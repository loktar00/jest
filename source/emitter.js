
Jest.Emitter = function(options)
{
    this.live = true;
    this.particleGroups = [];

    // Timing specifics
    this.lastUpdate = new Date().getTime();
    this.startTime =  new Date().getTime();

    options = options || {};
    this.width = options.width || Jest.bounds.width;
    this.height = options.height || Jest.bounds.height;
    this.pos = options.pos || {x:0,y:0,z:0};

    this.particles = [];

    Game.addEntity(this, true);
}

Jest.Emitter.prototype = {
    getParticles : function()
    {
        return this.particles;
    },

    addGroup : function(particleGroup){
        particleGroup.startTime = new Date().getTime();
        particleGroup.lastUpdate = new Date().getTime();
        if(typeof particleGroup.delay == 'undefined'){
            particleGroup.delay = 0;
        }
        this.particleGroups.push(particleGroup);
    },

    removeGroup : function(group){
        var len = this.particleGroups.length;

        if(typeOf(group) == "String"){
            while(len--){
                if(group === this.particleGroups[len].name){
                    this.particleGroups.splice(len, 1);
                    return;
                }
            }
        }else{
            while(len--){
                if(group === this.particleGroups[len]){
                    this.particleGroups.splice(len, 1);
                    return;
                }
            }
        }

        return false;
    },

    getGroup : function(group){
        var len = this.particleGroups.length;

        if(typeOf(group) == "String"){
            while(len--){
                if(group === this.particleGroups[len].name){
                    return this.particleGroups[len];
                }
            }
        }else{
            while(len--){
                if(group === this.particleGroups[len]){
                    return this.particleGroups[len];
                }
            }
        }

        return false;
    },

    kill : function(){
        this.particleGroups = [];
    },

    update : function(deltaTime)
    {
        this.lastUpdate = new Date().getTime();

        var particleGroups = this.particleGroups,
            util = Game.Utilities,
            pg = particleGroups.length;

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
                        particleGroups[pg].z = this.pos.z;

                        var thrustRange = particleGroups[pg].thrustRange,
                            angleRange = particleGroups[pg].angleRange;

                        if(typeof thrustRange != 'undefined'){
                            if(typeof thrustRange.max != 'undefined' && typeof thrustRange.min != 'undefined'){
                                particleGroups[pg].thrust = util.getRandomRange(thrustRange.min,thrustRange.max);
                            }else if(typeof thrustRange.max != 'undefined'){
                                particleGroups[pg].thrust = util.getRandomRange(0,thrustRange.max);
                            }
                        }

                        if(typeof angleRange != 'undefined'){
                            if(typeof angleRange.max != 'undefined' && typeof angleRange.min != 'undefined'){
                                particleGroups[pg].angle = util.fGetRandomRange(angleRange.min, angleRange.max);
                            }else if(typeof angleRange.max != 'undefined'){
                                particleGroups[pg].angle = util.fGetRandomRange(0,angleRange.max);
                            }
                        }

                        // should add a pool here and recycle particles for perf
                        particleGroups[pg].list = this.particles;
                        var curParticle = new Jest.Particle(particleGroups[pg]);
                        this.particles.push(curParticle);

                        Game.addEntity(curParticle);
                    }
                }else{
                    this.particleGroups.splice(pg, 1);
                }
            }

        }
    }
};
