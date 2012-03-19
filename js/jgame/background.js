/** Background, basically a static sprite, in terms of moving on the screen. Mainly used for scrolling a single image over and over */

/** TODO : handle the bgIndex in the parralax portion.. not in here since bg's can be used multiple times **/
(function () {
	var utilities = new Utilities();	
	
	//constructor
    function Background(options)
    {   

		this.width =  Game.bounds.width;
		this.height = Game.bounds.height;
		this.pos = new Vector(0,0,0);
		this.resource = {};
		this.startX = this.startY = 0;
		this.endX = this.endY = 32;
		this.bgIndex = 0;
		this.state = {'id' : 0};
			
		if(options !== undefined){
			// Set resource if there isnt one, then make it a standard shape
			if(options.resource){
				this.resource = options.resource;
			}

			// Set size
			if(options.width === undefined){
				this.width = Game.bounds.width;
			}else{
				this.width = options.width;
			}
			
			if(options.height === undefined){
				this.height = Game.bounds.height;
			}else{
				this.height = options.height;
			}
			
			// Get the backgrounds image size, not game bound size, size of the whole image portion so it can scroll
			if(options.startX){
				this.startX = options.startX;
			}else{
				this.startX = 0;
			}
			
			if(options.startY){
				this.startY = options.startY;
			}else{
				this.startY = 0;
			}
			
			if(options.endX){
				this.endX = options.endX;
			}else{
				if(this.resource){
					this.endX = this.resource.source.width;
				}else{
					this.endX = 32;
				}
			}
			
			if(options.endY){
				this.endY = options.endY;
			}else{
				if(this.resource){
					this.endY = this.resource.source.height;
				}else{
					this.endY = 32;
				}
			}
			
			// Where this falls in relation to other backgrounds that are defined
			if(options.bgIndex){
				this.bgIndex = options.bgIndex;
			}else{
				this.bgIndex = 0;
			}
			
			// Set position
			if(options.x === undefined || options.y === undefined){
				this.pos = new Vector(0,0,0);
			}else{
				var z = 0;
				
				if(options.z){
					z = options.z;
				}
				
				this.pos = new Vector(options.x,options.y,z);
			}
			
			if(options.state){
				this.state = options.state;
			}
			
		}
		
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
    }
    
	this.Background = Background;
	
	Background.prototype = {
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
		render : function(_context){
			_context.save;
			
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

				_context.drawImage(source,sX[0],sY[0],sWidth[0],sHeight[0],dX[0], dY[0], dWidth[0], dHeight[0]);	
				_context.drawImage(source,sX[1],sY[1],sWidth[1],sHeight[1],dX[1], dY[1], dWidth[1], dHeight[1]);	
			}else{
				_context.drawImage(source,this.startX+this.scrollX,this.startY+this.scrollY,this.width,this.height, this.pos.x, this.pos.y, this.width, this.height);	
			}
				
			_context.restore();
		}
	}	
})();