import Emitter from '../Jest/Emitter.js';
import Player from '../entities/player.js';

export default class GameState {
    constructor(Jest) {
        Jest.gameState = {};
        const { gameState } = Jest;

        gameState.sprites = [];

        const player = new Player({
            x: 960,
            y: 540
        });

        gameState.sprites.push(player);

        Jest.addEntity(player);

        const emitter = new Emitter({
            pos: {
                x: Jest.width / 4,
                y: Jest.height / 4
            }
        });

        emitter.addGroup({
            alignToAngle: true,
            size: 0,
            endSize: 15,
            thrustRange: {
                min: 100,
                max: 150
            },
            angleRange: {
                min: 0,
                max: 360
            },
            startAlpha: 1,
            endAlpha: 0,
            startColor: {
                r: 255,
                g: 0,
                b: 0
            },
            endColor: {
                r: 0,
                g: 255,
                b: 255
            },
            duration: -1,
            rate: 200,
            lifeTime: 3500
        });

        const emitter2 = new Emitter({
            pos: {
                x: (Jest.width / 4) * 3,
                y: (Jest.height / 4) * 3
            }
        });

        emitter2.addGroup({
            alignToAngle: true,
            size: 0,
            endSize: 15,
            thrustRange: {
                min: 100,
                max: 150
            },
            angleRange: {
                min: 0,
                max: 360
            },
            startAlpha: 1,
            endAlpha: 0,
            startColor: {
                r: 255,
                g: 0,
                b: 0
            },
            endColor: {
                r: 255,
                g: 255,
                b: 255
            },
            duration: -1,
            rate: 200,
            lifeTime: 3500
        });
    }
}
