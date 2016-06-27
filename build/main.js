define(["require", "exports", "./bitmap"], function (require, exports, bitmap_1) {
    "use strict";
    var file;
    var bmp;
    var canvas = document.getElementById("canvas1");
    function handleFileSelect(evt) {
        file = evt.target.files[0];
        bmp = new bitmap_1.Bitmap(file);
        bmp.read(function (response) {
            document.getElementById("options").style.display = "block";
            bmp = response;
            bmp.drawOnCanvas(canvas);
        });
    }
    document.getElementById("file").addEventListener("change", handleFileSelect, false);
    document.getElementById("negative").addEventListener("click", function () {
        bmp.negative();
        bmp.drawOnCanvas(canvas);
    });
    document.getElementById("rotate90CW").addEventListener("click", function () {
        bmp.rotate90CW();
        bmp.drawOnCanvas(canvas);
    });
    document.getElementById("rotate180").addEventListener("click", function () {
        bmp.rotate180();
        bmp.drawOnCanvas(canvas);
    });
    document.getElementById("rotate270CW").addEventListener("click", function () {
        bmp.rotate270CW();
        bmp.drawOnCanvas(canvas);
    });
    document.getElementById("rotate90CCW").addEventListener("click", function () {
        bmp.rotate90CCW();
        bmp.drawOnCanvas(canvas);
    });
    document.getElementById("rotate270CCW").addEventListener("click", function () {
        bmp.rotate270CCW();
        bmp.drawOnCanvas(canvas);
    });
    document.getElementById("horizontalFlip").addEventListener("click", function () {
        bmp.horizontalFlip();
        bmp.drawOnCanvas(canvas);
    });
    document.getElementById("verticalFlip").addEventListener("click", function () {
        bmp.verticalFlip();
        bmp.drawOnCanvas(canvas);
    });
});
