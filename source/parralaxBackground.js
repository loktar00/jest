
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