import RendererBase from './RendererBase.js';
import SpriteBatch from './SpriteBatch.js';
import ParticleBatch from './ParticleBatch.js';

export default class WebGLRenderer extends RendererBase {
    constructor(canvas, options = {}) {
        super(canvas);

        this.gl =
            canvas.getContext('webgl2', { alpha: false, antialias: false }) ||
            canvas.getContext('webgl', { alpha: false, antialias: false });

        if (!this.gl) {
            throw new Error('WebGL not supported');
        }

        this.isWebGL2 = this.gl instanceof WebGL2RenderingContext;
        this.scale = options.scale || 1;
        this.projectionMatrix = new Float32Array(16);
        this.currentTime = 0;
        this.startTime = performance.now() / 1000;

        // Text cache for Label rendering
        this.textCache = new Map();
        this.textCacheOrder = [];
        this.textCacheMax = 200;
        this.textRasterCanvas = document.createElement('canvas');
        this.textRasterCtx = this.textRasterCanvas.getContext('2d');

        this.initGL();

        this.spriteBatch = new SpriteBatch(this.gl, this.isWebGL2);
        this.particleBatch = new ParticleBatch(this.gl, this.isWebGL2);

        this.updateProjection();
    }

    initGL() {
        const { gl } = this;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 1);
        gl.disable(gl.DEPTH_TEST);
    }

    updateProjection() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        // Orthographic: top-left origin like Canvas2D
        const m = this.projectionMatrix;
        m[0] = 2 / w;
        m[1] = 0;
        m[2] = 0;
        m[3] = 0;
        m[4] = 0;
        m[5] = -2 / h;
        m[6] = 0;
        m[7] = 0;
        m[8] = 0;
        m[9] = 0;
        m[10] = -1;
        m[11] = 0;
        m[12] = -1;
        m[13] = 1;
        m[14] = 0;
        m[15] = 1;
    }

    resize(width, height) {
        super.resize(width, height);
        this.gl.viewport(0, 0, width, height);
        this.updateProjection();
    }

    setBlendMode(additive) {
        const { gl } = this;
        if (additive) {
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        } else {
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        }
    }

    redraw() {
        const { gl } = this;

        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.currentTime = performance.now() / 1000 - this.startTime;

        gl.viewport(0, 0, this.width, this.height);
        this.updateProjection();
        gl.clear(gl.COLOR_BUFFER_BIT);

        if (this.sortDirty) {
            this.sortRenderList();
        }

        // Walk sorted list back-to-front (highest index = back)
        const list = this.renderList;
        let currentBlend = false;
        this.setBlendMode(false);

        this.spriteBatch.begin(this.projectionMatrix);

        let id = list.length;

        while (id--) {
            const entity = list[id];
            if (!entity.visible) {
                // skip invisible entities
            } else {
                // Check blend mode transition
                const entityBlend = entity.blend || false;
                if (entityBlend !== currentBlend) {
                    this.spriteBatch.flush();
                    this.setBlendMode(entityBlend);
                    currentBlend = entityBlend;
                }

                // Route to appropriate batch based on entity type
                if (entity.font !== undefined) {
                    this.drawLabel(entity);
                } else if (entity.shape) {
                    this.drawShape(entity);
                } else if (entity.resource && entity.resource.source) {
                    this.drawTexturedSprite(entity);
                } else if (typeof entity.render === 'function') {
                    this.drawCustomEntity(entity);
                }
            }
        }

        this.spriteBatch.end();

        // Draw GPU particles in a single pass after sprites
        if (this.particleBatch.activeCount > 0) {
            this.particleBatch.draw(
                this.projectionMatrix,
                this.currentTime,
                this.scale
            );
        }

        // Reset blend mode
        if (currentBlend) {
            this.setBlendMode(false);
        }
    }

    drawShape(entity) {
        const color = entity.color || { r: 255, g: 255, b: 255 };
        const alpha = entity.alpha !== undefined ? entity.alpha : 1;
        const scale = entity.ctx ? entity.ctx.jestScale : this.scale;

        let x;
        let y;
        let w;
        let h;

        if (entity.emitterPool !== undefined) {
            // Particle shape
            const scaleVal = entity.scale || { x: 0, y: 0 };
            x = (entity.pos.x - entity.origin.x) * scale;
            y = (entity.pos.y - entity.origin.y) * scale;
            w = (entity.width - scaleVal.x) * scale;
            h = (entity.height - scaleVal.y) * scale;
        } else {
            // Normal sprite shape
            x = (entity.pos.x - entity.origin.x) * scale;
            y = (entity.pos.y - entity.origin.y) * scale;
            w = entity.width * scale;
            h = entity.height * scale;
        }

        const rotation = entity.drawAngle
            ? (entity.drawAngle * Math.PI) / 180
            : 0;

        if (rotation !== 0 && entity.emitterPool !== undefined) {
            this.spriteBatch.drawQuad(
                entity.pos.x * scale,
                entity.pos.y * scale,
                w,
                h,
                color.r / 255,
                color.g / 255,
                color.b / 255,
                alpha,
                null,
                null,
                rotation,
                w / 2,
                h / 2
            );
        } else {
            this.spriteBatch.drawQuad(
                x,
                y,
                w,
                h,
                color.r / 255,
                color.g / 255,
                color.b / 255,
                alpha,
                null,
                null,
                rotation,
                0,
                0
            );
        }
    }

    drawTexturedSprite(entity) {
        const alpha = entity.alpha !== undefined ? entity.alpha : 1;
        const scale = entity.ctx ? entity.ctx.jestScale : this.scale;
        const source = entity.resource.source;

        const texture = this.getOrCreateTexture(source);

        let x;
        let y;
        let w;
        let h;
        let srcRect = null;

        if (entity.emitterPool !== undefined) {
            // Particle texture
            const scaleVal = entity.scale || { x: 0, y: 0 };
            const oX = entity.origin.x;
            const oY = entity.origin.y;
            x = (entity.pos.x - oX) * scale;
            y = (entity.pos.y - oY) * scale;
            w = (entity.width - scaleVal.x) * scale;
            h = (entity.height - scaleVal.y) * scale;
            srcRect = {
                x: entity.startX,
                y: entity.startY,
                w: entity.width * scale,
                h: entity.height * scale,
                texW: source.width,
                texH: source.height
            };
        } else {
            // Normal sprite texture
            const cX = (0.5 + (entity.pos.x - entity.origin.x)) | 0;
            const cY = (0.5 + (entity.pos.y - entity.origin.y)) | 0;
            w = entity.width * scale;
            h = entity.height * scale;
            x = cX;
            y = cY;
            srcRect = {
                x: entity.startX,
                y: entity.startY,
                w: entity.width,
                h: entity.height,
                texW: source.width,
                texH: source.height
            };
        }

        const color = entity.color || { r: 255, g: 255, b: 255 };
        const rotation = entity.drawAngle
            ? (entity.drawAngle * Math.PI) / 180
            : 0;

        this.spriteBatch.drawQuad(
            x,
            y,
            w,
            h,
            color.r / 255,
            color.g / 255,
            color.b / 255,
            alpha,
            texture,
            srcRect,
            rotation,
            0,
            0
        );
    }

    drawLabel(entity) {
        const text = entity.text;
        const font = entity.font;
        const color = entity.color || '#fff';
        const cacheKey = `${text}|${font}|${color}`;

        let cached = this.textCache.get(cacheKey);

        if (!cached) {
            cached = this.rasterizeText(text, font, color);
            this.textCache.set(cacheKey, cached);
            this.textCacheOrder.push(cacheKey);

            // LRU eviction
            if (this.textCacheOrder.length > this.textCacheMax) {
                const oldKey = this.textCacheOrder.shift();
                const old = this.textCache.get(oldKey);
                if (old) {
                    this.gl.deleteTexture(old.texture);
                    this.textCache.delete(oldKey);
                }
            }
        }

        this.spriteBatch.drawQuad(
            entity.pos.x,
            entity.pos.y - cached.ascent,
            cached.width,
            cached.height,
            1,
            1,
            1,
            1,
            cached.texture,
            null,
            0,
            0,
            0
        );
    }

    rasterizeText(text, font, color) {
        const ctx = this.textRasterCtx;
        const canvas = this.textRasterCanvas;

        ctx.font = font;
        const metrics = ctx.measureText(text);
        const w = Math.ceil(metrics.width) + 2;
        const ascent = Math.ceil(
            metrics.actualBoundingBoxAscent || parseInt(font, 10) || 16
        );
        const descent = Math.ceil(metrics.actualBoundingBoxDescent || 4);
        const h = ascent + descent + 2;

        canvas.width = w;
        canvas.height = h;

        ctx.clearRect(0, 0, w, h);
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textBaseline = 'top';
        ctx.fillText(text, 0, 0);

        const texture = this.createTextureFromCanvas(canvas);

        return { texture, width: w, height: h, ascent };
    }

    createTextureFromCanvas(sourceCanvas) {
        const { gl } = this;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            sourceCanvas
        );
        return texture;
    }

    getOrCreateTexture(source) {
        if (source.glTexture) {
            return source.glTexture;
        }

        const { gl } = this;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            source
        );

        source.glTexture = texture;
        return texture;
    }

    drawCustomEntity() {
        // Custom entities that only have render(ctx) need a 2D context.
        // We skip them in pure WebGL mode — they won't render.
    }

    destroy() {
        super.destroy();

        // Clean up text cache
        this.textCache.forEach((cached) => {
            this.gl.deleteTexture(cached.texture);
        });
        this.textCache.clear();
        this.textCacheOrder = [];

        this.spriteBatch.destroy();
        this.particleBatch.destroy();

        const ext = this.gl.getExtension('WEBGL_lose_context');
        if (ext) {
            ext.loseContext();
        }
    }

    get type() {
        return 'webgl';
    }
}
