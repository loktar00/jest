const PARTICLE_VERTEX_SHADER = `
attribute vec2 aCornerOffset;
attribute vec2 aPosition;
attribute float aThrust;
attribute float aAngle;
attribute float aAngleChange;
attribute float aGravity;
attribute vec4 aStartColor;
attribute vec4 aEndColor;
attribute float aStartSize;
attribute float aEndSize;
attribute float aDrawAngle;
attribute float aDrawAngleChg;
attribute float aAlignToAngle;
attribute float aBirthTime;
attribute float aLifeTime;

uniform mat4 uProjection;
uniform float uCurrentTime;
uniform float uScale;

varying vec4 vColor;

void main() {
    float age = uCurrentTime - aBirthTime;
    float t = clamp(age / aLifeTime, 0.0, 1.0);

    // Dead particle — move off-screen
    if (age < 0.0 || age > aLifeTime) {
        gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
        vColor = vec4(0.0);
        return;
    }

    float size = mix(aStartSize, aEndSize, t) * uScale;

    // Thrust direction rotates over time
    float curAngle = aAngle + aAngleChange * age;

    // Position: thrust + gravity
    vec2 vel = vec2(cos(curAngle), sin(curAngle)) * aThrust;
    vec2 pos = aPosition * uScale + vel * age * uScale + vec2(0.0, 0.5 * aGravity * age * age * uScale);

    // Visual rotation
    float drawAngle = aDrawAngle + aDrawAngleChg * age;
    if (aAlignToAngle > 0.5) {
        drawAngle = curAngle;
    }

    // Rotate quad corners around center
    float c = cos(drawAngle);
    float s = sin(drawAngle);
    vec2 rotated = vec2(
        aCornerOffset.x * c - aCornerOffset.y * s,
        aCornerOffset.x * s + aCornerOffset.y * c
    ) * size;

    vec2 corner = pos + rotated;

    gl_Position = uProjection * vec4(corner, 0.0, 1.0);
    vColor = mix(aStartColor, aEndColor, t);
}
`;

const PARTICLE_FRAGMENT_SHADER = `
precision mediump float;

varying vec4 vColor;

void main() {
    if (vColor.a < 0.004) {
        discard;
    }
    gl_FragColor = vColor;
}
`;

const MAX_PARTICLES = 50000;
// Per-particle instance data layout (21 floats):
// 0-1:   aPosition (vec2)
// 2:     aThrust
// 3:     aAngle
// 4:     aAngleChange
// 5:     aGravity
// 6-9:   aStartColor (vec4)
// 10-13: aEndColor (vec4)
// 14:    aStartSize
// 15:    aEndSize
// 16:    aDrawAngle
// 17:    aDrawAngleChg
// 18:    aAlignToAngle
// 19:    aBirthTime
// 20:    aLifeTime
const INSTANCE_FLOATS = 21;

function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`ParticleBatch shader compile error: ${info}`);
    }

    return shader;
}

export default class ParticleBatch {
    constructor(gl, isWebGL2) {
        this.gl = gl;
        this.isWebGL2 = isWebGL2;
        this.activeCount = 0;
        this.maxParticles = MAX_PARTICLES;

        // Free list for particle slots
        this.freeSlots = [];
        for (let i = MAX_PARTICLES - 1; i >= 0; i--) {
            this.freeSlots.push(i);
        }

        // Track birth/life for CPU-side death detection
        this.birthTimes = new Float32Array(MAX_PARTICLES);
        this.lifeTimes = new Float32Array(MAX_PARTICLES);
        this.slotActive = new Uint8Array(MAX_PARTICLES);

        this.ext = null;
        if (!isWebGL2) {
            this.ext = gl.getExtension('ANGLE_instanced_arrays');
            if (!this.ext) {
                console.warn(
                    'ANGLE_instanced_arrays not available — GPU particles disabled'
                );
                this.supported = false;
                return;
            }
        }
        this.supported = true;

        this.initShader();
        this.initBuffers();
    }

    initShader() {
        const { gl } = this;

        const vs = compileShader(gl, gl.VERTEX_SHADER, PARTICLE_VERTEX_SHADER);
        const fs = compileShader(
            gl,
            gl.FRAGMENT_SHADER,
            PARTICLE_FRAGMENT_SHADER
        );

        this.program = gl.createProgram();
        gl.attachShader(this.program, vs);
        gl.attachShader(this.program, fs);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(this.program);
            throw new Error(`ParticleBatch shader link failed: ${info}`);
        }

        gl.deleteShader(vs);
        gl.deleteShader(fs);

        // Attribute locations
        this.loc = {
            aCornerOffset: gl.getAttribLocation(this.program, 'aCornerOffset'),
            aPosition: gl.getAttribLocation(this.program, 'aPosition'),
            aThrust: gl.getAttribLocation(this.program, 'aThrust'),
            aAngle: gl.getAttribLocation(this.program, 'aAngle'),
            aAngleChange: gl.getAttribLocation(this.program, 'aAngleChange'),
            aGravity: gl.getAttribLocation(this.program, 'aGravity'),
            aStartColor: gl.getAttribLocation(this.program, 'aStartColor'),
            aEndColor: gl.getAttribLocation(this.program, 'aEndColor'),
            aStartSize: gl.getAttribLocation(this.program, 'aStartSize'),
            aEndSize: gl.getAttribLocation(this.program, 'aEndSize'),
            aDrawAngle: gl.getAttribLocation(this.program, 'aDrawAngle'),
            aDrawAngleChg: gl.getAttribLocation(this.program, 'aDrawAngleChg'),
            aAlignToAngle: gl.getAttribLocation(this.program, 'aAlignToAngle'),
            aBirthTime: gl.getAttribLocation(this.program, 'aBirthTime'),
            aLifeTime: gl.getAttribLocation(this.program, 'aLifeTime')
        };

        // Uniform locations
        this.uProjection = gl.getUniformLocation(this.program, 'uProjection');
        this.uCurrentTime = gl.getUniformLocation(this.program, 'uCurrentTime');
        this.uScale = gl.getUniformLocation(this.program, 'uScale');
    }

    initBuffers() {
        const { gl } = this;

        // Quad corner offsets: unit quad centered at origin
        const corners = new Float32Array([
            -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5
        ]);

        this.cornerBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cornerBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, corners, gl.STATIC_DRAW);

        // Instance data buffer
        this.instanceData = new Float32Array(MAX_PARTICLES * INSTANCE_FLOATS);
        this.instanceBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            this.instanceData.byteLength,
            gl.DYNAMIC_DRAW
        );

        // Index buffer for the quad
        const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    }

    allocSlot() {
        if (this.freeSlots.length === 0) {
            return -1;
        }
        const slot = this.freeSlots.pop();
        this.slotActive[slot] = 1;
        this.activeCount++;
        return slot;
    }

    freeSlot(slot) {
        if (this.slotActive[slot]) {
            this.slotActive[slot] = 0;
            this.freeSlots.push(slot);
            this.activeCount--;
        }
    }

    setParticle(slot, params) {
        const offset = slot * INSTANCE_FLOATS;
        const d = this.instanceData;

        // aPosition (vec2)
        d[offset] = params.x;
        d[offset + 1] = params.y;
        // aThrust
        d[offset + 2] = params.thrust || 0;
        // aAngle (degrees to radians)
        d[offset + 3] = ((params.angle || 0) * Math.PI) / 180;
        // aAngleChange (degrees/frame to radians/sec approximation)
        d[offset + 4] = ((params.angleChange || 0) * Math.PI) / 180;
        // aGravity
        d[offset + 5] = params.gravity || 0;
        // aStartColor (vec4)
        const sc = params.startColor ||
            params.color || {
                r: 255,
                g: 255,
                b: 255
            };
        const sa = params.startAlpha !== undefined ? params.startAlpha : 1;
        d[offset + 6] = sc.r / 255;
        d[offset + 7] = sc.g / 255;
        d[offset + 8] = sc.b / 255;
        d[offset + 9] = sa;
        // aEndColor (vec4)
        const ec = params.endColor || sc;
        const ea = params.endAlpha !== undefined ? params.endAlpha : sa;
        d[offset + 10] = ec.r / 255;
        d[offset + 11] = ec.g / 255;
        d[offset + 12] = ec.b / 255;
        d[offset + 13] = ea;
        // aStartSize
        d[offset + 14] = params.startSize || params.size || 4;
        // aEndSize
        d[offset + 15] =
            params.endSize !== undefined ? params.endSize : d[offset + 14];
        // aDrawAngle (degrees to radians)
        d[offset + 16] = ((params.drawAngle || 0) * Math.PI) / 180;
        // aDrawAngleChg (degrees/frame to radians/sec)
        d[offset + 17] = ((params.drawAngleChange || 0) * Math.PI) / 180;
        // aAlignToAngle
        d[offset + 18] = params.alignToAngle ? 1.0 : 0.0;
        // aBirthTime
        d[offset + 19] = params.birthTime;
        // aLifeTime (ms to seconds)
        d[offset + 20] = (params.lifeTime || 1000) / 1000;

        // CPU-side tracking
        this.birthTimes[slot] = params.birthTime;
        this.lifeTimes[slot] = (params.lifeTime || 1000) / 1000;

        // Upload just this particle's data
        const { gl } = this;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
        gl.bufferSubData(
            gl.ARRAY_BUFFER,
            offset * 4,
            this.instanceData.subarray(offset, offset + INSTANCE_FLOATS)
        );
    }

    collectDead(currentTime) {
        for (let i = 0; i < MAX_PARTICLES; i++) {
            if (this.slotActive[i]) {
                const age = currentTime - this.birthTimes[i];
                if (age > this.lifeTimes[i]) {
                    this.freeSlot(i);
                }
            }
        }
    }

    draw(projectionMatrix, currentTime, scale) {
        if (!this.supported || this.activeCount === 0) {
            return;
        }

        this.collectDead(currentTime);

        if (this.activeCount === 0) {
            return;
        }

        const { gl } = this;
        const stride = INSTANCE_FLOATS * 4;

        gl.useProgram(this.program);
        gl.uniformMatrix4fv(this.uProjection, false, projectionMatrix);
        gl.uniform1f(this.uCurrentTime, currentTime);
        gl.uniform1f(this.uScale, scale);

        // Bind corner offsets (per-vertex, divisor 0)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cornerBuffer);
        gl.enableVertexAttribArray(this.loc.aCornerOffset);
        gl.vertexAttribPointer(
            this.loc.aCornerOffset,
            2,
            gl.FLOAT,
            false,
            0,
            0
        );

        // Bind instance data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);

        // Instance attribute definitions: [location, size, byte offset]
        const instanceAttrs = [
            [this.loc.aPosition, 2, 0],
            [this.loc.aThrust, 1, 8],
            [this.loc.aAngle, 1, 12],
            [this.loc.aAngleChange, 1, 16],
            [this.loc.aGravity, 1, 20],
            [this.loc.aStartColor, 4, 24],
            [this.loc.aEndColor, 4, 40],
            [this.loc.aStartSize, 1, 56],
            [this.loc.aEndSize, 1, 60],
            [this.loc.aDrawAngle, 1, 64],
            [this.loc.aDrawAngleChg, 1, 68],
            [this.loc.aAlignToAngle, 1, 72],
            [this.loc.aBirthTime, 1, 76],
            [this.loc.aLifeTime, 1, 80]
        ];

        instanceAttrs.forEach(([loc, size, byteOffset]) => {
            if (loc === -1) {
                return;
            }
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(
                loc,
                size,
                gl.FLOAT,
                false,
                stride,
                byteOffset
            );
            if (this.isWebGL2) {
                gl.vertexAttribDivisor(loc, 1);
            } else {
                this.ext.vertexAttribDivisorANGLE(loc, 1);
            }
        });

        // Corner offset has divisor 0
        if (this.isWebGL2) {
            gl.vertexAttribDivisor(this.loc.aCornerOffset, 0);
        } else {
            this.ext.vertexAttribDivisorANGLE(this.loc.aCornerOffset, 0);
        }

        // Bind index buffer and draw instanced
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        if (this.isWebGL2) {
            gl.drawElementsInstanced(
                gl.TRIANGLES,
                6,
                gl.UNSIGNED_SHORT,
                0,
                MAX_PARTICLES
            );
        } else {
            this.ext.drawElementsInstancedANGLE(
                gl.TRIANGLES,
                6,
                gl.UNSIGNED_SHORT,
                0,
                MAX_PARTICLES
            );
        }

        // Reset divisors and disable attributes
        instanceAttrs.forEach(([loc]) => {
            if (loc === -1) {
                return;
            }
            if (this.isWebGL2) {
                gl.vertexAttribDivisor(loc, 0);
            } else {
                this.ext.vertexAttribDivisorANGLE(loc, 0);
            }
            gl.disableVertexAttribArray(loc);
        });

        gl.disableVertexAttribArray(this.loc.aCornerOffset);
    }

    destroy() {
        if (!this.supported) {
            return;
        }
        const { gl } = this;
        gl.deleteBuffer(this.cornerBuffer);
        gl.deleteBuffer(this.instanceBuffer);
        gl.deleteBuffer(this.indexBuffer);
        gl.deleteProgram(this.program);
    }
}
