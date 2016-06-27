define(["require", "exports", "./bitmap"], function (require, exports, bitmap_1) {
    "use strict";
    var file;
    var bmp;
    var canvas = document.getElementById("canvas1");
    function handleFileSelect(evt) {
        file = evt.target.files[0];
        bmp = new bitmap_1.Bitmap(file);
        bmp.read(function (response) {
            response.negative();
            response.drawOnCanvas(canvas);
        });
    }
    document.getElementById("file").addEventListener("change", handleFileSelect, false);
});
