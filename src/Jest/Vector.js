export default class Vector{
    constructor(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;

        let copy = function(v){
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
        },
        add = function(v){
            this.x += v.x;
            this.y += v.y;
            this.z += v.z;
        },
        sub = function(v){
            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;
        },
        cross = function(v){
            this.tx = this.x;
            this.ty = this.y;
            this.tz = this.z;

            this.x = this.ty * v.z - this.tz * v.y;
            this.y = this.tz * v.x - this.tx * v.z;
            this.z = this.tx * v.y - this.ty * v.x;
        },
        multiply = function(s){
            this.x *= s;
            this.y *= s;
            this.z *= s;
        },
        distanceTo = function(v){
            this.dx = this.x - v.x;
            this.dy = this.y - v.y;
            this.dz = this.z - v.z;

            return Math.sqrt(this.dx * this.dx + this.dy * this.dy + this.dz * this.dz);
        },
        distanceToSquared = function(v){
            this.dx = this.x - v.x;
            this.dy = this.y - v.y;
            this.dz = this.z - v.z;

            return this.dx * this.dx + this.dy * this.dy + this.dz * this.dz;
        },
        length = function(){
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        },
        lengthSq = function(){
            return this.x * this.x + this.y * this.y + this.z * this.z;
        },
        negate = function(){
            this.x = -this.x;
            this.y = -this.y;
            this.z = -this.z;
        },
        dot = function(v){
            return this.x * v.x + this.y * v.y + this.z * v.z;
        },
        clone = function(){
            return new Vector(this.x, this.y, this.z);
        },
        toString = function(){
            return '(' + this.x + ', ' + this.y + ', ' + this.z + ')';
        }
    }
    add(a, b){
        return new Vector( a.x + b.x, a.y + b.y, a.z + b.z );
    }
    sub(a, b){
        return new Vector( a.x - b.x, a.y - b.y, a.z - b.z );
    }
    negate(){
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
    }
    multiply(a, s){
        return new Vector( a.x * s, a.y * s, a.z * s );
    }
    cross(a, b){
        return new Vector( a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x );
    }
    dot(v){
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    distance(a, b){
        var dx = a.x - b.x,
            dy = a.y - b.y,
            dz = a.z - b.z;

        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    length(){
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    mulScale(a, b){
        return new Vector(this.x*b,this.y*b, this.z*b);
    }
    normalize(){
        if (this.length() > 0)
            this.ool = 1.0 / this.length();
        else
            this.ool = 0;

        this.x *= this.ool;
        this.y *= this.ool;
        this.z *= this.ool;
        return this;
    }
}
