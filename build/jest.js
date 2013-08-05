// seedrandom.js version 2.2.
// Author: David Bau
// Date: 2013 Jun 15
//
// Defines a method Math.seedrandom() that, when called, substitutes
// an explicitly seeded RC4-based algorithm for Math.random().  Also
// supports automatic seeding from local or network sources of entropy.
//
// http://davidbau.com/encode/seedrandom.js
// http://davidbau.com/encode/seedrandom-min.js
//
// Usage:
//
//   <script src=http://davidbau.com/encode/seedrandom-min.js></script>
//
//   Math.seedrandom('yay.');  Sets Math.random to a function that is
//                             initialized using the given explicit seed.
//
//   Math.seedrandom();        Sets Math.random to a function that is
//                             seeded using the current time, dom state,
//                             and other accumulated local entropy.
//                             The generated seed string is returned.
//
//   Math.seedrandom('yowza.', true);
//                             Seeds using the given explicit seed mixed
//                             together with accumulated entropy.
//
//   <script src="https://jsonlib.appspot.com/urandom?callback=Math.seedrandom">
//   </script>                 Seeds using urandom bits from a server.
//
// More advanced examples:
//
//   Math.seedrandom("hello.");           // Use "hello." as the seed.
//   document.write(Math.random());       // Always 0.9282578795792454
//   document.write(Math.random());       // Always 0.3752569768646784
//   var rng1 = Math.random;              // Remember the current prng.
//
//   var autoseed = Math.seedrandom();    // New prng with an automatic seed.
//   document.write(Math.random());       // Pretty much unpredictable x.
//
//   Math.random = rng1;                  // Continue "hello." prng sequence.
//   document.write(Math.random());       // Always 0.7316977468919549
//
//   Math.seedrandom(autoseed);           // Restart at the previous seed.
//   document.write(Math.random());       // Repeat the 'unpredictable' x.
//
//   function reseed(event, count) {      // Define a custom entropy collector.
//     var t = [];
//     function w(e) {
//       t.push([e.pageX, e.pageY, +new Date]);
//       if (t.length < count) { return; }
//       document.removeEventListener(event, w);
//       Math.seedrandom(t, true);        // Mix in any previous entropy.
//     }
//     document.addEventListener(event, w);
//   }
//   reseed('mousemove', 100);            // Reseed after 100 mouse moves.
//
// Version notes:
//
// The random number sequence is the same as version 1.0 for string seeds.
// Version 2.0 changed the sequence for non-string seeds.
// Version 2.1 speeds seeding and uses window.crypto to autoseed if present.
// Version 2.2 alters non-crypto autoseeding to sweep up entropy from plugins.
//
// The standard ARC4 key scheduler cycles short keys, which means that
// seedrandom('ab') is equivalent to seedrandom('abab') and 'ababab'.
// Therefore it is a good idea to add a terminator to avoid trivial
// equivalences on short string seeds, e.g., Math.seedrandom(str + '\0').
// Starting with version 2.0, a terminator is added automatically for
// non-string seeds, so seeding with the number 111 is the same as seeding
// with '111\0'.
//
// When seedrandom() is called with zero args, it uses a seed
// drawn from the browser crypto object if present.  If there is no
// crypto support, seedrandom() uses the current time, the native rng,
// and a walk of several DOM objects to collect a few bits of entropy.
//
// Each time the one- or two-argument forms of seedrandom are called,
// entropy from the passed seed is accumulated in a pool to help generate
// future seeds for the zero- and two-argument forms of seedrandom.
//
// On speed - This javascript implementation of Math.random() is about
// 3-10x slower than the built-in Math.random() because it is not native
// code, but that is typically fast enough.  Some details (timings on
// Chrome 25 on a 2010 vintage macbook):
//
// seeded Math.random()          - avg less than 0.0002 milliseconds per call
// seedrandom('explicit.')       - avg less than 0.2 milliseconds per call
// seedrandom('explicit.', true) - avg less than 0.2 milliseconds per call
// seedrandom() with crypto      - avg less than 0.2 milliseconds per call
//
// Autoseeding without crypto is somewhat slower, about 20-30 milliseconds on
// a 2012 windows 7 1.5ghz i5 laptop, as seen on Firefox 19, IE 10, and Opera.
// Seeded rng calls themselves are fast across these browsers, with slowest
// numbers on Opera at about 0.0005 ms per seeded Math.random().
//
// LICENSE (BSD):
//
// Copyright 2013 David Bau, all rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//   1. Redistributions of source code must retain the above copyright
//      notice, this list of conditions and the following disclaimer.
//
//   2. Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.
//
//   3. Neither the name of this module nor the names of its contributors may
//      be used to endorse or promote products derived from this software
//      without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
/**
 * All code is in an anonymous closure to keep the global namespace clean.
 */
(function (
    global, pool, math, width, chunks, digits) {

//
// The following constants are related to IEEE 754 limits.
//
var startdenom = math.pow(width, chunks),
    significance = math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1;

//
// seedrandom()
// This is the seedrandom function described above.
//
math['seedrandom'] = function(seed, use_entropy) {
  var key = [];

  // Flatten the seed string or build one from local entropy if needed.
  var shortseed = mixkey(flatten(
    use_entropy ? [seed, tostring(pool)] :
    0 in arguments ? seed : autoseed(), 3), key);

  // Use the seed to initialize an ARC4 generator.
  var arc4 = new ARC4(key);

  // Mix the randomness into accumulated entropy.
  mixkey(tostring(arc4.S), pool);

  // Override Math.random

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.

  math['random'] = function() {         // Closure to return a random double:
    var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
        d = startdenom,                 //   and denominator d = 2 ^ 48.
        x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  };

  // Return the seed that was used
  return shortseed;
};

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
/** @constructor */
function ARC4(key) {
  var t, keylen = key.length,
      me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) {
    s[i] = i++;
  }
  for (i = 0; i < width; i++) {
    s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
    s[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  (me.g = function(count) {
    // Using instance members instead of closure state nearly doubles speed.
    var t, r = 0,
        i = me.i, j = me.j, s = me.S;
    while (count--) {
      t = s[i = mask & (i + 1)];
      r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
    }
    me.i = i; me.j = j;
    return r;
    // For robust unpredictability discard an initial batch of values.
    // See http://www.rsa.com/rsalabs/node.asp?id=2009
  })(width);
}

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
function flatten(obj, depth) {
  var result = [], typ = (typeof obj)[0], prop;
  if (depth && typ == 'o') {
    for (prop in obj) {
      try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
    }
  }
  return (result.length ? result : typ == 's' ? obj : obj + '\0');
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
function mixkey(seed, key) {
  var stringseed = seed + '', smear, j = 0;
  while (j < stringseed.length) {
    key[mask & j] =
      mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
  }
  return tostring(key);
}

//
// autoseed()
// Returns an object for autoseeding, using window.crypto if available.
//
/** @param {Uint8Array=} seed */
function autoseed(seed) {
  try {
    global.crypto.getRandomValues(seed = new Uint8Array(width));
    return tostring(seed);
  } catch (e) {
    return [+new Date, global, global.navigator.plugins,
            global.screen, tostring(pool)];
  }
}

//
// tostring()
// Converts an array of charcodes to a string
//
function tostring(a) {
  return String.fromCharCode.apply(0, a);
}

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to intefere with determinstic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
mixkey(math.random(), pool);

// End anonymous scope, and pass initial values.
})(
  this,   // global window object
  [],     // pool: entropy pool starts empty
  Math,   // math: package containing random, pow, and seedrandom
  256,    // width: each RC4 output is 0 <= x < 256
  6,      // chunks: at least six RC4 outputs for each double
  52      // digits: there are 52 significant digits in a double
);

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

var Game = {};

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

        this.renderCanvas.addEventListener('click', function(event){self.clicked(event,self);}, false);
        this.renderCanvas.addEventListener('mousemove', function(event){self.mouseMove(event,self);}, false);
        this.renderCanvas.addEventListener('mousedown', function(event){self.mouseDown(event,self);}, false);
        this.renderCanvas.addEventListener('mouseup', function(event){self.mouseUp(event,self);}, false);

        this.renderCanvas.addEventListener('contextmenu', function(event){event.preventDefault();}, false);

        // mousewheel
        this.renderCanvas.addEventListener ("mousewheel", function(event){self.mouseWheel(event,self);}, false);
        this.renderCanvas.addEventListener ("DOMMouseScroll", function(event){self.mouseWheel(event,self);}, false);

        this.renderCanvas.width = this.width;
        this.renderCanvas.height = this.height;

        this.renderer = new Jest.Renderer(this.renderCanvas);

        this.addState(this.stateName);
        this.switchState({'id' : 0});

        // setup a label to display the frameRate
        if(this.showFrameRate){
            this.frameRateLabel = new Label({'text':' ', x:0,y:30,z:1, 'font':'14pt arial bold'});
            this.addEntity(this.frameRateLabel);
        }

        this.mouseX = 0;
        this.mouseY = 0;

        this.moused = false;
        this.leftDown = false;
        this.rightDown = false;
        this.midDown = false;
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

        if(typeof object.kill !== 'undefined'){
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
    addState : function(name){
        var stateObj = {};

        if(name){
            stateObj.name = name;
        }else{
            stateObj.name = this.states.length;
        }

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
        };

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
    };
})();
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
    preCalcRotation : function(resource, numRotations, frameWidth, frameHeight, offsetAngle){
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
        //document.body.appendChild(tempCanvas);
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
            hsv = this.rgbhsv({r : pix[i], g:pix[i + 1], b:pix[i + 2]});

            hsv.h+=h;
            if(hsv.h < 0){
                hsv.h = 0;
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
            if(maxColor === 0.0){
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

function Label(options)
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
}

this.Label = Label;

Label.prototype = {
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
                this.startX  = this.width * this.curAnimation[this.frame];
                this.frame++;
                if(this.frame > this.curAnimation.length-1){
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
                this.curAnimation = curAnim.frames;
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
}

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
(function(){
	function UI(options){
		options = options || {};
		this.state = options.state || Game.currentState;
		this.width = options.width || Game.bounds.width;
		this.height = options.height || Game.bounds.height;


		this.items = [];

		// add to the entity list, and call the render since we are going to override the main render to make sure UI items are always on top.
		Game.addEntity(this, true, this.state);
	}

	this.UI = UI;

	UI.prototype = {
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
			}
		},
		/**
		 ** UI.show
		 **/
		show : function(){
			var id =  this.items.length;
			while(id--){
				this.items[id].visible = true;
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

	this.clickable = true;
}

Button.prototype = new Jest.Sprite();

Button.prototype.clicked = function(){
	Sprite.prototype.clicked();
	if(this.clicked){
		this.clicked();
	}
};

Button.prototype.mouseover = function(over){
	if(this.hover){
		this.hover(over);
	}
}

Button.prototype.update = function(deltaTime){
	Jest.Sprite.prototype.update();
	var x = this.pos.x-this.origin.x,
		y = this.pos.y-this.origin.y;

	if(Game.mouseX > x && Game.mouseX < x + this.width && Game.mouseY > y && Game.mouseY < y+this.height){
		this.mouseover(true);
	}else{
		this.mouseover(false);
	}
}
/*** Cursor is just a sprite that matches its position with the mouse coords. **/
function Cursor(options){
	Jest.Sprite.call(this, options);
}

Cursor.prototype = new Jest.Sprite();

Cursor.prototype.update = function(deltaTime){
	Jest.Sprite.prototype.update();
	this.pos.x = Game.mouseX;
	this.pos.y = Game.mouseY;
}

Jest.ParralaxBackground = function(options)
{
    this.live = true;
    this.curSpeedCheck = 0;
    this.curSpeedMult = 0;
    this.backgrounds = [],

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