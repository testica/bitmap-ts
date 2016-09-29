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
            if (index[0] < halfw) {
                var center = new RGB();
                var location_2 = index[1] * width * 4 + index[0] * 4;
                center.r = image[location_2];
                center.g = image[location_2 + 1];
                center.b = image[location_2 + 2];
                matrix[halfh * this.kernel.width + halfw] = center;
                for (var i = 1; i <= halfw; i++) {
                    var neighbor = new RGB();
                    var location_3 = index[1] * width * 4 + (index[0] + i) * 4;
                    neighbor.r = image[location_3];
                    neighbor.g = image[location_3 + 1];
                    neighbor.b = image[location_3 + 2];
                    matrix[halfh * this.kernel.width + (halfw + i)] = neighbor;
                    neighbor = new RGB();
                    if (index[0] - i < 0) {
                        neighbor.r = 0;
                        neighbor.g = 0;
                        neighbor.b = 0;
                    }
                    else {
                        var l = index[1] * width * 4 + (index[0] - i) * 4;
                        neighbor.r = image[l];
                        neighbor.g = image[l + 1];
                        neighbor.b = image[l + 2];
                    }
                    matrix[halfh * this.kernel.width + (halfw - i)] = neighbor;
                }
            }
            else if (index[0] + halfw >= width) {
                var center = new RGB();
                var location_4 = index[1] * width * 4 + index[0] * 4;
                center.r = image[location_4];
                center.g = image[location_4 + 1];
                center.b = image[location_4 + 2];
                matrix[halfh * this.kernel.width + halfw] = center;
                for (var i = 1; i <= halfw; i++) {
                    var neighbor = new RGB();
                    var location_5 = index[1] * width * 4 + (index[0] - i) * 4;
                    neighbor.r = image[location_5];
                    neighbor.g = image[location_5 + 1];
                    neighbor.b = image[location_5 + 2];
                    matrix[halfh * this.kernel.width + (halfw - i)] = neighbor;
                    neighbor = new RGB();
                    if (index[0] + i >= width) {
                        neighbor.r = 0;
                        neighbor.g = 0;
                        neighbor.b = 0;
                    }
                    else {
                        var l = index[1] * width * 4 + (index[0] + i) * 4;
                        neighbor.r = image[l];
                        neighbor.g = image[l + 1];
                        neighbor.b = image[l + 2];
                    }
                    matrix[halfh * this.kernel.width + (halfw + i)] = neighbor;
                }
            }
            else {
                var center = new RGB();
                var location_6 = index[1] * width * 4 + index[0] * 4;
                center.r = image[location_6];
                center.g = image[location_6 + 1];
                center.b = image[location_6 + 2];
                matrix[halfh * this.kernel.width + halfw] = center;
                for (var i = 1; i <= halfw; i++) {
                    var neighbor = new RGB();
                    var location_right = index[1] * width * 4 + (index[0] + i) * 4;
                    var location_left = index[1] * width * 4 + (index[0] - i) * 4;
                    neighbor.r = image[location_right];
                    neighbor.g = image[location_right + 1];
                    neighbor.b = image[location_right + 2];
                    matrix[halfh * this.kernel.width + (halfw + i)] = neighbor;
                    neighbor = new RGB();
                    neighbor.r = image[location_left];
                    neighbor.g = image[location_left + 1];
                    neighbor.b = image[location_left + 2];
                    matrix[halfh * this.kernel.width + (halfw - i)] = neighbor;
                }
            }
            if (index[1] < halfh) {
                var center = new RGB();
                var location_7 = index[1] * width * 4 + index[0] * 4;
                center.r = image[location_7];
                center.g = image[location_7 + 1];
                center.b = image[location_7 + 2];
                matrix[halfh * this.kernel.width + halfw] = center;
                for (var i = 1; i <= halfh; i++) {
                    var neighbor = new RGB();
                    var location_8 = (index[1] + i) * width * 4 + index[0] * 4;
                    neighbor.r = image[location_8];
                    neighbor.g = image[location_8 + 1];
                    neighbor.b = image[location_8 + 2];
                    matrix[(halfh + i) * this.kernel.width + halfw] = neighbor;
                    neighbor = new RGB();
                    if (index[1] - i < 0) {
                        neighbor.r = 0;
                        neighbor.g = 0;
                        neighbor.b = 0;
                    }
                    else {
                        var l = (index[1] - i) * width * 4 + index[0] * 4;
                        neighbor.r = image[l];
                        neighbor.g = image[l + 1];
                        neighbor.b = image[l + 2];
                    }
                    matrix[(halfh - i) * this.kernel.width + halfw] = neighbor;
                }
            }
            else if (index[1] + halfh >= height) {
                var center = new RGB();
                var location_9 = index[1] * width * 4 + index[0] * 4;
                center.r = image[location_9];
                center.g = image[location_9 + 1];
                center.b = image[location_9 + 2];
                matrix[halfh * this.kernel.width + halfw] = center;
                for (var i = 1; i <= halfh; i++) {
                    var neighbor = new RGB();
                    var location_10 = (index[1] - i) * width * 4 + index[0] * 4;
                    neighbor.r = image[location_10];
                    neighbor.g = image[location_10 + 1];
                    neighbor.b = image[location_10 + 2];
                    matrix[(halfh - i) * this.kernel.width + halfw] = neighbor;
                    neighbor = new RGB();
                    if (index[1] + i >= height) {
                        neighbor.r = 0;
                        neighbor.g = 0;
                        neighbor.b = 0;
                    }
                    else {
                        var l = (index[1] + i) * width * 4 + index[0] * 4;
                        neighbor.r = image[l];
                        neighbor.g = image[l + 1];
                        neighbor.b = image[l + 2];
                    }
                    matrix[(halfh + i) * this.kernel.width + halfw] = neighbor;
                }
            }
            else {
                var center = new RGB();
                var location_11 = index[1] * width * 4 + index[0] * 4;
                center.r = image[location_11];
                center.g = image[location_11 + 1];
                center.b = image[location_11 + 2];
                matrix[halfh * this.kernel.width + halfw] = center;
                for (var i = 1; i <= halfh; i++) {
                    var neighbor = new RGB();
                    var location_down = (index[1] + i) * width * 4 + index[0] * 4;
                    var location_up = (index[1] - i) * width * 4 + index[0] * 4;
                    neighbor.r = image[location_down];
                    neighbor.g = image[location_down + 1];
                    neighbor.b = image[location_down + 2];
                    matrix[(halfh + i) * this.kernel.width + halfw] = neighbor;
                    neighbor = new RGB();
                    neighbor.r = image[location_up];
                    neighbor.g = image[location_up + 1];
                    neighbor.b = image[location_up + 2];
                    matrix[(halfh - i) * this.kernel.width + halfw] = neighbor;
                }
            }
            for (var x = 1; x <= halfw; x++) {
                for (var y = 1; y <= halfh; y++) {
                    var neighbor = new Array(4);
                    var pixel = new RGB();
                    if (index[1] - y < 0 || index[0] - x < 0) {
                        neighbor[0] = new RGB();
                    }
                    else {
                        var location_12 = (index[1] - y) * width * 4 + (index[0] - x) * 4;
                        neighbor[0] = new RGB(image[location_12], image[location_12 + 1], image[location_12 + 2]);
                    }
                    matrix[(halfh - y) * this.kernel.width + (halfw - x)] = neighbor[0];
                    if (index[1] - y < 0 || index[0] + x >= width) {
                        neighbor[1] = new RGB();
                    }
                    else {
                        var location_13 = (index[1] - y) * width * 4 + (index[0] + x) * 4;
                        neighbor[1] = new RGB(image[location_13], image[location_13 + 1], image[location_13 + 2]);
                    }
                    matrix[(halfh - y) * this.kernel.width + (halfw + x)] = neighbor[1];
                    if (index[1] + y >= height || index[0] - x < 0) {
                        neighbor[2] = new RGB();
                    }
                    else {
                        var location_14 = (index[1] + y) * width * 4 + (index[0] - x) * 4;
                        neighbor[2] = new RGB(image[location_14], image[location_14 + 1], image[location_14 + 2]);
                    }
                    matrix[(halfh + y) * this.kernel.width + (halfw - x)] = neighbor[2];
                    if (index[1] + y >= height || index[0] + x >= width) {
                        neighbor[3] = new RGB();
                    }
                    else {
                        var location_15 = (index[1] + y) * width * 4 + (index[0] + x) * 4;
                        neighbor[3] = new RGB(image[location_15], image[location_15 + 1], image[location_15 + 2]);
                    }
                    matrix[(halfh + y) * this.kernel.width + (halfw + x)] = neighbor[3];
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
