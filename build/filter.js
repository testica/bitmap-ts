define(["require", "exports"], function (require, exports) {
    "use strict";
    var RGB = (function () {
        function RGB(r, g, b) {
            if (r || g || b) {
                this.r = r;
                this.g = g;
                this.b = b;
            }
            else {
                this.r = this.g = this.b = 0;
            }
        }
        return RGB;
    }());
    var Filter = (function () {
        function Filter() {
            this.kernel = {};
            this.setKernel(3, 3);
        }
        Filter.prototype.blur = function (type, image, width, height) {
            var data = new Uint8ClampedArray(width * height * 4);
            if (type === 0) {
                var normalize = 1 / (this.kernel.width * this.kernel.height);
                for (var y = 0; y < height; y++) {
                    for (var x = 0; x < width; x++) {
                        var location_1 = y * width * 4 + x * 4;
                        var neighbors = this.getNeighbors(image, width, height, [x, y]);
                        var total = new RGB();
                        for (var i = 0; i < this.kernel.width * this.kernel.height; i++) {
                            this.kernel.matrix[i] = normalize;
                            total.r += this.kernel.matrix[i] * neighbors[i].r;
                            total.g += this.kernel.matrix[i] * neighbors[i].g;
                            total.b += this.kernel.matrix[i] * neighbors[i].b;
                        }
                        if (total.r > 255)
                            total.r = 255;
                        if (total.g > 255)
                            total.g = 255;
                        if (total.b > 255)
                            total.b = 255;
                        if (total.r < 0)
                            total.r = 0;
                        if (total.g < 0)
                            total.g = 0;
                        if (total.b < 0)
                            total.b = 0;
                        data[location_1] = total.r;
                        data[location_1 + 1] = total.g;
                        data[location_1 + 2] = total.b;
                        data[location_1 + 3] = 0xFF;
                    }
                }
            }
            return data;
        };
        Filter.prototype.getNeighbors = function (image, width, height, index) {
            var matrix = new Array(this.kernel.width * this.kernel.height);
            var halfw = Math.floor(this.kernel.width / 2);
            var halfh = Math.floor(this.kernel.height / 2);
            for (var x = 0; x <= halfw; x++) {
                for (var y = 0; y <= halfh; y++) {
                    var neighbor = new Array(4);
                    var pixel = new RGB();
                    if (x === 0 && y === 0) {
                        var location_2 = index[1] * width * 4 + index[0] * 4;
                        neighbor[0] = new RGB(image[location_2], image[location_2 + 1], image[location_2 + 2]);
                        matrix[halfh * this.kernel.width + halfw] = neighbor[0];
                    }
                    else {
                        if (index[1] - y < 0 || index[0] - x < 0) {
                            neighbor[0] = new RGB();
                        }
                        else {
                            var location_3 = (index[1] - y) * width * 4 + (index[0] - x) * 4;
                            neighbor[0] = new RGB(image[location_3], image[location_3 + 1], image[location_3 + 2]);
                        }
                        matrix[(halfh - y) * this.kernel.width + (halfw - x)] = neighbor[0];
                        if (index[1] - y < 0 || index[0] + x >= width) {
                            neighbor[1] = new RGB();
                        }
                        else {
                            var location_4 = (index[1] - y) * width * 4 + (index[0] + x) * 4;
                            neighbor[1] = new RGB(image[location_4], image[location_4 + 1], image[location_4 + 2]);
                        }
                        matrix[(halfh - y) * this.kernel.width + (halfw + x)] = neighbor[1];
                        if (index[1] + y >= height || index[0] - x < 0) {
                            neighbor[2] = new RGB();
                        }
                        else {
                            var location_5 = (index[1] + y) * width * 4 + (index[0] - x) * 4;
                            neighbor[2] = new RGB(image[location_5], image[location_5 + 1], image[location_5 + 2]);
                        }
                        matrix[(halfh + y) * this.kernel.width + (halfw - x)] = neighbor[2];
                        if (index[1] + y >= height || index[0] + x >= width) {
                            neighbor[3] = new RGB();
                        }
                        else {
                            var location_6 = (index[1] + y) * width * 4 + (index[0] + x) * 4;
                            neighbor[3] = new RGB(image[location_6], image[location_6 + 1], image[location_6 + 2]);
                        }
                        matrix[(halfh + y) * this.kernel.width + (halfw + x)] = neighbor[3];
                    }
                }
            }
            return matrix;
        };
        Filter.prototype.setKernel = function (width, height, customKernel) {
            if (customKernel) {
            }
            else {
                this.kernel.height = height;
                this.kernel.width = width;
                this.kernel.matrix = new Array(height * width);
            }
        };
        return Filter;
    }());
    exports.Filter = Filter;
});
