export default class BouncingBox {
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
        this.baseY = this.pos.y;
        this.time = 0;
    }

    update(deltaTime) {
        this.time += deltaTime;
        this.pos.y =
            this.baseY + Math.sin(this.time * 2) * 30 * Jest.jestScale;

        // State switching via keyboard
        if (Jest.keys[49]) {
            Jest.switchState({ name: 'menu' });
        }
        if (Jest.keys[50]) {
            Jest.switchState({ name: 'gameplay' });
        }
        if (Jest.keys[51]) {
            Jest.switchState({ name: 'pause' });
        }
    }

    render(context) {
        const { color } = this;
        context.fillStyle = `rgba(${color.r},${color.g},${color.b},${this.alpha})`;
        context.fillRect(
            this.pos.x * Jest.jestScale,
            this.pos.y * Jest.jestScale,
            this.width * Jest.jestScale,
            this.height * Jest.jestScale
        );
    }

    clicked() {
        this.color = {
            r: Math.floor(Math.random() * 255),
            g: Math.floor(Math.random() * 255),
            b: Math.floor(Math.random() * 255)
        };
    }

    mouseDown() {}
}
