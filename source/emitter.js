(function () {	
    function Emitter(options)
    {    
		this.utilities = Game.utilities;	
		this.live = true;
		this.particleGroups = [];

		// Timing specifics
		this.lastUpdate = new Date().getTime();
		this.startTime =  new Date().getTime();
		
		options = options || {};
		this.width = options.width || Game.bounds.width;
		this.height = options.height || Game.bounds.height;
		this.pos = options.pos || {x:0,y:0,z:0};
		
		this.particles = [];
		
		Game.addEntity(this, true);
    }
    
    this.Emitter = Emitter;
    
	Emitter.prototype.getParticles = function()
    {	
		return this.particles;
    }
	
	Emitter.prototype.addGroup = function(particleGroup){
		particleGroup.startTime = new Date().getTime();
		particleGroup.lastUpdate = new Date().getTime();
		if(typeof particleGroup.delay == 'undefined'){
			particleGroup.delay = 0;
		}
		this.particleGroups.push(particleGroup);
	}
	
	Emitter.prototype.kill = function(){
		this.particleGroups = [];
	}
	
    Emitter.prototype.update = function(deltaTime)
    {	
		this.lastUpdate = new Date().getTime();
		
		var particleGroups = this.particleGroups,
			utilities = this.utilities,
			pg = particleGroups.length;
			
		if(pg === 0){
			this.live = false;
		}
		
		while(pg--){
			if(this.lastUpdate - particleGroups[pg].lastUpdate >= 1000/particleGroups[pg].rate && this.lastUpdate > particleGroups[pg].startTime + particleGroups[pg].delay && Game.currentFrameRate > 30){
				particleGroups[pg].lastUpdate = this.lastUpdate;
				if(this.lastUpdate - this.startTime < particleGroups[pg].duration || particleGroups[pg].duration === -1){
				
					if(particleGroups[pg].oneShot){
						p = particleGroups[pg].rate;
					}else{
						p = 1;
					}
					
					while(p--){
						particleGroups[pg].x = this.pos.x;
						particleGroups[pg].y = this.pos.y;
						
						var thrustRange = particleGroups[pg].thrustRange,
							angleRange = particleGroups[pg].angleRange;

						if(typeof thrustRange != 'undefined'){
							if(typeof thrustRange.max != 'undefined' && typeof thrustRange.min != 'undefined'){
								particleGroups[pg].thrust = utilities.getRandomRange(thrustRange.min,thrustRange.max);
							}else if(typeof thrustRange.max != 'undefined'){
								particleGroups[pg].thrust = utilities.getRandomRange(0,thrustRange.max);
							}
						}

						if(typeof angleRange != 'undefined'){
							if(typeof angleRange.max != 'undefined' && typeof angleRange.min != 'undefined'){
								particleGroups[pg].angle = utilities.fGetRandomRange(angleRange.min, angleRange.max);
							}else if(typeof angleRange.max != 'undefined'){
								particleGroups[pg].angle = utilities.fGetRandomRange(0,angleRange.max);
							}
						}
						
						// should add a pool here and recycle particles for perf
						particleGroups[pg].list = this.particles;
						var curParticle = new Particle(particleGroups[pg]);		
						this.particles.push(curParticle);
						
						Game.addEntity(curParticle);
					}
				}else{
					this.particleGroups.splice(pg, 1);
				}
			}
			
		}
    };
})();