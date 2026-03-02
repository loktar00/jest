export default class RendererBase {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderList = [];
        this.sortDirty = true;
        this.width = canvas.width;
        this.height = canvas.height;
    }

    addToRenderer(object) {
        this.renderList.push(object);
        this.sortDirty = true;
    }

    removeFromRenderer(object) {
        const list = this.renderList;
        const objIndex = list.indexOf(object);

        if (objIndex !== -1) {
            list.splice(objIndex, 1);
            this.sortDirty = true;
        }
    }

    markDirty() {
        this.sortDirty = true;
    }

    sortRenderList() {
        this.renderList.sort((a, b) => {
            if (a.bg && b.bg) {
                return b.bgIndex - a.bgIndex;
            }
            if (a.ui && b.ui) {
                return b.uiIndex - a.uiIndex;
            }
            if (a.bg || b.ui) {
                return 1;
            }
            if (b.bg || a.ui) {
                return -1;
            }

            if (a.pos && b.pos) {
                return (b.pos?.z ?? 0) - (a.pos?.z ?? 0);
            }

            return 0;
        });
        this.sortDirty = false;
    }

    redraw() {
        throw new Error('redraw() must be implemented by subclass');
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
    }

    destroy() {
        this.renderList = [];
    }

    get type() {
        return 'base';
    }
}
