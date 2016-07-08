define(["require", "exports"], function (require, exports) {
    "use strict";
    var Histogram = (function () {
        function Histogram() {
            this._histogram_r = [];
            this._histogram_g = [];
            this._histogram_b = [];
            this._histogram_avg = [];
            for (var i = 0; i < 256; i++) {
                this._histogram_r[i] = 0;
                this._histogram_g[i] = 0;
                this._histogram_b[i] = 0;
                this._histogram_avg[i] = 0;
            }
        }
        Histogram.prototype.fillAll = function (imageData) {
            for (var i = 0; i < imageData.length; i += 4) {
                this._histogram_r[imageData[i]]++;
                this._histogram_g[imageData[i + 1]]++;
                this._histogram_b[imageData[i + 2]]++;
            }
            this.fillAvg();
        };
        Histogram.prototype.fillAvg = function () {
            for (var i = 0; i < 256; i++) {
                this._histogram_avg[i] = (this._histogram_r[i] + this._histogram_g[i] + this._histogram_b[i]) / 3;
                this._histogram_avg[i] = Math.floor(this._histogram_avg[i]);
            }
        };
        Histogram.prototype.fill = function (r, g, b) {
            this._histogram_r[r]++;
            this._histogram_g[g]++;
            this._histogram_b[b]++;
        };
        Histogram.prototype.draw_r = function (canvas) {
            var max = Math.max.apply(null, this._histogram_r);
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgb(255,0,0)";
            for (var i = 0; i < 256; i++) {
                var pct = (this._histogram_r[i] / max) * 100;
                ctx.fillRect(i, 100, 1, -Math.round(pct));
            }
        };
        Histogram.prototype.draw_g = function (canvas) {
            var max = Math.max.apply(null, this._histogram_g);
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgb(0,255,0)";
            for (var i = 0; i < 256; i++) {
                var pct = (this._histogram_g[i] / max) * 100;
                ctx.fillRect(i, 100, 1, -Math.round(pct));
            }
        };
        Object.defineProperty(Histogram.prototype, "histogram_avg", {
            get: function () { return this._histogram_avg; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(Histogram.prototype, "histogram_r", {
            get: function () { return this._histogram_r; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(Histogram.prototype, "histogram_g", {
            get: function () { return this._histogram_g; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(Histogram.prototype, "histogram_b", {
            get: function () { return this._histogram_b; },
            enumerable: true,
            configurable: true
        });
        ;
        Histogram.prototype.draw_b = function (canvas) {
            var max = Math.max.apply(null, this._histogram_b);
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgb(0,0,255)";
            for (var i = 0; i < 256; i++) {
                var pct = (this._histogram_b[i] / max) * 100;
                ctx.fillRect(i, 100, 1, -Math.round(pct));
            }
        };
        Histogram.prototype.draw_avg = function (canvas) {
            var rmax = Math.max.apply(null, this._histogram_r);
            var gmax = Math.max.apply(null, this._histogram_g);
            var bmax = Math.max.apply(null, this._histogram_b);
            var max = Math.max.apply(null, [rmax, gmax, bmax]);
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgb(0,0,0)";
            for (var i = 0; i < 256; i++) {
                var pct = (this._histogram_avg[i] / max) * 100;
                ctx.fillRect(i, 100, 1, -Math.round(pct));
            }
        };
        return Histogram;
    }());
    exports.Histogram = Histogram;
});
