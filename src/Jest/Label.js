export default class Label {
    constructor(options = {}) {
        this.text = options.text || 'Undefined Label Text';
        this.originalFont = options.font || '1rem Arial';
        this.font = this.originalFont; // Initialize with the original font

        this.pos = { x: 0, y: 0 };
        this.pos.x = options.x || 0;
        this.pos.y = options.y || 0;
        // Scale the position
        this.pos = {
            x: (options.pos?.x || options.x || 0) * Jest.jestScale,
            y: (options.pos?.y || options.y || 0) * Jest.jestScale
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

            // Scale the size
            const scaledSize = size * scale;

            // Replace the original size with the scaled size
            return font.replace(fullMatch, `${scaledSize}${unit}`);
        }
        return font; // If no match, return the original font
    }

    // The update method remains unchanged
    update() {
        // Call this in update if the scale can change between renders
        this.font = this.scaleFont(this.originalFont, Jest.jestScale);

        // // Update positions with the scale
        this.pos.x = this.originalX * Jest.jestScale;
        this.pos.y = this.originalY * Jest.jestScale;
    }

    // Draw the label
    render(context) {
        context.fillStyle = this.color;
        context.font = this.font;
        context.fillText(this.text, this.pos.x, this.pos.y);
    }
}
