import { Sprite } from './Jest.js';

export default class Particle extends Sprite {
    constructor(options = {}, context = null) {
        super(options, context);
    }

    initialize(options, context) {
        super.initialize(options, context);
        this.ctx.particleCount++;

        this.visible = true;
        this.emitterPool = options.pool;

        this.startLife = Date.now();
        this.curStep = 0;

        this.lifeTime =
            options.lifeTime !== undefined ? options.lifeTime : 1000;
        this.delay = options.delay || 0;

        this.size = options.size || options.startSize || 1;
        this.size *= this.ctx.jestScale;

        this.scale = {
            x: 1,
            y: 1
        };

        this.width = this.size;
        this.height = this.size;
        this.startSize = options.startSize || this.size;
        this.endSize =
            options.endSize !== undefined ? options.endSize : this.size;
        this.thrust = options.thrust || 0;
        this.gravity = options.gravity || 0;

        this.angle = options.angle || 0;
        this.angleChange = options.angleChange || 0;
        this.alignToAngle = options.alignToAngle || false;
        this.drawAngle = options.drawAngle || 0;
        this.drawAngleChange = options.drawAngleChange || 0;

        this.startColor = options.startColor || this.color;
        this.endColor = options.endColor || this.color;

        this.startAlpha =
            options.startAlpha !== undefined ? options.startAlpha : 1;
        this.endAlpha = options.endAlpha !== undefined ? options.endAlpha : 1;
        this.alpha = this.startAlpha;

        this.blend = options.blend || false;

        // sets the origin to the center
        this.origin.y = this.height / 2;
        this.origin.x = this.width / 2;

        // originating positon
        this.originalPos = {
            x: this.pos.x / this.ctx.jestScale,
            y: this.pos.y / this.ctx.jestScale
        };

        this.endLife = this.startLife + this.lifeTime;

        // precalc color changes
        this.colors = [];

        if (this.endColor !== this.startColor) {
            for (
                let i = Math.ceil(this.lifeTime / this.ctx.frameRate) + 1;
                i > -1;
                i--
            ) {
                this.colors.push(
                    this.colorFade(
                        this.startColor,
                        this.endColor,
                        this.lifeTime,
                        i * this.ctx.frameRate
                    )
                );
            }
        }
    }

    update(deltaTime) {
        this.curStep = this.endLife - Date.now();

        this.vel.x =
            Math.cos((this.angle * Math.PI) / 180) * this.thrust * deltaTime;
        this.vel.y =
            (Math.sin((this.angle * Math.PI) / 180) * this.thrust +
                this.gravity * (this.lifeTime - this.curStep) * deltaTime) *
            deltaTime;

        // Apply the velocity to the original position
        this.originalPos.x += this.vel.x;
        this.originalPos.y += this.vel.y;

        // Scale the original position to get the current position
        this.pos.x = this.originalPos.x * this.ctx.jestScale;
        this.pos.y = this.originalPos.y * this.ctx.jestScale;

        if (this.visible) {
            let dead = false;

            // Bounds check
            if (
                this.pos.y < 0 ||
                this.pos.y > this.ctx.bounds.y + this.ctx.bounds.height
            ) {
                dead = true;
            }

            // Lifetime check
            if (Date.now() > this.endLife) {
                dead = true;
            }

            if (dead) {
                this.visible = false;
                this.emitterPool.push(this);
                this.ctx.particleCount--;
            }
        }

        // Do the changes between
        if (this.endAlpha !== this.startAlpha) {
            if (this.endAlpha > this.startAlpha) {
                this.alpha =
                    this.endAlpha -
                    ((this.endAlpha - this.startAlpha) / this.lifeTime) *
                        this.curStep;
            } else {
                this.alpha =
                    this.endAlpha +
                    ((this.startAlpha - this.endAlpha) / this.lifeTime) *
                        this.curStep;
            }

            this.alpha = Math.min(1, Math.max(0, this.alpha));
        }

        if (this.endColor !== this.startColor) {
            this.color =
                this.colors[
                    Math.ceil(
                        (this.lifeTime - this.curStep) / this.ctx.frameRate
                    )
                ];
        }

        if (this.endSize !== this.size) {
            let scale = 0;

            if (this.endSize < this.startSize) {
                scale = Math.max(
                    ((this.startSize - this.endSize) / this.lifeTime) *
                        this.curStep,
                    this.endSize
                );
            } else {
                scale = Math.min(
                    this.endSize +
                        ((this.startSize - this.endSize) / this.lifeTime) *
                            this.curStep,
                    this.endSize
                );
            }

            this.scale = {
                x: -scale,
                y: -scale
            };
        }

        if (this.angleChange) {
            this.angle += this.angleChange * deltaTime;
        }

        if (this.drawAngleChange) {
            this.drawAngle += this.drawAngleChange * deltaTime;
        }

        if (this.alignToAngle) {
            this.drawAngle = this.angle;
        }
    }

    render(context) {
        context.save();

        const scale = this.scale || {
            x: 0,
            y: 0
        };
        const { x, y } = this.pos;
        const oX = this.origin.x;
        const oY = this.origin.y;
        const { width } = this;
        const { height } = this;
        const rotAngle = (this.drawAngle * Math.PI) / 180;

        if (this.blend) {
            context.globalCompositeOperation = 'lighter';
        }

        if (!this.shape) {
            context.globalAlpha = this.alpha;

            if (this.drawAngle !== 0) {
                context.translate(x, y);
                context.rotate(rotAngle);
                context.drawImage(
                    this.resource.source,
                    this.startX * this.ctx.jestScale,
                    this.startY * this.ctx.jestScale,
                    width * this.ctx.jestScale,
                    height * this.ctx.jestScale,
                    -oX,
                    -oY,
                    (width - scale.x) * this.ctx.jestScale,
                    (height - scale.y) * this.ctx.jestScale
                );
            } else {
                context.drawImage(
                    this.resource.source,
                    this.startX,
                    this.startY,
                    width * this.ctx.jestScale,
                    height * this.ctx.jestScale,
                    (x - oX) * this.ctx.jestScale,
                    (y - oY) * this.ctx.jestScale,
                    (width - scale.x) * this.ctx.jestScale,
                    (height - scale.y) * this.ctx.jestScale
                );
            }
        } else {
            const color = this.color || {
                r: 0,
                g: 0,
                b: 0
            };

            context.fillStyle = `rgba(${color.r},${color.g},${color.b},${this.alpha})`;

            if (this.drawAngle !== 0) {
                context.translate(x, y);
                context.rotate(rotAngle);
                context.fillRect(
                    -oX * this.ctx.jestScale,
                    -oY * this.ctx.jestScale,
                    (width - scale.x) * this.ctx.jestScale,
                    (height - scale.y) * this.ctx.jestScale
                );
            } else {
                context.fillRect(
                    (x - oX) * this.ctx.jestScale, // Scale the x position
                    (y - oY) * this.ctx.jestScale, // Scale the y position
                    (width - scale.x) * this.ctx.jestScale, // Scale the width
                    (height - scale.y) * this.ctx.jestScale // Scale the height
                );
            }
        }
        context.restore();
        context.globalCompositeOperation = 'source-over';
    }

    getColor(color) {
        return Math.floor(Math.min(255, Math.max(0, color)));
    }

    colorFade(startColor, endColor, totalSteps, step) {
        const scale = step / totalSteps;
        const r = endColor.r + scale * (startColor.r - endColor.r);
        const b = endColor.b + scale * (startColor.b - endColor.b);
        const g = endColor.g + scale * (startColor.g - endColor.g);

        return {
            r: this.getColor(r),
            g: this.getColor(g),
            b: this.getColor(b)
        };
    }
}
