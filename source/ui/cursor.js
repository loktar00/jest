/*** Cursor is just a sprite that matches its position with the mouse coords. **/
(function(){	
	var utilities = new Utilities();
	
	function Cursor(options){		
		Sprite.call(this, options);	
	}		
	
	Cursor.prototype = new Sprite();	
	this.Cursor = Cursor;			
	
	Cursor.prototype.update = function(deltaTime){		
		Sprite.prototype.update();				
			this.pos.x = Game.mouseX;					
			this.pos.y = Game.mouseY;		
	}
})();