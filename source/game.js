// requestAnim shim layer by Paul Irish
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
})();

/**
 * Jest(options:object)
 * options canvas:string, width:int, height:int, frameRate:int
 * Sets up the initial values required to start the game
 **/
var Jest = function(options){

    options = options || {};
    this.renderCanvas = options.canvas || "playCanvas";
    this.width = options.width || 320;
    this.height = options.height || 240;
    this.frameRate = options.frameRate || Math.ceil(1000/60);
    this.showFrameRate = options.showFrameRate || false;
    this.stateName = options.stateName || "0";

    // State info
    this.states = [];
    this.currentState = {};

    // Render stuff
    this.renderer = {};
    this.renderList = [];
    this.entities = [];

    // Timing
    this.intervalId = {};
    this.lastTime = (new Date()).getTime();
    this.accTime = 0;
    this.timeStep = 1;

    // game bounds
    this.bounds = {x: 0, y: 0, width : this.width, height : this.height};

    // used to show the fps
    this.frameRateLabel = {};

    // init the utilities and resource manager
    this.resourceManager = new Jest.ResourceManager();

    // List of entities in a recent collision
    this.hitEntities = [];

    // Keep track of how many particles we have on screen
    this.particleCount = 0;

    Jest.frameRate = this.frameRate;
    Jest.bounds = this.bounds;
    Jest.particleCount = this.particleCount;
    Jest.utilities = this.utilities;
    Jest.states = this.states;
    Jest.currentState = this.currentState;
    Jest.focused = true;
    Jest.keys = [];
};

Jest.prototype = {
    /**
     * Jest.load()
     *
     * prepares the canvas for rendering, and starts the update process
     **/
    load : function(){
        this.loaded(this);
    },
    /**
     * Jest.loaded()
     * object event
     * makes sure everything is loaded until continuing
     **/
    loaded : function(game){
        var self = this;
        if(this.resourceManager.loadingComplete){
            game.init();
            return true;
        }else{
            setTimeout(function(){self.loaded(game);},100);
            return false;
        }
    },
    /**
     * Jest.init()
     *
     * prepares the canvas for rendering, and starts the update process
     **/
    init : function() {
        // base for starting, presetup ect.
        var self = this;

        this.renderCanvas = document.getElementById(this.renderCanvas);

        if(this.renderCanvas === null){
            this.renderCanvas = document.createElement("canvas");
        }

        // disable dragging
        this.renderCanvas.draggable = false;

        // determine if the game has the focus or not
        document.addEventListener("touchstart", function(event){
            if(event.target !== self.renderCanvas){
                Jest.focused = false;
            }else{
                Jest.focused = true;
            }});

        //this.renderCanvas.addEventListener('touchstart', function(event){Jest.focused = true; self.clicked(event,self);}, false);
        this.renderCanvas.addEventListener('click', function(event){Jest.focused = true; self.clicked(event,self);}, false);
        this.renderCanvas.addEventListener('mousemove', function(event){self.mouseMove(event,self);}, false);
        this.renderCanvas.addEventListener('mousedown', function(event){self.mouseDown(event,self);}, false);
        this.renderCanvas.addEventListener('mouseup', function(event){self.mouseUp(event,self);}, false);

        this.renderCanvas.addEventListener('contextmenu', function(event){event.preventDefault();}, false);

        // mousewheel
        this.renderCanvas.addEventListener ("mousewheel", function(event){self.mouseWheel(event,self);}, false);
        this.renderCanvas.addEventListener ("DOMMouseScroll", function(event){self.mouseWheel(event,self);}, false);

        // keypress
        document.addEventListener("keydown", function(event){if(Jest.focused){self.keyDown(event,self);}}, false);
        document.addEventListener("keyup", function(event){if(Jest.focused){self.keyUp(event,self);}}, false);

        this.renderCanvas.width = this.width;
        this.renderCanvas.height = this.height;

        this.renderer = new Jest.Renderer(this.renderCanvas);

        this.addState(this.stateName);
        this.switchState({'id' : 0});

        // setup a label to display the frameRate
        if(this.showFrameRate){
            this.frameRateLabel = new Jest.Label({'text':' ', x:0,y:30,z:1, 'font':'14pt arial bold'});
            this.addEntity(this.frameRateLabel);
        }

        this.mouseX = 0;
        this.mouseY = 0;

        this.moused = false;
        this.leftDown = false;
        this.rightDown = false;
        this.midDown = false;

        this.update();
    },
    /**
     * Jest.update()
     *
     * Main update loop for the game, updates all objects, and calls the renderer.
     **/
    update : function(){
        var curTime = (new Date()).getTime(),
            update = this.update;

        this.deltaTime = curTime - this.lastTime;
        this.lastTime = curTime;
        this.accTime += this.deltaTime;

        // Limit the delta queing
        if(this.accTime > 60){
            this.accTime = 0;
        }

        while (this.accTime > this.timeStep)
        {
            this.accTime -= this.timeStep;
            var entities = this.entities,
                entLen = this.entities.length;

            while(entLen--){
                var object = entities[entLen];
                if(object !== undefined){
                    if(object.live){
                        object.update(this.timeStep /100);
                    }else{
                        this.removeEntity(object);
                    }
                }
            }
        }

        this.renderer.redraw();
        this.frameRateLabel.text = Math.round(1000/this.deltaTime) + " fps";
        this.currentFrameRate =  Math.round(1000/this.deltaTime);

        var self = this;
        requestAnimFrame( function(){self.update();} );
    },
    /**
     * Jest.getKey()
     * returns the state of a key
     **/
    getKey : function(key){
        //todo: add logic to return the state of the key, get the keycode based off of thekey passed
        return Jest.keys[key];
    },
    /**
     * Jest.keyDown()
     * sets the state of the key pressed to true
     **/
    keyDown : function(event, self){
        Jest.keys[event.keyCode] = true;
    },
    /**
     * Jest.keyUp()
     * sets the state of the key pressed to false
     **/
    keyUp : function(event, self){
        Jest.keys[event.keyCode] = false;
    },
    /**
     * Jest.clicked()
     * object event
     * handles the click event for the canvas
     * TODO update this, I dont like how it requires origin and pos
     **/
    clicked : function(event, self){
        this.cX = 0;
        this.cY = 0;

        if (event.pageX || event.pageY) {
            this.cX = event.pageX;
            this.cY = event.pageY;
        }
        else if(event.changedTouches){
            this.cX = event.changedTouches[0].pageX;
            this.cY = event.changedTouches[0].pageY;
        }
        else {
            this.cX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            this.cY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        this.cX -= self.renderCanvas.offsetLeft;
        this.cY -= self.renderCanvas.offsetTop;

        var id = self.entities.length,
            entities = self.entities;

        while(id--){
            var entity = entities[id];
            if(entity.clickable && entity.pos && entity.origin){
                if(this.cX > entity.pos.x-entity.origin.x && this.cX < (entity.pos.x-entity.origin.x)+entity.width && this.cY > entity.pos.y-entity.origin.y && this.cY < (entity.pos.y-entity.origin.y)+entity.height){
                    entity.clicked();
                    if(entity.noClickThrough){
                        break;
                    }
                }
            }
        }

        return {'clickX' : this.cX, 'clickY' : this.cY};
    },
    /**
     * Jest.mouseMove()
     * object event
     * handles the mouse move event
     **/
    mouseMove : function(event, self){
        if(event.pageX ||event.pageY){
            self.mouseX = event.pageX - self.renderCanvas.offsetLeft;
            self.mouseY = event.pageY - self.renderCanvas.offsetTop;
        }else{
            self.mouseX = (event.clientX + document.body.scrollLeft - document.body.clientLeft) - self.renderCanvas.offsetLeft;
            self.mouseY = (event.clientY + document.body.scrollTop  - document.body.clientTop) - self.renderCanvas.offsetTop;
        }
    },
    mouseDown : function(event, self){
        self.moused = true;
        if ('which' in event) {
            switch (event.which) {
            case 1:
                self.leftDown = true;
                break;
            case 2:
                self.midDown = true;
                break;
            case 3:
                self.rightDown = true;
                break;
            }
        }

        this.mdX = 0;
        this.mdY = 0;

        if (event.pageX || event.pageY) {
            this.mdX = event.pageX;
            this.mdY = event.pageY;
        }
        else {
            this.mdX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            this.mdY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        this.mdX -= self.renderCanvas.offsetLeft;
        this.mdY -= self.renderCanvas.offsetTop;

        var id = self.entities.length,
            entities = self.entities;

        while(id--){
            var entity = entities[id];
            if(entity.clickable && entity.pos && entity.origin){
                if(this.mdX > entity.pos.x-entity.origin.x && this.mdX < (entity.pos.x-entity.origin.x)+entity.width && this.mdY > entity.pos.y-entity.origin.y && this.mdY < (entity.pos.y-entity.origin.y)+entity.height){
                    entity.mouseDown();
                }
            }
        }

        return {'mouseDownX' : this.mdX, 'mouseDownY' : this.mdY};
    },
    mouseUp : function(event, self){
        self.moused = false;
        self.leftDown = false;
        self.midDown = false;
        self.rightDown = false;
    },
    mouseWheel : function(event, self){
        var dir = 0;
        if ('wheelDelta' in event) {
            if(Math.abs(event.wheelDelta) - event.wheelDelta === 0){
                dir = -1;
            }else{
                dir = 1;
            }
        }else if (event.detail) {
            if(Math.abs(event.detail) - event.detail === 0){
                dir = 1;
            }else{
                dir = -1;
            }
        }

        return dir;
    },
    // Handles Entities

    /**
     * Jest.addEntity()
     * object entity, renderFalse bool, state object
     * renderFalse : controls if the item is added to the renderer.. idk this is kind of hack, basically its for things you want in the
     * main update loop but doesn't render at all, so like a container
     * state {name : string, OR id : number}: allows you to specify what state you want to add the entity to, if you dont specify it adds it to the current state
     **/
    addEntity : function(object, renderFalse, state){
        // add the live prop since the renderer/update chooses to display or update based on it
        if(!("live" in object)){
            object.live = true;
        }

        this.renderFalse = renderFalse;

        if(state){
            var foundState = this.getState(state);

            if(foundState){
                foundState.entityList.push(object);
                object.state = foundState;
            }
        }else{
            this.entities.push(object);
            object.state = this.currentState;
        }

        if(!renderFalse){
            this.renderer.addToRenderer(object);
        }
    },

    /**
     * Jest.removeEntity()
     * object entity, state Object
     * Removes an entity from the update cycle and renderer, you can also specify the state you want to remove from
     **/
    removeEntity : function(object, state){
        var entities = this.entities,
            numEntities = entities.length;

        if(state){
            var foundState = this.getState(state);

            if(foundState){
                entities = foundState.entityList;
                numEntities = entities.length;
            }
        }

        var item = entities.indexOf(object);

        if(typeof object.kill != 'undefined'){
            object.kill();
        }

        entities.splice(item,1);

        this.renderer.removeFromRenderer(object);

        delete object;
    },

    /**
     * Jest.addState()
     * object options
     * {name : string}
     * Adds a state the Jest, states hold their own entity list, and render list
     **/
    addState : function(name, enterState, exitState){
        var stateObj = {};

        if(name){
            stateObj.name = name;
        }else{
            stateObj.name = this.states.length;
        }

        stateObj.enterState = enterState || undefined;

        // assign it the next val
        stateObj.id = this.states.length;
        stateObj.renderList = [];
        stateObj.entityList = [];
        this.states.push(stateObj);
    },

    /**
     * Jest.getState()
     * object options
     * {name : string, id : number}
     * Finds and returns the state
     **/
    getState : function(options){
        var foundState = false;

        if("id" in options){
            foundState = this.states[options.id];
        }else if("name" in options){
            var stateName = options.name;
            for(var i = 0, len = this.states.length; i < len; i++){
                if(this.states[i].name === stateName){
                    foundState = this.states[i];
                    break;
                }
            }
        }

        return foundState;
    },

    /**
     * Jest.switchState()
     * object options
     * {name : string, id : number}
     * Adds a state the Jest, states hold their own entity list, and render list
     **/
    switchState : function(options){
        var foundState = this.getState(options);

        // throw in a debug if the state hasn't been found
        if(foundState){
            if(options.exitTransition && !options.exitComplete){
                // perform exit transition if one exists
                options.exitComplete = true;
                Game.addEntity(new Jest.Transition(options.exitTransition, function(){Game.switchState(options);}));
            }else{
                // switch the render list, and the entity list
                this.currentState = foundState;
                this.renderer.renderList = this.currentState.renderList;
                this.entities = this.currentState.entityList;

                // if the state has an enter state function call it
                if(foundState.enterState){
                    foundState.enterState();
                }

                // Perform enter transition if one exists
                if(options.enterTransition){
                    Game.addEntity(new Jest.Transition(options.enterTransition));
                }
            }
        }
    },
    /**
     * Jest.checkHit(x,y)
     * x,y number
     * Checks all the entities to see if they were hit by the coords. Very expensive right now definitly need to clean it up
     **/
    checkHit : function(x,y){
        var numEntities = this.entities.length,
            entities = this.entities;

        this.hitEntities = [];

        for (var id  = 0,entLen = this.entities.length; id < entLen; id ++){
            var object = entities[id];
            if(object.live && object.clickable){
                if(x > object.x && x < object.x + object.width && y > object.y && y < object.y + object.height){
                    this.hitEntities.push(object);
                }
            }
        }
    }
};