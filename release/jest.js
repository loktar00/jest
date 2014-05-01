/** Background, basically a static sprite, in terms of moving on the screen. Mainly used for scrolling a single image over and over */

/** TODO : handle the bgIndex in the parralax portion.. not in here since bg's can be used multiple times **/
Jest.Background = function(options)
{
    options = options || {};
    this.resource = options.resource || null;
    this.width = options.width || Jest.bounds.width;
    this.height = options.height || Jest.bounds.height;
    this.startX = options.startX || 0;
    this.startY = options.startY || 0;
    this.alpha = options.alpha || 100;

    var endX = 32,
        endY = 32;

    if(this.resource){
        endX = this.resource.source.width;
    }

    if(this.resource){
        endY = this.resource.source.height;
    }

    this.endX = options.endX || endX;
    this.endY = options.endY || endY;

    this.bgIndex = options.bgIndex || 0;
    this.pos = {x : options.x || 0, y : options.y || 0};
    this.state = options.state || { id : 0 };

    this.visible = true;
    this.x = this.pos.x;
    this.y = this.pos.y;
    this.scrollX = 0;
    this.scrollY = 0;
    this.live = true;
    this.bg = true;

    if(this.endX < this.width){
        var tempCanvas = document.createElement("canvas"),
            tempCtx = tempCanvas.getContext("2d"),
            source = this.resource.source,
            widthDiff =  this.width - this.endX;

            tempCanvas.width = this.endX + widthDiff;
            tempCanvas.height = this.endY;

            tempCtx.drawImage(source,0,0,this.endX,this.endY,0,0, this.endX, this.endY);
            tempCtx.drawImage(source,0,0,widthDiff,this.endY,this.endX, 0, widthDiff, this.endY);

            this.endX = this.endX + widthDiff;
            this.resource.source = tempCanvas;
    }
};

Jest.Background.prototype = {
    // Handles updating
    update : function(deltaTime)
    {
    },
    scroll : function(speedX, speedY, deltaTime){
        this.scrollX += speedX  * deltaTime;
        this.scrollY += speedY *  deltaTime;

        if(this.scrollY > this.endY){
            this.scrollY = 0;
        }else if(this.scrollY < 0){
            this.scrollY = this.endY;
        }

        if(this.scrollX > this.endX){
            this.scrollX = 0;
        }else if(this.scrollX < 0){
            this.scrollX = this.endX;
        }
    },
    // Draw
    render : function(context){
        context.save();
        context.globalAlpha = this.alpha * 0.01;
        var source = this.resource.source;
        if(this.startY + this.scrollY > this.endY-this.height || this.startX + this.scrollX > this.endX-this.width){
            var sX = [this.startX+this.scrollX, this.startX],
                sY = [this.startY+this.scrollY, this.startY],
                sWidth = [this.width, this.width],
                sHeight = [this.height, this.height],
                dX = [this.pos.x, this.pos.x],
                dY = [this.pos.y, this.pos.y],
                dWidth = [this.width, this.width],
                dHeight = [this.height, this.height];

            // check the Y and set values accordingly
            if(this.startY + this.scrollY > this.endY-this.height){
                sY[0] = this.startY+this.scrollY;
                sY[1] = this.startY;

                sHeight[0] = this.endY-(this.startY+this.scrollY);
                sHeight[1] = this.height;

                dY[0] = this.pos.y;
                dY[1] = this.pos.y+this.endY-(this.startY+this.scrollY);

                dHeight[0] = this.endY-(this.startY+this.scrollY);
                dHeight[1] = this.height;
            }

            // Check the X and set value accordingly
            if(this.startX + this.scrollX > this.endX-this.width){
                sX[0] = this.startX+this.scrollX;
                sX[1] = this.startX;

                sWidth[0] = this.endX-(this.startX+this.scrollX);
                sWidth[1] = this.width;

                dX[0] = this.pos.x;
                dX[1] = this.pos.x+this.endX-(this.startX+this.scrollX);

                dWidth[0] = this.endX-(this.startX+this.scrollX);
                dWidth[1] = this.width;
            }

            context.drawImage(source,sX[0],sY[0],sWidth[0],sHeight[0],dX[0], dY[0], dWidth[0], dHeight[0]);
            context.drawImage(source,sX[1],sY[1],sWidth[1],sHeight[1],dX[1], dY[1], dWidth[1], dHeight[1]);
        }else{
            context.drawImage(source,this.startX+this.scrollX,this.startY+this.scrollY,this.width,this.height, this.pos.x, this.pos.y, this.width, this.height);
        }

        context.restore();
        context.globalAlpha = 1;
    }
};

Jest.Emitter = function(options)
{
    this.live = true;
    this.particleGroups = [];

    // Timing specifics
    this.lastUpdate = new Date().getTime();
    this.startTime =  new Date().getTime();

    options = options || {};
    this.width = options.width || Jest.bounds.width;
    this.height = options.height || Jest.bounds.height;
    this.pos = options.pos || {x:0,y:0,z:0};

    this.particles = [];

    Game.addEntity(this, true);
};

Jest.Emitter.prototype = {
    getParticles : function()
    {
        return this.particles;
    },

    addGroup : function(particleGroup){
        particleGroup.startTime = new Date().getTime();
        particleGroup.lastUpdate = new Date().getTime();
        if(typeof particleGroup.delay == 'undefined'){
            particleGroup.delay = 0;
        }
        this.particleGroups.push(particleGroup);
    },

    removeGroup : function(group){
        var len = this.particleGroups.length;

        if(typeOf(group) == "String"){
            while(len--){
                if(group === this.particleGroups[len].name){
                    this.particleGroups.splice(len, 1);
                    return;
                }
            }
        }else{
            while(len--){
                if(group === this.particleGroups[len]){
                    this.particleGroups.splice(len, 1);
                    return;
                }
            }
        }

        return false;
    },

    getGroup : function(group){
        var len = this.particleGroups.length;

        if(typeOf(group) == "String"){
            while(len--){
                if(group === this.particleGroups[len].name){
                    return this.particleGroups[len];
                }
            }
        }else{
            while(len--){
                if(group === this.particleGroups[len]){
                    return this.particleGroups[len];
                }
            }
        }

        return false;
    },

    kill : function(){
        this.particleGroups = [];
    },

    update : function(deltaTime)
    {
        this.lastUpdate = new Date().getTime();

        var particleGroups = this.particleGroups,
            util = Game.Utilities,
            pg = particleGroups.length;

        while(pg--){
            if(this.lastUpdate - particleGroups[pg].lastUpdate >= 1000/particleGroups[pg].rate && this.lastUpdate > particleGroups[pg].startTime + particleGroups[pg].delay && Game.currentFrameRate > 30){
                particleGroups[pg].lastUpdate = this.lastUpdate;
                if(this.lastUpdate - this.startTime < particleGroups[pg].duration || particleGroups[pg].duration === -1){

                    if(particleGroups[pg].oneShot){
                        p = particleGroups[pg].rate;
                    }else{
                        p = 1;
                    }

                    while(p--){
                        particleGroups[pg].x = this.pos.x;
                        particleGroups[pg].y = this.pos.y;
                        particleGroups[pg].z = this.pos.z;

                        var thrustRange = particleGroups[pg].thrustRange,
                            angleRange = particleGroups[pg].angleRange;

                        if(typeof thrustRange != 'undefined'){
                            if(typeof thrustRange.max != 'undefined' && typeof thrustRange.min != 'undefined'){
                                particleGroups[pg].thrust = util.getRandomRange(thrustRange.min,thrustRange.max);
                            }else if(typeof thrustRange.max != 'undefined'){
                                particleGroups[pg].thrust = util.getRandomRange(0,thrustRange.max);
                            }
                        }

                        if(typeof angleRange != 'undefined'){
                            if(typeof angleRange.max != 'undefined' && typeof angleRange.min != 'undefined'){
                                particleGroups[pg].angle = util.fGetRandomRange(angleRange.min, angleRange.max);
                            }else if(typeof angleRange.max != 'undefined'){
                                particleGroups[pg].angle = util.fGetRandomRange(0,angleRange.max);
                            }
                        }

                        // should add a pool here and recycle particles for perf
                        particleGroups[pg].list = this.particles;
                        var curParticle = new Jest.Particle(particleGroups[pg]);
                        this.particles.push(curParticle);

                        Game.addEntity(curParticle);
                    }
                }else{
                    this.particleGroups.splice(pg, 1);
                }
            }

        }
    }
};
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
Jest.Label = function(options)
{
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
};

Jest.Label.prototype = {
    // Handles updating the label
    update : function(deltaTime)
    {

    },
    // Draw the label
    render : function(context)
    {
        context.fillStyle = this.color;
        context.font = this.font;
        context.fillText(this.text, this.pos.x, this.pos.y);
    }
};
Jest.ParralaxBackground = function(options)
{
    this.live = true;
    this.curSpeedCheck = 0;
    this.curSpeedMult = 0;
    this.backgrounds = [];

    options = options || {};

    this.width  = options.width || Game.bounds.width;
    this.height  = options.height || Game.bounds.height;

    this.state = {'id' : 0};
    if("state" in options){
        this.state = options.state;
    }

    Game.addEntity(this, true, this.state);
};

/** Add a background image that scrolls
** options : background, speedMultX, speedMultY
*/
Jest.ParralaxBackground.prototype.addBackground = function(options)
{
    if(options){
        var background = {},
            speedMultX = 0,
            speedMultY = 0;

        if(options.background){
            background = options.background;
            Game.addEntity(background, false, this.state);
        }else{
            return false;
        }

        if(options.speedMultX){
            speedMultX = options.speedMultX;
        }

        if(options.speedMultY){
            speedMultY = options.speedMultY;
        }

        this.backgrounds.push({'bg' : background, 'speedMultX' : speedMultX, 'speedMultY' : speedMultY});
    }else{
        return false;
    }
};

/** Update a background (used to change scroll speed dynamically)
** options : bgIndex, speedMultX, speedMultY
*/
Jest.ParralaxBackground.prototype.updateBackground = function(options){

    if(typeof options !== 'undefined' && typeof options.bgIndex !== 'undefined'){
        if(options.speedMultX){
            this.backgrounds[options.bgIndex].speedMultX = options.speedMultX;
        }

        if(options.speedMultY){
            this.backgrounds[options.bgIndex].speedMultY = options.speedMultY;
        }
    }
};

// updates the backgrounds
Jest.ParralaxBackground.prototype.update = function(deltaTime)
{
    for(var len = this.backgrounds.length, bg = 0; bg < len; bg++){
        this.backgrounds[bg].bg.scroll(this.backgrounds[bg].speedMultX, this.backgrounds[bg].speedMultY, deltaTime);
    }
};
Jest.Particle = function(options){

    Jest.Sprite.call(this, options);
    Jest.particleCount++;

    this.startLife = new Date().getTime();
    this.curStep = 0;

    options = options || {};
    this.lifeTime = (options.lifeTime !== undefined) ? options.lifeTime : 1000;
    this.delay = options.delay || 0;

    this.size = options.size || 1;
    this.width = this.height = this.size;
    this.startSize = options.startSize || this.size;
    this.endSize = (options.endSize !== undefined) ? options.endSize : this.size;
    this.thrust = options.thrust || 0;
    this.gravity = options.gravity || 0;

    this.angle = options.angle || 0;
    this.angleChange = options.angleChange || 0;
    this.alignToAngle = options.alignToAngle || false;
    this.drawAngle = options.drawAngle || 0;
    this.drawAngleChange = options.drawAngleChange || 0;

    this.startColor = options.startColor || this.color;
    this.endColor = options.endColor || this.color;
    this.startAlpha = (options.startAlpha !== undefined) ? options.startAlpha : 1;
    this.endAlpha = (options.endAlpha !== undefined) ? options.endAlpha : 1;
    this.blend = options.blend || false;

    // sets the origin to the center
    this.origin.y = this.height/2;
    this.origin.x = this.width/2;

    this.endLife = this.startLife + this.lifeTime;

    // precalc color changes
    this.colors = [];

    if(this.endColor !== this.startColor){
        for(var i =  Math.ceil(this.lifeTime/Jest.frameRate)+1; i > -1; i--){
            this.colors.push(this.colorFade(this.startColor, this.endColor, this.lifeTime, i*Jest.frameRate));
        }
    }
};

Jest.Particle.prototype = new Jest.Sprite();

Jest.Particle.prototype.update = function(deltaTime)
{
    this.curStep =  this.endLife - new Date().getTime();

    this.vel.x = Math.cos(((this.angle)) *  Math.PI / 180) * this.thrust * deltaTime;
    this.vel.y = ((Math.sin(((this.angle)) *  Math.PI / 180) * this.thrust)+this.gravity*(this.lifeTime-this.curStep)*deltaTime) * deltaTime;


    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    if(this.pos.y < 0 || this.pos.y > Jest.bounds.y + Jest.bounds.height){
        this.live = false;
        Jest.particleCount--;
    }

    if(new Date().getTime() > this.endLife){
        this.live = false;
        Jest.particleCount--;
    }

    // Do the changes between
    if(this.endAlpha !== this.startAlpha){
        if(this.endAlpha > this.startAlpha){
            this.alpha = ((this.startAlpha-this.endAlpha)/this.lifeTime)*this.curStep;
        }else{
            this.alpha = this.endAlpha + ((this.startAlpha-this.endAlpha)/this.lifeTime)*this.curStep;
        }
    }

    if(this.endColor !== this.startColor){
        this.color = this.colors[Math.ceil((this.lifeTime-this.curStep)/Jest.frameRate)];
    }

    if(this.endSize !== this.size){
        var scale = 0;
        if(this.endSize < this.startSize){
            scale =  ((this.startSize-this.endSize)/this.lifeTime)*this.curStep;
            this.scale = {x : -scale, y : -scale};
            //this.size = scale;
        }else{
            scale = this.endSize + ((this.startSize-this.endSize)/this.lifeTime)*this.curStep;
            this.scale = {x : -scale, y : -scale};
            //this.size = scale;
        }
    }

    if(this.angleChange){
        this.angle += this.angleChange*deltaTime;
    }

    if(this.drawAngleChange){
        this.drawAngle += this.drawAngleChange*deltaTime;
    }

    if(this.alignToAngle){
        this.drawAngle = this.angle;
    }
};

Jest.Particle.prototype.render = function(context){
    context.save();

    var scale = this.scale || {x:0,y:0},
        x = this.pos.x,
        y = this.pos.y,
        oX = this.origin.x,
        oY = this.origin.y,
        width = this.width,
        height = this.height,
        rotAngle = this.drawAngle*Math.PI/180;

    if(this.blend){
        context.globalCompositeOperation = "lighter";
    }

    if(!this.shape){
        context.globalAlpha  = this.alpha;

        if(this.drawAngle !== 0){
            context.translate(x, y);
            context.rotate(rotAngle);
            context.drawImage(this.resource.source,this.startX,this.startY,width,height, scale.x/2, scale.y/2, width-scale.x,height-scale.y);
        }else{
            context.drawImage(this.resource.source,this.startX,this.startY,width,height, x-oX, y-oY, width-scale.x,height-scale.y);
        }
    }else{
        var color = this.color || {r:0,g:0,b:0};
        context.fillStyle = "rgba(" + color.r+ "," + color.g + "," + color.b + "," + this.alpha + ")";
        if(this.drawAngle !== 0){
            context.translate(x, y);
            context.rotate(rotAngle);
            context.fillRect(-oX,-oY,width-scale.x,height-scale.y);
        }else{
            context.fillRect(x-oX, y-oY, width-scale.x,height-scale.y);
        }
    }
    context.restore();
    context.globalCompositeOperation = "source-over";
};

Jest.Particle.prototype.colorFade = function(startColor, endColor, totalSteps, step){
    var scale = step/totalSteps,
        r = endColor.r + scale*(startColor.r - endColor.r);
        b = endColor.b + scale*(startColor.b - endColor.b);
        g = endColor.g + scale*(startColor.g - endColor.g);

        return {r : Math.floor( Math.min(255,  Math.max(0, r))), g: Math.floor( Math.min(255,  Math.max(0, g))), b:  Math.floor( Math.min(255,  Math.max(0, b)))};
};
Jest.Renderer = function(canvas){
    this.renderList  = [];
    this.canvas    = canvas;
    this.context   = this.canvas.getContext("2d");
    this.width     = this.canvas.width;
    this.height    = this.canvas.height;
};

Jest.Renderer.prototype = {
    // Todo: I dont like this. fix the sorting, right now sorts on y, but could potentially sort based on z
    redraw : function ()
    {
        this.context.clearRect(0,0,this.width,this.height);
        //this.renderList.sort(function(a,b){return b.y-a.y});

        this.renderList.sort(function(a,b){
            if(a.bg && b.bg){
                return b.bgIndex - a.bgIndex;
            }else if(a.ui && b.ui){
                return b.uiIndex - a.uiIndex;
            }else if(a.bg || b.ui){
                return 1;
            }else if(b.bg || a.ui){
                return -1;
            }else if(a.pos && b.pos){
                return b.pos.z - a.pos.z;
            }
            return 0;
        });

        var id =  this.renderList.length;

        while(id--){
            var curObject = this.renderList[id];
            if(curObject.visible){
                curObject.render(this.context);
            }
        }
    },

    /**
     * Renderer.addToRenderer(object)
     *
     * add a new item to the renderer
     **/
    addToRenderer : function (object)
    {
        this.renderList.push(object);
    },

    /**
     * Renderer.removeFromRenderer(object)
     *
     * remove an item from the renderer
     **/
    removeFromRenderer : function (object)
    {
        var list = this.renderList,
            objIndex = list.indexOf(object);

        if(objIndex !== -1){
            list.splice(list.indexOf(object), 1);
        }
    }
};
Jest.Resource = function(_resource, _type){
    if(_type == 1 || _type == "img" || _type === null){
        this.source = new Image();
    }else if(_type == 2 || _type == "audio"){
        this.source = new Audio();
    }
    this.source.src = _resource;
};

Jest.Resource.prototype.changeResource = function(_resource){
    this.source.src = _resource;
};

Jest.ResourceManager = function(){
    this.resources = [];
    this.loaded = 0;
    this.loadingComplete = true;
};

Jest.ResourceManager.prototype = {
    /**
     * Resourcemanager.add(_resource, _type)
     * object resource, String/Number, String
     * adds a new resource for use and begins the process of loading
     **/
    add : function(_resource, _type, _name){
        var resource = {'path' : _resource, 'type' : _type, 'name' : _name};

        // if the resource is an existing image
        if(_resource.src){
            resource.path = _resource.src;
        }

        this.loadingComplete = false;

        if(_name === undefined){
            _name = "";
        }

        if(_type == 1 || _type == "img" || _type === null){
            if(_resource.nodeType === 1){
                resource.source = _resource;
            }else{
                resource.source = new Image();
            }

            this.resources.push({resource : resource, name : _name});
            resource.source.onload = function(callback, res){resource.loaded = true; callback.loadImg(callback, res);}(this, resource);

            if(_resource.nodeType === 1){
                resource.source.src = _resource.src;
            }else{
                resource.source.src = _resource;
            }

        }else if(_type == 2 || _type == "audio"){
            resource.source = new Audio();
            this.resources.push({resource : resource, name : _name});
            this.loadAudio(resource);
            resource.source.src = _resource;
        }

        return resource;
    },
    /**
     * Resourcemanager.loadImg()
     * object event
     * reports when an image is loaded
     **/
    loadImg : function(callback, resource){
        if(resource.source.complete && resource.source.width){
            callback.loaded++;

            if(callback.loaded === callback.resources.length){
                callback.loadingComplete = true;
            }
        }else{
            setTimeout(function(){callback.loadImg(callback, resource);},10);
        }
    },
    /**
     * Resourcemanager.loadAudio(audio)
     * object audio resource
     * reports when audio is loaded
     **/
    loadAudio : function(audio,timeOut){
        clearTimeout(timeOut);
        timeOut = 0;

        var self = this;

        if (audio.source.readyState > 0) {
            this.loaded++;

            if(this.loaded === this.resources.length){
                this.loadingComplete = true;
            }
        } else {
            timeOut = setTimeout(function(){self.loadAudio(audio, timeOut);}, 100);
        }
    },
    /**
     * Resourcemanager.getResource(name)
     * string/text
     * returns the resource by name if found
     **/
     getResource : function(_name){
        var resources = this.resources;

        for(var i = 0, l = resources.length; i < l; i++){
            if(resources[i].name == _name){
                return resources[i].resource;
            }
        }
     }
};
(function(p,n,j,t,q,u,v){function x(b){var c,d,a=this,f=b.length,e=0,i=a.c=a.d=a.f=0;a.a=[];a.e=[];for(f||(b=[f++]);e<j;)a.a[e]=e++;for(e=0;e<j;e++){c=a.a[e];i=g(i+c+b[e%f]);d=a.a[i];a.a[e]=d;a.a[i]=c}a.b=function(y){var h=a.a,k=g(a.c+1),l=h[k],m=g(a.d+l),o=h[m];h[k]=o;h[m]=l;for(var r=h[g(l+o)];--y;){k=g(k+1);l=h[k];m=g(m+l);o=h[m];h[k]=o;h[m]=l;r=r*j+h[g(l+o)]}a.c=k;a.d=m;return r};a.b(j)}function w(b,c,d,a){d=[];if(c&&typeof b=="object")for(a in b)if(a.indexOf("S")<5)try{d.push(w(b[a],c-1))}catch(f){}return d.length?d:""+b}function s(b,c,d,a){b+="";for(a=d=0;a<b.length;a++)c[g(a)]=g((d^=c[g(a)]*19)+b.charCodeAt(a));b="";for(a in c)b+=String.fromCharCode(c[a]);return b}function g(b){return b&j-1}n.seedrandom=function(b,c){var d=[],a;b=s(w(c?[b,p]:arguments.length?b:[(new Date).getTime(),p,window],3),d);a=new x(d);s(a.a,p);n.random=function(){for(var f=a.b(t),e=v,i=0;f<q;){f=(f+i)*j;e*=j;i=a.b(1)}for(;f>=u;){f/=2;e/=2;i>>>=1}return(f+i)/e};return b};v=n.pow(j,t);q=n.pow(2,q);u=q*2;s(n.random(),p)})([],Math,256,6,52);

Jest.Sprite = function(options)
    {
        options = options || {};
        this.width = options.width || 32;
        this.height = options.height || 32;

        // Set the position
        this.pos = options.pos || {x:0, y:0, z:0};
        if(options.x && options.y){
            var z = 0;
            if(options.z){
                z = options.z;
            }
            this.pos = new Vector(options.x,options.y,z);
        }else if(options.pos){
            this.pos = options.pos;
        }else{
            this.pos = new Vector(0,0,0);
        }

        // Set drawing origin
        this.origin = options.origin || {x:0, y:0, z:0};
        if(options.ox && options.oy){
            var oz = 0;
            if(options.oz){
                oz = options.oz;
            }
            this.origin = new Vector(options.ox,options.oy,oz);
        }else if(options.origin){
            this.origin = options.origin;
        }else{
            this.origin = new Vector(0,0,0);
        }

        // Set an initial velocity
        this.vel = options.vel || {x:0, y:0, z:0};
        if(options.vx && options.vy){
            var vz = 0;
            if(options.vz){
                vz = options.vz;
            }
            this.vel = new Vector(options.vx,options.vy,vz);
        }else if(options.vel){
            this.vel = options.vel;
        }else{
            this.vel = new Vector(0,0,0);
        }

        // StartX and StartY are used for animated sprites to determine which frame to show
        this.startX = options.startX || 0;
        this.startY = options.startY || 0;

        this.tileable = options.tileable || false;
        if(this.tileable){
            this.endX = options.endX || this.width;
            this.endY = options.endY || this.height;
        }

        // If theres not a resource specified we just assume its going to be a rect
        if(options.resource === undefined){
            this.shape = true;
            this.resource = {};
        }else{
            this.shape = false;
            this.resource = options.resource;
        }

        this.angle = options.angle || 0;
        this.thrust = options.thrust || 0;
        this.color = options.color || {r:255,g:255,b:255};
        this.alpha = 255;
        this.clickable = options.clickable || false;

        // for referencing a list of entities or sprites its a part of
        if(options.list && options.list.length != 'undefined'){
            this.list = options.list;
            this.list.push(this);
        }else{
            this.list = [];
        }

        // required properties
        this.visible = true;

        this.animations = [];
        this.curAnim = {name : "", frames : 0};
        this.isAnimating = false;

        this.lastAnim = 0;
        this.animSpeed = 0;

        this.x = this.pos.x;
        this.y = this.pos.y;

        this.live = true;
    };

Jest.Sprite.prototype = {
    // Handles updating the sprite
    update : function(deltaTime)
    {

        if(this.isAnimating){
            if(new Date().getTime() > this.lastAnim + this.animSpeed){
                this.lastAnim = new Date().getTime();
                this.startX  = this.width * this.curAnim.frames[this.frame];
                this.frame++;
                if(this.frame > this.curAnim.frames.length-1){
                    // stop if its a one shot animation
                    if(this.animType !== 1){
                        this.isAnimating = false;
                    }else{
                        this.frame = 0;
                    }
                }
            }
        }
    },
    // Add animation sequences for animated sprites
    addAnimation : function(sequence, sequenceName){
        var aniSequence = {name : sequenceName, frames : sequence};
        this.animations.push(aniSequence);
    },
    /** Play animation sequence
     * sequenceName - name of prev added sequence
     * animSpeed - milliseconds between frames
     * animType - 0/null/undefined = play sequence full once, 1 = play until stopped
    **/
    playAnimation : function(sequenceName, animSpeed, animType){
        for(var i = 0, len = this.animations.length; i < len; i++){
            var curAnim = this.animations[i];
            if(curAnim.name === sequenceName){
                this.curAnim = curAnim;
                this.animSpeed = animSpeed;
                if(typeof animType == 'undefined'){
                    this.animType = 0;
                }else{
                    this.animType = animType;
                }
                this.frame = 0;
                this.isAnimating = true;
            }
        }
    },
    stopAnimation : function(){
        if(this.isAnimating){
            this.isAnimating = false;
            this.curAnim = {name : "", frames : 0};
        }
    },
    // Check for collisions
    checkCollision : function(x, y){
    },
    // Change the frame to a specific one
    changeFrame : function(frame){
        this.startX = frame*this.width;
    },
    kill : function(){
        // do something before its "dead"
        if(this.list.length > 0){
            var listItem = this.list.length,
                list = this.list,
                item = list.indexOf(this);

            if(item){
                list.splice(item,1);
            }
        }
    },
    // Draw
    render : function(context){
        context.save();
        if(!this.shape){

            // render to the nearest full pixel
            var cX = (0.5 + (this.pos.x-this.origin.x)) << 0,
                cY = (0.5 + (this.pos.y-this.origin.y)) << 0;

            context.drawImage(this.resource.source,this.startX,this.startY,this.width,this.height, cX, cY, this.width,this.height);
        }else{
            var color = this.color;
            context.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + "," + this.alpha + ")";
            context.fillRect(this.pos.x-this.origin.x, this.pos.y-this.origin.y, this.width,this.height);
        }
        context.restore();
    },
    clicked : function(){
        // Object was clicked do some stuff brah
    },
    mouseDown : function(){
        // Object was mousedDown on do some stuff brah
    }
};
Jest.Transition = function(options, callback)
{
        // Defaults
        if(callback){
            this.callback = callback;
        }else{
            this.callback = function(){return true;};
        }

        this.effect = "fadeOut";
        this.duration = 1000;
        this.start = new Date().getTime();

        if(options !== undefined){
            if(options.effect){
                this.effect = options.effect;
            }

            if(options.duration){
                this.duration = options.duration;
            }
        }

        this.timeStep = this.duration/Game.frameRate;
        this.steps = this.duration/Game.frameRate;
        this.curStep = 0;
        this.visible = true;
        this.live = true;

        Game.addEntity(this);
};

Jest.Transition.prototype = {
    // Handles updating the sprite
    update : function(deltaTime)
    {
        if(this.complete){
            Game.renderCanvas.style.cursor = "default";
            this.live = false;
            this.callback();
        }
    },
    // Draw
    render : function(_context){
        switch(this.effect){
            case "fadeOut":
                _context.globalAlpha = 1-(1/this.timeStep)*this.curStep;
                break;
            case "fadeIn":
                _context.globalAlpha = (1/this.timeStep)*this.curStep;
                break;
        }

        this.curStep ++;

        if(this.curStep >= this.steps){
            this.complete = true;
        }
    }
};
// Utility merge from the awesome https://github.com/Titani/SO-ChatBot/
Object.merge = function () {
    return [].reduce.call( arguments, function ( ret, merger ) {

        Object.keys( merger ).forEach(function ( key ) {
            ret[ key ] = merger[ key ];
        });

        return ret;
    }, {} );
};

Jest.prototype.Utilities = {
    getRandomRange : function(_min, _max){
        return Math.floor(Math.random()*(_max-_min+1))+_min;
    },
    fGetRandomRange :  function(_min, _max){
        return Math.random()*(_max-_min)+_min;
    },
    getDistance : function(a, b){
        return Math.sqrt((b.x - a.x) *(b.x - a.x) + (b.y - a.y) * (b.y - a.y));
    },
    getAngle : function(a,b){
        var tx = b.x - a.x,
            ty = b.y - a.y,
            rad = Math.atan2(ty,tx),
            angle = rad/Math.PI * 180;

        return angle;
    },
    getRad : function(a,b){
        var tx = b.x - a.x,
            ty = b.y - a.y,
            rad = Math.atan2(ty,tx);

        return rad;
    },
    colCheck : function(shapeA, shapeB) {
        // get the vectors to check against
        var vX = (shapeA.pos.x + (shapeA.width / 2)) - (shapeB.pos.x + (shapeB.width / 2)),
            vY = (shapeA.pos.y + (shapeA.height / 2)) - (shapeB.pos.y + (shapeB.height / 2)),
            // add the half widths and half heights of the objects
            hWidths = (shapeA.width / 2) + (shapeB.width / 2),
            hHeights = (shapeA.height / 2) + (shapeB.height / 2),
            collision = false,
            offset = {x : 0, y : 0};

        if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
            var oX = hWidths - Math.abs(vX),
                oY = hHeights - Math.abs(vY);

            if (oX >= oY) {
                if (vY > 0) {
                    //top
                    offset.y += oY;
                } else {
                    //bottom
                    offset.y -= oY;
                }
            } else {
                if (vX > 0) {
                    //left
                    offset.x += oX;
                } else {
                    //right
                    offset.x -= oX;
                }
            }
        }

        if(offset.x !== 0 || offset.y !== 0){
            collision = true;
        }

        return {collision : collision, offset : offset};
    },
    mouse : function(ev){
        if(ev.pageX || ev.pageY){
            return {x:ev.pageX, y:ev.pageY};
        }
        return {
            x:ev.clientX + document.body.scrollLeft - document.body.clientLeft,
            y:ev.clientY + document.body.scrollTop  - document.body.clientTop
        };
    },
    getGradColor : function(startColor, endColor, height, width){
        var scale = -(width-height)/6,
            r = startColor.r + scale*(endColor.r - startColor.r);
            b = startColor.b + scale*(endColor.b - startColor.b);
            g = startColor.g + scale*(endColor.g - startColor.g);

        return "rgb(" +  Math.floor( Math.min(255,  Math.max(0, r))) + "," +  Math.floor( Math.min(255,  Math.max(0, g))) + "," +  Math.floor( Math.min(255,  Math.max(0, b))) + ")";
    },
    preCalcRotation : function(resource, numRotations, frameWidth, frameHeight, offsetAngle, debug){
        if(resource.nodeType === 1){
            var img = resource;
            resource = {};
            resource.source = img;
        }

        var tempCanvas = document.createElement("canvas"),
            tempCtx = tempCanvas.getContext("2d"),
            frameCanvas = document.createElement("canvas"),
            frameCtx = frameCanvas.getContext("2d"),
            frames =  resource.source.width/frameWidth,
            angleIncrement = 360/numRotations;
            startAngle = 0;

        if(offsetAngle){
            startAngle = offsetAngle;
        }

        tempCanvas.width = resource.source.width;
        tempCanvas.height = Math.ceil(frameHeight * 360/angleIncrement);
        frameCanvas.width = frameWidth;
        frameCanvas.height = frameHeight;

        // goes through each frame and rotates it adding it vertically
        for(var y = 0; y < numRotations; y++){
            for(var x = 0; x < frames; x++){
                frameCtx.clearRect(0,0,frameWidth,frameHeight);
                frameCtx.save();
                frameCtx.translate(frameCanvas.width/2, frameCanvas.height/2);
                frameCtx.rotate((startAngle + angleIncrement*y)*Math.PI/180);
                frameCtx.drawImage(resource.source,x*frameWidth,0,frameWidth,frameHeight,-frameWidth/2,-frameHeight/2,frameWidth,frameHeight);
                frameCtx.restore();
                tempCtx.drawImage(frameCanvas,0,0,frameWidth,frameHeight,x*frameWidth,y*frameHeight,frameWidth,frameHeight);
            }
        }

        /* Debug */

        if(debug){
            var imageRes = new Image();
            imageRes.onload = function(){
                document.body.appendChild(this);
            };
            imageRes.src = tempCanvas.toDataURL();
        }

        resource.source = tempCanvas;
        return tempCanvas;
    },
    colorize : function(resource, hsv){
        var tempCanvas = document.createElement("canvas"),
            tempCtx = tempCanvas.getContext("2d");

            tempCanvas.width = resource.source.width;
            tempCanvas.height = resource.source.height;
            tempCtx.drawImage(resource.source, 0 , 0);

        var imgd = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height),
            pix = imgd.data,
            h = hsv.h,
            s = hsv.s,
            v = hsv.v;

        for (var i = 0, n = pix.length; i <n; i += 4) {
            var hsv = this.rgbhsv({r : pix[i], g:pix[i + 1], b:pix[i + 2]});

            hsv.h+=h;
            if(hsv.h < 0){
                hsv.h = 0
            }else if(hsv.h > 360){
                hsv.h = 360;
            }
            hsv.s+=s;
            hsv.v+=v;

            var newColor = this.hsvrgb(hsv);

            pix[i] = newColor.r;
            pix[i+1] = newColor.g;
            pix[i+2] = newColor.b;
        }

        tempCtx.putImageData(imgd, 0, 0);
        //document.body.appendChild(tempCanvas);
        return tempCanvas.toDataURL();
    },
    rgbhsv : function(color){
        var r = color.r,
            g = color.g,
            b = color.b,
            maxColor = Math.max(r,g,b),
            minColor = Math.min(r,g,b),
            h = 0,
            s = 0,
            v = 0;

            if(maxColor == minColor){
                h = 0;
            }else if(maxColor == r){
                h = 60.0 * ((g - b) / (maxColor - minColor)) % 360.0;
            }else if(maxColor == g){
                h = 60.0 * ((b - r) / (maxColor - minColor)) + 120.0;
            }else if(maxColor == b){
                h = 60.0 * ((r - g) / (maxColor - minColor)) + 240.0;
            }

            v = maxColor;
            if(maxColor == 0.0){
                s = 0.0;
            }else{
                s = 1.0 - (minColor / maxColor);
            }

            return {h : h, s : s, v :v};
    },
    hsvrgb : function(hsv){
        var h = hsv.h,
            s = hsv.s,
            v = hsv.v,
            color = {r:0,g:0,b:0},
            hi = Math.floor(h/60.0)%6,
            f =  (h / 60.0) - Math.floor(h / 60.0),
            p = v * (1.0 - s),
            q = v * (1.0 - (f*s)),
            t = v * (1.0 - ((1.0 - f) * s));

        switch(hi){
            case 0:
                color.r =v;
                color.g = t;
                color.b = p;
                break;
            case 1:
                color.r =q;
                color.g = v;
                color.b = p;
                break;
            case 2:
                color.r = p;
                color.g = v;
                color.b = t;
                break;
            case 3:
                color.r = p;
                color.g = q;
                color.b = v;
                break;
            case 4:
                color.r = t;
                color.g = p;
                color.b = v;
                break;
            case 5:
                color.r = v;
                color.g = p;
                color.b = q;
                break;
        }

        return color;
    }
}
(function () {
    function Vector(x, y, z)
    {
        this.x = x;
        this.y = y;
        this.z = z;

        copy = function(v){
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
        },
        add = function(v){
            this.x += v.x;
            this.y += v.y;
            this.z += v.z;
        },
        sub = function(v){
            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;
        },
        cross = function(v){
            this.tx = this.x;
            this.ty = this.y;
            this.tz = this.z;

            this.x = this.ty * v.z - this.tz * v.y;
            this.y = this.tz * v.x - this.tx * v.z;
            this.z = this.tx * v.y - this.ty * v.x;
        },
        multiply = function(s){
            this.x *= s;
            this.y *= s;
            this.z *= s;
        },
        distanceTo = function(v){
            this.dx = this.x - v.x;
            this.dy = this.y - v.y;
            this.dz = this.z - v.z;

            return Math.sqrt(this.dx * this.dx + this.dy * this.dy + this.dz * this.dz);
        },

        distanceToSquared = function(v){
            this.dx = this.x - v.x;
            this.dy = this.y - v.y;
            this.dz = this.z - v.z;

            return this.dx * this.dx + this.dy * this.dy + this.dz * this.dz;
        },

        length = function(){
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        },

        lengthSq = function(){
            return this.x * this.x + this.y * this.y + this.z * this.z;
        },

        negate = function(){
            this.x = -this.x;
            this.y = -this.y;
            this.z = -this.z;
        },
        dot = function(v){
            return this.x * v.x + this.y * v.y + this.z * v.z;
        },

        clone = function(){
            return new Vector(this.x, this.y, this.z);
        },

        toString = function(){
            return '(' + this.x + ', ' + this.y + ', ' + this.z + ')';
        }
    }

    this.Vector = Vector;

    Vector.prototype = {
        add : function(a, b)
        {
            return new Vector( a.x + b.x, a.y + b.y, a.z + b.z );
        },
        sub : function(a, b)
        {
            return new Vector( a.x - b.x, a.y - b.y, a.z - b.z );
        },
        negate : function(){
            this.x = -this.x;
            this.y = -this.y;
            this.z = -this.z;
        },
        multiply : function(a, s)
        {
            return new Vector( a.x * s, a.y * s, a.z * s );
        },
        cross : function(a, b)
        {
            return new Vector( a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x );
        },
        dot : function(v){
            return this.x * v.x + this.y * v.y + this.z * v.z;
        },
        distance : function(a, b){
            var dx = a.x - b.x,
                dy = a.y - b.y,
                dz = a.z - b.z;

            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        },
        length : function(){
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        },
        mulScale : function(a, b){
            return new Vector(this.x*b,this.y*b, this.z*b);
        },
        normalize : function(){
            if (this.length() > 0)
                this.ool = 1.0 / this.length();
            else
                this.ool = 0;

            this.x *= this.ool;
            this.y *= this.ool;
            this.z *= this.ool;
            return this;
        }
    }
})();
/*** Button is just a sprite with a few added methods for clicking and hovering **/
function Button(options){
    Jest.Sprite.call(this, options);
    if(options){
        // callback for the click event if specified
        if(options.clicked){
            this.clicked = options.clicked;
        }

        // callback if the element is moused over
        if(options.hover){
            this.hover = options.hover;
        }
    }

    this.over = false;
    this.clickable = true;
    this.noClickThrough = true;
}

Button.prototype = new Jest.Sprite();

Button.prototype.clicked = function(){
    Sprite.prototype.clicked();
    if(this.clicked && this.visible){
        this.clicked();
    }
};

Button.prototype.mouseover = function(over){
    if(this.hover && this.visible){
        this.hover(over);
    }
};

Button.prototype.update = function(deltaTime){
    Jest.Sprite.prototype.update();
    if(this.visible){
        var x = this.pos.x-this.origin.x,
            y = this.pos.y-this.origin.y;

        if(Game.mouseX > x && Game.mouseX < x + this.width && Game.mouseY > y && Game.mouseY < y+this.height){
            this.over = true;
            this.mouseover(this.over);
        }else{
            if(this.over){
                this.over = false;
                this.mouseover(this.over);
            }
        }
    }
};
/*** Cursor is just a sprite that matches its position with the mouse coords. **/
function Cursor(options){
    Jest.Sprite.call(this, options);
}

Cursor.prototype = new Jest.Sprite();

Cursor.prototype.update = function(deltaTime){
    Jest.Sprite.prototype.update();
    this.pos.x = Game.mouseX;
    this.pos.y = Game.mouseY;
};
    Jest.UI = function(options){
        options = options || {};
        this.state = options.state || Game.currentState;
        this.width = options.width || Game.bounds.width;
        this.height = options.height || Game.bounds.height;


        this.items = [];

        // add to the entity list, and call the render since we are going to override the main render to make sure UI items are always on top.
        Game.addEntity(this, true, this.state);
    };

    Jest.UI.prototype = {
        /**
         ** UI.addItem
         ** object, item to add button, sprite, ect.
         **/
        addItem : function(object, uiIndex){

            if(uiIndex === undefined){
                uiIndex = 1;
            }

            object.ui = true;
            object.uiIndex = uiIndex;

            // add it to the update/render of the ui's parent state
            Game.addEntity(object, false, this.state);
            this.items.push(object);
        },
        /**
         ** UI.hide
         **/
        hide : function(){
            var id =  this.items.length;
            while(id--){
                this.items[id].visible = false;
                this.items[id].clickable = false;
            }
        },
        /**
         ** UI.show
         **/
        show : function(){
            var id =  this.items.length;
            while(id--){
                this.items[id].visible = true;
                this.items[id].clickable = true;
            }
        },
        /**
         ** UI.update
         **/
        update : function(deltaTime){

        },
        /**
         ** UI.render
         **/
        render : function(context){

        }
    };