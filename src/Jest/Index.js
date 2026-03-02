import GameContext from './GameContext.js';

// Jest is now a thin facade over GameContext.
// It inherits all subsystem access (entities, input, states, rendering)
// and exposes the same API as before for backward compatibility.
class Jest extends GameContext {
    constructor() {
        super();

        // Expose click handling on the instance for backward compat
        this.cX = 0;
        this.cY = 0;
        this.mdX = 0;
        this.mdY = 0;
    }

    init() {
        super.init();

        // Listen for input events via EventBus for entity click handling
        this.eventBus.on('input:click', (event) => {
            this.clicked(event);
        });
        this.eventBus.on('input:mousedown', (event) => {
            this.mouseDown(event);
        });
    }

    /**
     * Jest.clicked()
     * Handles click event — checks entity hit boxes
     */
    clicked(event) {
        this.cX = 0;
        this.cY = 0;

        if (event.pageX || event.pageY) {
            this.cX = event.pageX;
            this.cY = event.pageY;
        } else if (event.changedTouches) {
            this.cX = event.changedTouches[0].pageX;
            this.cY = event.changedTouches[0].pageY;
        } else {
            this.cX =
                event.clientX +
                document.body.scrollLeft +
                document.documentElement.scrollLeft;
            this.cY =
                event.clientY +
                document.body.scrollTop +
                document.documentElement.scrollTop;
        }

        this.cX =
            (this.cX - this.renderCanvas.offsetLeft) / this.jestScale;
        this.cY =
            (this.cY - this.renderCanvas.offsetTop) / this.jestScale;

        let id = this.entities.length;
        const { entities } = this;

        while (id--) {
            const entity = entities[id];
            if (entity.clickable && entity.pos && entity.origin) {
                if (
                    this.cX > entity.pos.x - entity.origin.x &&
                    this.cX < entity.pos.x - entity.origin.x + entity.width &&
                    this.cY > entity.pos.y - entity.origin.y &&
                    this.cY < entity.pos.y - entity.origin.y + entity.height
                ) {
                    entity.clicked();
                    if (entity.noClickThrough) {
                        break;
                    }
                }
            }
        }

        return {
            clickX: this.cX,
            clickY: this.cY
        };
    }

    /**
     * Jest.mouseDown()
     * Handles mousedown — checks entity hit boxes
     */
    mouseDown(event) {
        this.mdX =
            (event.pageX - this.renderCanvas.offsetLeft) / this.jestScale;
        this.mdY =
            (event.pageY - this.renderCanvas.offsetTop) / this.jestScale;

        let id = this.entities.length;
        const { entities } = this;

        while (id--) {
            const entity = entities[id];
            if (entity.clickable && entity.pos && entity.origin) {
                if (
                    this.mdX > entity.pos.x - entity.origin.x &&
                    this.mdX <
                        entity.pos.x - entity.origin.x + entity.width &&
                    this.mdY > entity.pos.y - entity.origin.y &&
                    this.mdY <
                        entity.pos.y - entity.origin.y + entity.height
                ) {
                    entity.mouseDown();
                }
            }
        }

        return {
            mouseDownX: this.mdX,
            mouseDownY: this.mdY
        };
    }
}

const jest = new Jest();
window.Jest = jest;

export default jest;
