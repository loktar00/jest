export default class InputChecker {
    constructor(player, trailEmitter, burstEmitter, scoreLabel) {
        this.player = player;
        this.trailEmitter = trailEmitter;
        this.burstEmitter = burstEmitter;
        this.scoreLabel = scoreLabel;
        this.live = true;
        this.visible = false;
        this.spaceWasDown = false;
        this.score = 0;
    }

    update() {
        this.trailEmitter.pos.x = this.player.pos.x;
        this.trailEmitter.pos.y = this.player.pos.y;

        if (Jest.keys[32] && !this.spaceWasDown) {
            this.burstEmitter.pos.x = this.player.pos.x;
            this.burstEmitter.pos.y = this.player.pos.y;
            this.burstEmitter.startGroup('burst');
            this.score += 10;
            this.scoreLabel.text = `Score: ${this.score}`;
            this.spaceWasDown = true;
        }
        if (!Jest.keys[32]) {
            this.spaceWasDown = false;
        }

        if (Jest.keys[49]) {
            Jest.switchState({ name: 'menu' });
        }
        if (Jest.keys[51]) {
            Jest.switchState({ name: 'pause' });
        }
    }

    render() {}
}
