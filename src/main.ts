// File Object
let file: File;
let bitmap: any = {};
let canvas: any = document.getElementById("canvas1");

function decodeHeader(buffer: ArrayBuffer) {
    let header: DataView;
    // Header (14 bytes)
    header = new DataView(buffer, 0, 14);
    console.log("Header size (bytes): " + header.byteLength);

    bitmap.header = {};
    bitmap.header.type = header.getUint16(0, true);
    if (bitmap.header.type.toString("16") !== "4d42") {
      throw('Invalid type, should be BMP');
    }
    bitmap.header.size = header.getUint32(2, true);
    bitmap.header.reserved1 = header.getUint16(6, true);
    bitmap.header.reserved2 = header.getUint16(8, true);
    bitmap.header.offset = header.getUint32(10, true);

}

function decodeHeaderInfo(buffer: ArrayBuffer) {
    let infoHeader: DataView;
    // Header (40 bytes)
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

function decodePalette(buffer: ArrayBuffer) {
    let colors: number = 0;
    // Check if has palette
    if (bitmap.infoHeader.bitsPerPixel <= 8) {
      // has palette
      if ((colors = bitmap.infoHeader.numberColors) === 0) {
        colors = Math.pow(2, bitmap.infoHeader.bitsPerPixel);
        bitmap.infoHeader.numberColors = colors;
      }
      console.log("has palette with " + colors + " colors");
      // PALETTE STORAGE
      let palette: DataView = new DataView(buffer, bitmap.infoHeader.size + 14, colors * 4);
      let offset: number = 0;
      bitmap.palette = [];
      for (let i = 0; i < colors; i++) {
        let b = palette.getUint8(offset++);
        let g = palette.getUint8(offset++);
        let r = palette.getUint8(offset++);
        let a = palette.getUint8(offset++);
        bitmap.palette.push({
          r: r,
          g: g,
          b: b,
          a: a
        });
      }
    }
}

function decodeImageData(buffer: ArrayBuffer) {
    // Pixel storage
    bitmap.rowSize = Math.floor((bitmap.infoHeader.bitsPerPixel * bitmap.infoHeader.width + 31) / 32) * 4;
    bitmap.pixelArraySize = bitmap.rowSize * Math.abs(bitmap.infoHeader.height);
    bitmap.pixels = new Uint8Array(buffer, bitmap.header.offset);
    let data;
    switch (bitmap.infoHeader.bitsPerPixel){
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
        throw("Not supported");
    }

    bitmap.current = {};
    bitmap.defaultData = bitmap.current.data = data;
    bitmap.current.width = bitmap.infoHeader.width;
    bitmap.current.height = bitmap.infoHeader.height;

    return data;

}

function decodeBit1(): Uint8ClampedArray {
    let width: number = bitmap.infoHeader.width;
    let height: number = bitmap.infoHeader.height;
    let bmpdata = bitmap.pixels;
    let data: any = new Uint8ClampedArray(width*height*4);
    let palette = bitmap.palette;
    let pos = 0;
    var xlen = Math.ceil(width / 8);
    var mode = xlen%4;
    for (var y = height - 1; y >= 0; y--) {
      for (var x = 0; x < xlen; x++) {
        var b = bmpdata[pos++];
        var location = y * width * 4 + x*8*4;
        for (var i = 0; i < 8; i++) {
          if(x * 8 + i < width){
            var rgb = palette[((b>>(7-i))&0x1)];
            data[location+i*4] = rgb.r;
            data[location+i*4 + 1] = rgb.g;
            data[location+i*4 + 2] = rgb.b;
            data[location+i*4 + 3] = 0xFF;
          }else{
            break;
          }
        }
      }

      if (mode != 0){
        pos+=(4 - mode);
      }
    }

    return data;

}

function decodeBit2(): Uint8ClampedArray {
    let width: number = bitmap.infoHeader.width;
    let height: number = bitmap.infoHeader.height;
    let bmpdata = bitmap.pixels;
    let data: any = new Uint8ClampedArray(width*height*4);
    let palette = bitmap.palette;
    let pos = 0;
    var xlen = Math.ceil(width / 4);
    var mode = xlen%4;
    for (var y = height - 1; y >= 0; y--) {
      for (var x = 0; x < xlen; x++) {
        var b = bmpdata[pos++];
        var location = y * width * 4 + x*4*4;
        for (var i = 0; i < 4; i++) {
          if(x * 4 + i < width){
            var rgb = palette[((b>>(3-i))&0x2)];
            data[location+i*4] = rgb.r;
            data[location+i*4 + 1] = rgb.g;
            data[location+i*4 + 2] = rgb.b;
            data[location+i*4 + 3] = 0xFF;
          }else{
            break;
          }
        }
      }

      if (mode != 0){
        pos+=(4 - mode);
      }
    }

    return data;

}
function decodeBit4(): Uint8ClampedArray {
    let width: number = bitmap.infoHeader.width;
    let height: number = bitmap.infoHeader.height;
    let bmpdata = bitmap.pixels;
    let data: any = new Uint8ClampedArray(width*height*4);
    let palette = bitmap.palette;
    let pos = 0;
    var xlen = Math.ceil(width/2);
    var mode = xlen%4;
    for (var y = height - 1; y >= 0; y--) {
     for (var x = 0; x < xlen; x++) {
       var b = bmpdata[pos++];
       var location = y * width * 4 + x*2*4;

       var before = b>>4;
       var after = b&0x0F;

       var rgb = palette[before];
       data[location] = rgb.r;
       data[location + 1] = rgb.g;
       data[location + 2] = rgb.b;
       data[location + 3] = 0xFF;

       if(x*2+1>=width)break;

       rgb = palette[after];
       data[location+4] = rgb.r;
       data[location+4 + 1] = rgb.g;
       data[location+4 + 2] = rgb.b;
       data[location+4 + 3] = 0xFF;
     }

     if (mode != 0){
       pos+=(4 - mode);
     }
    }

    return data;
}

function decodeBit8() : Uint8ClampedArray {

    let width: number = bitmap.infoHeader.width;
    let height: number = bitmap.infoHeader.height;
    let bmpdata = bitmap.pixels;
    let data: any = new Uint8ClampedArray(width*height*4);
    let pos = 0;
    let palette = bitmap.palette;
    var mode = width%4;
    for (var y = height - 1; y >= 0; y--) {
      for (var x = 0; x < width; x++) {
        var b = bmpdata[pos++];
        var location = y * width * 4 + x*4;
        if(b < palette.length) {
          var rgb = palette[b];
          data[location] = rgb.r;
          data[location + 1] = rgb.g;
          data[location + 2] = rgb.b;
          data[location + 3] = 0xFF;
        } else {
          data[location] = 0xFF;
          data[location + 1] = 0xFF;
          data[location + 2] = 0xFF;
          data[location + 3] = 0xFF;
        }
      }
      if (mode != 0){
        pos+=(4 - mode);
      }
    }

    return data;
}

function decodeBit24() : Uint8ClampedArray {
    let width: number = bitmap.infoHeader.width;
    let height: number = bitmap.infoHeader.height;
    let bmpdata = bitmap.pixels;
    let data: any = new Uint8ClampedArray(width*height*4);
    let pos = 0;
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
        //skip extra bytes
        pos += (width % 4);
      }

    return data;
}



function handleFileSelect(evt: any) {
    file = evt.target.files[0];
    console.log("Filename: " + file.name);
    // Read File
    let header: File = file;
    let reader: FileReader = new FileReader();
    reader.onload = function(e) {
      let palette: DataView;
      let data;
      let arrayBuffer: ArrayBuffer = reader.result;
      console.log("Size (bytes): " + arrayBuffer.byteLength);

      decodeHeader(arrayBuffer);

      decodeHeaderInfo(arrayBuffer);

      decodePalette(arrayBuffer);

      data = decodeImageData(arrayBuffer);

      console.log(bitmap);
      horizontalFlip(data);

      drawOnCanvas(canvas,bitmap.current.data);
    };
    reader.readAsArrayBuffer(header);

}

function negative(data: Uint8ClampedArray) {
  for (let i=0; i < (data.length/4); i++) {
    let pos = i*4;
    data[pos] = 255 - data[pos];
    data[pos+1] = 255 - data[pos+1];
    data[pos+2] = 255 - data[pos+2];
  }
  bitmap.current.data = data;
}

function rotate90CW(data: Uint8ClampedArray) {
  let width: number = bitmap.current.width;
  let height: number = bitmap.current.height;
  let dataRotated: Uint8ClampedArray= new Uint8ClampedArray(data.length);
  let i: number = 0;
  for(let x = 0; x < width ; x++) {
    for(let y = height - 1; y >= 0; y--) {
      let pos:number = width*y*4 + (x*4);
      dataRotated[i] = data[pos];
      dataRotated[i+1] = data[pos+1];
      dataRotated[i+2] = data[pos+2];
      dataRotated[i+3] = data[pos+3];
      i = i + 4;
    }
  }
  bitmap.current.width = height;
  bitmap.current.height = width;
  bitmap.current.data = dataRotated;
}

function rotate180(data: Uint8ClampedArray) {
  rotate90CW(bitmap.current.data);
  rotate90CW(bitmap.current.data);
}

function rotate270CW(data: Uint8ClampedArray) {
  rotate90CW(bitmap.current.data);
  rotate90CW(bitmap.current.data);
  rotate90CW(bitmap.current.data);
}

function rotate90CCW(data: Uint8ClampedArray) {
  let width: number = bitmap.current.width;
  let height: number = bitmap.current.height;
  let dataRotated: Uint8ClampedArray= new Uint8ClampedArray(data.length);
  let i: number = 0;
  for(let x = width -1 ; x >= 0 ; x--) {
    for(let y = 0; y < height; y++) {
      let pos:number = width*y*4 + (x*4);
      dataRotated[i] = data[pos];
      dataRotated[i+1] = data[pos+1];
      dataRotated[i+2] = data[pos+2];
      dataRotated[i+3] = data[pos+3];
      i = i + 4;
    }
  }
  bitmap.current.width = height;
  bitmap.current.height = width;
  bitmap.current.data = dataRotated;
}

function rotate270CCW(data: Uint8ClampedArray) {
  rotate90CCW(bitmap.current.data);
  rotate90CCW(bitmap.current.data);
  rotate90CCW(bitmap.current.data);
}

function verticalFlip(data: Uint8ClampedArray) {
  let width: number = bitmap.current.width;
  let height: number = bitmap.current.height;
  let dataFliped: Uint8ClampedArray= new Uint8ClampedArray(data.length);
  let i: number = 0;
  for(let x = height -1 ; x >= 0 ; x--) {
    for(let y = 0; y < width; y++) {
      let pos:number = width*x*4 + (y*4);
      dataFliped[i] = data[pos];
      dataFliped[i+1] = data[pos+1];
      dataFliped[i+2] = data[pos+2];
      dataFliped[i+3] = data[pos+3];
      i = i + 4;
    }
  }
  bitmap.current.data = dataFliped;
}

function horizontalFlip(data: Uint8ClampedArray) {
  let width: number = bitmap.current.width;
  let height: number = bitmap.current.height;
  let dataFliped: Uint8ClampedArray= new Uint8ClampedArray(data.length);
  let i: number = 0;
  for(let x = 0; x < height ; x++) {
    for(let y = width -1; y >= 0; y--) {
      let pos:number = width*x*4 + (y*4);
      dataFliped[i] = data[pos];
      dataFliped[i+1] = data[pos+1];
      dataFliped[i+2] = data[pos+2];
      dataFliped[i+3] = data[pos+3];
      i = i + 4;
    }
  }
  bitmap.current.data = dataFliped;
}




function drawOnCanvas(canvas: any, data: Uint8ClampedArray){
    let width: number = bitmap.current.width;
    let height: number = bitmap.current.height;
    canvas.style.display = 'none';
    canvas.height = height;
    canvas.width = width;
    let ctx: any = canvas.getContext("2d");
    let imageData: ImageData = ctx.createImageData(width, height);
    imageData.data.set(data);
    ctx.putImageData(imageData, 0, 0);
    var imageObject=new Image();
    imageObject.onload=function(){
      let scale = 0.25;
      canvas.height = height * scale;
      canvas.width = width * scale;
      ctx.clearRect(0,0,width,height);
      ctx.scale(scale,scale);
      ctx.drawImage(imageObject,0,0);
      canvas.style.display = 'block';

    }
    imageObject.src=canvas.toDataURL();
}

// EventListene when file input is changed
document.getElementById("file").addEventListener("change", handleFileSelect, false);
