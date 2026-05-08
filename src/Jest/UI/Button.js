import Sprite from '../Sprite.js';

export default class Button extends Sprite {
    constructor(options = {}) {
        super(options);

        if (options.clicked) {
            this.onClicked = options.clicked;
        }
        if (options.hover) {
            this.onHover = options.hover;
        }

        this.over = false;
        this.clickable = true;
        this.noClickThrough = true;
    }

    clicked() {
        if (this.onClicked && this.visible) {
            this.onClicked();
        }
    }

    mouseover(over) {
        if (this.onHover && this.visible) {
            this.onHover(over);
        }
    }

    update() {
        super.update();

        if (!this.visible) {
            return;
        }

        const x = this.pos.x - this.origin.x;
        const y = this.pos.y - this.origin.y;

        if (
            Jest.mouseX > x &&
            Jest.mouseX < x + this.width &&
            Jest.mouseY > y &&
            Jest.mouseY < y + this.height
        ) {
            if (!this.over) {
                this.over = true;
                this.mouseover(true);
            }
        } else if (this.over) {
            this.over = false;
            this.mouseover(false);
        }
    }
}
