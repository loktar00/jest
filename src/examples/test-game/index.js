import { Jest } from '../../Jest/Jest.js';
import MenuState from './states/menuState.js';
import GameplayState from './states/gameplayState.js';
import PauseState from './states/pauseState.js';

Jest.setup({
    canvas: 'jestCanvas',
    width: 1920,
    height: 1080,
    frameRate: Math.ceil(1000 / 60),
    showFrameRate: true,
    showParticleCount: true
});

Jest.setupGame = function setupGame() {
    // Create states
    Jest.addState('menu', () => {
        /* eslint-disable no-new */
        new MenuState(Jest);
    });
    Jest.addState('gameplay', () => {
        new GameplayState(Jest);
    });
    Jest.addState('pause', () => {
        new PauseState(Jest);
        /* eslint-enable no-new */
    });

    // Start with menu state
    Jest.switchState({ name: 'menu' });

    // Status overlay
    const statusEl = document.getElementById('status');
    const updateStatus = () => {
        const lines = [
            `State: ${Jest.currentState.name || 'default'}`,
            `Entities: ${Jest.entities.length}`,
            `Particles: ${Jest.particleCount}`,
            `Scale: ${Jest.jestScale.toFixed(2)}`,
            `Mouse: ${Math.round(Jest.mouseX)}, ${Math.round(Jest.mouseY)}`,
            `Focused: ${Jest.focused}`,
            '',
            'Controls:',
            '  1 = Menu state',
            '  2 = Gameplay state',
            '  3 = Pause state',
            '  Arrow keys = Move player',
            '  Space = One-shot emitter',
            '  Mouse = Click entities'
        ];
        statusEl.textContent = lines.join('\n');
        requestAnimationFrame(updateStatus);
    };
    updateStatus();

    this.update();
};

window.onload = () => {
    Jest.load();
};
