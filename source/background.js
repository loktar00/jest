/** Background, basically a static sprite, in terms of moving on the screen. Mainly used for scrolling a single image over and over */

/** TODO : handle the bgIndex in the parralax portion.. not in here since bg's can be used multiple times **/
Jest.Background = function(options)
{

    options = options || {};
    this.resource = options.resource || null;
    this.width = options.width || Jest.bounds.width;
    this.height = options.height || Jest.bounds.height;
    this.startX = options.startX || 0;
    this.startY = options.startY || 0;

    var endX = 32,
        endY = 32;

    if(this.resource){
        endX = this.resource.source.width;
    }

    if(this.resource){
        endY = this.resource.source.height;
    }

    this.endX = options.endX || endX;
    this.endY = options.endY || endY;

    this.bgIndex = options.bgIndex || 0;
    this.pos = {x : options.x || 0, y : options.y || 0};
    this.state = options.state || { id : 0 };

    this.visible = true;
    this.x = this.pos.x;
    this.y = this.pos.y;
    this.scrollX = 0;
    this.scrollY = 0;
    this.live = true;
    this.bg = true;

    if(this.endX < this.width){
        var tempCanvas = document.createElement("canvas"),
            tempCtx = tempCanvas.getContext("2d"),
            source = this.resource.source,
            widthDiff =  this.width - this.endX;

            tempCanvas.width = this.endX + widthDiff;
            tempCanvas.height = this.endY;

            tempCtx.drawImage(source,0,0,this.endX,this.endY,0,0, this.endX, this.endY);
            tempCtx.drawImage(source,0,0,widthDiff,this.endY,this.endX, 0, widthDiff, this.endY);

            this.endX = this.endX + widthDiff;
            this.resource.source = tempCanvas;
    }
};

Jest.Background.prototype = {
    // Handles updating
    update : function(deltaTime)
    {
    },
    scroll : function(speedX, speedY, deltaTime){
        this.scrollX += speedX  * deltaTime;
        this.scrollY += speedY *  deltaTime;

        if(this.scrollY > this.endY){
            this.scrollY = 0;
        }else if(this.scrollY < 0){
            this.scrollY = this.endY;
        }

        if(this.scrollX > this.endX){
            this.scrollX = 0;
        }else if(this.scrollX < 0){
            this.scrollX = this.endX;
        }
    },
    // Draw
    render : function(context){
        context.save();

        var source = this.resource.source;
        if(this.startY + this.scrollY > this.endY-this.height || this.startX + this.scrollX > this.endX-this.width){
            var sX = [this.startX+this.scrollX, this.startX],
                sY = [this.startY+this.scrollY, this.startY],
                sWidth = [this.width, this.width],
                sHeight = [this.height, this.height],
                dX = [this.pos.x, this.pos.x],
                dY = [this.pos.y, this.pos.y],
                dWidth = [this.width, this.width],
                dHeight = [this.height, this.height];

            // check the Y and set values accordingly
            if(this.startY + this.scrollY > this.endY-this.height){
                sY[0] = this.startY+this.scrollY;
                sY[1] = this.startY;

                sHeight[0] = this.endY-(this.startY+this.scrollY);
                sHeight[1] = this.height;

                dY[0] = this.pos.y;
                dY[1] = this.pos.y+this.endY-(this.startY+this.scrollY);

                dHeight[0] = this.endY-(this.startY+this.scrollY);
                dHeight[1] = this.height;
            }

            // Check the X and set value accordingly
            if(this.startX + this.scrollX > this.endX-this.width){
                sX[0] = this.startX+this.scrollX;
                sX[1] = this.startX;

                sWidth[0] = this.endX-(this.startX+this.scrollX);
                sWidth[1] = this.width;

                dX[0] = this.pos.x;
                dX[1] = this.pos.x+this.endX-(this.startX+this.scrollX);

                dWidth[0] = this.endX-(this.startX+this.scrollX);
                dWidth[1] = this.width;
            }

            context.drawImage(source,sX[0],sY[0],sWidth[0],sHeight[0],dX[0], dY[0], dWidth[0], dHeight[0]);
            context.drawImage(source,sX[1],sY[1],sWidth[1],sHeight[1],dX[1], dY[1], dWidth[1], dHeight[1]);
        }else{
            context.drawImage(source,this.startX+this.scrollX,this.startY+this.scrollY,this.width,this.height, this.pos.x, this.pos.y, this.width, this.height);
        }

        context.restore();
    }
};
