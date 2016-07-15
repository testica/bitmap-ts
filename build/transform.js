define(["require", "exports"], function (require, exports) {
    "use strict";
    var Algorithm;
    (function (Algorithm) {
        Algorithm[Algorithm["Neighbor"] = 0] = "Neighbor";
        Algorithm[Algorithm["Interpolation"] = 1] = "Interpolation";
    })(Algorithm || (Algorithm = {}));
    ;
    var Transform = (function () {
        function Transform() {
            this.algorithmType = Algorithm.Neighbor;
        }
        Transform.prototype.scale = function (owidth, oheight, currentData, iwidth, iheight) {
            var cx = owidth / iwidth;
            var cy = oheight / iheight;
            var data = new Uint8ClampedArray(owidth * oheight * 4);
            var pos = 0;
            for (var y = 0; y < oheight; y++) {
                for (var x = 0; x < owidth; x++) {
                    var olocation = y * owidth * 4 + x * 4;
                    var ix = this.neighbor(x / cx);
                    var iy = this.neighbor(y / cy);
                    var ilocation = iy * iwidth * 4 + ix * 4;
                    data[olocation] = currentData[ilocation];
                    data[olocation + 1] = currentData[ilocation + 1];
                    data[olocation + 2] = currentData[ilocation + 2];
                    data[olocation + 3] = 0xFF;
                }
            }
            return data;
        };
        Transform.prototype.neighbor = function (value) {
            return Math.floor(value + 0.5);
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
