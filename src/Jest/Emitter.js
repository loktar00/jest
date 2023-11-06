import { Jest } from './Jest.js';
import Particle from './Particle.js';

export default class Emitter {
    constructor(options = {}) {
        this.live = true;
        this.particleGroups = [];

        // Timing specifics
        this.lastUpdate = Date.now();
        this.startTime = Date.now();

        // Apply scale to emitter size
        this.width = (options.width || Jest.bounds.width) * Jest.jestScale;
        this.height = (options.height || Jest.bounds.height) * Jest.jestScale;

        // Apply scale to initial position
        this.pos = {
            x: (options.pos?.x || 0) * Jest.jestScale,
            y: (options.pos?.y || 0) * Jest.jestScale,
            z: options.pos?.z || 0 // Assuming z-scale is not required, else apply Jest.jestScale
        };

        this.particles = [];
        this.pool = [];

        Jest.addEntity(this, true);
    }

    getParticles() {
        return this.particles;
    }

    addGroup(particleGroup) {
        const group = structuredClone(particleGroup);
        group.startTime = Date.now();
        group.lastUpdate = Date.now();

        if (typeof particleGroup.delay === 'undefined') {
            group.delay = 0;
        }

        this.particleGroups.push(group);
    }

    removeGroup(group) {
        let len = this.particleGroups.length;

        if (typeof group === 'string') {
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
    }

    getGroup(group) {
        let len = this.particleGroups.length;

        if (typeof group === 'string') {
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

    startGroup(group) {
        const selectedGroup = this.getGroup(group);

        if (selectedGroup) {
            selectedGroup.startTime = Date.now();
            selectedGroup.lastUpdate = 0;
        }
    }

    kill() {
        this.particleGroups = [];
    }

    update() {
        this.lastUpdate = new Date().getTime();

        const { particleGroups } = this;
        const util = Jest.utilities;
        let pg = particleGroups.length;

        while (pg--) {
            const currentGroup = particleGroups[pg];

            if (
                this.lastUpdate - currentGroup.lastUpdate >=
                    1000 / currentGroup.rate &&
                this.lastUpdate > currentGroup.startTime + currentGroup.delay &&
                Jest.currentFrameRate > 30
            ) {
                currentGroup.lastUpdate = this.lastUpdate;

                if (
                    currentGroup.lastUpdate - currentGroup.startTime <
                        currentGroup.duration ||
                    currentGroup.duration === -1
                ) {
                    let rate = 1;

                    if (currentGroup.oneShot) {
                        rate = currentGroup.rate;
                    }

                    while (rate--) {
                        if (currentGroup.posRangeX) {
                            const xRange = util.getRandomRange(
                                currentGroup.posRangeX.start * Jest.jestScale, // Scaled
                                (currentGroup.posRangeX.end || 0) *
                                    Jest.jestScale // Scaled
                            );
                            currentGroup.x = this.pos.x + xRange;
                        } else {
                            currentGroup.x = this.pos.x;
                        }

                        if (currentGroup.posRangeY) {
                            const yRange = util.getRandomRange(
                                currentGroup.posRangeY.start * Jest.jestScale, // Scaled
                                (currentGroup.posRangeY.end || 0) *
                                    Jest.jestScale // Scaled
                            );
                            currentGroup.y = this.pos.y + yRange;
                        } else {
                            currentGroup.y = this.pos.y;
                        }

                        currentGroup.z = this.pos.z;

                        const { thrustRange, angleRange } = currentGroup;

                        if (typeof thrustRange !== 'undefined') {
                            if (
                                typeof thrustRange.max !== 'undefined' &&
                                typeof thrustRange.min !== 'undefined'
                            ) {
                                currentGroup.thrust = util.getRandomRange(
                                    thrustRange.min,
                                    thrustRange.max
                                );
                            } else if (typeof thrustRange.max !== 'undefined') {
                                currentGroup.thrust = util.getRandomRange(
                                    0,
                                    thrustRange.max
                                );
                            }
                        }

                        if (typeof angleRange !== 'undefined') {
                            if (
                                typeof angleRange.max !== 'undefined' &&
                                typeof angleRange.min !== 'undefined'
                            ) {
                                currentGroup.angle = util.fGetRandomRange(
                                    angleRange.min,
                                    angleRange.max
                                );
                            } else if (typeof angleRange.max !== 'undefined') {
                                currentGroup.angle = util.fGetRandomRange(
                                    0,
                                    angleRange.max
                                );
                            }
                        }

                        // should add a pool here and recycle particles for perf
                        if (!this.pool.length) {
                            currentGroup.list = this.particles;
                            const curParticle = new Particle({
                                ...currentGroup,
                                ...{ pool: this.pool }
                            });
                            this.particles.push(curParticle);
                            Jest.addEntity(curParticle);
                        } else {
                            const curParticle = this.pool.pop();
                            curParticle.initialize({
                                ...currentGroup,
                                ...{ pool: this.pool }
                            });
                        }
                    }
                }
            }
        }
    }
}
