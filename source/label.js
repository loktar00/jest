(function () {
	//constructor
    function Label(options)
    {   
		if(options !== undefined){
			// Set the label
			if(options.text === undefined){
				this.text = "Undefined Label Text";
			}else{
				this.text = options.text;
			}	
			
			// Set font size
			if(options.font === undefined){
				this.font = "12pt Arial";
			}else{
				this.font = options.font;
			}
			
			// Set position
			if(options.x === undefined || options.y === undefined){
				this.pos = new Vector(0,0,0);
			}else{
				var z = 0;
				
				if(options.z){
					z = options.z;
				}
				
				this.pos = new Vector(options.x,options.y,z);
			}
			
			//Set Color
			if(options.color === undefined){
				this.color = "#ffffff";
			}else{
				this.color = options.color;
			}
		}else{
			this.text = "Undefined Label Text";
			this.font = "12pt Arial";
			this.pos = new Vector(0,0,0);
			this.color = "#ffffff";
		}
		
		this.x = this.pos.x;
		this.y = this.pos.y;
		this.z = this.pos.z;
		this.live = true;
		this.visible = true;
    }
    
	this.Label = Label;
	
	Label.prototype = {
		// Handles updating the label
		update : function(deltaTime)
		{

		},
		// Draw the label
		render : function(_context)
		{	
			_context.fillStyle = this.color;
			_context.font = this.font;
			_context.fillText(this.text, this.pos.x, this.pos.y);
		}
	}	
})();