(function () {	
	function Resource(_resource){
		this.source = new Image();
		this.source.src = _resource;
	}

	this.Resource = Resource;	
	
	Resource.prototype.changeResource = function(_resource){
		this.source.src = _resource;
	}
})();