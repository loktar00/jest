Jest.Particle = function(options){

	Jest.Sprite.call(this, options);
	Jest.particleCount++;

	this.startLife = new Date().getTime();
	this.curStep = 0;

	options = options || {};
	this.lifeTime = (options.lifeTime !== undefined) ? options.lifeTime : 1000;
	this.delay = options.delay || 0;

	this.size = options.size || 1;
	this.width = this.height = this.size;
	this.startSize = options.startSize || this.size;
	this.endSize = (options.endSize !== undefined) ? options.endSize : this.size;
	this.thrust = options.thrust || 0;
	this.gravity = options.gravity || 0;

	this.angle = options.angle || 0;
	this.angleChange = options.angleChange || 0;
	this.alignToAngle = options.alignToAngle || false;
	this.drawAngle = options.drawAngle || 0;
	this.drawAngleChange = options.drawAngleChange || 0;

	this.startColor = options.startColor || this.color;
	this.endColor = options.endColor || this.color;
	this.startAlpha = (options.startAlpha !== undefined) ? options.startAlpha : 1;
	this.endAlpha = (options.endAlpha !== undefined) ? options.endAlpha : 1;
	this.blend = options.blend || false;

	// sets the origin to the center
	this.origin.y = this.height/2;
	this.origin.x = this.width/2;

	this.endLife = this.startLife + this.lifeTime;

	// precalc color changes
	this.colors = [];

	if(this.endColor !== this.startColor){
		for(var i =  Math.ceil(this.lifeTime/Jest.frameRate)+1; i > -1; i--){
			this.colors.push(this.colorFade(this.startColor, this.endColor, this.lifeTime, i*Jest.frameRate));
		}
	}
};

Jest.Particle.prototype = new Jest.Sprite();

Jest.Particle.prototype.update = function(deltaTime)
{
	this.curStep =  this.endLife - new Date().getTime();

	this.vel.x = Math.cos(((this.angle)) *  Math.PI / 180) * this.thrust * deltaTime;
	this.vel.y = ((Math.sin(((this.angle)) *  Math.PI / 180) * this.thrust)+this.gravity*(this.lifeTime-this.curStep)*deltaTime) * deltaTime;


	this.pos.x += this.vel.x;
	this.pos.y += this.vel.y;

	if(this.pos.y < 0 || this.pos.y > Jest.bounds.y + Jest.bounds.height){
		this.live = false;
		Jest.particleCount--;
	}

	if(new Date().getTime() > this.endLife){
		this.live = false;
		Jest.particleCount--;
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
		this.color = this.colors[Math.ceil((this.lifeTime-this.curStep)/Jest.frameRate)];
	}

	if(this.endSize !== this.size){
		var scale = 0;
		if(this.endSize < this.startSize){
			scale =  ((this.startSize-this.endSize)/this.lifeTime)*this.curStep;
			this.scale = {x : -scale, y : -scale};
			//this.size = scale;
		}else{
			scale = this.endSize + ((this.startSize-this.endSize)/this.lifeTime)*this.curStep;
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
};

Jest.Particle.prototype.render = function(context){
	context.save();

	var scale = this.scale || {x:0,y:0},
		x = this.pos.x,
		y = this.pos.y,
		oX = this.origin.x,
		oY = this.origin.y,
		width = this.width,
		height = this.height,
		rotAngle = this.drawAngle*Math.PI/180;

	if(this.blend){
		context.globalCompositeOperation = "lighter";
	}

	if(!this.shape){
		context.globalAlpha  = this.alpha;

		if(this.drawAngle !== 0){
			context.translate(x, y);
			context.rotate(rotAngle);
			context.drawImage(this.resource.source,this.startX,this.startY,width,height, scale.x/2, scale.y/2, width-scale.x,height-scale.y);
		}else{
			context.drawImage(this.resource.source,this.startX,this.startY,width,height, x-oX, y-oY, width-scale.x,height-scale.y);
		}
	}else{
		var color = this.color || {r:0,g:0,b:0};
		context.fillStyle = "rgba(" + color.r+ "," + color.g + "," + color.b + "," + this.alpha + ")";
		if(this.drawAngle !== 0){
			context.translate(x, y);
			context.rotate(rotAngle);
			context.fillRect(-oX,-oY,width-scale.x,height-scale.y);
		}else{
			context.fillRect(x-oX, y-oY, width-scale.x,height-scale.y);
		}
	}
	context.restore();
	context.globalCompositeOperation = "source-over";
};

Jest.Particle.prototype.colorFade = function(startColor, endColor, totalSteps, step){
	var scale = step/totalSteps,
		r = endColor.r + scale*(startColor.r - endColor.r);
		b = endColor.b + scale*(startColor.b - endColor.b);
		g = endColor.g + scale*(startColor.g - endColor.g);

		return {r : Math.floor( Math.min(255,  Math.max(0, r))), g: Math.floor( Math.min(255,  Math.max(0, g))), b:  Math.floor( Math.min(255,  Math.max(0, b)))};
}