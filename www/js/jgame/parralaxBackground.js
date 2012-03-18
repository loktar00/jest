(function () {	
    function ParralaxBackground(options)
    {    
		var utilities = Game.utilities;	
		this.live = true;
		this.width = 0;
		this.height = 0;
		this.curSpeedCheck = 0;
		this.curSpeedMult = 0;
		this.backgrounds = [],
		this.state = {'id' : 0};
		
		// see if our width and height were passed not doing as much checking as I could because i know ill pass the right stuff!
		if(options !== undefined){
			if(options.width === undefined){
				this.width = Game.bounds.width;
			}else{
				this.width = options.width;
			}
			
			if(options.height === undefined){
				this.height =  Game.bounds.height;
			}else{
				this.height = options.height;
			}
			
			if("state" in options){
				this.state = options.state;
			}
		}else{
			this.width = Game.bounds.width;
			this.height = Game.bounds.height;
		}
		
		Game.addEntity(this, true, this.state);
    }
    
    this.ParralaxBackground = ParralaxBackground;
    
// public	
	/** Add a background image that scrolls
	** options : background, speedMultX, speedMultY
	*/
	ParralaxBackground.prototype.addBackground = function(options)
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
	ParralaxBackground.prototype.updateBackground = function(options){

		if(typeof options !== 'undefined' && typeof options.bgIndex !== 'undefined'){
			if(options.speedMultX){
				this.backgrounds[options.bgIndex].speedMultX = options.speedMultX;
			}
			
			if(options.speedMultY){
				this.backgrounds[options.bgIndex].speedMultY = options.speedMultY;
			}
		}
		
	}
	
	// updates the backgrounds
    ParralaxBackground.prototype.update = function(deltaTime)
    {
		for(var len = this.backgrounds.length, bg = 0; bg < len; bg++){
			this.backgrounds[bg].bg.scroll(this.backgrounds[bg].speedMultX, this.backgrounds[bg].speedMultY, deltaTime);
		}
    };
})();