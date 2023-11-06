import Vector from './Vector.js';

export default class Sprite {
    constructor(options = {}) {
        this.initialize(options);
    }

    initialize(options) {
        this.width = (options.width || 32) * Jest.jestScale;
        this.height = (options.height || 32) * Jest.jestScale;

        // Set the position
        this.pos = options.pos || {
            x: 0,
            y: 0,
            z: 0
        };

        if (options.x && options.y) {
            this.pos = new Vector(
                (options?.x || 0) * Jest.jestScale,
                (options?.y || 0) * Jest.jestScale,
                options.pos?.z || 0 // Assuming z-scale is not required, else apply Jest.jestScale
            );
        } else if (options.pos) {
            this.pos = options.pos;
        } else {
            this.pos = new Vector(0, 0, 0);
        }

        // Set drawing origin
        // Apply scale to origin
        this.origin = new Vector(
            (options.origin?.x || 0) * Jest.jestScale,
            (options.origin?.y || 0) * Jest.jestScale,
            options.origin?.z || 0 // Assuming z-scale is not required, else apply Jest.jestScale
        );

        if (options.ox && options.oy) {
            const { oz } = options || 0;
            this.origin = new Vector(options.ox, options.oy, oz);
        } else if (options.origin) {
            this.origin = options.origin;
        } else {
            this.origin = new Vector(0, 0, 0);
        }

        // Set an initial velocity
        this.vel = options.vel || {
            x: 0,
            y: 0,
            z: 0
        };
        if (options.vx && options.vy) {
            const { vz } = options || 0;
            this.vel = new Vector(options.vx, options.vy, vz);
        } else if (options.vel) {
            this.vel = options.vel;
        } else {
            this.vel = new Vector(0, 0, 0);
        }

        // Apply scale to startX and startY if needed
        this.startX = (options.startX || 0) * Jest.jestScale;
        this.startY = (options.startY || 0) * Jest.jestScale;

        this.tileable = options.tileable || false;
        if (this.tileable) {
            this.endX = options.endX || this.width;
            this.endY = options.endY || this.height;
        }

        // If theres not a resource specified we just assume its going to be a rect
        if (options.resource === undefined) {
            this.shape = true;
            this.resource = {};
        } else {
            this.shape = false;
            this.resource = options.resource;
        }

        this.angle = options.angle || 0;
        this.thrust = options.thrust || 0;
        this.color = options.color || {
            r: 255,
            g: 255,
            b: 255
        };
        this.alpha = 1;
        this.clickable = options.clickable || false;

        // for referencing a list of entities or sprites its a part of
        if (options.list && options.list.length !== undefined) {
            this.list = options.list;
            this.list.push(this);
        } else {
            this.list = [];
        }

        // required properties
        this.visible = true;

        this.animations = [];
        this.curAnim = {
            name: '',
            frames: 0
        };
        this.isAnimating = false;

        this.lastAnim = 0;
        this.animSpeed = 0;

        this.x = this.pos.x;
        this.y = this.pos.y;

        this.live = true;
    }

    // Handles updating the sprite
    update() {
        if (this.isAnimating) {
            if (new Date().getTime() > this.lastAnim + this.animSpeed) {
                this.lastAnim = new Date().getTime();
                this.startX = this.width * this.curAnim.frames[this.frame];
                this.frame++;
                if (this.frame > this.curAnim.frames.length - 1) {
                    // stop if its a one shot animation
                    if (this.animType !== 1) {
                        this.isAnimating = false;
                    } else {
                        this.frame = 0;
                    }
                }
            }
        }
    }

    // Add animation sequences for animated sprites
    addAnimation(sequence, sequenceName) {
        const aniSequence = {
            name: sequenceName,
            frames: sequence
        };
        this.animations.push(aniSequence);
    }

    /** Play animation sequence
     * sequenceName - name of prev added sequence
     * animSpeed - milliseconds between frames
     * animType - 0/null/undefined = play sequence full once, 1 = play until stopped
     * */
    playAnimation(sequenceName, animSpeed, animType) {
        for (let i = 0, len = this.animations.length; i < len; i++) {
            const curAnim = this.animations[i];
            if (curAnim.name === sequenceName) {
                this.curAnim = curAnim;
                this.animSpeed = animSpeed;
                if (typeof animType === 'undefined') {
                    this.animType = 0;
                } else {
                    this.animType = animType;
                }
                this.frame = 0;
                this.isAnimating = true;
            }
        }
    }

    stopAnimation() {
        if (this.isAnimating) {
            this.isAnimating = false;
            this.curAnim = {
                name: '',
                frames: 0
            };
        }
    }

    // Change the frame to a specific one
    changeFrame(frame) {
        this.startX = frame * this.width;
    }

    kill() {
        // do something before its "dead"
        if (this.list.length > 0) {
            const { list } = this;
            const item = list.indexOf(this);

            if (item) {
                list.splice(item, 1);
            }
        }
    }

    // Draw
    render(context) {
        context.save();
        if (!this.shape) {
            // render to the nearest full pixel
            const cX = (0.5 + (this.pos.x - this.origin.x)) << 0;
            const cY = (0.5 + (this.pos.y - this.origin.y)) << 0;

            context.drawImage(
                this.resource.source,
                this.startX,
                this.startY,
                this.width,
                this.height,
                cX,
                cY,
                this.width,
                this.height
            );
        } else {
            const { color } = this;
            context.fillStyle = `rgba(${color.r},${color.g},${color.b},${this.alpha})`;
            context.fillRect(
                (this.pos.x - this.origin.x) * Jest.jestScale,
                (this.pos.y - this.origin.y) * Jest.jestScale,
                this.width * Jest.jestScale,
                this.height * Jest.jestScale
            );
        }
        context.restore();
    }

    clicked() {
        // Object was clicked
    }

    mouseDown() {
        // Object was mousedDown on
    }
}
