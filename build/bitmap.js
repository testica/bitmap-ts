define(["require", "exports"], function (require, exports) {
    "use strict";
    var RGBA = (function () {
        function RGBA() {
            this.r = this.g = this.b = this.a = 0;
        }
        return RGBA;
    }());
    var Bitmap = (function () {
        function Bitmap(file) {
            this._bitmap = {};
            this._file = file;
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
                callback(_this);
            };
            reader.readAsArrayBuffer(this._file);
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
                case 24:
                    data = this.decodeBit24();
                    break;
                default:
                    throw ("Not supported");
            }
            this._bitmap.current = {};
            this._bitmap.defaultData = this._bitmap.current.data = data;
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
                    if (x * 2 + 1 >= width)
                        break;
                    rgb = palette[after];
                    data[location_3 + 4] = rgb.r;
                    data[location_3 + 4 + 1] = rgb.g;
                    data[location_3 + 4 + 2] = rgb.b;
                    data[location_3 + 4 + 3] = 0xFF;
                }
                if (mode !== 0) {
                    pos += (4 - mode);
                }
            }
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
                    }
                    else {
                        data[location_4] = 0xFF;
                        data[location_4 + 1] = 0xFF;
                        data[location_4 + 2] = 0xFF;
                        data[location_4 + 3] = 0xFF;
                    }
                }
                if (mode !== 0) {
                    pos += (4 - mode);
                }
            }
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
                    var location_5 = y * width * 4 + x * 4;
                    data[location_5] = color.r;
                    data[location_5 + 1] = color.g;
                    data[location_5 + 2] = color.b;
                    data[location_5 + 3] = 0xFF;
                }
                pos += (width % 4);
            }
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
            for (var i = 0; i < (this._bitmap.current.data.length / 4); i++) {
                var pos = i * 4;
                this._bitmap.current.data[pos] = 255 - this._bitmap.current.data[pos];
                this._bitmap.current.data[pos + 1] = 255 - this._bitmap.current.data[pos + 1];
                this._bitmap.current.data[pos + 2] = 255 - this._bitmap.current.data[pos + 2];
            }
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
        Bitmap.prototype.drawOnCanvas = function (canvas) {
            var width = this._bitmap.current.width;
            var height = this._bitmap.current.height;
            canvas.style.display = "none";
            var w = canvas.width;
            var h = canvas.height;
            canvas.height = height;
            canvas.width = width;
            var ctx = canvas.getContext("2d");
            var imageData = ctx.createImageData(width, height);
            imageData.data.set(this._bitmap.current.data);
            ctx.putImageData(imageData, 0, 0);
            var imageObject = new Image();
            imageObject.onload = function () {
                var ratio = width / height;
                var windowRatio = w / h;
                var scale = w / width;
                if (windowRatio > ratio) {
                    scale = h / height;
                }
                canvas.height = h;
                canvas.width = w;
                ctx.clearRect(0, 0, width, height);
                ctx.scale(scale, scale);
                ctx.drawImage(imageObject, 0, 0);
                canvas.style.display = "block";
            };
            imageObject.src = canvas.toDataURL();
        };
        return Bitmap;
    }());
    exports.Bitmap = Bitmap;
});
