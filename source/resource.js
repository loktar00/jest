
 Jest.Resource = function(_resource, _type){
	if(_type == 1 || _type == "img" || _type == null){
		this.source = new Image();
	}else if(_type == 2 || _type == "audio"){
		this.source = new Audio();
	}
	this.source.src = _resource;
}

Jest.Resource.prototype.changeResource = function(_resource){
	this.source.src = _resource;
}