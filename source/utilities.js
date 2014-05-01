// Utility merge from the awesome https://github.com/Titani/SO-ChatBot/
Object.merge = function () {
    return [].reduce.call( arguments, function ( ret, merger ) {

        Object.keys( merger ).forEach(function ( key ) {
            ret[ key ] = merger[ key ];
        });

        return ret;
    }, {} );
};

Jest.prototype.Utilities = {
    getRandomRange : function(_min, _max){
        return Math.floor(Math.random()*(_max-_min+1))+_min;
    },
    fGetRandomRange :  function(_min, _max){
        return Math.random()*(_max-_min)+_min;
    },
    getDistance : function(a, b){
        return Math.sqrt((b.x - a.x) *(b.x - a.x) + (b.y - a.y) * (b.y - a.y));
    },
    getAngle : function(a,b){
        var tx = b.x - a.x,
            ty = b.y - a.y,
            rad = Math.atan2(ty,tx),
            angle = rad/Math.PI * 180;

        return angle;
    },
    getRad : function(a,b){
        var tx = b.x - a.x,
            ty = b.y - a.y,
            rad = Math.atan2(ty,tx);

        return rad;
    },
    colCheck : function(shapeA, shapeB) {
        // get the vectors to check against
        var vX = (shapeA.pos.x + (shapeA.width / 2)) - (shapeB.pos.x + (shapeB.width / 2)),
            vY = (shapeA.pos.y + (shapeA.height / 2)) - (shapeB.pos.y + (shapeB.height / 2)),
            // add the half widths and half heights of the objects
            hWidths = (shapeA.width / 2) + (shapeB.width / 2),
            hHeights = (shapeA.height / 2) + (shapeB.height / 2),
            collision = false,
            offset = {x : 0, y : 0};

        if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
            var oX = hWidths - Math.abs(vX),
                oY = hHeights - Math.abs(vY);

            if (oX >= oY) {
                if (vY > 0) {
                    //top
                    offset.y += oY;
                } else {
                    //bottom
                    offset.y -= oY;
                }
            } else {
                if (vX > 0) {
                    //left
                    offset.x += oX;
                } else {
                    //right
                    offset.x -= oX;
                }
            }
        }

        if(offset.x !== 0 || offset.y !== 0){
            collision = true;
        }

        return {collision : collision, offset : offset};
    },
    mouse : function(ev){
        if(ev.pageX || ev.pageY){
            return {x:ev.pageX, y:ev.pageY};
        }
        return {
            x:ev.clientX + document.body.scrollLeft - document.body.clientLeft,
            y:ev.clientY + document.body.scrollTop  - document.body.clientTop
        };
    },
    getGradColor : function(startColor, endColor, height, width){
        var scale = -(width-height)/6,
            r = startColor.r + scale*(endColor.r - startColor.r);
            b = startColor.b + scale*(endColor.b - startColor.b);
            g = startColor.g + scale*(endColor.g - startColor.g);

        return "rgb(" +  Math.floor( Math.min(255,  Math.max(0, r))) + "," +  Math.floor( Math.min(255,  Math.max(0, g))) + "," +  Math.floor( Math.min(255,  Math.max(0, b))) + ")";
    },
    preCalcRotation : function(resource, numRotations, frameWidth, frameHeight, offsetAngle, debug){
        if(resource.nodeType === 1){
            var img = resource;
            resource = {};
            resource.source = img;
        }

        var tempCanvas = document.createElement("canvas"),
            tempCtx = tempCanvas.getContext("2d"),
            frameCanvas = document.createElement("canvas"),
            frameCtx = frameCanvas.getContext("2d"),
            frames =  resource.source.width/frameWidth,
            angleIncrement = 360/numRotations;
            startAngle = 0;

        if(offsetAngle){
            startAngle = offsetAngle;
        }

        tempCanvas.width = resource.source.width;
        tempCanvas.height = Math.ceil(frameHeight * 360/angleIncrement);
        frameCanvas.width = frameWidth;
        frameCanvas.height = frameHeight;

        // goes through each frame and rotates it adding it vertically
        for(var y = 0; y < numRotations; y++){
            for(var x = 0; x < frames; x++){
                frameCtx.clearRect(0,0,frameWidth,frameHeight);
                frameCtx.save();
                frameCtx.translate(frameCanvas.width/2, frameCanvas.height/2);
                frameCtx.rotate((startAngle + angleIncrement*y)*Math.PI/180);
                frameCtx.drawImage(resource.source,x*frameWidth,0,frameWidth,frameHeight,-frameWidth/2,-frameHeight/2,frameWidth,frameHeight);
                frameCtx.restore();
                tempCtx.drawImage(frameCanvas,0,0,frameWidth,frameHeight,x*frameWidth,y*frameHeight,frameWidth,frameHeight);
            }
        }

        /* Debug */

        if(debug){
            var imageRes = new Image();
            imageRes.onload = function(){
                document.body.appendChild(this);
            };
            imageRes.src = tempCanvas.toDataURL();
        }

        resource.source = tempCanvas;
        return tempCanvas;
    },
    colorize : function(resource, hsv){
        var tempCanvas = document.createElement("canvas"),
            tempCtx = tempCanvas.getContext("2d");

            tempCanvas.width = resource.source.width;
            tempCanvas.height = resource.source.height;
            tempCtx.drawImage(resource.source, 0 , 0);

        var imgd = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height),
            pix = imgd.data,
            h = hsv.h,
            s = hsv.s,
            v = hsv.v;

        for (var i = 0, n = pix.length; i <n; i += 4) {
            var hsv = this.rgbhsv({r : pix[i], g:pix[i + 1], b:pix[i + 2]});

            hsv.h+=h;
            if(hsv.h < 0){
                hsv.h = 0
            }else if(hsv.h > 360){
                hsv.h = 360;
            }
            hsv.s+=s;
            hsv.v+=v;

            var newColor = this.hsvrgb(hsv);

            pix[i] = newColor.r;
            pix[i+1] = newColor.g;
            pix[i+2] = newColor.b;
        }

        tempCtx.putImageData(imgd, 0, 0);
        //document.body.appendChild(tempCanvas);
        return tempCanvas.toDataURL();
    },
    rgbhsv : function(color){
        var r = color.r,
            g = color.g,
            b = color.b,
            maxColor = Math.max(r,g,b),
            minColor = Math.min(r,g,b),
            h = 0,
            s = 0,
            v = 0;

            if(maxColor == minColor){
                h = 0;
            }else if(maxColor == r){
                h = 60.0 * ((g - b) / (maxColor - minColor)) % 360.0;
            }else if(maxColor == g){
                h = 60.0 * ((b - r) / (maxColor - minColor)) + 120.0;
            }else if(maxColor == b){
                h = 60.0 * ((r - g) / (maxColor - minColor)) + 240.0;
            }

            v = maxColor;
            if(maxColor == 0.0){
                s = 0.0;
            }else{
                s = 1.0 - (minColor / maxColor);
            }

            return {h : h, s : s, v :v};
    },
    hsvrgb : function(hsv){
        var h = hsv.h,
            s = hsv.s,
            v = hsv.v,
            color = {r:0,g:0,b:0},
            hi = Math.floor(h/60.0)%6,
            f =  (h / 60.0) - Math.floor(h / 60.0),
            p = v * (1.0 - s),
            q = v * (1.0 - (f*s)),
            t = v * (1.0 - ((1.0 - f) * s));

        switch(hi){
            case 0:
                color.r =v;
                color.g = t;
                color.b = p;
                break;
            case 1:
                color.r =q;
                color.g = v;
                color.b = p;
                break;
            case 2:
                color.r = p;
                color.g = v;
                color.b = t;
                break;
            case 3:
                color.r = p;
                color.g = q;
                color.b = v;
                break;
            case 4:
                color.r = t;
                color.g = p;
                color.b = v;
                break;
            case 5:
                color.r = v;
                color.g = p;
                color.b = q;
                break;
        }

        return color;
    }
}