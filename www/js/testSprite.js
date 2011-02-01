// Test Sprite, extends sprite, just to show an example
(function () {
	var utilities = new Utilities();	
	
	//constructor
    function TestSprite(options)
    {  		
		Sprite.call(this, options);
		
		if(options !== undefined){ 
			// Set an extra param for the heck of it.
			if(options.extraParam === undefined){
				this.extraParam = 0;
			}else{
				this.extraParam = options.extraParam;
			}
		}else{
			this.extraParam = 0;
		}
	}
	
	TestSprite.prototype = new Sprite();
	this.TestSprite = TestSprite;
	
	// public
	TestSprite.prototype.update = function(deltaTime)
    {
		this.pos.x += this.vel.x * deltaTime;
		this.pos.y += this.vel.y * deltaTime;
    };
})();