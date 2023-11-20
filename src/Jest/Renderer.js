export default class Renderer {
    constructor(canvas) {
        this.renderList = [];
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.context.imageSmoothingEnabled = false;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    // Todo: I dont like this. fix the sorting, right now sorts on y, but could potentially sort based on z
    redraw() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.context.clearRect(0, 0, this.width, this.height);
        // this.renderList.sort(function(a,b){return b.y-a.y});

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

        let id = this.renderList.length;

        while (id--) {
            const curObject = this.renderList[id];
            if (curObject.visible) {
                curObject.render(this.context);
            }
        }
    }

    /**
     * Renderer.addToRenderer(object)
     *
     * add a new item to the renderer
     * */
    addToRenderer(object) {
        this.renderList.push(object);
    }

    /**
     * Renderer.removeFromRenderer(object)
     *
     * remove an item from the renderer
     * */
    removeFromRenderer(object) {
        const list = this.renderList;
        const objIndex = list.indexOf(object);

        if (objIndex !== -1) {
            list.splice(list.indexOf(object), 1);
        }
    }
}
