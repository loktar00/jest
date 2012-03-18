(function () {
	var utilities = new Utilities();	
	
	//constructor
    function Sprite(options)
    {   
	
		this.width = this.height = 32;
		this.pos = new Vector(0,0,0);
		this.origin = new Vector(0,0,0);
		this.vel = new Vector(0,0,0);
		this.thrust = 0;
		this.color = this.color = {r : 255, g : 255, b: 255};
		this.resource = {};
		this.shape = true;
		this.alpha = 1;
		this.animated = false;
		this.tileable = false;
		this.shadow = false;
		this.clickable = false;
		
		if(options !== undefined){
			// Set size
			if(options.width === undefined){
				this.width = 32;
			}else{
				this.width = options.width;
			}
			
			if(options.height === undefined){
				this.height = 32;
			}else{
				this.height = options.height;
			}
			
			// Set start position on tilesheet for particular sprite
			if(options.startX === undefined){
				this.startX = 0;
			}else{
				this.startX = options.startX;
			}
			
			if(options.startY === undefined){
				this.startY= 0;
			}else{
				this.startY = options.startY;
			}
			
			// Check if its a tileable graphic need to finish not fully implemented
			if(options.tileable){
				this.tileable = options.tileable;
				
				if(options.endX){
					this.endX = options.endX;
				}
				
				if(options.endY){
					this.endY = options.endY;
				}
			}
			
			// Set resource if there isnt one, then make it a standard shape
			if(options.resource === undefined){
				this.shape = true;
				this.resource = {};
			}else{
				this.shape = false;
				this.resource = options.resource;
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
			
			// Set velocity
			if(options.vx === undefined || options.vy === undefined){
				this.vel = new Vector(0,0,0);
			}else{
				this.vel = new Vector(options.vx,options.vy,0);
			}
			
			if(options.thrust === undefined){
				this.thrust = 0;
			}else{
				this.thrust = options.thrust;
			}
			
			//Set Color
			if(typeof options.color !== 'undefined'){
				this.color = options.color;
			}
			
			// Set clickable
			if(options.clickable === undefined){
				this.clickable = false
			}else{
				this.clickable = true;
			}
			
			if(options.animated === undefined){
				this.animated = false;
			}else{
				this.animated = true;
			}
			
			if(options.shadow){
				this.shadow = true;
			}
			
		}
		
		this.visible = true;
		this.animations = [];
				
		this.x = this.pos.x;
		this.y = this.pos.y;

		this.live = true;
    }
    
	this.Sprite = Sprite;
	
	Sprite.prototype = {
		// Handles updating the sprite
		update : function(deltaTime)
		{
		   /*if(this.pos){
				this.x = this.pos.x;
				this.y = this.pos.y;
			}*/
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
			for(var i = this.animations.length -1; i > 0; i--){
				var curAnim = this.animations[i];
				if(curAnim.name === sequenceName){
					this.curAnimation = curAnim.frames;
					this.animSpeed = aniSpeed;
					if(animType !== undefined){
						this.animType = 0;
					}else{
						this,animType = animType;
					}
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
		},
		// Draw
		render : function(_context){		
			_context.save;
			if(!this.shape){
				_context.drawImage(this.resource.source,this.startX,this.startY,this.width,this.height, this.pos.x-this.origin.x, this.pos.y-this.origin.y, this.width,this.height);
				// Debugs collision bounds
				/*if(this.radius){
					_context.strokeStyle = "rgb(255,0,0)";
					_context.beginPath();
					_context.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI*2, true); 
					_context.closePath();
					_context.stroke();
				}*/
			}else{
				var color = this.color;
				_context.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + "," + this.alpha + ")";
				_context.fillRect(this.pos.x-this.origin.x, this.pos.y-this.origin.y, this.width,this.height);
			}
			_context.restore();
		},
		// Object was clicked do some stuff brah
		clicked : function(){

		}
	}	
})();