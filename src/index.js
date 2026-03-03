import { Jest } from './Jest/Jest.js';
import GameState from './states/gamestate.js';

Jest.setup({
    canvas: 'jestCanvas',
    width: 1920,
    height: 1080,
    frameRate: Math.ceil(1000 / 60),
    showFrameRate: true
});

Jest.setupGame = function setupGame() {
    // eslint-disable-next-line no-new
    new GameState(Jest);
    this.update();
};

window.onload = () => {
    Jest.load();
};
