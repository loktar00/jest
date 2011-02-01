(function () {
	
	function Renderer(canvas){
		this._renderItems  = [];
		this._canvas    = canvas;
		this._context   = this._canvas.getContext("2d");
		this._width     = this._canvas.width;
		this._height    = this._canvas.height;
	}

	this.Renderer = Renderer;
	
	Renderer.prototype = {
		redraw : function ()
		{
			render.apply(this);
		},
		
		addToRenderer : function (object)
		{
			this._renderItems.push(object);
		},
		
		removeFromRenderer : function (object)
		{
			for (var id in this._renderItems) {
				if(this._renderItems[id] === object){
					this._renderItems.splice(id,1);
				}
			}
		}
	}
	
	// Todo: I dont like this.
    function render ()
    {	
		this._context.clearRect(0,0,this._width,this._height);
	 	id =  this._renderItems.length;
		while(id--){
			var curObject = this._renderItems[id];	
			curObject.render(this._context);
			
		}
    }

})();