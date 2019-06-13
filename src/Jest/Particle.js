import {Jest, Sprite} from './Jest';

export default class Particle extends Sprite {
    constructor(options = {}) {
        super(options);
        this.initialize(options);
    }

    initialize(options = {}) {
        super.initialize(options);
        Jest.particleCount++;

        this.visible = true;
        this.emitterPool = options.pool;

        this.startLife = Date.now();
        this.curStep = 0;

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
        this.alpha = this.startAlpha;
        
        this.blend = options.blend || false;

        // sets the origin to the center
        this.origin.y = this.height / 2;
        this.origin.x = this.width / 2;

        this.endLife = this.startLife + this.lifeTime;

        // precalc color changes
        this.colors = [];

        if(this.endColor !== this.startColor){
            for(let i = Math.ceil(this.lifeTime/Jest.frameRate) + 1; i > -1; i--){
                this.colors.push(this.colorFade(this.startColor, this.endColor, this.lifeTime, i*Jest.frameRate));
            }
        }
    }

    update(deltaTime) {
        this.curStep =  this.endLife - Date.now();

        this.vel.x = Math.cos(((this.angle)) *  Math.PI / 180) * this.thrust * deltaTime;
        this.vel.y = ((Math.sin(((this.angle)) *  Math.PI / 180) * this.thrust) + this.gravity * (this.lifeTime - this.curStep) * deltaTime) * deltaTime;

        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;

        if(this.pos.y < 0 || this.pos.y > Jest.bounds.y + Jest.bounds.height){
            // this.live = false;
            this.visible = false;
            this.emitterPool.push(this);
            Jest.particleCount--;
        }

        if(Date.now() > this.endLife){
            this.visible = false;
            this.emitterPool.push(this);
            //this.live = false;
            Jest.particleCount--;
        }

        // Do the changes between
        if(this.endAlpha !== this.startAlpha){
            if(this.endAlpha > this.startAlpha){
                this.alpha = this.endAlpha - ((this.endAlpha - this.startAlpha) / this.lifeTime) * this.curStep;
            }else{
                this.alpha = this.endAlpha + ((this.startAlpha - this.endAlpha) / this.lifeTime) * this.curStep;
            }

            if (this.alpha < 0) {
                this.alpha = 0;
            }
            
            if (this.alpha > 1) {
                this.alpha = 1;
            }
        }

        if(this.endColor !== this.startColor){
            this.color = this.colors[Math.ceil((this.lifeTime-this.curStep)/Jest.frameRate)];
        }

        if(this.endSize !== this.size){
            let scale = 0;
            if(this.endSize < this.startSize){
                scale =  ((this.startSize-this.endSize)/this.lifeTime)*this.curStep;
            }else{
                scale = this.endSize + ((this.startSize-this.endSize)/this.lifeTime)*this.curStep;
            }
            this.scale = {x : -scale, y : -scale};
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
    render(context) {
        context.save();

        const scale = this.scale || {x:0,y:0};
        let x = this.pos.x;
        let y = this.pos.y;
        let oX = this.origin.x;
        let oY = this.origin.y;
        let width = this.width;
        let height = this.height;
        let rotAngle = this.drawAngle * Math.PI / 180;

        if(this.blend){
            context.globalCompositeOperation = 'lighter';
        }

        if(!this.shape){
            context.globalAlpha  = this.alpha;

            if(this.drawAngle !== 0){
                context.translate(x, y);
                context.rotate(rotAngle);
                context.drawImage(this.resource.source, this.startX, this.startY, width,height, scale.x/2, scale.y/2, width-scale.x, height-scale.y);
            }else{
                context.drawImage(this.resource.source, this.startX, this.startY, width, height, x - oX, y - oY, width-scale.x, height-scale.y);
            }
        }else{
            const color = this.color || {r:0,g:0,b:0};
            context.fillStyle = `rgba(${color.r},${color.g},${color.b},${this.alpha})`;

            if(this.drawAngle !== 0){
                context.translate(x, y);
                context.rotate(rotAngle);
                context.fillRect(-oX, -oY, width - scale.x, height - scale.y);
            }else{
                context.fillRect(x - oX, y - oY, width - scale.x, height - scale.y);
            }
        }
        context.restore();
        context.globalCompositeOperation = 'source-over';
    }
    getColor(color) {
        return Math.floor(Math.min(255, Math.max(0, color)));
    }
    colorFade (startColor, endColor, totalSteps, step) {
        const scale = step/totalSteps;
        const r = endColor.r + scale*(startColor.r - endColor.r);
        const b = endColor.b + scale*(startColor.b - endColor.b);
        const g = endColor.g + scale*(startColor.g - endColor.g);

        return {r : this.getColor(r), g: this.getColor(g), b: this.getColor(b)};
    }
}
