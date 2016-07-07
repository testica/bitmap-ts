define(["require", "exports", "./bitmap"], function (require, exports, bitmap_1) {
    "use strict";
    // File Object
    var file;
    var bmp;
    var canvas = document.getElementById("canvas1");
    var properties;
    var histogram_r = document.getElementById("histogram_r");
    var histogram_g = document.getElementById("histogram_g");
    var histogram_b = document.getElementById("histogram_b");
    var histogram_avg = document.getElementById("histogram_avg");
    function handleFileSelect(evt) {
        file = evt.target.files[0];
        bmp = new bitmap_1.Bitmap(file);
        bmp.read(function (response) {
            document.getElementById("options").style.display = "block";
            bmp = response;
            properties = [document.getElementById("width"), document.getElementById("height"), document.getElementById("bitsDepth"), document.getElementById("size")];
            bmp.drawProperties(properties);
            bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
            bmp.drawOnCanvas(canvas);
        });
    }
    // EventListene when file input is changed
    document.getElementById("file").addEventListener("change", handleFileSelect, false);
    // BUTTONS FUNCTIONS
    // Negative
    document.getElementById("negative").addEventListener("click", function () {
        bmp.negative();
        bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
        bmp.drawOnCanvas(canvas);
    });
    // Rotate 90 CW
    document.getElementById("rotate90CW").addEventListener("click", function () {
        bmp.rotate90CW();
        bmp.drawOnCanvas(canvas);
    });
    // Rotate 180
    document.getElementById("rotate180").addEventListener("click", function () {
        bmp.rotate180();
        bmp.drawOnCanvas(canvas);
    });
    // Rotate 270 CW
    document.getElementById("rotate270CW").addEventListener("click", function () {
        bmp.rotate270CW();
        bmp.drawOnCanvas(canvas);
    });
    // Rotate 90 CCW
    document.getElementById("rotate90CCW").addEventListener("click", function () {
        bmp.rotate90CCW();
        bmp.drawOnCanvas(canvas);
    });
    // Rotate 270 CCW
    document.getElementById("rotate270CCW").addEventListener("click", function () {
        bmp.rotate270CCW();
        bmp.drawOnCanvas(canvas);
    });
    // Horizontal Flip
    document.getElementById("horizontalFlip").addEventListener("click", function () {
        bmp.horizontalFlip();
        bmp.drawOnCanvas(canvas);
    });
    // Vertical Flip
    document.getElementById("verticalFlip").addEventListener("click", function () {
        bmp.verticalFlip();
        bmp.drawOnCanvas(canvas);
    });
});
