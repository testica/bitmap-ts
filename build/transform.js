define(["require", "exports"], function (require, exports) {
    "use strict";
    var Algorithm;
    (function (Algorithm) {
        Algorithm[Algorithm["Neighbor"] = 0] = "Neighbor";
        Algorithm[Algorithm["Interpolation"] = 1] = "Interpolation";
    })(Algorithm || (Algorithm = {}));
    ;
    var RGBA = (function () {
        function RGBA() {
            this.r = this.g = this.b = this.a = 0;
        }
        return RGBA;
    }());
    var Transform = (function () {
        function Transform() {
            this.algorithmType = Algorithm.Neighbor;
        }
        Transform.prototype.scale = function (owidth, oheight, currentData, iwidth, iheight) {
            switch (this.algorithmType) {
                case Algorithm.Neighbor:
                    return this.scaleWithNearestNeighbor(owidth, oheight, currentData, iwidth, iheight);
                case Algorithm.Interpolation:
                    return this.scaleWithInterpolation(owidth, oheight, currentData, iwidth, iheight);
            }
        };
        Transform.prototype.scaleWithNearestNeighbor = function (owidth, oheight, currentData, iwidth, iheight) {
            var cx = owidth / iwidth;
            var cy = oheight / iheight;
            var data = new Uint8ClampedArray(owidth * oheight * 4);
            for (var y = 0; y < oheight; y++) {
                for (var x = 0; x < owidth; x++) {
                    var olocation = y * owidth * 4 + x * 4;
                    var ix = this.neighbor(x / cx, iwidth - 1);
                    var iy = this.neighbor(y / cy, iheight - 1);
                    var ilocation = iy * iwidth * 4 + ix * 4;
                    data[olocation] = currentData[ilocation];
                    data[olocation + 1] = currentData[ilocation + 1];
                    data[olocation + 2] = currentData[ilocation + 2];
                    data[olocation + 3] = 0xFF;
                }
            }
            return data;
        };
        Transform.prototype.scaleWithInterpolation = function (owidth, oheight, currentData, iwidth, iheight) {
            var cx = owidth / iwidth;
            var cy = oheight / iheight;
            var data = new Uint8ClampedArray(owidth * oheight * 4);
            var ilocation;
            var x1, x2, y1, y2;
            for (var y = 0; y < oheight; y++) {
                for (var x = 0; x < owidth; x++) {
                    var olocation = y * owidth * 4 + x * 4;
                    var ix = (x / cx);
                    var iy = (y / cy);
                    var neighbor = this.neighbor2x2([ix, iy], iwidth - 1, iheight - 1);
                    x2 = neighbor[1][0];
                    x1 = neighbor[0][0];
                    y2 = neighbor[2][1];
                    y1 = neighbor[0][1];
                    var fixed = (1 / ((x2 - x1) * (y2 - y1)));
                    var neighborColors = [new RGBA(), new RGBA(), new RGBA(), new RGBA()];
                    for (var n = 0; n < 4; n++) {
                        ilocation = neighbor[n][1] * iwidth * 4 + neighbor[n][0] * 4;
                        neighborColors[n].r = currentData[ilocation];
                        neighborColors[n].g = currentData[ilocation + 1];
                        neighborColors[n].b = currentData[ilocation + 2];
                    }
                    var finalPixel = new RGBA();
                    finalPixel.r = fixed * ((neighborColors[0].r * (x2 - ix) * (y2 - iy)) +
                        (neighborColors[1].r * (ix - x1) * (y2 - iy)) +
                        (neighborColors[2].r * (x2 - ix) * (iy - y1)) +
                        (neighborColors[3].r * (ix - x1) * (iy - y1)));
                    finalPixel.g = fixed * ((neighborColors[0].g * (x2 - ix) * (y2 - iy)) +
                        (neighborColors[1].g * (ix - x1) * (y2 - iy)) +
                        (neighborColors[2].g * (x2 - ix) * (iy - y1)) +
                        (neighborColors[3].g * (ix - x1) * (iy - y1)));
                    finalPixel.b = fixed * ((neighborColors[0].b * (x2 - ix) * (y2 - iy)) +
                        (neighborColors[1].b * (ix - x1) * (y2 - iy)) +
                        (neighborColors[2].b * (x2 - ix) * (iy - y1)) +
                        (neighborColors[3].b * (ix - x1) * (iy - y1)));
                    data[olocation] = Math.floor(finalPixel.r);
                    data[olocation + 1] = Math.floor(finalPixel.g);
                    data[olocation + 2] = Math.floor(finalPixel.b);
                    data[olocation + 3] = 0xFF;
                }
            }
            return data;
        };
        Transform.prototype.rotate = function (angle, owidth, oheight, dx, dy, currentData, iwidth, iheight) {
            var data = new Uint8ClampedArray(owidth * oheight * 4);
            var ilocation;
            var coseno = Math.cos(-angle);
            var seno = Math.sin(-angle);
            var x1, x2, y1, y2;
            for (var y = 0; y < oheight; y++) {
                for (var x = 0; x < owidth; x++) {
                    var olocation = y * owidth * 4 + x * 4;
                    var ix = (x + dx) * coseno + (y + dy) * seno + 1e-5;
                    var iy = -(x + dx) * seno + (y + dy) * coseno + 1e-5;
                    if (ix >= 0 && ix <= iwidth && iy >= 0 && iy <= iheight) {
                        var neighbor = this.neighbor2x2([ix, iy], iwidth - 1, iheight - 1);
                        x2 = neighbor[1][0];
                        x1 = neighbor[0][0];
                        y2 = neighbor[2][1];
                        y1 = neighbor[0][1];
                        var fixed = (1 / ((x2 - x1) * (y2 - y1)));
                        var neighborColors = [new RGBA(), new RGBA(), new RGBA(), new RGBA()];
                        for (var n = 0; n < 4; n++) {
                            ilocation = neighbor[n][1] * iwidth * 4 + neighbor[n][0] * 4;
                            neighborColors[n].r = currentData[ilocation];
                            neighborColors[n].g = currentData[ilocation + 1];
                            neighborColors[n].b = currentData[ilocation + 2];
                        }
                        var finalPixel = new RGBA();
                        finalPixel.r = fixed * ((neighborColors[0].r * (x2 - ix) * (y2 - iy)) +
                            (neighborColors[1].r * (ix - x1) * (y2 - iy)) +
                            (neighborColors[2].r * (x2 - ix) * (iy - y1)) +
                            (neighborColors[3].r * (ix - x1) * (iy - y1)));
                        finalPixel.g = fixed * ((neighborColors[0].g * (x2 - ix) * (y2 - iy)) +
                            (neighborColors[1].g * (ix - x1) * (y2 - iy)) +
                            (neighborColors[2].g * (x2 - ix) * (iy - y1)) +
                            (neighborColors[3].g * (ix - x1) * (iy - y1)));
                        finalPixel.b = fixed * ((neighborColors[0].b * (x2 - ix) * (y2 - iy)) +
                            (neighborColors[1].b * (ix - x1) * (y2 - iy)) +
                            (neighborColors[2].b * (x2 - ix) * (iy - y1)) +
                            (neighborColors[3].b * (ix - x1) * (iy - y1)));
                        data[olocation] = Math.floor(finalPixel.r);
                        data[olocation + 1] = Math.floor(finalPixel.g);
                        data[olocation + 2] = Math.floor(finalPixel.b);
                        data[olocation + 3] = 0xFF;
                    }
                    else {
                        data[olocation] = 0x00;
                        data[olocation + 1] = 0x00;
                        data[olocation + 2] = 0x00;
                        data[olocation + 3] = 0xFF;
                    }
                }
            }
            return data;
        };
        Transform.prototype.neighbor = function (value, max) {
            if (Math.floor(value) === max) {
                return max;
            }
            return Math.floor(value + 0.5);
        };
        Transform.prototype.neighbor2x2 = function (value, xmax, ymax) {
            var upleft = [Math.floor(value[0]), Math.floor(value[1])];
            var upright = [Math.floor(value[0]) + 1, Math.floor(value[1])];
            var downleft = [Math.floor(value[0]), Math.floor(value[1]) + 1];
            var downright = [Math.floor(value[0]) + 1, Math.floor(value[1]) + 1];
            if (Math.floor(value[1]) === 0) {
                upleft[1] = 0;
                upright[1] = 0;
                downleft[1] = 1;
                downright[1] = 1;
            }
            else if (Math.floor(value[1]) === ymax) {
                upleft[1] = ymax - 1;
                upright[1] = ymax - 1;
                downleft[1] = ymax;
                downright[1] = ymax;
            }
            if (Math.floor(value[0]) === 0) {
                upleft[0] = 0;
                upright[0] = 1;
                downleft[0] = 0;
                downright[0] = 1;
            }
            else if (Math.floor(value[0]) === xmax) {
                upleft[0] = xmax - 1;
                upright[0] = xmax;
                downleft[0] = xmax - 1;
                downright[0] = xmax;
            }
            return new Array(upleft, upright, downleft, downright);
        };
        Transform.prototype.setNeighbor = function () {
            this.algorithmType = Algorithm.Neighbor;
        };
        Transform.prototype.setInterpolation = function () {
            this.algorithmType = Algorithm.Interpolation;
        };
        return Transform;
    }());
    exports.Transform = Transform;
});
