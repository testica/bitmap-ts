# bitmap-ts
Typescript library to load/handle a bitmap file.
Support 1,2,4,8,24 bpp
The following functions are available:
- read(File)
- negative()
- rotate90CW()
- rotate90CCW()
- rotate180()
- rotate270CW()
- rotate270CCW()
- horizontalFlip()
- verticalFlip()
- drawOnCanvas(canvas)

### How to use
First, you need to import in your typescript file the library:

```javascript
import {Bitmap} from "./bitmap";
```

Call the constructor and read:
```javascript
let bmp: Bitmap = new Bitmap(file);
// file is a File Type
bmp.read(file, (b: Bitmap) => {
  // bmp and b is the same instance
  // The file was read. Now, you can use the functions
});
```
And that's all.

##### Drawing on Canvas:
Every time that you want to see the changes on your canvas, you have to call `drawOnCanvas(canvas)`
```javascript
let canvas = document.getElementById("canvas_id");
let bmp: Bitmap = new Bitmap(file);
bmp.read(file, (b: Bitmap) => {
  b.drawOnCanvas(canvas);
});
```
Also, is important to specify a size of you canvas:
```html
<canvas id="canvas_id" width="500" height="500">
```
### Dependencies
RequireJS in needed to allow exports and import Bitmap module.
```html
<script data-main="../../build/main.js" src="../../lib/require.js"></script>
```
### Demo
Visit [the github repository pages](https://testica.github.io/bitmap-ts/) to see a demo.

----
**Leonardo Testa**
