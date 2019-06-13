const buttonMap = {
    cross: 0,
    a: 0,
    b: 1,
    circle: 1,
    x: 2,
    square: 2,
    y: 3,
    triangle: 3,
    l1: 4,
    r1: 5,
    lt: 6,
    rt: 7,
    select: 8,
    share: 8,
    start: 9,
    options: 9,
    l3: 10,
    r3: 11,
    dpad_up: 12,
    dpad_down: 13,
    dpad_left: 14,
    dpad_right: 15,
    psbutton: 16,
    xboxbutton: 16
};

export default class Gamepad {
    constructor(pad, id) {
        this.id = id;
        this.buttons = pad.buttons;
        this.axes = pad.axes;
    }
    buttonPressed(button) {
        return this.buttons[buttonMap[button]].value;
    }
    axis(direction) {
        if (direction === 'left') {
            return {
                x: this.axes[0],
                y: this.axes[1]
            }
        }

        if (direction === 'right') {
            return {
                x: this.axes[2],
                y: this.axes[3]
            }
        }
    }
    update(deltaTime) {
        const pad = navigator.getGamepads()[this.id];
        this.buttons = pad.buttons;
        this.axes = pad.axes;
    }
}