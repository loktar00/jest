import Renderer from './Renderer.js';
import ResourceManager from './ResourceManager.js';
import EventBus from './EventBus.js';
import InputManager from './InputManager.js';
import EntityManager from './EntityManager.js';
import SceneManager from './SceneManager.js';
import Label from './Label.js';
import Utilities from './Utilities.js';

export default class GameContext {
    constructor() {
        this.eventBus = new EventBus();
        this.resourceManager = new ResourceManager();
        this.utilities = Utilities;

        // Timing
        this.lastTime = Date.now();
        this.deltaTime = 0;
        this.currentFrameRate = 60;

        // Scale
        this.jestScale = 1;
        this.particleCount = 0;

        // Labels
        this.frameRateLabel = {};
        this.particleLabel = {};

        // These get initialized in init()
        this.renderer = null;
        this.inputManager = null;
        this.entityManager = null;
        this.sceneManager = null;
        this.renderCanvas = null;
    }

    setup(options = {}) {
        this.canvasId = options.canvas || 'playCanvas';
        this.width = options.width || 320;
        this.height = options.height || 240;
        this.aspectRatio = this.width / this.height;
        this.frameRate = options.frameRate || Math.ceil(1000 / 60);
        this.showFrameRate = options.showFrameRate || false;
        this.showParticleCount = options.showParticleCount || false;
        this.stateName = options.stateName || '0';

        this.bounds = {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height
        };
    }

    async load() {
        await this.resourceManager.loadAll();
        this.init();
    }

    init() {
        this.renderCanvas = document.getElementById(this.canvasId);

        if (this.renderCanvas === null) {
            this.renderCanvas = document.createElement('canvas');
        }

        this.renderCanvas.draggable = false;
        this.renderCanvas.width = this.width;
        this.renderCanvas.height = this.height;

        // Create subsystems
        this.renderer = new Renderer(this.renderCanvas);
        this.entityManager = new EntityManager(
            this.renderer,
            this.eventBus
        );
        this.sceneManager = new SceneManager(
            this.renderer,
            this.entityManager,
            this.eventBus
        );
        this.inputManager = new InputManager(
            this.renderCanvas,
            this.eventBus
        );

        // Wire resize and trigger initial sizing
        window.addEventListener('resize', () => this.handleResize());
        this.handleResize();

        // Default state
        this.sceneManager.addState(this.stateName);
        this.sceneManager.switchState({ id: 0 });

        // FPS label
        if (this.showFrameRate) {
            this.frameRateLabel = new Label({
                text: ' ',
                x: 0,
                y: 30,
                z: 1,
                font: '14pt arial bold'
            });
            this.addEntity(this.frameRateLabel);
        }

        // Particle count label
        if (this.showParticleCount) {
            this.particleLabel = new Label({
                text: ' ',
                x: 0,
                y: 80,
                z: 1,
                font: '14pt arial bold'
            });
            this.addEntity(this.particleLabel);
        }

        this.setupGame();
    }

    handleResize() {
        const { innerWidth, innerHeight } = window;
        const windowRatio = innerWidth / innerHeight;
        let newWidth = 0;
        let newHeight = 0;

        if (windowRatio > this.aspectRatio) {
            this.renderCanvas.style.width = `${
                innerHeight * this.aspectRatio
            }px`;
            this.renderCanvas.style.height = `${innerHeight}px`;
            newWidth = innerHeight * this.aspectRatio;
            newHeight = innerHeight;
        } else {
            this.renderCanvas.style.width = `${innerWidth}px`;
            this.renderCanvas.style.height = `${
                innerWidth / this.aspectRatio
            }px`;
            newWidth = innerWidth;
            newHeight = innerWidth / this.aspectRatio;
        }

        this.renderCanvas.height = newHeight;
        this.renderCanvas.width = newWidth;

        this.jestScale = newWidth / this.width;

        this.bounds = {
            x: 0,
            y: 0,
            width: newWidth,
            height: newHeight
        };

        this.eventBus.emit('resize', {
            width: newWidth,
            height: newHeight,
            scale: this.jestScale
        });
    }

    setupGame() {
        this.update();
    }

    update() {
        const curTime = Date.now();
        this.deltaTime = curTime - this.lastTime;
        this.lastTime = curTime;

        this.inputManager.updateGamepads();
        this.inputManager.updateMousePosition(this.jestScale);

        this.entityManager.updateEntities(this.deltaTime);
        this.renderer.redraw();

        this.frameRateLabel.text = `${Math.round(1000 / this.deltaTime)} fps`;
        this.particleLabel.text = `${this.particleCount} particles`;
        this.currentFrameRate = Math.round(1000 / this.deltaTime);

        requestAnimationFrame(() => {
            this.update();
        });
    }

    // Delegate methods for backward compat
    addEntity(object, renderFalse, state) {
        this.entityManager.addEntity(
            object,
            renderFalse,
            state,
            this.sceneManager
        );
    }

    removeEntity(object, state) {
        this.entityManager.removeEntity(object, state, this.sceneManager);
    }

    addState(name, enterState) {
        this.sceneManager.addState(name, enterState);
    }

    getState(options) {
        return this.sceneManager.getState(options);
    }

    switchState(options) {
        this.sceneManager.switchState(options);
    }

    checkHit(x, y) {
        this.entityManager.checkHit(x, y);
    }

    checkBounds(x, y, width = 0, height = 0) {
        return this.entityManager.checkBounds(
            x,
            y,
            this.bounds,
            width,
            height
        );
    }

    // Input delegates
    get keys() {
        return this.inputManager ? this.inputManager.keys : [];
    }

    get mouseX() {
        return this.inputManager ? this.inputManager.mouseX : 0;
    }

    get mouseY() {
        return this.inputManager ? this.inputManager.mouseY : 0;
    }

    get focused() {
        return this.inputManager ? this.inputManager.focused : true;
    }

    set focused(val) {
        if (this.inputManager) {
            this.inputManager.focused = val;
        }
    }

    get leftDown() {
        return this.inputManager ? this.inputManager.leftDown : false;
    }

    get rightDown() {
        return this.inputManager ? this.inputManager.rightDown : false;
    }

    get midDown() {
        return this.inputManager ? this.inputManager.midDown : false;
    }

    get moused() {
        return this.inputManager ? this.inputManager.moused : false;
    }

    get gamePads() {
        return this.inputManager ? this.inputManager.gamePads : [];
    }

    get entities() {
        return this.entityManager ? this.entityManager.entities : [];
    }

    set entities(val) {
        if (this.entityManager) {
            this.entityManager.entities = val;
        }
    }

    get hitEntities() {
        return this.entityManager ? this.entityManager.hitEntities : [];
    }

    get currentState() {
        return this.sceneManager ? this.sceneManager.currentState : {};
    }

    get states() {
        return this.sceneManager ? this.sceneManager.states : [];
    }

    getKey(key) {
        return this.inputManager.getKey(key);
    }

    buttonPressed(gamepadIndex, button) {
        return this.inputManager.buttonPressed(gamepadIndex, button);
    }

    getAxis(gamepadIndex, axis) {
        return this.inputManager.getAxis(gamepadIndex, axis);
    }

    gamePadRumble(gamepadIndex, duration) {
        return this.inputManager.gamePadRumble(gamepadIndex, duration);
    }
}
