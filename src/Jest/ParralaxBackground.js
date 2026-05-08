export default class ParralaxBackground {
    constructor(options = {}) {
        this.live = true;
        this.curSpeedCheck = 0;
        this.curSpeedMult = 0;
        this.backgrounds = [];

        this.width = options.width || Jest.bounds.width;
        this.height = options.height || Jest.bounds.height;

        this.state = options.state || { id: 0 };

        Jest.addEntity(this, true, this.state);
    }

    addBackground(options) {
        if (!options || !options.background) {
            return false;
        }

        const background = options.background;
        Jest.addEntity(background, false, this.state);

        const speedMultX = options.speedMultX || 0;
        const speedMultY = options.speedMultY || 0;

        this.backgrounds.push({ bg: background, speedMultX, speedMultY });
        return true;
    }

    updateBackground(options) {
        if (!options || options.bgIndex === undefined) {
            return;
        }

        if (options.speedMultX !== undefined) {
            this.backgrounds[options.bgIndex].speedMultX = options.speedMultX;
        }

        if (options.speedMultY !== undefined) {
            this.backgrounds[options.bgIndex].speedMultY = options.speedMultY;
        }
    }

    update(deltaTime) {
        for (let i = 0, len = this.backgrounds.length; i < len; i++) {
            const entry = this.backgrounds[i];
            entry.bg.scroll(entry.speedMultX, entry.speedMultY, deltaTime);
        }
    }
}
