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

	this.clickable = true;
}

Button.prototype = new Jest.Sprite();

Button.prototype.clicked = function(){
	Sprite.prototype.clicked();
	if(this.clicked){
		this.clicked();
	}
};

Button.prototype.mouseover = function(over){
	if(this.hover){
		this.hover(over);
	}
}

Button.prototype.update = function(deltaTime){
	Jest.Sprite.prototype.update();
	var x = this.pos.x-this.origin.x,
		y = this.pos.y-this.origin.y;

	if(Game.mouseX > x && Game.mouseX < x + this.width && Game.mouseY > y && Game.mouseY < y+this.height){
		this.mouseover(true);
	}else{
		this.mouseover(false);
	}
}