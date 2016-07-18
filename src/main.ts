import {Bitmap} from "./bitmap";

declare var saveAs: any;

// File Object
let file: File;
let bmp: Bitmap;
let canvas: any = document.getElementById("canvas1");
let properties: [HTMLElement, HTMLElement, HTMLElement, HTMLElement];
let histogram_r: any = document.getElementById("histogram_r");
let histogram_g: any = document.getElementById("histogram_g");
let histogram_b: any = document.getElementById("histogram_b");
let histogram_avg: any = document.getElementById("histogram_avg");

function handleFileSelect(evt: any) {
    file = evt.target.files[0];
    bmp = new Bitmap(file);
    bmp.read((response: Bitmap) => {
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

// EventListene when file input is changed
document.getElementById("file").addEventListener("change", handleFileSelect, false);
// BUTTONS FUNCTIONS

// Negative
document.getElementById("negative").addEventListener("click", () => {
  bmp.negative();
  bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
  bmp.drawOnCanvas(canvas);
});
// Rotate 90 CW
document.getElementById("rotate90CW").addEventListener("click", () => {
  bmp.rotate90CW();
  bmp.drawOnCanvas(canvas);
});
// Rotate 180
document.getElementById("rotate180").addEventListener("click", () => {
  bmp.rotate180();
  bmp.drawOnCanvas(canvas);
});
// Rotate 270 CW
document.getElementById("rotate270CW").addEventListener("click", () => {
  bmp.rotate270CW();
  bmp.drawOnCanvas(canvas);
});
// Rotate 90 CCW
document.getElementById("rotate90CCW").addEventListener("click", () => {
  bmp.rotate90CCW();
  bmp.drawOnCanvas(canvas);
});
// Rotate 270 CCW
document.getElementById("rotate270CCW").addEventListener("click", () => {
  bmp.rotate270CCW();
  bmp.drawOnCanvas(canvas);
});
// Horizontal Flip
document.getElementById("horizontalFlip").addEventListener("click", () => {
  bmp.horizontalFlip();
  bmp.drawOnCanvas(canvas);
});
// Vertical Flip
document.getElementById("verticalFlip").addEventListener("click", () => {
  bmp.verticalFlip();
  bmp.drawOnCanvas(canvas);
});
// Brightness
document.getElementById("brightnessBtn").addEventListener("click", () => {
  let value: number = + (<HTMLInputElement>document.getElementById("brightness")).value;
  bmp.brightness(value);
  bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
  bmp.drawOnCanvas(canvas);
});
// contrast
document.getElementById("contrastBtn").addEventListener("click", () => {
  let value: number = + (<HTMLInputElement>document.getElementById("contrast")).value;
  bmp.contrast(value);
  bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
  bmp.drawOnCanvas(canvas);
});
// equalization
document.getElementById("equalization").addEventListener("click", () => {
  bmp.equalization();
  bmp.drawHistogram(histogram_r, histogram_g, histogram_b, histogram_avg);
  bmp.drawOnCanvas(canvas);
});

// umbralization
document.getElementById("umbralization").addEventListener("click" , () => {
  let minValue: number = + (<HTMLInputElement>document.getElementById("minValueUmbral")).value;
  let maxValue: number = + (<HTMLInputElement>document.getElementById("maxValueUmbral")).value;

  bmp.umbralization(minValue, maxValue);
  bmp.drawHistogram(histogram_r , histogram_g , histogram_b , histogram_avg);
  bmp.drawOnCanvas(canvas);

});
document.getElementById("save").addEventListener("click", () => {
  bmp.saveFile((file: Blob) => {
    saveAs(file, "image.bmp");
  });
});
// scale
document.getElementById("scaleBtn").addEventListener("click", () => {
  let scaleWidth: number = + (<HTMLInputElement>document.getElementById("scaleWidth")).value;
  let scaleHeight: number = + (<HTMLInputElement>document.getElementById("scaleHeight")).value;
  if ((<HTMLInputElement> document.getElementsByName("algorithm")[0]).checked) {
    // neighbor algorithm
    bmp.scale(scaleWidth, scaleHeight, "neighbor");
    bmp.drawOnCanvas(canvas);
  } else {
    // interpolation algorithm
    bmp.scale(scaleWidth, scaleHeight, "interpolation");
    bmp.drawOnCanvas(canvas);
  }
});
