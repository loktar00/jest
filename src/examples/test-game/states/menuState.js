import Label from '../../../Jest/Label.js';
import BouncingBox from '../entities/BouncingBox.js';

export default class MenuState {
    constructor(game) {
        const title = new Label({
            text: 'JEST ENGINE TEST GAME',
            x: game.width / 2 - 300,
            y: game.height / 3,
            font: '36pt Arial',
            color: '#0ff'
        });
        game.addEntity(title);

        const subtitle = new Label({
            text: 'Press 2 to start gameplay',
            x: game.width / 2 - 200,
            y: game.height / 3 + 80,
            font: '18pt Arial',
            color: '#aaa'
        });
        game.addEntity(subtitle);

        const instructions = new Label({
            text: 'Press 1=Menu, 2=Gameplay, 3=Pause to switch states',
            x: game.width / 2 - 350,
            y: game.height / 2 + 40,
            font: '14pt Arial',
            color: '#666'
        });
        game.addEntity(instructions);

        this.box = new BouncingBox({
            x: game.width / 2,
            y: game.height / 2 + 150,
            width: 60,
            height: 60,
            color: { r: 0, g: 200, b: 255 }
        });
        game.addEntity(this.box);
    }
}
