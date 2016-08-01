define(["require", "exports", "./histogram", "./transform"], function (require, exports, histogram_1, transform_1) {
    "use strict";
    var RGBA = (function () {
        function RGBA() {
            this.r = this.g = this.b = this.a = 0;
        }
        return RGBA;
    }());
    var Bitmap = (function () {
        function Bitmap(file) {
            this._grayScale = false;
            this._rotateAngle = 0;
            this._histogram = new histogram_1.Histogram();
            this._bitmap = {};
            this._file = file;
            this._transform = new transform_1.Transform();
        }
        Bitmap.prototype.read = function (callback) {
            var _this = this;
            var reader = new FileReader();
            reader.onload = function (e) {
                var arrayBuffer = reader.result;
                _this.decodeHeader(arrayBuffer);
                _this.decodeHeaderInfo(arrayBuffer);
                _this.decodePalette(arrayBuffer);
                _this.decodeImageData(arrayBuffer);
                console.log(_this._bitmap);
                callback(_this);
            };
            reader.readAsArrayBuffer(this._file);
        };
        Bitmap.prototype.saveFile = function (callback) {
            this.encodeHeader();
            this.encodeInfoHeader();
            this.encodeImageData();
            callback(new Blob([this._dataView.buffer], { type: "application/octet-stream" }));
        };
        Bitmap.prototype.encodeHeader = function () {
            var bitsPerPixel = 24;
            var size = ((this._bitmap.current.height * this._bitmap.current.width) * (bitsPerPixel / 8));
            size += 54;
            var xlen = (this._bitmap.current.width * 3);
            var mode = xlen % 4;
            if (mode !== 0) {
                size += this._bitmap.current.height * (4 - mode);
            }
            this._dataView = new DataView(new ArrayBuffer(size));
            this._dataView.setInt16(0, this._bitmap.header.type, true);
            this._dataView.setInt32(2, size, true);
            this._dataView.setInt16(6, this._bitmap.header.reserved1, true);
            this._dataView.setInt16(8, this._bitmap.header.reserved2, true);
            this._dataView.setInt32(10, 54, true);
        };
        Bitmap.prototype.encodeInfoHeader = function () {
            var bitsPerPixel = 24;
            var size = ((this._bitmap.current.height * this._bitmap.current.width) * (bitsPerPixel / 8));
            var xlen = (this._bitmap.current.width * 3);
            var mode = xlen % 4;
            if (mode !== 0) {
                size += this._bitmap.current.height * (4 - mode);
            }
            var preOffset = 14;
            this._dataView.setInt32(preOffset + 0, 40, true);
            this._dataView.setInt32(preOffset + 4, this._bitmap.current.width, true);
            this._dataView.setInt32(preOffset + 8, this._bitmap.current.height, true);
            this._dataView.setInt16(preOffset + 12, this._bitmap.infoHeader.planes, true);
            this._dataView.setInt16(preOffset + 14, bitsPerPixel, true);
            this._dataView.setInt32(preOffset + 16, this._bitmap.infoHeader.compression, true);
            this._dataView.setInt32(preOffset + 20, size, true);
            this._dataView.setInt32(preOffset + 24, this._bitmap.infoHeader.horizontalRes, true);
            this._dataView.setInt32(preOffset + 28, this._bitmap.infoHeader.verticalRes, true);
            this._dataView.setInt16(preOffset + 32, 0, true);
            this._dataView.setInt16(preOffset + 36, 0, true);
        };
        Bitmap.prototype.encodeImageData = function () {
            this.enconde24bit();
        };
        Bitmap.prototype.enconde24bit = function () {
            var width = this._bitmap.current.width;
            var height = this._bitmap.current.height;
            var pos = 0;
            var xlen = (width * 3);
            var mode = xlen % 4;
            var location;
            var pad = 4 - mode;
            for (var y = height - 1; y >= 0; y--) {
                for (var x = 0; x < width; x++) {
                    var color = new RGBA();
                    color.r = this._bitmap.current.data[pos++];
                    color.g = this._bitmap.current.data[pos++];
                    color.b = this._bitmap.current.data[pos++];
                    pos++;
                    location = y * width * 3 + x * 3;
                    location += 54;
                    if (mode !== 0) {
                        location += (pad * y);
                    }
                    this._dataView.setInt8(location, color.b);
                    this._dataView.setInt8(location + 1, color.g);
                    this._dataView.setInt8(location + 2, color.r);
                }
            }
        };
        Bitmap.prototype.decodeHeader = function (buffer) {
            var header;
            header = new DataView(buffer, 0, 14);
            this._bitmap.header = {};
            this._bitmap.header.type = header.getUint16(0, true);
            if (this._bitmap.header.type.toString("16") !== "4d42") {
                throw ("Invalid type, should be BMP");
            }
            this._bitmap.header.size = header.getUint32(2, true);
            this._bitmap.header.reserved1 = header.getUint16(6, true);
            this._bitmap.header.reserved2 = header.getUint16(8, true);
            this._bitmap.header.offset = header.getUint32(10, true);
        };
        Bitmap.prototype.decodeHeaderInfo = function (buffer) {
            var infoHeader;
            infoHeader = new DataView(buffer, 14, 40);
            this._bitmap.infoHeader = {};
            this._bitmap.infoHeader.size = infoHeader.getUint32(0, true);
            this._bitmap.infoHeader.width = infoHeader.getUint32(4, true);
            this._bitmap.infoHeader.height = infoHeader.getUint32(8, true);
            this._bitmap.infoHeader.planes = infoHeader.getUint16(12, true);
            this._bitmap.infoHeader.bitsPerPixel = infoHeader.getUint16(14, true);
            this._bitmap.infoHeader.compression = infoHeader.getUint32(16, true);
            this._bitmap.infoHeader.imageSize = infoHeader.getUint32(20, true);
            this._bitmap.infoHeader.horizontalRes = infoHeader.getUint32(24, true);
            this._bitmap.infoHeader.verticalRes = infoHeader.getUint32(28, true);
            this._bitmap.infoHeader.numberColors = infoHeader.getUint32(32, true);
            this._bitmap.infoHeader.importantColors = infoHeader.getUint32(36, true);
        };
        Bitmap.prototype.decodePalette = function (buffer) {
            var colors = 0;
            if (this._bitmap.infoHeader.bitsPerPixel <= 8) {
                this._grayScale = true;
                if ((colors = this._bitmap.infoHeader.numberColors) === 0) {
                    colors = Math.pow(2, this._bitmap.infoHeader.bitsPerPixel);
                    this._bitmap.infoHeader.numberColors = colors;
                }
                var palette = new DataView(buffer, this._bitmap.infoHeader.size + 14, colors * 4);
                var offset = 0;
                this._bitmap.palette = [];
                for (var i = 0; i < colors; i++) {
                    var color = new RGBA();
                    color.b = palette.getUint8(offset++);
                    color.g = palette.getUint8(offset++);
                    color.r = palette.getUint8(offset++);
                    color.a = palette.getUint8(offset++);
                    if (this._grayScale)
                        this._grayScale = this.isGrayScale(color);
                    this._bitmap.palette.push(color);
                }
            }
        };
        Bitmap.prototype.decodeImageData = function (buffer) {
            this._bitmap.rowSize = Math.floor((this._bitmap.infoHeader.bitsPerPixel * this._bitmap.infoHeader.width + 31) / 32) * 4;
            this._bitmap.pixelArraySize = this._bitmap.rowSize * Math.abs(this._bitmap.infoHeader.height);
            this._bitmap.pixels = new Uint8Array(buffer, this._bitmap.header.offset);
            var data;
            switch (this._bitmap.infoHeader.bitsPerPixel) {
                case 1:
                    data = this.decodeBit1();
                    break;
                case 2:
                    data = this.decodeBit2();
                    break;
                case 4:
                    data = this.decodeBit4();
                    break;
                case 8:
                    data = this.decodeBit8();
                    break;
                case 16:
                    data = this.decodeBit16();
                    break;
                case 24:
                    data = this.decodeBit24();
                    break;
                default:
                    throw ("Not supported");
            }
            this._bitmap.current = {};
            this._bitmap.defaultData = new Uint8ClampedArray(data);
            this._bitmap.current.data = new Uint8ClampedArray(data);
            this._bitmap.current.width = this._bitmap.infoHeader.width;
            this._bitmap.current.height = this._bitmap.infoHeader.height;
        };
        Bitmap.prototype.decodeBit1 = function () {
            var width = this._bitmap.infoHeader.width;
            var height = this._bitmap.infoHeader.height;
            var bmpdata = this._bitmap.pixels;
            var data = new Uint8ClampedArray(width * height * 4);
            var palette = this._bitmap.palette;
            var pos = 0;
            var xlen = Math.ceil(width / 8);
            var mode = xlen % 4;
            for (var y = height - 1; y >= 0; y--) {
                for (var x = 0; x < xlen; x++) {
                    var b = bmpdata[pos++];
                    var location_1 = y * width * 4 + x * 8 * 4;
                    for (var i = 0; i < 8; i++) {
                        if (x * 8 + i < width) {
                            var rgb = palette[((b >> (7 - i)) & 0x1)];
                            data[location_1 + i * 4] = rgb.r;
                            data[location_1 + i * 4 + 1] = rgb.g;
                            data[location_1 + i * 4 + 2] = rgb.b;
                            data[location_1 + i * 4 + 3] = 0xFF;
                            this._histogram.fill(rgb.r, rgb.g, rgb.b);
                        }
                        else {
                            break;
                        }
                    }
                }
                if (mode !== 0) {
                    pos += (4 - mode);
                }
            }
            this._histogram.fillAvg();
            return data;
        };
        Bitmap.prototype.decodeBit2 = function () {
            var width = this._bitmap.infoHeader.width;
            var height = this._bitmap.infoHeader.height;
            var bmpdata = this._bitmap.pixels;
            var data = new Uint8ClampedArray(width * height * 4);
            var palette = this._bitmap.palette;
            var pos = 0;
            var xlen = Math.ceil(width / 4);
            var mode = xlen % 4;
            for (var y = height - 1; y >= 0; y--) {
                for (var x = 0; x < xlen; x++) {
                    var b = bmpdata[pos++];
                    var location_2 = y * width * 4 + x * 4 * 4;
                    for (var i = 0; i < 4; i++) {
                        if (x * 4 + i < width) {
                            var rgb = palette[((b >> (3 - i)) & 0x2)];
                            data[location_2 + i * 4] = rgb.r;
                            data[location_2 + i * 4 + 1] = rgb.g;
                            data[location_2 + i * 4 + 2] = rgb.b;
                            data[location_2 + i * 4 + 3] = 0xFF;
                            this._histogram.fill(rgb.r, rgb.g, rgb.b);
                        }
                        else {
                            break;
                        }
                    }
                }
                if (mode !== 0) {
                    pos += (4 - mode);
                }
            }
            this._histogram.fillAvg();
            return data;
        };
        Bitmap.prototype.decodeBit4 = function () {
            var width = this._bitmap.infoHeader.width;
            var height = this._bitmap.infoHeader.height;
            var bmpdata = this._bitmap.pixels;
            var data = new Uint8ClampedArray(width * height * 4);
            var palette = this._bitmap.palette;
            var pos = 0;
            var xlen = Math.ceil(width / 2);
            var mode = xlen % 4;
            for (var y = height - 1; y >= 0; y--) {
                for (var x = 0; x < xlen; x++) {
                    var b = bmpdata[pos++];
                    var location_3 = y * width * 4 + x * 2 * 4;
                    var before = b >> 4;
                    var after = b & 0x0F;
                    var rgb = palette[before];
                    data[location_3] = rgb.r;
                    data[location_3 + 1] = rgb.g;
                    data[location_3 + 2] = rgb.b;
                    data[location_3 + 3] = 0xFF;
                    this._histogram.fill(rgb.r, rgb.g, rgb.b);
                    if (x * 2 + 1 >= width)
                        break;
                    rgb = palette[after];
                    data[location_3 + 4] = rgb.r;
                    data[location_3 + 4 + 1] = rgb.g;
                    data[location_3 + 4 + 2] = rgb.b;
                    data[location_3 + 4 + 3] = 0xFF;
                    this._histogram.fill(rgb.r, rgb.g, rgb.b);
                }
                if (mode !== 0) {
                    pos += (4 - mode);
                }
            }
            this._histogram.fillAvg();
            return data;
        };
        Bitmap.prototype.decodeBit8 = function () {
            var width = this._bitmap.infoHeader.width;
            var height = this._bitmap.infoHeader.height;
            var bmpdata = this._bitmap.pixels;
            var data = new Uint8ClampedArray(width * height * 4);
            var pos = 0;
            var palette = this._bitmap.palette;
            var mode = width % 4;
            for (var y = height - 1; y >= 0; y--) {
                for (var x = 0; x < width; x++) {
                    var b = bmpdata[pos++];
                    var location_4 = y * width * 4 + x * 4;
                    if (b < palette.length) {
                        var rgb = palette[b];
                        data[location_4] = rgb.r;
                        data[location_4 + 1] = rgb.g;
                        data[location_4 + 2] = rgb.b;
                        data[location_4 + 3] = 0xFF;
                        this._histogram.fill(rgb.r, rgb.g, rgb.b);
                    }
                    else {
                        data[location_4] = 0xFF;
                        data[location_4 + 1] = 0xFF;
                        data[location_4 + 2] = 0xFF;
                        data[location_4 + 3] = 0xFF;
                        this._histogram.fill(255, 255, 255);
                    }
                }
                if (mode !== 0) {
                    pos += (4 - mode);
                }
            }
            this._histogram.fillAvg();
            return data;
        };
        Bitmap.prototype.decodeBit16 = function () {
            var width = this._bitmap.infoHeader.width;
            var height = this._bitmap.infoHeader.height;
            var bmpdata = this._bitmap.pixels;
            var data = new Uint8ClampedArray(width * height * 4);
            var pos = 0;
            var palette = this._bitmap.palette;
            var mode = width % 4;
            for (var y = height - 1; y >= 0; y--) {
                for (var x = 0; x < width; x++) {
                    var b = (bmpdata[pos++] << 8) | bmpdata[pos++];
                    var location_5 = y * width * 4 + x * 4;
                    if (b < palette.length) {
                        var rgb = palette[b];
                        data[location_5] = rgb.r;
                        data[location_5 + 1] = rgb.g;
                        data[location_5 + 2] = rgb.b;
                        data[location_5 + 3] = 0xFF;
                        this._histogram.fill(rgb.r, rgb.g, rgb.b);
                    }
                    else {
                        data[location_5] = 0xFF;
                        data[location_5 + 1] = 0xFF;
                        data[location_5 + 2] = 0xFF;
                        data[location_5 + 3] = 0xFF;
                        this._histogram.fill(255, 255, 255);
                    }
                }
                if (mode !== 0) {
                    pos += (4 - mode);
                }
            }
            this._histogram.fillAvg();
            return data;
        };
        Bitmap.prototype.decodeBit24 = function () {
            var width = this._bitmap.infoHeader.width;
            var height = this._bitmap.infoHeader.height;
            var bmpdata = this._bitmap.pixels;
            var data = new Uint8ClampedArray(width * height * 4);
            var pos = 0;
            for (var y = height - 1; y >= 0; y--) {
                for (var x = 0; x < width; x++) {
                    var color = new RGBA();
                    color.b = bmpdata[pos++];
                    color.g = bmpdata[pos++];
                    color.r = bmpdata[pos++];
                    var location_6 = y * width * 4 + x * 4;
                    data[location_6] = color.r;
                    data[location_6 + 1] = color.g;
                    data[location_6 + 2] = color.b;
                    data[location_6 + 3] = 0xFF;
                    this._histogram.fill(color.r, color.g, color.b);
                }
                pos += (width % 4);
            }
            this._histogram.fillAvg();
            return data;
        };
        Bitmap.prototype.currentData = function () {
            if (this.checkCurrentData()) {
                return this._bitmap.current.data;
            }
            else {
                throw ("Not current data");
            }
        };
        Bitmap.prototype.checkCurrentData = function () {
            return this._bitmap.current.data ? true : false;
        };
        Bitmap.prototype.negative = function () {
            this._histogram = new histogram_1.Histogram();
            for (var i = 0; i < (this._bitmap.current.data.length / 4); i++) {
                var pos = i * 4;
                this._bitmap.current.data[pos] = 255 - this._bitmap.current.data[pos];
                this._bitmap.current.data[pos + 1] = 255 - this._bitmap.current.data[pos + 1];
                this._bitmap.current.data[pos + 2] = 255 - this._bitmap.current.data[pos + 2];
            }
            this._histogram.fillAll(this._bitmap.current.data);
        };
        Bitmap.prototype.rotate90CW = function () {
            var data = this.currentData();
            var width = this._bitmap.current.width;
            var height = this._bitmap.current.height;
            var dataRotated = new Uint8ClampedArray(data.length);
            var i = 0;
            for (var x = 0; x < width; x++) {
                for (var y = height - 1; y >= 0; y--) {
                    var pos = width * y * 4 + (x * 4);
                    dataRotated[i] = data[pos];
                    dataRotated[i + 1] = data[pos + 1];
                    dataRotated[i + 2] = data[pos + 2];
                    dataRotated[i + 3] = data[pos + 3];
                    i = i + 4;
                }
            }
            this._bitmap.current.width = height;
            this._bitmap.current.height = width;
            this._bitmap.current.data = dataRotated;
        };
        Bitmap.prototype.rotate180 = function () {
            this.rotate90CW();
            this.rotate90CW();
        };
        Bitmap.prototype.rotate270CW = function () {
            this.rotate90CW();
            this.rotate90CW();
            this.rotate90CW();
        };
        Bitmap.prototype.rotate90CCW = function () {
            var data = this.currentData();
            var width = this._bitmap.current.width;
            var height = this._bitmap.current.height;
            var dataRotated = new Uint8ClampedArray(data.length);
            var i = 0;
            for (var x = width - 1; x >= 0; x--) {
                for (var y = 0; y < height; y++) {
                    var pos = width * y * 4 + (x * 4);
                    dataRotated[i] = data[pos];
                    dataRotated[i + 1] = data[pos + 1];
                    dataRotated[i + 2] = data[pos + 2];
                    dataRotated[i + 3] = data[pos + 3];
                    i = i + 4;
                }
            }
            this._bitmap.current.width = height;
            this._bitmap.current.height = width;
            this._bitmap.current.data = dataRotated;
        };
        Bitmap.prototype.rotate270CCW = function () {
            this.rotate90CCW();
            this.rotate90CCW();
            this.rotate90CCW();
        };
        Bitmap.prototype.verticalFlip = function () {
            var data = this.currentData();
            var width = this._bitmap.current.width;
            var height = this._bitmap.current.height;
            var dataFliped = new Uint8ClampedArray(data.length);
            var i = 0;
            for (var x = height - 1; x >= 0; x--) {
                for (var y = 0; y < width; y++) {
                    var pos = width * x * 4 + (y * 4);
                    dataFliped[i] = data[pos];
                    dataFliped[i + 1] = data[pos + 1];
                    dataFliped[i + 2] = data[pos + 2];
                    dataFliped[i + 3] = data[pos + 3];
                    i = i + 4;
                }
            }
            this._bitmap.current.data = dataFliped;
        };
        Bitmap.prototype.horizontalFlip = function () {
            var data = this.currentData();
            var width = this._bitmap.current.width;
            var height = this._bitmap.current.height;
            var dataFliped = new Uint8ClampedArray(data.length);
            var i = 0;
            for (var x = 0; x < height; x++) {
                for (var y = width - 1; y >= 0; y--) {
                    var pos = width * x * 4 + (y * 4);
                    dataFliped[i] = data[pos];
                    dataFliped[i + 1] = data[pos + 1];
                    dataFliped[i + 2] = data[pos + 2];
                    dataFliped[i + 3] = data[pos + 3];
                    i = i + 4;
                }
            }
            this._bitmap.current.data = dataFliped;
        };
        Bitmap.prototype.truncate = function (value) {
            if (value < 0)
                value = 0;
            if (value > 255)
                value = 255;
            return value;
        };
        Bitmap.prototype.rgb2gray = function () {
            this._grayScale = true;
            this._histogram = new histogram_1.Histogram();
            for (var i = 0; i < this._bitmap.current.data.length; i += 4) {
                var color = new RGBA();
                color.r = this._bitmap.current.data[i];
                color.g = this._bitmap.current.data[i + 1];
                color.b = this._bitmap.current.data[i + 2];
                var gray = 0.2989 * color.r + 0.5870 * color.g + 0.1140 * color.b;
                gray = Math.round(gray);
                this._bitmap.current.data[i] = gray;
                this._bitmap.current.data[i + 1] = gray;
                this._bitmap.current.data[i + 2] = gray;
            }
            this._histogram.fillAll(this._bitmap.current.data);
        };
        Bitmap.prototype.equalization = function () {
            if (!this._grayScale)
                this.rgb2gray();
            var output = [];
            var input = [];
            var totalPixels = this._bitmap.current.width * this._bitmap.current.height;
            input = this._histogram.histogram_avg;
            output[0] = 0;
            var acum = input[0];
            for (var i = 1; i < 255; i++) {
                output[i] = Math.floor((acum * 255) / totalPixels);
                acum += input[i];
            }
            output[255] = 255;
            this._histogram = new histogram_1.Histogram();
            for (var i = 0; i < this._bitmap.current.data.length; i += 4) {
                var gray = output[this._bitmap.current.data[i]];
                this._bitmap.current.data[i] = gray;
                this._bitmap.current.data[i + 1] = gray;
                this._bitmap.current.data[i + 2] = gray;
                this._histogram.fill(gray, gray, gray);
            }
            this._histogram.fillAvg();
        };
        Bitmap.prototype.brightness = function (value) {
            value = Math.floor(value);
            if (value > 255)
                value = 255;
            if (value < -255)
                value = -255;
            var data = new Uint8ClampedArray(this._bitmap.current.data);
            this._histogram = new histogram_1.Histogram();
            for (var i = 0; i < data.length; i += 4) {
                data[i] = this.truncate(data[i] + value);
                data[i + 1] = this.truncate(data[i + 1] + value);
                data[i + 2] = this.truncate(data[i + 2] + value);
            }
            this._histogram.fillAll(data);
            this._bitmap.current.data = data;
        };
        Bitmap.prototype.contrast = function (value) {
            value = Math.floor(value);
            if (value > 255)
                value = 255;
            if (value < -255)
                value = -255;
            var fc = (259 * (value + 255)) / (255 * (259 - value));
            var data = new Uint8ClampedArray(this._bitmap.current.data);
            this._histogram = new histogram_1.Histogram();
            for (var i = 0; i < data.length; i += 4) {
                data[i] = this.truncate(fc * (data[i] - 128) + 128);
                data[i + 1] = this.truncate(fc * (data[i + 1] - 128) + 128);
                data[i + 2] = this.truncate(fc * (data[i + 2] - 128) + 128);
            }
            this._histogram.fillAll(data);
            this._bitmap.current.data = data;
        };
        Bitmap.prototype.isGrayScale = function (color) {
            if ((color.r === color.g) && (color.r === color.b)) {
                return true;
            }
        };
        Bitmap.prototype.umbralization = function (minValue, maxValue) {
            if (!this._grayScale)
                this.rgb2gray();
            var data = new Uint8ClampedArray(this._bitmap.current.data);
            this._histogram = new histogram_1.Histogram();
            for (var i = 0; i < data.length; i += 4) {
                if (data[i] >= minValue && data[i] <= maxValue) {
                    data[i] = 255;
                    data[i + 1] = 255;
                    data[i + 2] = 255;
                }
                else {
                    data[i] = 0;
                    data[i + 1] = 0;
                    data[i + 2] = 0;
                }
            }
            this._histogram.fillAll(data);
            this._bitmap.current.data = data;
        };
        Bitmap.prototype.scale = function (owidth, oheight, algorithm) {
            if (algorithm === "neighbor")
                this._transform.setNeighbor();
            if (algorithm === "interpolation")
                this._transform.setInterpolation();
            this._bitmap.current.data = this._transform.scale(owidth, oheight, this._bitmap.current.data, this._bitmap.current.width, this._bitmap.current.height);
            this._bitmap.current.width = owidth;
            this._bitmap.current.height = oheight;
        };
        Bitmap.prototype.rotate = function (angle) {
            this._rotateAngle += angle;
            var iwidth = this._bitmap.infoHeader.width;
            var iheight = this._bitmap.infoHeader.height;
            var coseno = Math.cos(this._rotateAngle);
            var seno = Math.sin(this._rotateAngle);
            var x1, x2, x3, x4, y1, y2, y3, y4;
            x1 = 0;
            y1 = 0;
            x2 = Math.floor((iwidth - 1) * coseno);
            y2 = Math.floor(-(iwidth - 1) * seno);
            x3 = Math.floor((iheight - 1) * seno);
            y3 = Math.floor((iheight - 1) * coseno);
            x4 = Math.floor((iwidth - 1) * coseno + (iheight - 1) * seno);
            y4 = Math.floor(-(iwidth - 1) * seno + (iheight - 1) * coseno);
            var minX, maxX, minY, maxY, dx, dy;
            minX = Math.min(x1, x2, x3, x4);
            maxX = Math.max(x1, x2, x3, x4);
            minY = Math.min(y1, y2, y3, y4);
            maxY = Math.max(y1, y2, y3, y4);
            var owidth = maxX - minX + 1;
            var oheight = maxY - minY + 1;
            dx = minX;
            dy = minY;
            this._bitmap.current.data = this._transform.rotate(this._rotateAngle, owidth, oheight, dx, dy, this._bitmap.defaultData, this._bitmap.infoHeader.width, this._bitmap.infoHeader.height);
            this._bitmap.current.width = owidth;
            this._bitmap.current.height = oheight;
            console.log(this._bitmap.current);
        };
        Bitmap.prototype.drawProperties = function (properties) {
            properties[0].innerHTML = this._bitmap.infoHeader.width;
            properties[1].innerHTML = this._bitmap.infoHeader.height;
            properties[2].innerHTML = this._bitmap.infoHeader.bitsPerPixel;
            properties[3].innerHTML = (this._bitmap.header.size / (1024 * 1024));
        };
        Bitmap.prototype.drawHistogram = function (canvas_r, canvas_g, canvas_b, canvas_avg) {
            if (!this._grayScale) {
                canvas_avg.style.display = "none";
                canvas_r.style.display = "block";
                canvas_g.style.display = "block";
                canvas_b.style.display = "block";
                this._histogram.draw_r(canvas_r);
                this._histogram.draw_g(canvas_g);
                this._histogram.draw_b(canvas_b);
            }
            else {
                canvas_avg.style.display = "block";
                canvas_r.style.display = "none";
                canvas_g.style.display = "none";
                canvas_b.style.display = "none";
                this._histogram.draw_avg(canvas_avg);
            }
        };
        Bitmap.prototype.drawOnCanvas = function (canvas) {
            var width = this._bitmap.current.width;
            var height = this._bitmap.current.height;
            canvas.style.display = "block";
            canvas.height = height;
            canvas.width = width;
            if ((height / width) > 1)
                canvas.style.width = (30 / (height / width)).toString() + "%";
            else {
                canvas.style.width = "30%";
            }
            var ctx = canvas.getContext("2d");
            var imageData = ctx.createImageData(width, height);
            imageData.data.set(this._bitmap.current.data);
            ctx.clearRect(0, 0, width, height);
            ctx.putImageData(imageData, 0, 0);
        };
        Bitmap.prototype.drawOnCanvasWithZoom = function (canvas, zoom, algorithm) {
            var imageZoomed;
            if (algorithm === "neighbor")
                this._transform.setNeighbor();
            if (algorithm === "interpolation")
                this._transform.setInterpolation();
            imageZoomed = this._transform.scale(this._bitmap.current.width * zoom, this._bitmap.current.height * zoom, this._bitmap.current.data, this._bitmap.current.width, this._bitmap.current.height);
            var cropWidth = [0, 0];
            var cropHeight = [0, 0];
            cropWidth[0] = Math.floor(this._bitmap.current.width * zoom / 2) - Math.floor(this._bitmap.current.width / 2);
            cropWidth[1] = Math.floor(this._bitmap.current.width * zoom / 2) + Math.round(this._bitmap.current.width / 2);
            cropHeight[0] = Math.floor(this._bitmap.current.height * zoom / 2) - Math.floor(this._bitmap.current.height / 2);
            cropHeight[1] = Math.round(this._bitmap.current.height * zoom / 2) + Math.round(this._bitmap.current.height / 2);
            var pos = 0;
            var imageCropped = new Uint8ClampedArray(this._bitmap.current.width * this._bitmap.current.height * 4);
            for (var y = cropHeight[0]; y < cropHeight[1]; y++) {
                for (var x = cropWidth[0]; x < cropWidth[1]; x++) {
                    var location_7 = y * (this._bitmap.current.width * zoom) * 4 + x * 4;
                    imageCropped[pos++] = imageZoomed[location_7];
                    imageCropped[pos++] = imageZoomed[location_7 + 1];
                    imageCropped[pos++] = imageZoomed[location_7 + 2];
                    imageCropped[pos++] = 0xFF;
                }
            }
            var width = this._bitmap.current.width;
            var height = this._bitmap.current.height;
            canvas.style.display = "block";
            canvas.height = height;
            canvas.width = width;
            if ((height / width) > 1)
                canvas.style.width = (15 / (height / width)).toString() + "%";
            else {
                canvas.style.width = "15%";
            }
            var ctx = canvas.getContext("2d");
            var imageData = ctx.createImageData(width, height);
            imageData.data.set(imageCropped);
            ctx.clearRect(0, 0, width, height);
            ctx.putImageData(imageData, 0, 0);
        };
        return Bitmap;
    }());
    exports.Bitmap = Bitmap;
});
