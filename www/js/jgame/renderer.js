(function () {
	
	function Renderer(canvas){
		this.renderList  = [];
		this.canvas    = canvas;
		this.context   = this.canvas.getContext("2d");
		this.width     = this.canvas.width;
		this.height    = this.canvas.height;
	}

	this.Renderer = Renderer;
	
	Renderer.prototype = {
		redraw : function ()
		{
			render.apply(this);
		},
				
		/**
		 * Renderer.addToRenderer(object)
		 * 
		 * add a new item to the renderer
		 **/
		addToRenderer : function (object)
		{
			this.renderList.push(object);
		},
		
		/**
		 * Renderer.removeFromRenderer(object)
		 * 
		 * remove an item from the renderer
		 **/
		removeFromRenderer : function (object)
		{
			for (var id in this.renderList) {
				if(this.renderList[id] === object){
					this.renderList.splice(id,1);
				}
			}
		}
	}
	
	// Todo: I dont like this. fix the sorting, right now sorts on y, but could potentially sort based on z
    function render ()
    {	
		this.context.clearRect(0,0,this.width,this.height);
		//this.renderList.sort(function(a,b){return b.y-a.y});
		
		this.renderList.sort(function(a,b){
			if(a.bg && b.bg){
				return b.bgIndex - a.bgIndex;
			}else if(a.ui && b.ui){
				return b.uiIndex - a.uiIndex;
			}else if(a.bg || b.ui){
				return 1;
			}else if(b.bg || a.ui){
				return -1;
			}else if(a.pos && b.pos){
				return a.pos.z - b.pos.z;
			}	
			return 0;
		});
			
	 	var id =  this.renderList.length;
		while(id--){
			var curObject = this.renderList[id];	
			if(curObject.visible){
				curObject.render(this.context);
			}
		}
    }

})();