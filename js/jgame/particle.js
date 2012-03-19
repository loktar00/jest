(function () {	
    function Particle(options)
    {   
		Sprite.call(this, options);	
		Game.particleCount++;
		
		this.lifeTime = 1000; // 1 second default lifetime
		this.delay = 0;
		this.startLife = new Date().getTime();

		this.startAlpha = 1;
		this.endAlpha = 1;
		
		this.startColor = this.color;
		this.endColor = this.color;
		this.blend = false;
	
		this.size = 1;
		this.startSize = this.size;
		this.endSize = this.size;
		
		this.drawAngle = 0;
		this.alignToAngle = false;
		
		this.curStep = 0;
	
		
		if(options !== undefined){ 
			if(options.thrust){
				this.thrust = options.thrust;
			}
			
			if(options.angle){
				this.angle = options.angle;
			}
			
			if(options.lifeTime !== undefined){
				this.lifeTime = options.lifeTime;
			}
			
			if(typeof options.startColor !== 'undefined'){
				this.startColor = options.startColor;
			}
			
			if(typeof options.endColor !== 'undefined'){
				this.endColor = options.endColor;
			}
			
			if(typeof options.endAlpha !== 'undefined'){
				this.endAlpha = options.endAlpha;
			}
			
			if(typeof options.blend !== 'undefined'){
				this.blend = options.blend;
			}
			
			if(typeof options.size !== 'undefined'){
				this.width = options.size;
				this.height = options.size;
				
				this.size = options.size;
				this.endSize = options.size
			}
			
			if(typeof options.endSize !== 'undefined'){
				this.startSize = this.size;
				this.endSize = options.endSize;
			}
			
			if(typeof options.angleChange !== 'undefined'){
				this.angleChange = options.angleChange;
			}
			
			if(typeof options.alignToAngle !== 'undefined'){
				this.alignToAngle = options.alignToAngle;
			}
			
			if(typeof options.drawAngle !== 'undefined'){
				this.drawAngle = options.drawAngle;
			}
			
			if(typeof options.drawAngleChange !== 'undefined'){
				this.drawAngleChange = options.drawAngleChange;
			}
			
		}
		
		// sets the origin to the center
		this.origin.y = this.height/2;
		this.origin.x = this.width/2;
		
		this.endLife = this.startLife + this.lifeTime;
		
	
		// precalc color changes
		this.colors = [];
		if(this.endColor !== this.startColor){
			for(var i =  Math.ceil(this.lifeTime/Game.frameRate)+1; i > -1; i--){
				this.colors.push(this.colorFade(this.startColor, this.endColor, this.lifeTime, i*Game.frameRate));
			}
		}
    }
    
	Particle.prototype = new Sprite();
	this.Particle = Particle;
	
	Particle.prototype.update = function(deltaTime)
	{
		this.curStep =  this.endLife - new Date().getTime();
		
		this.vel.x = Math.cos(((this.angle)) *  Math.PI / 180) * this.thrust * deltaTime;
		this.vel.y = Math.sin(((this.angle)) *  Math.PI / 180) * this.thrust * deltaTime;	
		
		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;
				
		if(this.pos.y < 0 || this.pos.y > Game.bounds.y + Game.bounds.height){
			this.live = false;
			Game.particleCount--;
		}
		
		if(new Date().getTime() > this.endLife){
			this.live = false;
			Game.particleCount--;
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
			this.color = this.colors[Math.ceil((this.lifeTime-this.curStep)/Game.frameRate)];
		}
		
		if(this.endSize !== this.size){
			if(this.endSize < this.startSize){
				var scale =  ((this.startSize-this.endSize)/this.lifeTime)*this.curStep;
				this.scale = {x : -scale, y : -scale};
				//this.size = scale;
			}else{
				var scale = this.endSize + ((this.startSize-this.endSize)/this.lifeTime)*this.curStep;
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
	}

	Particle.prototype.render = function(_context){
		_context.save();
		
		var scale = this.scale,
			origin = this.origin;
		
		if(!this.shape){
			if(this.blend){
				_context.globalCompositeOperation = "lighter";
			}
			_context.globalAlpha  = this.alpha;
						
			if(this.drawAngle !== 0){
				_context.translate(this.pos.x, this.pos.y);
				_context.rotate(this.drawAngle*Math.PI/180);
				_context.drawImage(this.resource.source,this.startX,this.startY,this.width,this.height, scale.x/2, scale.y/2, this.width-scale.x,this.height-scale.y);
			}else{
				_context.drawImage(this.resource.source,this.startX,this.startY,this.width,this.height, this.pos.x-origin.x, this.pos.y-origin.y, this.width-scale.x,this.height-scale.y);
			}
		}else{
			var color = this.color;
			_context.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + "," + this.alpha + ")";
			
			if(this.drawAngle !== 0){
				_context.translate(this.pos.x, this.pos.y);
				_context.rotate(this.drawAngle*Math.PI/180);
				_context.fillRect(-this.origin.x,-this.origin.y,this.width,this.height);
			}else{
				_context.fillRect(this.pos.x-this.origin.x, this.pos.y-this.origin.y, this.width,this.height);
			}
		}
		_context.restore();
		_context.globalCompositeOperation = "source-over"
	}
	
	Particle.prototype.colorFade = function(startColor, endColor, totalSteps, step){
		  var scale = step/totalSteps,
			  r = endColor.r + scale*(startColor.r - endColor.r);
			  b = endColor.b + scale*(startColor.b - endColor.b);
			  g = endColor.g + scale*(startColor.g - endColor.g);

		  return {r : Math.floor( Math.min(255,  Math.max(0, r))), g: Math.floor( Math.min(255,  Math.max(0, g))), b:  Math.floor( Math.min(255,  Math.max(0, b)))};
	}
	
})();