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