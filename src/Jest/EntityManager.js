export default class EntityManager {
    constructor(renderer, eventBus) {
        this.renderer = renderer;
        this.eventBus = eventBus;
        this.entities = [];
        this.hitEntities = [];
    }

    setEntityList(list) {
        this.entities = list;
    }

    addEntity(object, renderFalse, state, sceneManager) {
        if (!('live' in object)) {
            object.live = true;
        }

        if (state) {
            const foundState = sceneManager.getState(state);
            if (foundState) {
                foundState.entityList.push(object);
                object.state = foundState;
            }
        } else {
            this.entities.push(object);
            object.state = sceneManager
                ? sceneManager.currentState
                : null;
        }

        if (!renderFalse) {
            this.renderer.addToRenderer(object);
        }

        this.eventBus.emit('entityAdded', object);
    }

    removeEntity(object, state, sceneManager) {
        let { entities } = this;

        if (state) {
            const foundState = sceneManager.getState(state);
            if (foundState) {
                entities = foundState.entityList;
            }
        }

        const item = entities.indexOf(object);

        if (typeof object.kill !== 'undefined') {
            object.kill();
        }

        if (item !== -1) {
            entities.splice(item, 1);
        }

        this.renderer.removeFromRenderer(object);
        this.eventBus.emit('entityRemoved', object);
    }

    updateEntities(deltaTime) {
        const { entities } = this;
        let entLen = entities.length;

        while (entLen--) {
            const entity = entities[entLen];
            if (entity !== undefined) {
                if (entity.live) {
                    entity.update(deltaTime / 1000);
                } else {
                    this.removeEntity(entity);
                }
            }
        }
    }

    checkHit(x, y) {
        const { entities } = this;
        this.hitEntities = [];

        for (let id = 0, entLen = entities.length; id < entLen; id++) {
            const object = entities[id];
            if (object.live && object.clickable) {
                if (
                    x > object.x &&
                    x < object.x + object.width &&
                    y > object.y &&
                    y < object.y + object.height
                ) {
                    this.hitEntities.push(object);
                }
            }
        }
    }

    checkBounds(x, y, bounds, width = 0, height = 0) {
        return (
            bounds.x < x &&
            bounds.width > x + width &&
            bounds.y < y &&
            bounds.height > y + height
        );
    }
}
