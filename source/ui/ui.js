(function(){
	function UI(options){
		options = options || {}; 
		this.state = options.state || Game.currentState;
		this.width = options.width || Game.bounds.width;
		this.height = options.height || Game.bounds.height;
		
		
		this.items = [];

		// add to the entity list, and call the render since we are going to override the main render to make sure UI items are always on top. 
		Game.addEntity(this, true, this.state);
	}
	
	this.UI = UI;
	
	UI.prototype = {
		/**
		 ** UI.addItem
		 ** object, item to add button, sprite, ect.
		 **/
		addItem : function(object, uiIndex){
			
			if(uiIndex === undefined){
				uiIndex = 1;
			}
			
			object.ui = true;
			object.uiIndex = uiIndex;
			
			// add it to the update/render of the ui's parent state
			Game.addEntity(object, false, this.state);
			this.items.push(object);
		},
		/**
		 ** UI.hide
		 **/
		hide : function(){
			var id =  this.items.length;
			while(id--){
				this.items[id].visible = false;
			}
		},
		/**
		 ** UI.show
		 **/
		show : function(){
			var id =  this.items.length;
			while(id--){
				this.items[id].visible = true;
			}
		},
		/**
		 ** UI.update
		 **/
		update : function(deltaTime){
			
		},
		/**
		 ** UI.render
		 **/
		render : function(context){

		}
	}

})();