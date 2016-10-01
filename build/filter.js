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
                for (var i = 0; i < this.kernel.width * this.kernel.height; i++) {
                    this.kernel.matrix[i] = normalize;
                }
                for (var y = 0; y < height; y++) {
                    for (var x = 0; x < width; x++) {
                        var location_1 = y * width * 4 + x * 4;
                        var neighbors = this.getNeighbors(image, width, height, [x, y]);
                        var total = new RGB();
                        for (var i = 0; i < this.kernel.width * this.kernel.height; i++) {
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
            else if (type === 1) {
                var pascal_row = [1];
                for (var i = 0; i < this.kernel.width - 1; i++) {
                    pascal_row.push(pascal_row[i] * ((this.kernel.width - 1) - i) / (i + 1));
                }
                var sum = pascal_row.reduce(function (a, b) { return a + b; }, 0);
                var normalize = 1 / (sum * sum);
                for (var col = 0; col < this.kernel.width; col++) {
                    for (var row = 0; row < this.kernel.width; row++) {
                        this.kernel.matrix[this.kernel.width * col + row] = (pascal_row[row] * pascal_row[col]) * normalize;
                    }
                }
                for (var y = 0; y < height; y++) {
                    for (var x = 0; x < width; x++) {
                        var location_2 = y * width * 4 + x * 4;
                        var neighbors = this.getNeighbors(image, width, height, [x, y]);
                        var total = new RGB();
                        for (var i = 0; i < this.kernel.width * this.kernel.height; i++) {
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
                        data[location_2] = total.r;
                        data[location_2 + 1] = total.g;
                        data[location_2 + 2] = total.b;
                        data[location_2 + 3] = 0xFF;
                    }
                }
            }
            return data;
        };
        Filter.prototype.edge = function (type, image, width, height) {
            var data = new Uint8ClampedArray(width * height * 4);
            if (type === 0) {
                var kernelx = new Array(9);
                kernelx = [-1, 0, 1, -1, 0, 1, -1, 0, 1];
                var kernely = new Array(9);
                kernely = [-1, -1, -1, 0, 0, 0, 1, 1, 1];
                for (var y = 0; y < height; y++) {
                    for (var x = 0; x < width; x++) {
                        var location_3 = y * width * 4 + x * 4;
                        var neighbors = this.getNeighbors(image, width, height, [x, y]);
                        var totalx = new RGB();
                        var totaly = new RGB();
                        for (var i = 0; i < this.kernel.width * this.kernel.height; i++) {
                            totalx.r += kernelx[i] * neighbors[i].r;
                            totalx.g += kernelx[i] * neighbors[i].g;
                            totalx.b += kernelx[i] * neighbors[i].b;
                            totaly.r += kernely[i] * neighbors[i].r;
                            totaly.g += kernely[i] * neighbors[i].g;
                            totaly.b += kernely[i] * neighbors[i].b;
                        }
                        var gradient = new RGB(Math.abs(totalx.r) + Math.abs(totaly.r), Math.abs(totalx.g) + Math.abs(totaly.g), Math.abs(totalx.b) + Math.abs(totaly.b));
                        gradient.r = this.truncate(gradient.r);
                        gradient.g = this.truncate(gradient.g);
                        gradient.b = this.truncate(gradient.b);
                        data[location_3] = gradient.r;
                        data[location_3 + 1] = gradient.g;
                        data[location_3 + 2] = gradient.b;
                        data[location_3 + 3] = 0xFF;
                    }
                }
            }
            else if (type === 1) {
                var kernelx = new Array(9);
                kernelx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
                var kernely = new Array(9);
                kernely = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
                for (var y = 0; y < height; y++) {
                    for (var x = 0; x < width; x++) {
                        var location_4 = y * width * 4 + x * 4;
                        var neighbors = this.getNeighbors(image, width, height, [x, y]);
                        var totalx = new RGB();
                        var totaly = new RGB();
                        for (var i = 0; i < this.kernel.width * this.kernel.height; i++) {
                            totalx.r += kernelx[i] * neighbors[i].r;
                            totalx.g += kernelx[i] * neighbors[i].g;
                            totalx.b += kernelx[i] * neighbors[i].b;
                            totaly.r += kernely[i] * neighbors[i].r;
                            totaly.g += kernely[i] * neighbors[i].g;
                            totaly.b += kernely[i] * neighbors[i].b;
                        }
                        var gradient = new RGB(Math.abs(totalx.r) + Math.abs(totaly.r), Math.abs(totalx.g) + Math.abs(totaly.g), Math.abs(totalx.b) + Math.abs(totaly.b));
                        gradient.r = this.truncate(gradient.r);
                        gradient.g = this.truncate(gradient.g);
                        gradient.b = this.truncate(gradient.b);
                        data[location_4] = gradient.r;
                        data[location_4 + 1] = gradient.g;
                        data[location_4 + 2] = gradient.b;
                        data[location_4 + 3] = 0xFF;
                    }
                }
            }
            return data;
        };
        Filter.prototype.truncate = function (value) {
            if (value < 0)
                value = 0;
            if (value > 255)
                value = 255;
            return value;
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
                        var location_5 = index[1] * width * 4 + index[0] * 4;
                        neighbor[0] = new RGB(image[location_5], image[location_5 + 1], image[location_5 + 2]);
                        matrix[halfh * this.kernel.width + halfw] = neighbor[0];
                    }
                    else {
                        if (index[1] - y < 0 || index[0] - x < 0) {
                            neighbor[0] = new RGB();
                        }
                        else {
                            var location_6 = (index[1] - y) * width * 4 + (index[0] - x) * 4;
                            neighbor[0] = new RGB(image[location_6], image[location_6 + 1], image[location_6 + 2]);
                        }
                        matrix[(halfh - y) * this.kernel.width + (halfw - x)] = neighbor[0];
                        if (index[1] - y < 0 || index[0] + x >= width) {
                            neighbor[1] = new RGB();
                        }
                        else {
                            var location_7 = (index[1] - y) * width * 4 + (index[0] + x) * 4;
                            neighbor[1] = new RGB(image[location_7], image[location_7 + 1], image[location_7 + 2]);
                        }
                        matrix[(halfh - y) * this.kernel.width + (halfw + x)] = neighbor[1];
                        if (index[1] + y >= height || index[0] - x < 0) {
                            neighbor[2] = new RGB();
                        }
                        else {
                            var location_8 = (index[1] + y) * width * 4 + (index[0] - x) * 4;
                            neighbor[2] = new RGB(image[location_8], image[location_8 + 1], image[location_8 + 2]);
                        }
                        matrix[(halfh + y) * this.kernel.width + (halfw - x)] = neighbor[2];
                        if (index[1] + y >= height || index[0] + x >= width) {
                            neighbor[3] = new RGB();
                        }
                        else {
                            var location_9 = (index[1] + y) * width * 4 + (index[0] + x) * 4;
                            neighbor[3] = new RGB(image[location_9], image[location_9 + 1], image[location_9 + 2]);
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
