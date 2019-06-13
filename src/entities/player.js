import {Sprite} from '../Jest/Jest';

export default class Player extends Sprite {
    constructor(options) {
        super(options);

        this.width = 32;
        this.height = 32;
        this.shape = true;
        this.color = {
            r: 255,
            g: 0,
            b: 0,
            a: 255
        };

        this.guardDistance = 200;
    }
    update(deltaTime) {
        super.update(deltaTime);
        if (Jest.buttonPressed(0, 'a')) {
            // console.log('pressed')
        }

        let targetX = Jest.mouseX;
        let targetY = Jest.mouseY;

        if (Jest.gamePads.length) {
            targetX = Jest.getAxis(0, 'left').x * 1000;
            targetY = Jest.getAxis(0, 'left').y * 1000;
        }

        const centerX = Jest.bounds.width / 2;
        const centerY = Jest.bounds.height / 2;

        const x = centerX - targetX;
        const y = centerY - targetY;

        const radians = Math.atan2(y,x);
        
        this.pos.x = centerX - this.guardDistance * Math.cos(radians);
        this.pos.y = centerY - this.guardDistance * Math.sin(radians);
    }
};