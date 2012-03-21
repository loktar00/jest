/*** Controls the UI.. not sure on implementation.. either add a new canvas on top of the game canvas, 
  ** or add the elements to the current renderer/update
***/

(function(){
	function UI(options){
		this.state = Game.currentState;
		this.width = Game.bounds.width;
		this.height = Game.bounds.height;
		
		
		if(typeof options !== 'undefined'){

			// assign a ui to a state
			if(typeof options.state !== 'undefined'){
				this.state = options.state;
			}
			
			// maybe you dont wan the UI the whole game area.. idk 
			if(typeof options.width !== 'undefined'){
				this.width = options.width;
			}
			
			if(typeof options.height !== 'undefined'){
				this.height = options.height;
			}
		}
		
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