import Particle from './Particle.js';

export default class Emitter {
    constructor(options = {}, context = null) {
        this.ctx = context || Jest;
        this.live = true;
        this.particleGroups = [];

        // Timing specifics
        this.lastUpdate = Date.now();
        this.startTime = Date.now();

        const scale = this.ctx.jestScale;

        // Apply scale to emitter size
        this.width = (options.width || this.ctx.bounds.width) * scale;
        this.height = (options.height || this.ctx.bounds.height) * scale;

        // Apply scale to initial position
        this.pos = {
            x: (options.pos?.x || 0) * scale,
            y: (options.pos?.y || 0) * scale,
            z: options.pos?.z || 0
        };

        this.particles = [];
        this.pool = [];

        this.ctx.addEntity(this, true);
    }

    getParticles() {
        return this.particles;
    }

    addGroup(particleGroup) {
        // structuredClone can't handle DOM elements like HTMLImageElement,
        // so pull out resource before cloning and re-attach after.
        const { resource, ...cloneable } = particleGroup;
        const group = structuredClone(cloneable);
        if (resource) {
            group.resource = resource;
        }
        group.startTime = Date.now();
        group.lastUpdate = Date.now();

        if (typeof particleGroup.delay === 'undefined') {
            group.delay = 0;
        }

        if (particleGroup.oneShot) {
            group.duration = -Infinity;
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
            selectedGroup.lastUpdate = Date.now();

            if (selectedGroup.oneShot) {
                selectedGroup.duration = -Infinity;
            }
        }
    }

    kill() {
        this.particleGroups = [];
    }

    update() {
        const currentTime = new Date().getTime();

        const { particleGroups } = this;
        const util = this.ctx.utilities;
        const scale = this.ctx.jestScale;

        let pg = particleGroups.length;

        while (pg--) {
            const currentGroup = particleGroups[pg];
            const elapsedTime = (currentTime - currentGroup.lastUpdate) / 1000;

            if (
                currentTime > currentGroup.startTime + currentGroup.delay &&
                this.ctx.currentFrameRate > 30
            ) {
                let particlesToEmit = Math.floor(
                    currentGroup.rate * elapsedTime
                );

                // For one-shot, emit all at once and then set to 0 to prevent further emission
                if (
                    currentGroup.oneShot &&
                    currentGroup.duration === -Infinity
                ) {
                    particlesToEmit = elapsedTime > 0 ? currentGroup.rate : 0;
                    currentGroup.duration = 100;
                }

                // Only proceed if particles need to be emitted, and duration hasn't expired
                if (
                    particlesToEmit > 0 &&
                    (currentTime - currentGroup.startTime <
                        currentGroup.duration ||
                        currentGroup.duration === Infinity)
                ) {
                    if (currentGroup.oneShot && particlesToEmit > 0) {
                        currentGroup.duration = -1;
                    }

                    currentGroup.lastUpdate = currentTime;

                    while (particlesToEmit--) {
                        if (currentGroup.posRangeX) {
                            const xRange = util.getRandomRange(
                                currentGroup.posRangeX.start * scale,
                                (currentGroup.posRangeX.end || 0) * scale
                            );
                            currentGroup.x = this.pos.x + xRange;
                        } else {
                            currentGroup.x = this.pos.x;
                        }

                        if (currentGroup.posRangeY) {
                            const yRange = util.getRandomRange(
                                currentGroup.posRangeY.start * scale,
                                (currentGroup.posRangeY.end || 0) * scale
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

                        // Add or recycle particle
                        if (!this.pool.length) {
                            const curParticle = new Particle(
                                {
                                    ...currentGroup,
                                    ...{ pool: this.pool }
                                },
                                this.ctx
                            );
                            this.particles.push(curParticle);
                            this.ctx.addEntity(curParticle);
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
