import Label from '../../../Jest/Label.js';
import PauseIndicator from '../entities/PauseIndicator.js';

export default class PauseState {
    constructor(game) {
        const title = new Label({
            text: 'PAUSED',
            x: game.width / 2 - 100,
            y: game.height / 2 - 40,
            font: '48pt Arial',
            color: '#ff0'
        });
        game.addEntity(title);

        const subtitle = new Label({
            text: 'Press 2 to resume gameplay, 1 for menu',
            x: game.width / 2 - 300,
            y: game.height / 2 + 40,
            font: '16pt Arial',
            color: '#aaa'
        });
        game.addEntity(subtitle);

        this.indicator = new PauseIndicator({
            x: game.width / 2,
            y: game.height / 2 + 120
        });
        game.addEntity(this.indicator);
    }
}
