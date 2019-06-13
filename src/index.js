import {Jest, Emitter} from './Jest/Jest';
import GameState from './states/GameState';

Jest.setup({
    canvas: "jestCanvas",
    width: window.innerWidth,
    height: window.innerHeight,
    frameRate: Math.ceil(1000 / 60),
    showFrameRate: true
});

Jest.setupGame = function () {
    const gamestate = new GameState(Jest);
    this.update();
};

window.onload = () => {
    Jest.load();
};