import RendererBase from './RendererBase.js';

export default class Canvas2DRenderer extends RendererBase {
    constructor(canvas) {
        super(canvas);
        this.context = this.canvas.getContext('2d');
        this.context.imageSmoothingEnabled = false;
    }

    redraw() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.context.clearRect(0, 0, this.width, this.height);

        if (this.sortDirty) {
            this.sortRenderList();
        }

        let id = this.renderList.length;

        while (id--) {
            const curObject = this.renderList[id];
            if (curObject.visible) {
                curObject.render(this.context);
            }
        }
    }

    get type() {
        return 'canvas2d';
    }
}
