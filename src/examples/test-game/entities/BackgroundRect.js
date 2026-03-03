export default class BackgroundRect {
    constructor(options) {
        this.pos = { x: 0, y: 0, z: -100 };
        this.width = (options.width || 320) * Jest.jestScale;
        this.height = (options.height || 240) * Jest.jestScale;
        this.color = options.color || { r: 0, g: 0, b: 0 };
        this.alpha = 1;
        this.visible = true;
        this.live = true;
        this.origin = { x: 0, y: 0 };
    }

    update() {
        this.width = Jest.bounds.width;
        this.height = Jest.bounds.height;
    }

    render(context) {
        const { color } = this;
        context.fillStyle = `rgba(${color.r},${color.g},${color.b},${this.alpha})`;
        context.fillRect(0, 0, this.width, this.height);
    }
}
