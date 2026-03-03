export default class PauseIndicator {
    constructor(options) {
        this.pos = {
            x: (options.x || 0) * Jest.jestScale,
            y: (options.y || 0) * Jest.jestScale,
            z: 0
        };
        this.width = 20 * Jest.jestScale;
        this.height = 20 * Jest.jestScale;
        this.visible = true;
        this.live = true;
        this.origin = { x: 0, y: 0 };
        this.time = 0;
        this.alpha = 1;
    }

    update(deltaTime) {
        this.time += deltaTime;
        this.alpha = (Math.sin(this.time * 3) + 1) / 2;

        if (Jest.keys[49]) {
            Jest.switchState({ name: 'menu' });
        }
        if (Jest.keys[50]) {
            Jest.switchState({ name: 'gameplay' });
        }
    }

    render(context) {
        context.fillStyle = `rgba(255,255,0,${this.alpha})`;
        context.fillRect(this.pos.x, this.pos.y, this.width, this.height);
    }
}
