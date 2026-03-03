export default class Label {
    constructor(options = {}, context = null) {
        this.ctx = context || Jest;

        this.text = options.text || 'Undefined Label Text';
        this.originalFont = options.font || '1rem Arial';
        this.font = this.originalFont;

        const scale = this.ctx.jestScale;

        this.pos = {
            x: (options.pos?.x || options.x || 0) * scale,
            y: (options.pos?.y || options.y || 0) * scale
        };

        this.color = options.color || '#fff';

        // Store the original unscaled positions
        this.originalX = options.x || 0;
        this.originalY = options.y || 0;

        this.live = true;
        this.visible = true;
    }

    // Helper function to scale the font size
    scaleFont(font, scale) {
        const fontSizeRegex = /(\d+(\.\d+)?)(px|pt|em|%|rem|vh|vw|vmin|vmax)/i;
        const match = font.match(fontSizeRegex);

        if (match) {
            const fullMatch = match[0];
            const size = parseFloat(match[1]);
            const unit = match[3];

            const scaledSize = size * scale;
            return font.replace(fullMatch, `${scaledSize}${unit}`);
        }
        return font;
    }

    update() {
        const scale = this.ctx.jestScale;
        this.font = this.scaleFont(this.originalFont, scale);
        this.pos.x = this.originalX * scale;
        this.pos.y = this.originalY * scale;
    }

    render(context) {
        context.fillStyle = this.color;
        context.font = this.font;
        context.fillText(this.text, this.pos.x, this.pos.y);
    }
}
