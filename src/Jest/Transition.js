export default class Transition {
    constructor(options, callback) {
        this.callback = callback || (() => true);
        this.effect = (options && options.effect) || 'fadeOut';
        this.duration = (options && options.duration) || 500;
        this.timeStep = Date.now() + this.duration;
        this.complete = false;

        this.visible = true;
        this.live = true;

        // Render on top of everything
        this.ui = true;
        this.uiIndex = 9999;

        Jest.addEntity(this);
    }

    update() {
        if (this.complete) {
            if (Jest.renderCanvas) {
                Jest.renderCanvas.style.cursor = 'default';
            }
            this.live = false;
            this.callback();
        }
    }

    render(context) {
        if (this.effect === 'fadeOut') {
            context.globalAlpha =
                (1 / this.duration) * (this.timeStep - Date.now());
        } else if (this.effect === 'fadeIn') {
            context.globalAlpha =
                1 - (1 / this.duration) * (this.timeStep - Date.now());
        }

        if (context.globalAlpha < 0) {
            context.globalAlpha = 0;
        } else if (context.globalAlpha > 1) {
            context.globalAlpha = 1;
        }

        if (Date.now() >= this.timeStep) {
            this.complete = true;
        }
    }
}
