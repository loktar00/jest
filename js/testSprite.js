// Test Sprite, extends sprite, just to show an example
(function () {	
	//constructor
    function TestSprite(options)
    {  		
		Sprite.call(this, options);
		this.clickable = true;	

		this.addAnimation([0,1,2], "walk");
		this.addAnimation([5,3,4], "punch");
		this.playAnimation('walk', 130, 1);
	}
	
	TestSprite.prototype = new Sprite();
	this.TestSprite = TestSprite;
	

	TestSprite.prototype.update = function(deltaTime)
    	{
		Sprite.prototype.update.call(this, deltaTime);
		
		if(!this.isAnimating){
			this.playAnimation('walk', 130, 1);
		}

		this.vel.x = (Math.cos(((this.angle)) *  Math.PI / 180) * this.thrust * deltaTime);
		this.vel.y = (Math.sin(((this.angle)) *  Math.PI / 180) * this.thrust * deltaTime);	
			
		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;
		
		if(this.pos.x > Game.bounds.width){
			this.pos.x = -16;
		}
		
		if(this.pos.y > Game.bounds.height){
			this.pos.y = -16;
		}
		
		this.startY = this.height*Math.round(this.angle/90);
    	};
	
	TestSprite.prototype.clicked = function(){
		this.playAnimation('punch', 130, 0);
	};
	
})();