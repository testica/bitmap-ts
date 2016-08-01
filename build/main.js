define(["require", "exports", "./bitmap"], function (require, exports, bitmap_1) {
    "use strict";
    var file;
    var bmp;
    var canvas = document.getElementById("canvas1");
    var modal = document.getElementById("myModal");
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
            properties = [
                document.getElementById("width"),
                document.getElementById("height"),
                document.getElementById("bitsDepth"),
                document.getElementById("size")
            ];
            bmp.drawProperties(properties);
            bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
            bmp.drawOnCanvas(canvas);
        });
    }
    document.getElementById("file").addEventListener("change", handleFileSelect, false);
    document.getElementById("negative").addEventListener("click", function () {
        bmp.negative();
        bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
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
    document.getElementById("brightnessBtn").addEventListener("click", function () {
        var value = +document.getElementById("brightness").value;
        bmp.brightness(value);
        bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
        bmp.drawOnCanvas(canvas);
    });
    document.getElementById("contrastBtn").addEventListener("click", function () {
        var value = +document.getElementById("contrast").value;
        bmp.contrast(value);
        bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
        bmp.drawOnCanvas(canvas);
    });
    document.getElementById("equalization").addEventListener("click", function () {
        bmp.equalization();
        bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
        bmp.drawOnCanvas(canvas);
    });
    document.getElementById("umbralization").addEventListener("click", function () {
        var minValue = +document.getElementById("minValueUmbral").value;
        var maxValue = +document.getElementById("maxValueUmbral").value;
        bmp.umbralization(minValue, maxValue);
        bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
        bmp.drawOnCanvas(canvas);
    });
    document.getElementById("save").addEventListener("click", function () {
        bmp.saveFile(function (file) {
            saveAs(file, "image.bmp");
        });
    });
    document.getElementById("openModal").addEventListener("click", function () {
        modal.style.display = "block";
        document.getElementsByClassName("close")[0].addEventListener("click", function () {
            modal.style.display = "none";
            document.getElementById("inputRange").value = "1";
            document.getElementById("zoomedCanvas").height = 0;
            document.getElementById("zoomedCanvas").width = 0;
        });
        window.addEventListener("click", function () {
            if (event.target === modal) {
                document.getElementById("inputRange").value = "1";
                modal.style.display = "none";
                document.getElementById("zoomedCanvas").height = 0;
                document.getElementById("zoomedCanvas").width = 0;
            }
        });
        bmp.drawOnCanvas(document.getElementById("originalCanvas"));
        document.getElementById("inputRange").addEventListener("change", function () {
            var input = +document.getElementById("inputRange").value;
            bmp.drawOnCanvas(document.getElementById("originalCanvas"));
            if (document.getElementsByName("algorithm")[0].checked) {
                bmp.drawOnCanvasWithZoom(document.getElementById("zoomedCanvas"), input, "neighbor");
            }
            else {
                bmp.drawOnCanvasWithZoom(document.getElementById("zoomedCanvas"), input, "interpolation");
            }
        });
    });
    document.getElementById("scaleBtn").addEventListener("click", function () {
        var scaleWidth = +document.getElementById("scaleWidth").value;
        var scaleHeight = +document.getElementById("scaleHeight").value;
        if (document.getElementsByName("algorithm")[0].checked) {
            bmp.scale(scaleWidth, scaleHeight, "neighbor");
            bmp.drawOnCanvas(canvas);
        }
        else {
            bmp.scale(scaleWidth, scaleHeight, "interpolation");
            bmp.drawOnCanvas(canvas);
        }
    });
    document.getElementById("rotateBtn").addEventListener("click", function () {
        var rotateAngle = +document.getElementById("rotateAngle").value;
        bmp.rotate((rotateAngle * Math.PI) / 180);
        bmp.drawOnCanvas(canvas);
    });
});
