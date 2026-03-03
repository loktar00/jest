import WebGLRenderer from './WebGLRenderer.js';
import Canvas2DRenderer from './Canvas2DRenderer.js';

export default function createRenderer(canvas, options = {}) {
    if (!options.forceCanvas2D) {
        try {
            return new WebGLRenderer(canvas, options);
        } catch (e) {
            console.warn(
                'WebGL not available, falling back to Canvas2D:',
                e.message
            );
        }
    }
    return new Canvas2DRenderer(canvas);
}
