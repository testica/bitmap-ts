var file;
var bitmap = {};
var canvas = document.getElementById("canvas1");
function decodeHeader(buffer) {
    var header;
    header = new DataView(buffer, 0, 14);
    console.log("Header size (bytes): " + header.byteLength);
    bitmap.header = {};
    bitmap.header.type = header.getUint16(0, true);
    if (bitmap.header.type.toString("16") !== "4d42") {
        throw ('Invalid type, should be BMP');
    }
    bitmap.header.size = header.getUint32(2, true);
    bitmap.header.reserved1 = header.getUint16(6, true);
    bitmap.header.reserved2 = header.getUint16(8, true);
    bitmap.header.offset = header.getUint32(10, true);
}
function decodeHeaderInfo(buffer) {
    var infoHeader;
    infoHeader = new DataView(buffer, 14, 40);
    console.log("Header Info size (bytes): " + infoHeader.byteLength);
    bitmap.infoHeader = {};
    bitmap.infoHeader.size = infoHeader.getUint32(0, true);
    bitmap.infoHeader.width = infoHeader.getUint32(4, true);
    bitmap.infoHeader.height = infoHeader.getUint32(8, true);
    bitmap.infoHeader.planes = infoHeader.getUint16(12, true);
    bitmap.infoHeader.bitsPerPixel = infoHeader.getUint16(14, true);
    bitmap.infoHeader.compression = infoHeader.getUint32(16, true);
    bitmap.infoHeader.imageSize = infoHeader.getUint32(20, true);
    bitmap.infoHeader.horizontalRes = infoHeader.getUint32(24, true);
    bitmap.infoHeader.verticalRes = infoHeader.getUint32(28, true);
    bitmap.infoHeader.numberColors = infoHeader.getUint32(32, true);
    bitmap.infoHeader.importantColors = infoHeader.getUint32(36, true);
}
function decodePalette(buffer) {
    var colors = 0;
    if (bitmap.infoHeader.bitsPerPixel <= 8) {
        if ((colors = bitmap.infoHeader.numberColors) === 0) {
            colors = Math.pow(2, bitmap.infoHeader.bitsPerPixel);
            bitmap.infoHeader.numberColors = colors;
        }
        console.log("has palette with " + colors + " colors");
        var palette = new DataView(buffer, bitmap.infoHeader.size + 14, colors * 4);
        var offset = 0;
        bitmap.palette = [];
        for (var i = 0; i < colors; i++) {
            var b = palette.getUint8(offset++);
            var g = palette.getUint8(offset++);
            var r = palette.getUint8(offset++);
            var a = palette.getUint8(offset++);
            bitmap.palette.push({
                r: r,
                g: g,
                b: b,
                a: a
            });
        }
    }
}
function decodeImageData(buffer) {
    bitmap.rowSize = Math.floor((bitmap.infoHeader.bitsPerPixel * bitmap.infoHeader.width + 31) / 32) * 4;
    bitmap.pixelArraySize = bitmap.rowSize * Math.abs(bitmap.infoHeader.height);
    bitmap.pixels = new Uint8Array(buffer, bitmap.header.offset);
    var data;
    switch (bitmap.infoHeader.bitsPerPixel) {
        case 1:
            data = decodeBit1();
            break;
        case 2:
            data = decodeBit2();
            break;
        case 4:
            data = decodeBit4();
            break;
        case 8:
            data = decodeBit8();
            break;
        case 24:
            data = decodeBit24();
            break;
        default:
            throw ("Not supported");
    }
    bitmap.current = {};
    bitmap.defaultData = bitmap.current.data = data;
    bitmap.current.width = bitmap.infoHeader.width;
    bitmap.current.height = bitmap.infoHeader.height;
    return data;
}
function decodeBit1() {
    var width = bitmap.infoHeader.width;
    var height = bitmap.infoHeader.height;
    var bmpdata = bitmap.pixels;
    var data = new Uint8ClampedArray(width * height * 4);
    var palette = bitmap.palette;
    var pos = 0;
    var xlen = Math.ceil(width / 8);
    var mode = xlen % 4;
    for (var y = height - 1; y >= 0; y--) {
        for (var x = 0; x < xlen; x++) {
            var b = bmpdata[pos++];
            var location = y * width * 4 + x * 8 * 4;
            for (var i = 0; i < 8; i++) {
                if (x * 8 + i < width) {
                    var rgb = palette[((b >> (7 - i)) & 0x1)];
                    data[location + i * 4] = rgb.r;
                    data[location + i * 4 + 1] = rgb.g;
                    data[location + i * 4 + 2] = rgb.b;
                    data[location + i * 4 + 3] = 0xFF;
                }
                else {
                    break;
                }
            }
        }
        if (mode != 0) {
            pos += (4 - mode);
        }
    }
    return data;
}
function decodeBit2() {
    var width = bitmap.infoHeader.width;
    var height = bitmap.infoHeader.height;
    var bmpdata = bitmap.pixels;
    var data = new Uint8ClampedArray(width * height * 4);
    var palette = bitmap.palette;
    var pos = 0;
    var xlen = Math.ceil(width / 4);
    var mode = xlen % 4;
    for (var y = height - 1; y >= 0; y--) {
        for (var x = 0; x < xlen; x++) {
            var b = bmpdata[pos++];
            var location = y * width * 4 + x * 4 * 4;
            for (var i = 0; i < 4; i++) {
                if (x * 4 + i < width) {
                    var rgb = palette[((b >> (3 - i)) & 0x2)];
                    data[location + i * 4] = rgb.r;
                    data[location + i * 4 + 1] = rgb.g;
                    data[location + i * 4 + 2] = rgb.b;
                    data[location + i * 4 + 3] = 0xFF;
                }
                else {
                    break;
                }
            }
        }
        if (mode != 0) {
            pos += (4 - mode);
        }
    }
    return data;
}
function decodeBit4() {
    var width = bitmap.infoHeader.width;
    var height = bitmap.infoHeader.height;
    var bmpdata = bitmap.pixels;
    var data = new Uint8ClampedArray(width * height * 4);
    var palette = bitmap.palette;
    var pos = 0;
    var xlen = Math.ceil(width / 2);
    var mode = xlen % 4;
    for (var y = height - 1; y >= 0; y--) {
        for (var x = 0; x < xlen; x++) {
            var b = bmpdata[pos++];
            var location = y * width * 4 + x * 2 * 4;
            var before = b >> 4;
            var after = b & 0x0F;
            var rgb = palette[before];
            data[location] = rgb.r;
            data[location + 1] = rgb.g;
            data[location + 2] = rgb.b;
            data[location + 3] = 0xFF;
            if (x * 2 + 1 >= width)
                break;
            rgb = palette[after];
            data[location + 4] = rgb.r;
            data[location + 4 + 1] = rgb.g;
            data[location + 4 + 2] = rgb.b;
            data[location + 4 + 3] = 0xFF;
        }
        if (mode != 0) {
            pos += (4 - mode);
        }
    }
    return data;
}
function decodeBit8() {
    var width = bitmap.infoHeader.width;
    var height = bitmap.infoHeader.height;
    var bmpdata = bitmap.pixels;
    var data = new Uint8ClampedArray(width * height * 4);
    var pos = 0;
    var palette = bitmap.palette;
    var mode = width % 4;
    for (var y = height - 1; y >= 0; y--) {
        for (var x = 0; x < width; x++) {
            var b = bmpdata[pos++];
            var location = y * width * 4 + x * 4;
            if (b < palette.length) {
                var rgb = palette[b];
                data[location] = rgb.r;
                data[location + 1] = rgb.g;
                data[location + 2] = rgb.b;
                data[location + 3] = 0xFF;
            }
            else {
                data[location] = 0xFF;
                data[location + 1] = 0xFF;
                data[location + 2] = 0xFF;
                data[location + 3] = 0xFF;
            }
        }
        if (mode != 0) {
            pos += (4 - mode);
        }
    }
    return data;
}
function decodeBit24() {
    var width = bitmap.infoHeader.width;
    var height = bitmap.infoHeader.height;
    var bmpdata = bitmap.pixels;
    var data = new Uint8ClampedArray(width * height * 4);
    var pos = 0;
    for (var y = height - 1; y >= 0; y--) {
        for (var x = 0; x < width; x++) {
            var blue = bmpdata[pos++];
            var green = bmpdata[pos++];
            var red = bmpdata[pos++];
            var location = y * width * 4 + x * 4;
            data[location] = red;
            data[location + 1] = green;
            data[location + 2] = blue;
            data[location + 3] = 0xFF;
        }
        pos += (width % 4);
    }
    return data;
}
function handleFileSelect(evt) {
    file = evt.target.files[0];
    console.log("Filename: " + file.name);
    var header = file;
    var reader = new FileReader();
    reader.onload = function (e) {
        var palette;
        var data;
        var arrayBuffer = reader.result;
        console.log("Size (bytes): " + arrayBuffer.byteLength);
        decodeHeader(arrayBuffer);
        decodeHeaderInfo(arrayBuffer);
        decodePalette(arrayBuffer);
        data = decodeImageData(arrayBuffer);
        console.log(bitmap);
        drawOnCanvas(canvas, bitmap.current.data);
    };
    reader.readAsArrayBuffer(header);
}
function negative(data) {
    for (var i = 0; i < (data.length / 4); i++) {
        var pos = i * 4;
        data[pos] = 255 - data[pos];
        data[pos + 1] = 255 - data[pos + 1];
        data[pos + 2] = 255 - data[pos + 2];
    }
    bitmap.current.data = data;
}
function rotate90CW(data) {
    var width = bitmap.current.width;
    var height = bitmap.current.height;
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
    bitmap.current.width = height;
    bitmap.current.height = width;
    bitmap.current.data = dataRotated;
}
function rotate180(data) {
    rotate90CW(bitmap.current.data);
    rotate90CW(bitmap.current.data);
}
function rotate270CW(data) {
    rotate90CW(bitmap.current.data);
    rotate90CW(bitmap.current.data);
    rotate90CW(bitmap.current.data);
}
function rotate90CCW(data) {
    var width = bitmap.current.width;
    var height = bitmap.current.height;
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
    bitmap.current.width = height;
    bitmap.current.height = width;
    bitmap.current.data = dataRotated;
}
function rotate270CCW(data) {
    rotate90CCW(bitmap.current.data);
    rotate90CCW(bitmap.current.data);
    rotate90CCW(bitmap.current.data);
}
function verticalFlip(data) {
    var width = bitmap.current.width;
    var height = bitmap.current.height;
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
    bitmap.current.data = dataFliped;
}
function horizontalFlip(data) {
    var width = bitmap.current.width;
    var height = bitmap.current.height;
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
    bitmap.current.data = dataFliped;
}
function drawOnCanvas(canvas, data) {
    var width = bitmap.current.width;
    var height = bitmap.current.height;
    canvas.style.display = 'none';
    var w = canvas.width;
    var h = canvas.height;
    canvas.height = height;
    canvas.width = width;
    var ctx = canvas.getContext("2d");
    var imageData = ctx.createImageData(width, height);
    imageData.data.set(data);
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
        ctx.drawImage(imageObject, 0, height / 2 - height * scale / 2);
        canvas.style.display = 'block';
    };
    imageObject.src = canvas.toDataURL();
}
document.getElementById("file").addEventListener("change", handleFileSelect, false);
