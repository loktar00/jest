export default class SceneManager {
    constructor(renderer, entityManager, eventBus) {
        this.renderer = renderer;
        this.entityManager = entityManager;
        this.eventBus = eventBus;
        this.states = [];
        this.currentState = {};
    }

    addState(name, enterState) {
        const stateObj = {};

        if (name) {
            stateObj.name = name;
        } else {
            stateObj.name = this.states.length;
        }

        stateObj.enterState = enterState || undefined;
        stateObj.id = this.states.length;
        stateObj.renderList = [];
        stateObj.entityList = [];
        this.states.push(stateObj);
    }

    getState(options) {
        let foundState = false;

        if ('id' in options) {
            foundState = this.states[options.id];
        } else if ('name' in options) {
            const stateName = options.name;
            for (let i = 0, len = this.states.length; i < len; i++) {
                if (this.states[i].name === stateName) {
                    foundState = this.states[i];
                    break;
                }
            }
        }

        return foundState;
    }

    switchState(options) {
        const foundState = this.getState(options);

        if (foundState) {
            this.currentState = foundState;
            this.renderer.renderList = this.currentState.renderList;
            this.entityManager.setEntityList(this.currentState.entityList);

            if (foundState.enterState) {
                foundState.enterState();
            }

            this.eventBus.emit('stateChange', foundState);
        }
    }
}
