/* eslint-disable no-unused-vars */
export default class Vector {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;

        const copy = function copy(v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
        };
        const add = function add(v) {
            this.x += v.x;
            this.y += v.y;
            this.z += v.z;
        };
        const sub = function sub(v) {
            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;
        };
        const cross = function cross(v) {
            this.tx = this.x;
            this.ty = this.y;
            this.tz = this.z;

            this.x = this.ty * v.z - this.tz * v.y;
            this.y = this.tz * v.x - this.tx * v.z;
            this.z = this.tx * v.y - this.ty * v.x;
        };
        const multiply = function multiply(s) {
            this.x *= s;
            this.y *= s;
            this.z *= s;
        };
        const distanceTo = function distanceTo(v) {
            this.dx = this.x - v.x;
            this.dy = this.y - v.y;
            this.dz = this.z - v.z;

            return Math.sqrt(
                this.dx * this.dx + this.dy * this.dy + this.dz * this.dz
            );
        };
        const distanceToSquared = function distanceToSquared(v) {
            this.dx = this.x - v.x;
            this.dy = this.y - v.y;
            this.dz = this.z - v.z;

            return this.dx * this.dx + this.dy * this.dy + this.dz * this.dz;
        };
        const length = function length() {
            return Math.sqrt(
                this.x * this.x + this.y * this.y + this.z * this.z
            );
        };
        const lengthSq = function lengthSq() {
            return this.x * this.x + this.y * this.y + this.z * this.z;
        };
        const negate = function negate() {
            this.x = -this.x;
            this.y = -this.y;
            this.z = -this.z;
        };
        const dot = function dot(v) {
            return this.x * v.x + this.y * v.y + this.z * v.z;
        };
        const clone = function clone() {
            return new Vector(this.x, this.y, this.z);
        };
        const toString = function toString() {
            return `(${this.x}, ${this.y}, ${this.z})`;
        };
    }

    static add(a, b) {
        return new Vector(a.x + b.x, a.y + b.y, a.z + b.z);
    }

    static sub(a, b) {
        return new Vector(a.x - b.x, a.y - b.y, a.z - b.z);
    }

    static negate() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
    }

    static multiply(a, s) {
        return new Vector(a.x * s, a.y * s, a.z * s);
    }

    static cross(a, b) {
        return new Vector(
            a.y * b.z - a.z * b.y,
            a.z * b.x - a.x * b.z,
            a.x * b.y - a.y * b.x
        );
    }

    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    static distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = a.z - b.z;

        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    mulScale(a, b) {
        return new Vector(this.x * b, this.y * b, this.z * b);
    }

    normalize() {
        if (this.length() > 0) {
            this.ool = 1.0 / this.length();
        } else {
            this.ool = 0;
        }

        this.x *= this.ool;
        this.y *= this.ool;
        this.z *= this.ool;
        return this;
    }
}
