Jest.Sprite = function(options)
    {
        options = options || {};
        this.width = options.width || 32;
        this.height = options.height || 32;

        // Set the position
        this.pos = options.pos || {x:0, y:0, z:0};
        if(options.x && options.y){
            var z = 0;
            if(options.z){
                z = options.z;
            }
            this.pos = new Vector(options.x,options.y,z);
        }else if(options.pos){
            this.pos = options.pos;
        }else{
            this.pos = new Vector(0,0,0);
        }

        // Set drawing origin
        this.origin = options.origin || {x:0, y:0, z:0};
        if(options.ox && options.oy){
            var oz = 0;
            if(options.oz){
                oz = options.oz;
            }
            this.origin = new Vector(options.ox,options.oy,oz);
        }else if(options.origin){
            this.origin = options.origin;
        }else{
            this.origin = new Vector(0,0,0);
        }

        // Set an initial velocity
        this.vel = options.vel || {x:0, y:0, z:0};
        if(options.vx && options.vy){
            var vz = 0;
            if(options.vz){
                vz = options.vz;
            }
            this.vel = new Vector(options.vx,options.vy,vz);
        }else if(options.vel){
            this.vel = options.vel;
        }else{
            this.vel = new Vector(0,0,0);
        }

        // StartX and StartY are used for animated sprites to determine which frame to show
        this.startX = options.startX || 0;
        this.startY = options.startY || 0;

        this.tileable = options.tileable || false;
        if(this.tileable){
            this.endX = options.endX || this.width;
            this.endY = options.endY || this.height;
        }

        // If theres not a resource specified we just assume its going to be a rect
        if(options.resource === undefined){
            this.shape = true;
            this.resource = {};
        }else{
            this.shape = false;
            this.resource = options.resource;
        }

        this.angle = options.angle || 0;
        this.thrust = options.thrust || 0;
        this.color = options.color || {r:255,g:255,b:255};
        this.alpha = 255;
        this.clickable = options.clickable || false;

        // for referencing a list of entities or sprites its a part of
        if(options.list && options.list.length != 'undefined'){
            this.list = options.list;
            this.list.push(this);
        }else{
            this.list = [];
        }

        // required properties
        this.visible = true;

        this.animations = [];
        this.curAnim = {name : "", frames : 0};
        this.isAnimating = false;

        this.lastAnim = 0;
        this.animSpeed = 0;

        this.x = this.pos.x;
        this.y = this.pos.y;

        this.live = true;
    };

Jest.Sprite.prototype = {
    // Handles updating the sprite
    update : function(deltaTime)
    {

        if(this.isAnimating){
            if(new Date().getTime() > this.lastAnim + this.animSpeed){
                this.lastAnim = new Date().getTime();
                this.startX  = this.width * this.curAnim.frames[this.frame];
                this.frame++;
                if(this.frame > this.curAnim.frames.length-1){
                    // stop if its a one shot animation
                    if(this.animType !== 1){
                        this.isAnimating = false;
                    }else{
                        this.frame = 0;
                    }
                }
            }
        }
    },
    // Add animation sequences for animated sprites
    addAnimation : function(sequence, sequenceName){
        var aniSequence = {name : sequenceName, frames : sequence};
        this.animations.push(aniSequence);
    },
    /** Play animation sequence
     * sequenceName - name of prev added sequence
     * animSpeed - milliseconds between frames
     * animType - 0/null/undefined = play sequence full once, 1 = play until stopped
    **/
    playAnimation : function(sequenceName, animSpeed, animType){
        for(var i = 0, len = this.animations.length; i < len; i++){
            var curAnim = this.animations[i];
            if(curAnim.name === sequenceName){
                this.curAnim = curAnim;
                this.animSpeed = animSpeed;
                if(typeof animType == 'undefined'){
                    this.animType = 0;
                }else{
                    this.animType = animType;
                }
                this.frame = 0;
                this.isAnimating = true;
            }
        }
    },
    stopAnimation : function(){
        if(this.isAnimating){
            this.isAnimating = false;
            this.curAnim = {name : "", frames : 0};
        }
    },
    // Check for collisions
    checkCollision : function(x, y){
    },
    // Change the frame to a specific one
    changeFrame : function(frame){
        this.startX = frame*this.width;
    },
    kill : function(){
        // do something before its "dead"
        if(this.list.length > 0){
            var listItem = this.list.length,
                list = this.list,
                item = list.indexOf(this);

            if(item){
                list.splice(item,1);
            }
        }
    },
    // Draw
    render : function(context){
        context.save();
        if(!this.shape){

            // render to the nearest full pixel
            var cX = (0.5 + (this.pos.x-this.origin.x)) << 0,
                cY = (0.5 + (this.pos.y-this.origin.y)) << 0;

            context.drawImage(this.resource.source,this.startX,this.startY,this.width,this.height, cX, cY, this.width,this.height);
        }else{
            var color = this.color;
            context.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + "," + this.alpha + ")";
            context.fillRect(this.pos.x-this.origin.x, this.pos.y-this.origin.y, this.width,this.height);
        }
        context.restore();
    },
    clicked : function(){
        // Object was clicked do some stuff brah
    },
    mouseDown : function(){
        // Object was mousedDown on do some stuff brah
    }
};