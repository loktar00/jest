import { Jest, Sprite } from './Jest.js';

export default class Particle extends Sprite {
    constructor(options = {}) {
        super(options);
    }

    initialize(options = {}) {
        super.initialize(options);
        Jest.particleCount++;

        this.visible = true;
        this.emitterPool = options.pool;

        this.startLife = Date.now();
        this.curStep = 0;

        this.lifeTime =
            options.lifeTime !== undefined ? options.lifeTime : 1000;
        this.delay = options.delay || 0;

        this.size = options.size || options.startSize || 1;
        this.size *= Jest.jestScale;

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
            x: this.pos.x / Jest.jestScale,
            y: this.pos.y / Jest.jestScale
        };

        this.endLife = this.startLife + this.lifeTime;

        // precalc color changes
        this.colors = [];

        if (this.endColor !== this.startColor) {
            for (
                let i = Math.ceil(this.lifeTime / Jest.frameRate) + 1;
                i > -1;
                i--
            ) {
                this.colors.push(
                    this.colorFade(
                        this.startColor,
                        this.endColor,
                        this.lifeTime,
                        i * Jest.frameRate
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
        this.pos.x = this.originalPos.x * Jest.jestScale;
        this.pos.y = this.originalPos.y * Jest.jestScale;

        if (
            this.pos.y < 0 ||
            this.pos.y > Jest.bounds.y + Jest.bounds.height ||
            Date.now() > this.endLife
        ) {
            if (this.visible) {
                this.visible = false;
                this.emitterPool.push(this);
                Jest.particleCount--;
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
                    Math.ceil((this.lifeTime - this.curStep) / Jest.frameRate)
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
                    this.startX * Jest.jestScale, // If you want to scale the source clipping
                    this.startY * Jest.jestScale, // If you want to scale the source clipping
                    width * Jest.jestScale,
                    height * Jest.jestScale,
                    -oX,
                    -oY,
                    (width - scale.x) * Jest.jestScale,
                    (height - scale.y) * Jest.jestScale
                );
            } else {
                context.drawImage(
                    this.resource.source,
                    this.startX,
                    this.startY,
                    width * Jest.jestScale, // Scale the width
                    height * Jest.jestScale, // Scale the height
                    (x - oX) * Jest.jestScale, // Scale the x position
                    (y - oY) * Jest.jestScale, // Scale the y position
                    (width - scale.x) * Jest.jestScale, // Scale the width offset
                    (height - scale.y) * Jest.jestScale // Scale the height offset
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
                    -oX * Jest.jestScale,
                    -oY * Jest.jestScale,
                    (width - scale.x) * Jest.jestScale,
                    (height - scale.y) * Jest.jestScale
                );
            } else {
                context.fillRect(
                    (x - oX) * Jest.jestScale, // Scale the x position
                    (y - oY) * Jest.jestScale, // Scale the y position
                    (width - scale.x) * Jest.jestScale, // Scale the width
                    (height - scale.y) * Jest.jestScale // Scale the height
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
