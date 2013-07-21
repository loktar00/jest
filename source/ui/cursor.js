/*** Cursor is just a sprite that matches its position with the mouse coords. **/
function Cursor(options){
	Jest.Sprite.call(this, options);
}

Cursor.prototype = new Jest.Sprite();

Cursor.prototype.update = function(deltaTime){
	Jest.Sprite.prototype.update();
	this.pos.x = Game.mouseX;
	this.pos.y = Game.mouseY;
}