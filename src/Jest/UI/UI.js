export default class UI {
    constructor(options = {}) {
        this.state = options.state || Jest.currentState;
        this.width = options.width || Jest.bounds.width;
        this.height = options.height || Jest.bounds.height;

        this.items = [];

        Jest.addEntity(this, true, this.state);
    }

    addItem(object, uiIndex = 1) {
        object.ui = true;
        object.uiIndex = uiIndex;

        Jest.addEntity(object, false, this.state);
        this.items.push(object);
    }

    hide() {
        let id = this.items.length;
        while (id--) {
            this.items[id].visible = false;
            this.items[id].clickable = false;
        }
    }

    show() {
        let id = this.items.length;
        while (id--) {
            this.items[id].visible = true;
            this.items[id].clickable = true;
        }
    }

    update() {}

    render() {}
}
