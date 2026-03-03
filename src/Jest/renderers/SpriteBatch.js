const VERTEX_SHADER = `
attribute vec2 aPosition;
attribute vec2 aTexCoord;
attribute vec4 aColor;

uniform mat4 uProjection;

varying vec2 vTexCoord;
varying vec4 vColor;

void main() {
    gl_Position = uProjection * vec4(aPosition, 0.0, 1.0);
    vTexCoord = aTexCoord;
    vColor = aColor;
}
`;

const FRAGMENT_SHADER = `
precision mediump float;

varying vec2 vTexCoord;
varying vec4 vColor;

uniform sampler2D uTexture;

void main() {
    vec4 texColor = texture2D(uTexture, vTexCoord);
    gl_FragColor = texColor * vColor;
}
`;

const MAX_QUADS = 10000;
const FLOATS_PER_VERTEX = 8; // x, y, u, v, r, g, b, a
const VERTICES_PER_QUAD = 4;
const INDICES_PER_QUAD = 6;
const FLOATS_PER_QUAD = FLOATS_PER_VERTEX * VERTICES_PER_QUAD;

function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`Shader compile error: ${info}`);
    }

    return shader;
}

export default class SpriteBatch {
    constructor(gl) {
        this.gl = gl;
        this.quadCount = 0;
        this.currentTexture = null;
        this.drawing = false;

        this.initShader();
        this.initBuffers();
        this.initWhiteTexture();
    }

    initShader() {
        const { gl } = this;

        const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
        const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

        this.program = gl.createProgram();
        gl.attachShader(this.program, vs);
        gl.attachShader(this.program, fs);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(this.program);
            throw new Error(`SpriteBatch shader link failed: ${info}`);
        }

        gl.deleteShader(vs);
        gl.deleteShader(fs);

        // Attribute locations
        this.aPosition = gl.getAttribLocation(this.program, 'aPosition');
        this.aTexCoord = gl.getAttribLocation(this.program, 'aTexCoord');
        this.aColor = gl.getAttribLocation(this.program, 'aColor');

        // Uniform locations
        this.uProjection = gl.getUniformLocation(this.program, 'uProjection');
        this.uTexture = gl.getUniformLocation(this.program, 'uTexture');
    }

    initBuffers() {
        const { gl } = this;

        // Vertex buffer (dynamic)
        this.vertexData = new Float32Array(MAX_QUADS * FLOATS_PER_QUAD);
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            this.vertexData.byteLength,
            gl.DYNAMIC_DRAW
        );

        // Index buffer (static pattern: 0,1,2, 0,2,3 repeated)
        const indices = new Uint16Array(MAX_QUADS * INDICES_PER_QUAD);
        for (let i = 0; i < MAX_QUADS; i++) {
            const vi = i * 4;
            const ii = i * 6;
            indices[ii] = vi;
            indices[ii + 1] = vi + 1;
            indices[ii + 2] = vi + 2;
            indices[ii + 3] = vi;
            indices[ii + 4] = vi + 2;
            indices[ii + 5] = vi + 3;
        }

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    }

    initWhiteTexture() {
        const { gl } = this;
        this.whiteTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.whiteTexture);
        const pixel = new Uint8Array([255, 255, 255, 255]);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            1,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            pixel
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }

    begin(projectionMatrix) {
        const { gl } = this;

        this.drawing = true;
        this.quadCount = 0;
        this.currentTexture = null;

        gl.useProgram(this.program);
        gl.uniformMatrix4fv(this.uProjection, false, projectionMatrix);
        gl.uniform1i(this.uTexture, 0);
        gl.activeTexture(gl.TEXTURE0);

        // Bind buffers and set attribute pointers
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        const stride = FLOATS_PER_VERTEX * 4; // bytes

        gl.enableVertexAttribArray(this.aPosition);
        gl.vertexAttribPointer(this.aPosition, 2, gl.FLOAT, false, stride, 0);

        gl.enableVertexAttribArray(this.aTexCoord);
        gl.vertexAttribPointer(this.aTexCoord, 2, gl.FLOAT, false, stride, 8);

        gl.enableVertexAttribArray(this.aColor);
        gl.vertexAttribPointer(this.aColor, 4, gl.FLOAT, false, stride, 16);
    }

    drawQuad(x, y, w, h, r, g, b, a, texture, srcRect, rotation, ox, oy) {
        if (!this.drawing) {
            return;
        }

        const tex = texture || this.whiteTexture;

        // Flush if texture changes or batch is full
        if (tex !== this.currentTexture) {
            if (this.quadCount > 0) {
                this.flush();
            }
            this.currentTexture = tex;
            this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
        }

        if (this.quadCount >= MAX_QUADS) {
            this.flush();
        }

        // UV coordinates
        let u0 = 0;
        let v0 = 0;
        let u1 = 1;
        let v1 = 1;

        if (srcRect) {
            u0 = srcRect.x / srcRect.texW;
            v0 = srcRect.y / srcRect.texH;
            u1 = (srcRect.x + srcRect.w) / srcRect.texW;
            v1 = (srcRect.y + srcRect.h) / srcRect.texH;
        }

        // Compute corners
        let x0;
        let y0;
        let x1;
        let y1;
        let x2;
        let y2;
        let x3;
        let y3;

        if (rotation !== 0) {
            // Rotated quad: corners relative to origin, then rotate
            const cosR = Math.cos(rotation);
            const sinR = Math.sin(rotation);

            // Corner offsets relative to rotation origin
            const lx = -ox;
            const ly = -oy;
            const rx = w - ox;
            const ry = h - oy;

            // Top-left
            x0 = x + ox + (lx * cosR - ly * sinR);
            y0 = y + oy + (lx * sinR + ly * cosR);
            // Top-right
            x1 = x + ox + (rx * cosR - ly * sinR);
            y1 = y + oy + (rx * sinR + ly * cosR);
            // Bottom-right
            x2 = x + ox + (rx * cosR - ry * sinR);
            y2 = y + oy + (rx * sinR + ry * cosR);
            // Bottom-left
            x3 = x + ox + (lx * cosR - ry * sinR);
            y3 = y + oy + (lx * sinR + ry * cosR);
        } else {
            x0 = x;
            y0 = y;
            x1 = x + w;
            y1 = y;
            x2 = x + w;
            y2 = y + h;
            x3 = x;
            y3 = y + h;
        }

        const offset = this.quadCount * FLOATS_PER_QUAD;
        const vd = this.vertexData;

        // Top-left
        vd[offset] = x0;
        vd[offset + 1] = y0;
        vd[offset + 2] = u0;
        vd[offset + 3] = v0;
        vd[offset + 4] = r;
        vd[offset + 5] = g;
        vd[offset + 6] = b;
        vd[offset + 7] = a;

        // Top-right
        vd[offset + 8] = x1;
        vd[offset + 9] = y1;
        vd[offset + 10] = u1;
        vd[offset + 11] = v0;
        vd[offset + 12] = r;
        vd[offset + 13] = g;
        vd[offset + 14] = b;
        vd[offset + 15] = a;

        // Bottom-right
        vd[offset + 16] = x2;
        vd[offset + 17] = y2;
        vd[offset + 18] = u1;
        vd[offset + 19] = v1;
        vd[offset + 20] = r;
        vd[offset + 21] = g;
        vd[offset + 22] = b;
        vd[offset + 23] = a;

        // Bottom-left
        vd[offset + 24] = x3;
        vd[offset + 25] = y3;
        vd[offset + 26] = u0;
        vd[offset + 27] = v1;
        vd[offset + 28] = r;
        vd[offset + 29] = g;
        vd[offset + 30] = b;
        vd[offset + 31] = a;

        this.quadCount++;
    }

    flush() {
        if (this.quadCount === 0) {
            return;
        }

        const { gl } = this;

        // Upload only the used portion of vertex data
        const subData = this.vertexData.subarray(
            0,
            this.quadCount * FLOATS_PER_QUAD
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, subData);

        // Draw
        gl.drawElements(
            gl.TRIANGLES,
            this.quadCount * INDICES_PER_QUAD,
            gl.UNSIGNED_SHORT,
            0
        );

        this.quadCount = 0;
    }

    end() {
        this.flush();
        this.drawing = false;
    }

    destroy() {
        const { gl } = this;
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.indexBuffer);
        gl.deleteTexture(this.whiteTexture);
        gl.deleteProgram(this.program);
    }
}
