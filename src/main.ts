import {Bitmap} from "./bitmap";

// File Object
let file: File;
let bmp: Bitmap;
let canvas: any = document.getElementById("canvas1");

function handleFileSelect(evt: any) {
    file = evt.target.files[0];
    bmp = new Bitmap(file);
    bmp.read((response: any) => {
      response.negative();
      response.drawOnCanvas(canvas);
    });
}

// EventListene when file input is changed
document.getElementById("file").addEventListener("change", handleFileSelect, false);
