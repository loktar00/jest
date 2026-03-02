export default class ClickableBox {
    constructor(options) {
        this.pos = {
            x: (options.x || 0) * Jest.jestScale,
            y: (options.y || 0) * Jest.jestScale,
            z: 0
        };
        this.width = (options.width || 32) * Jest.jestScale;
        this.height = (options.height || 32) * Jest.jestScale;
        this.color = options.color || { r: 255, g: 255, b: 255 };
        this.alpha = 1;
        this.visible = true;
        this.live = true;
        this.shape = true;
        this.clickable = true;
        this.origin = { x: 0, y: 0 };
    }

    update() {}

    render(context) {
        const { color } = this;
        context.fillStyle = `rgba(${color.r},${color.g},${color.b},${this.alpha})`;
        context.fillRect(this.pos.x, this.pos.y, this.width, this.height);
    }

    clicked() {
        this.live = false;
    }

    mouseDown() {}
}
