import {Emitter} from '../Jest/Jest';
import Player from '../entities/Player';

export default class GameState {
    constructor(Jest) {
        Jest.gameState = {};
        const gameState = Jest.gameState;
    
        gameState.sprites = [];
        const player = new Player({
            x: Math.random() * 640,
            y: Math.random() * 480
        });

        gameState.sprites.push(player);
    
        Jest.addEntity(player);
        
        const emitter = new Emitter({
            pos: {
                x: Jest.width / 2,
                y: Jest.height / 2
            }
        });

        emitter.addGroup({
            size: 2,
            endSize: 1,
            thrust: 0,
            thrustRange: {
                min: 10,
                max: 20
            },
            angle: 0,
            angleRange: {
                min: 0,
                max: 360
            },
            startAlpha: 0,
            endAlpha: 1,
            color: {
                r: 255,
                g: 255,
                b: 255
            },
            duration: -1,
            rate: 1500,
            lifeTime: 3500
        });
    }
}
