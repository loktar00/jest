import { Sprite } from '../../../Jest/Jest.js';

export default class PlayerEntity extends Sprite {
    constructor(options) {
        super(options);
        this.speed = 400;
        this.shape = true;
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (Jest.keys[37] || Jest.keys[65]) {
            this.pos.x -= this.speed * deltaTime * Jest.jestScale;
        }
        if (Jest.keys[39] || Jest.keys[68]) {
            this.pos.x += this.speed * deltaTime * Jest.jestScale;
        }
        if (Jest.keys[38] || Jest.keys[87]) {
            this.pos.y -= this.speed * deltaTime * Jest.jestScale;
        }
        if (Jest.keys[40] || Jest.keys[83]) {
            this.pos.y += this.speed * deltaTime * Jest.jestScale;
        }

        this.pos.x = Math.max(
            0,
            Math.min(this.pos.x, Jest.bounds.width - this.width)
        );
        this.pos.y = Math.max(
            0,
            Math.min(this.pos.y, Jest.bounds.height - this.height)
        );
    }
}
