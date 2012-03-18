(function () {
	function ResourceManager(){
		this.resources = [];
		this.loaded = 0;
		this.loadingComplete = true;
	}

	this.ResourceManager = ResourceManager;	
	
	ResourceManager.prototype = {
		/**
		 * Resourcemanager.add(_resource, _type)
		 * object resource, String/Number, String
		 * adds a new resource for use and begins the process of loading
		 **/
		add : function(_resource, _type, _name){		
			var resource = {'path' : _resource, 'type' : _type, 'name' : _name};
			this.loadingComplete = false;
			
			if(_name === undefined){
				_name = "";
			}
					
			if(_type == 1 || _type == "img" || _type == null){
				resource.source = new Image();
				this.resources.push({resource : resource, name : _name});
				resource.source.onload = function(callback, res){callback.loadImg(callback, res)}(this, resource);
				resource.source.src = _resource;
				
			}else if(_type == 2 || _type == "audio"){
				resource.source = new Audio();
				this.resources.push({resource : resource, name : _name});
				this.loadAudio(resource);
				resource.source.src = _resource;
			}
					
			return resource;
		},
		/**
		 * Resourcemanager.loadImg()
		 * object event
		 * reports when an image is loaded
		 **/
		loadImg : function(callback, resource){
			if(resource.source.complete && resource.source.width){				
				callback.loaded++;
				if(callback.loaded === callback.resources.length){
					callback.loadingComplete = true;
				}
			}else{
				setTimeout(function(){callback.loadImg(callback, resource)},10);
			}
		},
		/**
		 * Resourcemanager.loadAudio(audio)
		 * object audio resource
		 * reports when audio is loaded
		 **/
		loadAudio : function(audio,timeOut){
			clearTimeout(timeOut);
			var self = this,
				timeOut = 0;
				
			if (audio.source.readyState > 0) {
				this.loaded++;
					
				if(this.loaded === this.resources.length){
					this.loadingComplete = true;
				}
			} else {
				timeOut = setTimeout(function(){self.loadAudio(audio, timeOut)}, 100);
			}
		},
		/**
		 * Resourcemanager.getResource(name)
		 * string/text
		 * returns the resource by name if found
		 **/
		 getResource : function(_name){
			var resources = this.resources;
			
			for(var i = 0, l = resources.length; i < l; i++){
				if(resources[i].name == _name){
					return resources[i].resource;
				}
			}
		 }
	}
})();