export default class Label{
    constructor(options){
        options = options || {};
        this.text = options.text || "Undefined Label Text";
        this.font = options.font || "1em Arial";

        this.pos = {x : 0, y : 0};
        this.pos.x = options.x || 0;
        this.pos.y = options.y || 0;
        this.pos = options.pos || {x : this.pos.x, y : this.pos.y};
        this.color = options.color || "#fff";

        this.x = this.pos.x;
        this.y = this.pos.y;

        this.live = true;
        this.visible = true;
    }
    update(deltaTime) {}
    // Draw the label
    render(context) {
        context.fillStyle = this.color;
        context.font = this.font;
        context.fillText(this.text, this.pos.x, this.pos.y);
    }
}