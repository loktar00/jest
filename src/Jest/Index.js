import ResourceManager from './ResourceManager';
import Renderer from './Renderer';
import Label from './Label';
import Gamepad from './Gamepad';
import Utilities from './Utilities';

class Jest {
    constructor() {
        // State info
        this.states = [];
        this.currentState = {};

        // Render stuff
        this.renderer = {};
        this.renderList = [];
        this.entities = [];

        // Timing
        this.intervalId = {};
        this.lastTime = Date.now();
        this.accTime = 0;
        this.timeStep = 1;

        // used to show the fps
        this.frameRateLabel = {};

        // init the utilities and resource manager
        this.resourceManager = new ResourceManager();

        // List of entities in a recent collision
        this.hitEntities = [];

        // Keep track of how many particles we have on screen
        this.particleCount = 0;

        this.frameRate = this.frameRate;
        this.bounds = this.bounds;
        this.particleCount = this.particleCount;
        this.utilities = Utilities;
        this.states = this.states;
        this.currentState = this.currentState;
        this.focused = true;
        this.keys = [];
        this.gamePads = [];
    }
    setup(options) {
        options = options || {};
        this.renderCanvas = options.canvas || "playCanvas";
        this.width = options.width || 320;
        this.height = options.height || 240;
        this.frameRate = options.frameRate || Math.ceil(1000 / 60);
        this.showFrameRate = options.showFrameRate || false;
        this.stateName = options.stateName || "0";

        // game bounds
        this.bounds = {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height
        };
    }
    /**
     * Jest.load()
     *
     * prepares the canvas for rendering, and starts the update process
     **/
    load() {
        this.loaded(this);
    }
    /**
     * Jest.loaded()
     * object event
     * makes sure everything is loaded until continuing
     **/
    loaded(game) {
        if (this.resourceManager.loadingComplete) {
            game.init();
            return true;
        } 
        
        setTimeout(() => {
            this.loaded(game);
        }, 100);
        return false;
    }
    /**
     * Jest.update()
     *
     * Main update loop for the game, updates all objects, and calls the renderer.
     **/
    update() {
        const curTime = Date.now()

        this.deltaTime = curTime - this.lastTime;
        this.lastTime = curTime;
        this.accTime += this.deltaTime;

        // Limit the delta queing
        if (this.accTime > 60) {
            this.accTime = 0;
        }

        while (this.accTime > this.timeStep) {
            this.accTime -= this.timeStep;
            const entities = this.entities;
            const entLen = this.entities.length;
            
            this.gamePads.forEach(pad => pad.update());

            while (entLen--) {
                const entity = entities[entLen];
                if (entity !== undefined) {
                    if (entity.live) {
                        entity.update(this.timeStep / 100);
                    } else {
                        this.removeEntity(entity);
                    }
                }
            }
        }

        this.renderer.redraw();
        this.frameRateLabel.text = Math.round(1000 / this.deltaTime) + " fps";
        this.currentFrameRate = Math.round(1000 / this.deltaTime);

        requestAnimationFrame(() => {
            this.update();
        });
    }
    /**
     * Jest.init()
     *
     * prepares the canvas for rendering, and starts the update process
     **/
    init() {
        // base for starting, presetup ect.
        this.renderCanvas = document.getElementById(this.renderCanvas);

        if (this.renderCanvas === null) {
            this.renderCanvas = document.createElement("canvas");
        }

        // disable dragging
        this.renderCanvas.draggable = false;

        // determine if the game has the focus or not
        document.addEventListener('touchstart', (event) => {
            if (event.target !== this.renderCanvas) {
                this.focused = false;
            } else {
                this.focused = true;
            }
        });

        this.renderCanvas.addEventListener('click', (event) => {
            this.focused = true;
            this.clicked(event);
        }, false);
        this.renderCanvas.addEventListener('mousemove', (event) => this.mouseMove(event), false);
        this.renderCanvas.addEventListener('mousedown', (event) => this.mouseDown(event), false);
        this.renderCanvas.addEventListener('mouseup', (event) => this.mouseUp(event), false);

        this.renderCanvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        }, false);

        // mousewheel
        this.renderCanvas.addEventListener('mousewheel', (event) => mouseWheel(event), false);
        this.renderCanvas.addEventListener('DOMMouseScroll', (event) => mouseWheel(event), false);

        // keypress
        document.addEventListener('keydown', (event) => {
            if (this.focused) {
                this.keyDown(event);
            }
        }, false);
        document.addEventListener('keyup', (event) => {
            if (this.focused) {
                this.keyUp(event);
            }
        }, false);

        // Gamepad
        window.addEventListener("gamepadconnected", (e) => {
            const index = e.gamepad.index;
            const gp = navigator.getGamepads()[index];
            
            this.gamePads[e.gamepad.index] = new Gamepad(gp, index);
        });
        window.addEventListener("gamepaddisconnected", (e) => {
            const index = e.gamepad.index;
            this.gamePads.splice(index, 1);
        });

        this.renderCanvas.width = this.width;
        this.renderCanvas.height = this.height;

        this.renderer = new Renderer(this.renderCanvas);

        this.addState(this.stateName);
        this.switchState({
            'id': 0
        });

        // setup a label to display the frameRate
        if (this.showFrameRate) {
            this.frameRateLabel = new Label({
                'text': ' ',
                x: 0,
                y: 30,
                z: 1,
                'font': '14pt arial bold'
            });
            this.addEntity(this.frameRateLabel);
        }

        this.mouseX = 0;
        this.mouseY = 0;

        this.moused = false;
        this.leftDown = false;
        this.rightDown = false;
        this.midDown = false;

        this.setupGame();
    }
    /**
     * Jest.setupGame()
     * Setup game states render loop, made to be overriden by user
     **/
    setupGame() {
        this.update();
    }
    /**
     * Jest.getKey()
     * returns the state of a key
     **/
    getKey(key) {
        //todo: add logic to return the state of the key, get the keycode based off of thekey passed
        return this.keys[key];
    }
    /**
     * Jest.keyDown()
     * sets the state of the key pressed to true
     **/
    keyDown(event) {
        this.keys[event.keyCode] = true;
    }
    /**
     * Jest.keyUp()
     * sets the state of the key pressed to false
     **/
    keyUp(event) {
        this.keys[event.keyCode] = false;
    }
    /**
     * Jest.buttonPressed()
     * sets the state of the key pressed to false
     **/
    buttonPressed(gamepadIndex, button) {
        return this.gamePads[gamepadIndex] && this.gamePads[gamepadIndex].buttonPressed(button.toLowerCase()) || 0;
    }
    getAxis(gamepadIndex, axis) {
        return this.gamePads[gamepadIndex] && this.gamePads[gamepadIndex].axis(axis.toLowerCase()) || {x: 0, y: 0};
    }
    /**
     * Jest.clicked()
     * object event
     * handles the click event for the canvas
     * TODO update this, I dont like how it requires origin and pos
     **/
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
            this.cX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            this.cY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        this.cX -= this.renderCanvas.offsetLeft;
        this.cY -= this.renderCanvas.offsetTop;

        var id = this.entities.length,
            entities = this.entities;

        while (id--) {
            var entity = entities[id];
            if (entity.clickable && entity.pos && entity.origin) {
                if (this.cX > entity.pos.x - entity.origin.x && this.cX < (entity.pos.x - entity.origin.x) + entity.width && this.cY > entity.pos.y - entity.origin.y && this.cY < (entity.pos.y - entity.origin.y) + entity.height) {
                    entity.clicked();
                    if (entity.noClickThrough) {
                        break;
                    }
                }
            }
        }

        return {
            'clickX': this.cX,
            'clickY': this.cY
        };
    }
    /**
     * Jest.mouseMove()
     * object event
     * handles the mouse move event
     **/
    mouseMove(event) {
        if (event.pageX || event.pageY) {
            this.mouseX = event.pageX - this.renderCanvas.offsetLeft;
            this.mouseY = event.pageY - this.renderCanvas.offsetTop;
        } else {
            this.mouseX = (event.clientX + document.body.scrollLeft - document.body.clientLeft) - this.renderCanvas.offsetLeft;
            this.mouseY = (event.clientY + document.body.scrollTop - document.body.clientTop) - this.renderCanvas.offsetTop;
        }
    }
    mouseDown(event) {
        this.moused = true;
        if ('which' in event) {
            switch (event.which) {
                case 1:
                    this.leftDown = true;
                    break;
                case 2:
                    this.midDown = true;
                    break;
                case 3:
                    this.rightDown = true;
                    break;
            }
        }

        this.mdX = 0;
        this.mdY = 0;

        if (event.pageX || event.pageY) {
            this.mdX = event.pageX;
            this.mdY = event.pageY;
        } else {
            this.mdX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            this.mdY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        this.mdX -= this.renderCanvas.offsetLeft;
        this.mdY -= this.renderCanvas.offsetTop;

        var id = this.entities.length,
            entities = this.entities;

        while (id--) {
            const entity = entities[id];
            if (entity.clickable && entity.pos && entity.origin) {
                if (this.mdX > entity.pos.x - entity.origin.x && this.mdX < (entity.pos.x - entity.origin.x) + entity.width && this.mdY > entity.pos.y - entity.origin.y && this.mdY < (entity.pos.y - entity.origin.y) + entity.height) {
                    entity.mouseDown();
                }
            }
        }

        return {
            'mouseDownX': this.mdX,
            'mouseDownY': this.mdY
        };
    }
    mouseUp(event) {
        this.moused = false;
        this.leftDown = false;
        this.midDown = false;
        this.rightDown = false;
    }
    mouseWheel(event) {
        var dir = 0;
        if ('wheelDelta' in event) {
            if (Math.abs(event.wheelDelta) - event.wheelDelta === 0) {
                dir = -1;
            } else {
                dir = 1;
            }
        } else if (event.detail) {
            if (Math.abs(event.detail) - event.detail === 0) {
                dir = 1;
            } else {
                dir = -1;
            }
        }

        return dir;
    }
    // Handles Entities

    /**
     * Jest.addEntity()
     * object entity, renderFalse bool, state object
     * renderFalse : controls if the item is added to the renderer.
     * state {name : string, OR id : number}: allows you to specify what state you want to add the entity to, if you dont specify it adds it to the current state
     **/
    addEntity(object, renderFalse, state) {
        // add the live prop since the renderer/update chooses to display or update based on it
        if (!("live" in object)) {
            object.live = true;
        }

        this.renderFalse = renderFalse;

        if (state) {
            var foundState = this.getState(state);

            if (foundState) {
                foundState.entityList.push(object);
                object.state = foundState;
            }
        } else {
            this.entities.push(object);
            object.state = this.currentState;
        }

        if (!renderFalse) {
            this.renderer.addToRenderer(object);
        }
    }

    /**
     * Jest.removeEntity()
     * object entity, state Object
     * Removes an entity from the update cycle and renderer, you can also specify the state you want to remove from
     **/
    removeEntity(object, state) {
        var entities = this.entities,
            numEntities = entities.length;

        if (state) {
            var foundState = this.getState(state);

            if (foundState) {
                entities = foundState.entityList;
                numEntities = entities.length;
            }
        }

        var item = entities.indexOf(object);

        if (typeof object.kill != 'undefined') {
            object.kill();
        }

        entities.splice(item, 1);

        this.renderer.removeFromRenderer(object);
    }

    /**
     * Jest.addState()
     * object options
     * {name : string}
     * Adds a state the Jest, states hold their own entity list, and render list
     **/
    addState(name, enterState, exitState) {
        var stateObj = {};

        if (name) {
            stateObj.name = name;
        } else {
            stateObj.name = this.states.length;
        }

        stateObj.enterState = enterState || undefined;

        // assign it the next val
        stateObj.id = this.states.length;
        stateObj.renderList = [];
        stateObj.entityList = [];
        this.states.push(stateObj);
    }

    /**
     * Jest.getState()
     * object options
     * {name : string, id : number}
     * Finds and returns the state
     **/
    getState(options) {
        var foundState = false;

        if ("id" in options) {
            foundState = this.states[options.id];
        } else if ("name" in options) {
            var stateName = options.name;
            for (var i = 0, len = this.states.length; i < len; i++) {
                if (this.states[i].name === stateName) {
                    foundState = this.states[i];
                    break;
                }
            }
        }

        return foundState;
    }

    /**
     * Jest.switchState()
     * object options
     * {name : string, id : number}
     * Adds a state the Jest, states hold their own entity list, and render list
     **/
    switchState(options) {
        var foundState = this.getState(options);

        // throw in a debug if the state hasn't been found
        if (foundState) {
            if (options.exitTransition && !options.exitComplete) {
                // perform exit transition if one exists
                options.exitComplete = true;
                Game.addEntity(new Jest.Transition(options.exitTransition, function () {
                    Game.switchState(options);
                }));
            } else {
                // switch the render list, and the entity list
                this.currentState = foundState;
                this.renderer.renderList = this.currentState.renderList;
                this.entities = this.currentState.entityList;

                // if the state has an enter state function call it
                if (foundState.enterState) {
                    foundState.enterState();
                }

                // Perform enter transition if one exists
                if (options.enterTransition) {
                    Game.addEntity(new Jest.Transition(options.enterTransition));
                }
            }
        }
    }
    /**
     * Jest.checkHit(x,y)
     * x,y number
     * Checks all the entities to see if they were hit by the coords. Very expensive right now definitly need to clean it up
     **/
    checkHit(x, y) {
        var numEntities = this.entities.length,
            entities = this.entities;

        this.hitEntities = [];

        for (var id = 0, entLen = this.entities.length; id < entLen; id++) {
            var object = entities[id];
            if (object.live && object.clickable) {
                if (x > object.x && x < object.x + object.width && y > object.y && y < object.y + object.height) {
                    this.hitEntities.push(object);
                }
            }
        }
    }
}

const jest = new Jest();
window.Jest = jest;

export default jest;