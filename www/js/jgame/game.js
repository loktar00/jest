(function () {

	/**
	 * jGame(options:object)
	 * options canvas:string, width:int, height:int, frameRate:int
	 * Sets up the initial values required to start the game
	 **/
	function jGame(options){
		if(options !== undefined){
			// set canvas
			if(options.canvas === undefined){
				this.renderCanvas = options.canvas;
			}else{
				this.renderCanvas = "playCanvas";
			}
			
			// Set canvas size
			if(options.width === undefined){
				this.width = 320;
			}else{
				this.width = options.width;
			}
			
			if(options.height === undefined){
				this.height = 240;
			}else{
				this.height = options.height;
			}
			
			// Set Framerate
			if(options.frameRate === undefined){
				this.frameRate = Math.ceil(1000 / 100);
			}else{
				this.frameRate = options.frameRate;
			}
			
			// Set Error rate for physics calculations;
			if(options.errorCorrection === undefined){
				this.errorCorrection = 5;
			}else{
				this.errorCorrection = options.errorCorrection;
			}
		}else{
			this.renderCanvas = "playCanvas";
			this.width = 320;
			this.height = 240;
			this.frameRate = Math.ceil(1000 / 120);
			this.errorCorrection = 5;
		}
		
		this.renderer = {};
		this.intervalId = {};
		this.entities = [];
		this.lastTime = (new Date()).getTime();
		this.gameState = 1;
		this.accTime = 0;
		this.timeStep = 1;
		
		this.utilities = new Utilities();	
		this.resourceManager = new ResourceManager();
	}
	
	// Make jGame accessable
	this.jGame = jGame;
	
	jGame.prototype = {
		/**
		 * jGame.init()
		 * 
		 * prepares the canvas for rendering, and starts the update process
		 **/
		init : function(){
			// base for starting, presetup ect.
			this.renderCanvas = document.getElementById(this.renderCanvas);
			
			if(this.renderCanvas === null){
				this.renderCanvas = document.createElement("canvas");
			}
			
			this.renderCanvas.width = this.width;
			this.renderCanvas.height = this.height;
			this.renderer = new Renderer(this.renderCanvas);
			
			if(this.resourceManager.loadingComplete){
				var self = this;
				this.intervalId = setTimeout(function(){self.update()}, this.frameRate);
			}
		},
		
		/**
		 * jGame.update()
		 * 
		 * Main update loop for the game, updates all objects, and calls the renderer.
		 **/
		update : function(){
			var curTime = (new Date()).getTime(),
				update = this.update;
			
			this.deltaTime = curTime - this.lastTime;
			this.lastTime = curTime;
			this.accTime += this.deltaTime;	
			
			while (this.accTime > this.timeStep)
			{
				this.accTime -= this.timeStep;
				var entities = this.entities;
					
				for (var id  = 0,entLen = this.entities.length; id < entLen; id ++){
					var object = entities[id];
					
					if(object.live){
						object.update(this.timeStep /100);
					}else{
						this.removeEntity(object);
					}
				}
			}
			
			this.renderer.redraw();
			this.renderer._context.fillStyle = "#fff";
			this.renderer._context.fillText(Math.round(1000/this.deltaTime) + " fps", 2, 56);
			
			var self = this;
			this.intervalId = setTimeout(function(){self.update()}, this.frameRate);
		},
			
		// Handles Entities
		
		/**
		 * jGame.addEntity()
		 * object entity
		 * Adds an entity to the update list, and to the renderer.
		 **/
		addEntity : function(object){
			this.entities.push(object);
			this.renderer.addToRenderer(object);
		},
		
		/**
		 * jGame.addEntity()
		 * object entity
		 * Removes an entity from the update cycle and renderer.
		 **/
		removeEntity : function(object){
			var numEntities = this.entities.length,
				entities = this.entities;
				
			for (var id = 0; id < numEntities; id ++) {
				if(entities[id] === object){
					entities.splice(id,1);
					this.renderer.removeFromRenderer(object);
					delete object;
				}
			}
		}
	}
})();