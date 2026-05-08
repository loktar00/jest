export default class Background {
    constructor(options = {}) {
        this.resource = options.resource || null;
        this.width = options.width || Jest.bounds.width;
        this.height = options.height || Jest.bounds.height;
        this.startX = options.startX || 0;
        this.startY = options.startY || 0;
        this.alpha = options.alpha !== undefined ? options.alpha : 100;

        let endX = 32;
        let endY = 32;

        if (this.resource && this.resource.source) {
            endX = this.resource.source.width;
            endY = this.resource.source.height;
        }

        this.endX = options.endX || endX;
        this.endY = options.endY || endY;

        this.bgIndex = options.bgIndex || 0;
        this.pos = { x: options.x || 0, y: options.y || 0 };
        this.state = options.state || { id: 0 };

        this.visible = true;
        this.x = this.pos.x;
        this.y = this.pos.y;
        this.scrollX = 0;
        this.scrollY = 0;
        this.live = true;
        this.bg = true;

        // If the source is narrower than the rendered width, pre-tile it
        // horizontally onto an offscreen canvas so the scroll math wraps cleanly.
        if (this.endX < this.width && this.resource && this.resource.source) {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            const { source } = this.resource;
            const widthDiff = this.width - this.endX;

            tempCanvas.width = this.endX + widthDiff;
            tempCanvas.height = this.endY;

            tempCtx.drawImage(
                source, 0, 0, this.endX, this.endY,
                0, 0, this.endX, this.endY
            );
            tempCtx.drawImage(
                source, 0, 0, widthDiff, this.endY,
                this.endX, 0, widthDiff, this.endY
            );

            this.endX += widthDiff;
            this.resource.source = tempCanvas;
        }
    }

    update() {}

    scroll(speedX, speedY, deltaTime) {
        this.scrollX += speedX * deltaTime;
        this.scrollY += speedY * deltaTime;

        if (this.scrollY > this.endY) {
            this.scrollY = 0;
        } else if (this.scrollY < 0) {
            this.scrollY = this.endY;
        }

        if (this.scrollX > this.endX) {
            this.scrollX = 0;
        } else if (this.scrollX < 0) {
            this.scrollX = this.endX;
        }
    }

    render(context) {
        context.save();
        context.globalAlpha = this.alpha * 0.01;
        const { source } = this.resource;

        if (
            this.startY + this.scrollY > this.endY - this.height ||
            this.startX + this.scrollX > this.endX - this.width
        ) {
            const sX = [this.startX + this.scrollX, this.startX];
            const sY = [this.startY + this.scrollY, this.startY];
            const sWidth = [this.width, this.width];
            const sHeight = [this.height, this.height];
            const dX = [this.pos.x, this.pos.x];
            const dY = [this.pos.y, this.pos.y];
            const dWidth = [this.width, this.width];
            const dHeight = [this.height, this.height];

            if (this.startY + this.scrollY > this.endY - this.height) {
                sY[0] = this.startY + this.scrollY;
                sY[1] = this.startY;

                sHeight[0] = this.endY - (this.startY + this.scrollY);
                sHeight[1] = this.height;

                dY[0] = this.pos.y;
                dY[1] = this.pos.y + this.endY - (this.startY + this.scrollY);

                dHeight[0] = this.endY - (this.startY + this.scrollY);
                dHeight[1] = this.height;
            }

            if (this.startX + this.scrollX > this.endX - this.width) {
                sX[0] = this.startX + this.scrollX;
                sX[1] = this.startX;

                sWidth[0] = this.endX - (this.startX + this.scrollX);
                sWidth[1] = this.width;

                dX[0] = this.pos.x;
                dX[1] = this.pos.x + this.endX - (this.startX + this.scrollX);

                dWidth[0] = this.endX - (this.startX + this.scrollX);
                dWidth[1] = this.width;
            }

            context.drawImage(
                source, sX[0], sY[0], sWidth[0], sHeight[0],
                dX[0], dY[0], dWidth[0], dHeight[0]
            );
            context.drawImage(
                source, sX[1], sY[1], sWidth[1], sHeight[1],
                dX[1], dY[1], dWidth[1], dHeight[1]
            );
        } else {
            context.drawImage(
                source,
                this.startX + this.scrollX,
                this.startY + this.scrollY,
                this.width,
                this.height,
                this.pos.x,
                this.pos.y,
                this.width,
                this.height
            );
        }

        context.restore();
    }
}
