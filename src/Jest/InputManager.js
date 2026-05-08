import Gamepad from './Gamepad.js';

export default class InputManager {
    constructor(canvas, eventBus) {
        this.canvas = canvas;
        this.eventBus = eventBus;

        this.keys = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.moused = false;
        this.leftDown = false;
        this.rightDown = false;
        this.midDown = false;
        this.focused = true;
        this.gamePads = [];

        this.bindEvents();
    }

    bindEvents() {
        const { canvas } = this;

        // Focus tracking
        document.addEventListener('touchstart', (event) => {
            if (event.target !== canvas) {
                this.focused = false;
            } else {
                this.focused = true;
            }
        });

        canvas.addEventListener(
            'click',
            (event) => {
                this.focused = true;
                this.eventBus.emit('input:click', event);
            },
            false
        );

        canvas.addEventListener(
            'mousemove',
            (event) => this.handleMouseMove(event),
            false
        );

        canvas.addEventListener(
            'mousedown',
            (event) => this.handleMouseDown(event),
            false
        );

        canvas.addEventListener(
            'mouseup',
            (event) => this.handleMouseUp(event),
            false
        );

        canvas.addEventListener(
            'contextmenu',
            (event) => {
                event.preventDefault();
            },
            false
        );

        canvas.addEventListener(
            'mousewheel',
            (event) => this.handleMouseWheel(event),
            false
        );
        canvas.addEventListener(
            'DOMMouseScroll',
            (event) => this.handleMouseWheel(event),
            false
        );

        // Touch events
        canvas.addEventListener(
            'touchstart',
            (event) => this.handleTouchStart(event),
            false
        );

        canvas.addEventListener(
            'touchmove',
            (event) => this.handleTouchMove(event),
            false
        );

        canvas.addEventListener(
            'touchend',
            (event) => this.handleTouchEnd(event),
            false
        );

        canvas.addEventListener(
            'touchcancel',
            (event) => this.handleTouchEnd(event),
            false
        );

        // Keyboard
        document.addEventListener(
            'keydown',
            (event) => {
                if (this.focused) {
                    this.keys[event.keyCode] = true;
                    this.eventBus.emit('input:keydown', event);
                }
            },
            false
        );

        document.addEventListener(
            'keyup',
            (event) => {
                if (this.focused) {
                    this.keys[event.keyCode] = false;
                    this.eventBus.emit('input:keyup', event);
                }
            },
            false
        );

        // Gamepad
        window.addEventListener('gamepadconnected', (e) => {
            const { index } = e.gamepad;
            const gp = navigator.getGamepads()[index];
            this.gamePads[index] = new Gamepad(gp, index);
            this.eventBus.emit('input:gamepadconnected', e);
        });

        window.addEventListener('gamepaddisconnected', (e) => {
            const { index } = e.gamepad;
            this.gamePads.splice(index, 1);
            this.eventBus.emit('input:gamepaddisconnected', e);
        });
    }

    handleMouseMove(event) {
        this.rawMouseX = event.pageX - this.canvas.offsetLeft;
        this.rawMouseY = event.pageY - this.canvas.offsetTop;
        this.eventBus.emit('input:mousemove', event);
    }

    updateMousePosition(scale) {
        this.mouseX = this.rawMouseX / scale;
        this.mouseY = this.rawMouseY / scale;
    }

    handleMouseDown(event) {
        this.moused = true;
        if ('which' in event) {
            switch (event.which) {
                case 1:
                    this.leftDown = true;
                    break;
                case 2:
                    this.midDown = true;
                    break;
                case 3:
                    this.rightDown = true;
                    break;
                default:
                    break;
            }
        }
        this.eventBus.emit('input:mousedown', event);
    }

    handleMouseUp() {
        this.moused = false;
        this.leftDown = false;
        this.midDown = false;
        this.rightDown = false;
        this.eventBus.emit('input:mouseup');
    }

    handleTouchStart(event) {
        this.eventBus.emit('input:touchstart', event);
    }

    handleTouchMove(event) {
        this.eventBus.emit('input:touchmove', event);
    }

    handleTouchEnd(event) {
        this.eventBus.emit('input:touchend', event);
    }

    handleMouseWheel(event) {
        let dir = 0;
        if ('wheelDelta' in event) {
            if (Math.abs(event.wheelDelta) - event.wheelDelta === 0) {
                dir = -1;
            } else {
                dir = 1;
            }
        } else if (event.detail) {
            if (Math.abs(event.detail) - event.detail === 0) {
                dir = 1;
            } else {
                dir = -1;
            }
        }
        this.eventBus.emit('input:mousewheel', dir);
        return dir;
    }

    updateGamepads() {
        this.gamePads.forEach((pad) => pad.update());
    }

    getKey(key) {
        return this.keys[key];
    }

    buttonPressed(gamepadIndex, button) {
        return (
            (this.gamePads[gamepadIndex] &&
                this.gamePads[gamepadIndex].buttonPressed(
                    button.toLowerCase()
                )) ||
            0
        );
    }

    getAxis(gamepadIndex, axis) {
        return (
            (this.gamePads[gamepadIndex] &&
                this.gamePads[gamepadIndex].axis(axis.toLowerCase())) || {
                x: 0,
                y: 0
            }
        );
    }

    gamePadRumble(gamepadIndex, duration) {
        return (
            this.gamePads[gamepadIndex] &&
            this.gamePads[gamepadIndex].rumble(duration)
        );
    }
}
