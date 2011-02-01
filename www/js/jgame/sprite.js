(function () {
	var utilities = new Utilities();	
	
	//constructor
    function Sprite(options)
    {   
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
			
			// Set resource
			if(options.resource === undefined){
				this.resource = {};
			}else{
				this.resource = options.resource;
			}
			
			// Set position
			if(options.x === undefined || options.y === undefined){
				this.pos = new Vector(0,0,0);
			}else{
				this.pos = new Vector(options.x,options.y,0);
			}
			
			// Set velocity
			if(options.vx === undefined || options.vy === undefined){
				this.vel = new Vector(0,0,0);
			}else{
				this.vel = new Vector(options.vx,options.vy,0);
			}
			
			//Set Color
			if(options.color === undefined){
				this.color = "#ffffff";
			}else{
				this.color = options.color;
			}
		}else{
			this.width = this.height = 32;
			this.pos = new Vector(0,0,0);
			this.vel = new Vector(0,0,0);
			this.color = "#ffffff";
			this.resource = {};
		}
		
		this.x = this.pos.x;
		this.y = this.pos.y;
		
		this.live = true;
    }
    
	this.Sprite = Sprite;
	
	Sprite.prototype = {
		// Handles updating the sprite
		update : function(deltaTime)
		{

		},
		
		// Check for collisions
		checkCollision : function(x, y){
		},
			
		// Draw
		render : function(_context)
		{	
			_context.save;
			_context.drawImage(this.resource.source,0,0,this.width,this.height, this.pos.x, this.pos.y, this.width,this.height);
			_context.restore();
		}
	}	
})();