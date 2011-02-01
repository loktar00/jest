var Vector = function(x, y){
    this.x = x;
    this.y = y;
}

Vector.prototype = {
    isub: function(other){
        this.x -= other.x;
        this.y -= other.y;
        return this;
    },
    sub: function(other){
        return new Vector(
            this.x - other.x,
            this.y - other.y
        );
    },
    iadd: function(other){
        this.x += other.x;
        this.y += other.y;
        return this;
    },
    add: function(other){
        return new Vector(
            this.x + other.x,
            this.y + other.y
        );
    },

    imul: function(scalar){
        this.x *= scalar;
        this.y *= scalar;
        return this;
    },
    mul: function(scalar){
        return new Vector(
            this.x * scalar,
            this.y * scalar
        )
    },
    dot: function(other){
        return new Vector(
            this.x * other.x,
            this.y * other.y
        )
    },
    idiv: function(scalar){
        this.x /= scalar;
        this.y /= scalar;
        return this;
    },
    div: function(scalar){
        return new Vector(
            this.x / scalar,
            this.y / scalar
        )
    },

    normalized: function(){
        var x=this.x, y=this.y;
        var length = Math.sqrt(x*x + y*y);
        if(length > 0){
            return new Vector(x/length, y/length);
        }
        else{
            return new Vector(0, 0);
        }
    },
    normalize: function(){
        var x=this.x, y=this.y;
        var length = Math.sqrt(x*x + y*y);
        if(length > 0){
            this.x = x/length;
            this.y = y/length;
        }
        return this;
    },

    length: function(){
        return Math.sqrt(this.x*this.x + this.y*this.y);
    },

    distance: function(other){
        var x = this.x - other.x;
        var y = this.y - other.y;
        return Math.sqrt(x*x + y*y);
    },

    copy: function(){
        return new Vector(this.x, this.y);
    },
    zero: function(){
        this.x = 0;
        this.y = 0;
    }
}