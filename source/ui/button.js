/*** Button is just a sprite with a few added methods for clicking and hovering **/
function Button(options){
	Jest.Sprite.call(this, options);
	if(options){
		// callback for the click event if specified
		if(options.clicked){
			this.clicked = options.clicked;
		}

		// callback if the element is moused over
		if(options.hover){
			this.hover = options.hover;
		}
	}

	this.over = false;
	this.clickable = true;
	this.noClickThrough = true;
}

Button.prototype = new Jest.Sprite();

Button.prototype.clicked = function(){
	Sprite.prototype.clicked();
	if(this.clicked && this.visible){
		this.clicked();
	}
};

Button.prototype.mouseover = function(over){
	if(this.hover && this.visible){
		this.hover(over);
	}
};

Button.prototype.update = function(deltaTime){
	Jest.Sprite.prototype.update();
	if(this.visible){
		var x = this.pos.x-this.origin.x,
			y = this.pos.y-this.origin.y;

		if(Game.mouseX > x && Game.mouseX < x + this.width && Game.mouseY > y && Game.mouseY < y+this.height){
			this.over = true;
			this.mouseover(this.over);
		}else{
			if(this.over){
				this.over = false;
				this.mouseover(this.over);
			}
		}
	}
};