export default class ResourceManager{
    constructor(){
        this.resources = [];
        this.loaded = 0;
        this.loadingComplete = true;
    }
    /**
     * Resourcemanager.add(_resource, _type)
     * object resource, String/Number, String
     * adds a new resource for use and begins the process of loading
     **/
    add(_resource, _type, _name){
        var resource = {'path' : _resource, 'type' : _type, 'name' : _name};

        // if the resource is an existing image
        if(_resource.src){
            resource.path = _resource.src;
        }

        this.loadingComplete = false;

        if(_name === undefined){
            _name = "";
        }

        if(_type == 1 || _type == "img" || _type === null){
            if(_resource.nodeType === 1){
                resource.source = _resource;
            }else{
                resource.source = new Image();
            }

            this.resources.push({resource : resource, name : _name});
            resource.source.onload = function(callback, res){resource.loaded = true; callback.loadImg(callback, res);}(this, resource);

            if(_resource.nodeType === 1){
                resource.source.src = _resource.src;
            }else{
                resource.source.src = _resource;
            }

        }else if(_type == 2 || _type == "audio"){
            resource.source = new Audio();
            this.resources.push({resource : resource, name : _name});
            this.loadAudio(resource);
            resource.source.src = _resource;
        }

        return resource;
    }
    /**
     * Resourcemanager.loadImg()
     * object event
     * reports when an image is loaded
     **/
    loadImg(callback, resource){
        if(resource.source.complete && resource.source.width){
            callback.loaded++;

            if(callback.loaded === callback.resources.length){
                callback.loadingComplete = true;
            }
        }else{
            setTimeout(function(){callback.loadImg(callback, resource);},10);
        }
    }
    /**
     * Resourcemanager.loadAudio(audio)
     * object audio resource
     * reports when audio is loaded
     **/
    loadAudio(audio,timeOut){
        clearTimeout(timeOut);
        timeOut = 0;

        var self = this;

        if (audio.source.readyState > 0) {
            this.loaded++;

            if(this.loaded === this.resources.length){
                this.loadingComplete = true;
            }
        } else {
            timeOut = setTimeout(function(){self.loadAudio(audio, timeOut);}, 100);
        }
    }
    /**
     * Resourcemanager.getResource(name)
     * string/text
     * returns the resource by name if found
     **/
     getResource(_name){
        var resources = this.resources;

        for(var i = 0, l = resources.length; i < l; i++){
            if(resources[i].name == _name){
                return resources[i].resource;
            }
        }
     }
}
