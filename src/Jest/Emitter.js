import {
    Jest,
    Particle
} from './Jest';

export default class Emitter {
    constructor(options = {}) {
        this.live = true;
        this.particleGroups = [];

        // Timing specifics
        this.lastUpdate = Date.now();
        this.startTime = Date.now();

        this.width = options.width || Jest.bounds.width;
        this.height = options.height || Jest.bounds.height;
        this.pos = options.pos || {
            x: 0,
            y: 0,
            z: 0
        };

        this.particles = [];
        this.pool = [];

        Jest.addEntity(this, true);
    }
    getParticles() {
        return this.particles;
    }
    addGroup(particleGroup) {
        particleGroup.startTime = Date.now();
        particleGroup.lastUpdate = Date.now();

        if (typeof particleGroup.delay == 'undefined') {
            particleGroup.delay = 0;
        }

        this.particleGroups.push(particleGroup);
    }
    removeGroup(group) {
        var len = this.particleGroups.length;

        if (typeOf(group) === String) {
            while (len--) {
                if (group === this.particleGroups[len].name) {
                    this.particleGroups.splice(len, 1);
                    return;
                }
            }
        } else {
            while (len--) {
                if (group === this.particleGroups[len]) {
                    this.particleGroups.splice(len, 1);
                    return;
                }
            }
        }

        return false;
    }
    getGroup(group) {
        var len = this.particleGroups.length;

        if (typeOf(group) == "String") {
            while (len--) {
                if (group === this.particleGroups[len].name) {
                    return this.particleGroups[len];
                }
            }
        } else {
            while (len--) {
                if (group === this.particleGroups[len]) {
                    return this.particleGroups[len];
                }
            }
        }

        return false;
    }
    kill() {
        this.particleGroups = [];
    }
    update(deltaTime) {
        this.lastUpdate = new Date().getTime();

        const particleGroups = this.particleGroups;
        const util = Jest.utilities;
        let pg = particleGroups.length;

        while (pg--) {
            const currentGroup = particleGroups[pg];

            if (this.lastUpdate - currentGroup.lastUpdate >= 1000 / currentGroup.rate && this.lastUpdate > currentGroup.startTime + currentGroup.delay && Jest.currentFrameRate > 30) {
                currentGroup.lastUpdate = this.lastUpdate;
                
                if (this.lastUpdate - this.startTime < currentGroup.duration || currentGroup.duration === -1) {
                    let rate = 1;

                    if (currentGroup.oneShot) {
                        rate = currentGroup.rate;
                    }

                    while (rate--) {
                        if (currentGroup.posRangeX) {
                            const xRange = util.getRandomRange(currentGroup.posRangeX.start, currentGroup.posRangeX.end || 0);
                            currentGroup.x = this.pos.x + xRange;
                        } else {
                            currentGroup.x = this.pos.x;
                        }

                        if (currentGroup.posRangeY) {
                            const yRange = util.getRandomRange(currentGroup.posRangeY.start, currentGroup.posRangeY.end || 0);
                            currentGroup.y = this.pos.y + yRange;
                        } else {
                            currentGroup.y = this.pos.y;
                        }

                        currentGroup.z = this.pos.z;

                        let thrustRange = currentGroup.thrustRange;
                        let angleRange = currentGroup.angleRange;

                        if (typeof thrustRange !== undefined) {
                            if (typeof thrustRange.max !== undefined && typeof thrustRange.min !== undefined) {
                                currentGroup.thrust = util.getRandomRange(thrustRange.min, thrustRange.max);
                            } else if (typeof thrustRange.max !== undefined) {
                                currentGroup.thrust = util.getRandomRange(0, thrustRange.max);
                            }
                        }

                        if (typeof angleRange !== undefined) {
                            if (typeof angleRange.max !== undefined && typeof angleRange.min !== undefined) {
                                currentGroup.angle = util.fGetRandomRange(angleRange.min, angleRange.max);
                            } else if (typeof angleRange.max !== undefined) {
                                currentGroup.angle = util.fGetRandomRange(0, angleRange.max);
                            }
                        }

                        // should add a pool here and recycle particles for perf
                        if (!this.pool.length) {
                            currentGroup.list = this.particles;
                            const curParticle = new Particle({...currentGroup, ...{pool: this.pool}});
                            this.particles.push(curParticle);
                            Jest.addEntity(curParticle);
                        } else {
                            const curParticle = this.pool.pop();
                            curParticle.initialize({...currentGroup, ...{pool: this.pool}});
                        }                    
                    }
                } else {
                    this.particleGroups.splice(pg, 1);
                }
            }
        }
    }
}