export default {
    getRandomRange(_min, _max) {
        return Math.floor(Math.random() * (_max - _min + 1)) + _min;
    },
    fGetRandomRange(_min, _max) {
        return Math.random() * (_max - _min) + _min;
    },
    getDistance(a, b) {
        return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
    },
    getAngle(a, b) {
        const tx = b.x - a.x;
        const ty = b.y - a.y;
        const rad = Math.atan2(ty, tx);
        const angle = (rad / Math.PI) * 180;

        return angle;
    },
    getRad(a, b) {
        const tx = b.x - a.x;
        const ty = b.y - a.y;
        const rad = Math.atan2(ty, tx);

        return rad;
    },
    colCheck(shapeA, shapeB) {
        // get the vectors to check against
        const vX =
            shapeA.pos.x + shapeA.width / 2 - (shapeB.pos.x + shapeB.width / 2);
        const vY =
            shapeA.pos.y +
            shapeA.height / 2 -
            (shapeB.pos.y + shapeB.height / 2);
        // add the half widths and half heights of the objects
        const hWidths = shapeA.width / 2 + shapeB.width / 2;
        const hHeights = shapeA.height / 2 + shapeB.height / 2;
        let collision = false;
        const offset = { x: 0, y: 0 };

        if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
            const oX = hWidths - Math.abs(vX);
            const oY = hHeights - Math.abs(vY);

            if (oX >= oY) {
                if (vY > 0) {
                    // top
                    offset.y += oY;
                } else {
                    // bottom
                    offset.y -= oY;
                }
            } else if (vX > 0) {
                // left
                offset.x += oX;
            } else {
                // right
                offset.x -= oX;
            }
        }

        if (offset.x !== 0 || offset.y !== 0) {
            collision = true;
        }

        return { collision, offset };
    },
    mouse(ev) {
        if (ev.pageX || ev.pageY) {
            return { x: ev.pageX, y: ev.pageY };
        }
        return {
            x: ev.clientX + document.body.scrollLeft - document.body.clientLeft,
            y: ev.clientY + document.body.scrollTop - document.body.clientTop
        };
    },
    getGradColor(startColor, endColor, height, width) {
        const scale = -(width - height) / 6;
        const r = startColor.r + scale * (endColor.r - startColor.r);
        const b = startColor.b + scale * (endColor.b - startColor.b);
        const g = startColor.g + scale * (endColor.g - startColor.g);

        return `rgb(${Math.floor(Math.min(255, Math.max(0, r)))},${Math.floor(
            Math.min(255, Math.max(0, g))
        )},${Math.floor(Math.min(255, Math.max(0, b)))})`;
    },
    preCalcRotation(
        resource,
        numRotations,
        frameWidth,
        frameHeight,
        offsetAngle,
        debug
    ) {
        if (resource.nodeType === 1) {
            const img = resource;
            resource.source = img;
        }

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        const frameCanvas = document.createElement('canvas');
        const frameCtx = frameCanvas.getContext('2d');
        const frames = resource.source.width / frameWidth;
        const angleIncrement = 360 / numRotations;
        let startAngle = 0;

        if (offsetAngle) {
            startAngle = offsetAngle;
        }

        tempCanvas.width = resource.source.width;
        tempCanvas.height = Math.ceil((frameHeight * 360) / angleIncrement);
        frameCanvas.width = frameWidth;
        frameCanvas.height = frameHeight;

        // goes through each frame and rotates it adding it vertically
        for (let y = 0; y < numRotations; y++) {
            for (let x = 0; x < frames; x++) {
                frameCtx.clearRect(0, 0, frameWidth, frameHeight);
                frameCtx.save();
                frameCtx.translate(
                    frameCanvas.width / 2,
                    frameCanvas.height / 2
                );
                frameCtx.rotate(
                    ((startAngle + angleIncrement * y) * Math.PI) / 180
                );
                frameCtx.drawImage(
                    resource.source,
                    x * frameWidth,
                    0,
                    frameWidth,
                    frameHeight,
                    -frameWidth / 2,
                    -frameHeight / 2,
                    frameWidth,
                    frameHeight
                );
                frameCtx.restore();
                tempCtx.drawImage(
                    frameCanvas,
                    0,
                    0,
                    frameWidth,
                    frameHeight,
                    x * frameWidth,
                    y * frameHeight,
                    frameWidth,
                    frameHeight
                );
            }
        }

        /* Debug */

        if (debug) {
            const imageRes = new Image();
            imageRes.onload = function onload() {
                document.body.appendChild(this);
            };
            imageRes.src = tempCanvas.toDataURL();
        }

        resource.source = tempCanvas;
        return tempCanvas;
    },
    colorize(resource, hsv) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        tempCanvas.width = resource.source.width;
        tempCanvas.height = resource.source.height;
        tempCtx.drawImage(resource.source, 0, 0);

        const imgd = tempCtx.getImageData(
            0,
            0,
            tempCanvas.width,
            tempCanvas.height
        );
        const pix = imgd.data;
        const { h, s, v } = hsv;

        for (let i = 0, n = pix.length; i < n; i += 4) {
            const colorHSV = this.rgbhsv({
                r: pix[i],
                g: pix[i + 1],
                b: pix[i + 2]
            });

            colorHSV.h += h;
            colorHSV.h = Math.min(360, Math.max(0, colorHSV.h));

            colorHSV.s += s;
            colorHSV.v += v;

            const newColor = this.hsvrgb(colorHSV);

            pix[i] = newColor.r;
            pix[i + 1] = newColor.g;
            pix[i + 2] = newColor.b;
        }

        tempCtx.putImageData(imgd, 0, 0);
        // document.body.appendChild(tempCanvas);
        return tempCanvas.toDataURL();
    },
    rgbhsv(color) {
        const { r } = color;
        const { g } = color;
        const { b } = color;
        const maxColor = Math.max(r, g, b);
        const minColor = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        let v = 0;

        if (maxColor === minColor) {
            h = 0;
        } else if (maxColor === r) {
            h = (60.0 * ((g - b) / (maxColor - minColor))) % 360.0;
        } else if (maxColor === g) {
            h = 60.0 * ((b - r) / (maxColor - minColor)) + 120.0;
        } else if (maxColor === b) {
            h = 60.0 * ((r - g) / (maxColor - minColor)) + 240.0;
        }

        v = maxColor;
        if (maxColor === 0.0) {
            s = 0.0;
        } else {
            s = 1.0 - minColor / maxColor;
        }

        return { h, s, v };
    },
    hsvrgb(hsv) {
        const { h } = hsv;
        const { s } = hsv;
        const { v } = hsv;
        const color = { r: 0, g: 0, b: 0 };
        const hi = Math.floor(h / 60.0) % 6;
        const f = h / 60.0 - Math.floor(h / 60.0);
        const p = v * (1.0 - s);
        const q = v * (1.0 - f * s);
        const t = v * (1.0 - (1.0 - f) * s);

        switch (hi) {
            case 0:
                color.r = v;
                color.g = t;
                color.b = p;
                break;
            case 1:
                color.r = q;
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
            default:
                color.r = v;
                color.g = t;
                color.b = p;
                break;
        }

        return color;
    }
};
