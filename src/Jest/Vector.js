export default class Vector {
    constructor(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    cross(v) {
        const tx = this.x;
        const ty = this.y;
        const tz = this.z;

        this.x = ty * v.z - tz * v.y;
        this.y = tz * v.x - tx * v.z;
        this.z = tx * v.y - ty * v.x;
        return this;
    }

    multiply(s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    }

    distanceTo(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;

        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    distanceToSquared(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;

        return dx * dx + dy * dy + dz * dz;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    negate() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    }

    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    clone() {
        return new Vector(this.x, this.y, this.z);
    }

    toString() {
        return `(${this.x}, ${this.y}, ${this.z})`;
    }

    mulScale(a, b) {
        return new Vector(this.x * b, this.y * b, this.z * b);
    }

    normalize() {
        const len = this.length();
        if (len > 0) {
            const invLen = 1.0 / len;
            this.x *= invLen;
            this.y *= invLen;
            this.z *= invLen;
        }
        return this;
    }

    static add(a, b) {
        return new Vector(a.x + b.x, a.y + b.y, a.z + b.z);
    }

    static sub(a, b) {
        return new Vector(a.x - b.x, a.y - b.y, a.z - b.z);
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

    static distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = a.z - b.z;

        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    static negate(v) {
        return new Vector(-v.x, -v.y, -v.z);
    }
}
