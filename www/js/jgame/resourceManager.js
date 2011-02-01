(function () {
	function ResourceManager(){
		this.resources = [];
		this.loaded = 0;
		this.loadingComplete = true;
	}

	this.ResourceManager = ResourceManager;	
	
	ResourceManager.prototype = {
		add : function(resource){
			var resource = new Resource(resource);
			this.resources.push(resource);
			this.loadingComplete = false;
			resource.onLoad = this.load();
			return resource;
		},
		load : function(callBack){
			this.loaded++;
			if(this.loaded === this.resources.length - 1){
				this.loadingComplete = true;
			}
		}
	}
})();