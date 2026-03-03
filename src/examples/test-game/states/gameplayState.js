import Emitter from '../../../Jest/Emitter.js';
import Label from '../../../Jest/Label.js';
import PlayerEntity from '../entities/PlayerEntity.js';
import ClickableBox from '../entities/ClickableBox.js';
import BackgroundRect from '../entities/BackgroundRect.js';
import InputChecker from '../entities/InputChecker.js';

export default class GameplayState {
    constructor(game) {
        // Score label
        this.score = 0;
        this.scoreLabel = new Label({
            text: 'Score: 0',
            x: 20,
            y: 60,
            font: '16pt Arial',
            color: '#ff0'
        });
        this.scoreLabel.ui = true;
        this.scoreLabel.uiIndex = 10;
        game.addEntity(this.scoreLabel);

        // State label
        const stateLabel = new Label({
            text: 'GAMEPLAY STATE',
            x: game.width / 2 - 150,
            y: 40,
            font: '20pt Arial',
            color: '#0f0'
        });
        stateLabel.ui = true;
        stateLabel.uiIndex = 10;
        game.addEntity(stateLabel);

        // Player entity
        this.player = new PlayerEntity({
            x: game.width / 2,
            y: game.height / 2,
            width: 40,
            height: 40,
            color: { r: 0, g: 255, b: 100 }
        });
        game.addEntity(this.player);

        // Continuous emitter (particle system test)
        this.trailEmitter = new Emitter({
            pos: {
                x: game.width / 2,
                y: game.height / 2
            }
        });

        this.trailEmitter.addGroup({
            name: 'trail',
            startSize: 2,
            endSize: 8,
            thrustRange: { min: 20, max: 80 },
            angleRange: { min: 0, max: 360 },
            startAlpha: 0.8,
            endAlpha: 0,
            startColor: { r: 255, g: 100, b: 0 },
            endColor: { r: 255, g: 255, b: 0 },
            duration: Infinity,
            rate: 200,
            lifeTime: 2000,
            blend: true
        });

        // One-shot emitter for spacebar
        this.burstEmitter = new Emitter({
            pos: {
                x: game.width / 2,
                y: game.height / 2
            }
        });

        this.burstEmitter.addGroup({
            name: 'burst',
            startSize: 1,
            endSize: 20,
            thrustRange: { min: 80, max: 200 },
            angleRange: { min: 0, max: 360 },
            startAlpha: 1,
            endAlpha: 0,
            startColor: { r: 100, g: 150, b: 255 },
            endColor: { r: 255, g: 50, b: 255 },
            rate: 200,
            lifeTime: 2500,
            oneShot: true,
            blend: true
        });

        // Clickable boxes for entity lifecycle test
        for (let i = 0; i < 5; i++) {
            const box = new ClickableBox({
                x: 200 + i * 300,
                y: game.height - 200,
                width: 50,
                height: 50,
                color: {
                    r: Math.floor(Math.random() * 255),
                    g: Math.floor(Math.random() * 255),
                    b: Math.floor(Math.random() * 255)
                }
            });
            game.addEntity(box);
        }

        // Background entity test
        const bg = new BackgroundRect({
            width: game.width,
            height: game.height,
            color: { r: 20, g: 20, b: 40 }
        });
        bg.bg = true;
        bg.bgIndex = 0;
        game.addEntity(bg);

        // Input checker entity
        this.inputChecker = new InputChecker(
            this.player,
            this.trailEmitter,
            this.burstEmitter,
            this.scoreLabel
        );
        game.addEntity(this.inputChecker, true);
    }
}
