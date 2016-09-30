class RGB {
  r: number;
  g: number;
  b: number;
  constructor(r?: number, g?: number, b?: number) {
    if ( r || g || b) {
      this.r = r;
      this.g = g;
      this.b = b;
    }
    else {
    this.r = this.g = this.b = 0;
  }
  }
}
export class Filter {
  private kernel: any = {};
  constructor() {
    this.setKernel(3, 3);
  }

  public blur(type: number, image: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    let data: any = new Uint8ClampedArray(width * height * 4);
    if (type === 0) {
      // box method
      let normalize: number = 1 / (this.kernel.width * this.kernel.height);
      for (let i: number = 0; i < this.kernel.width * this.kernel.height; i++) {
        this.kernel.matrix[i] = normalize;
      }
      for (let y: number = 0; y < height; y++) {
        for (let x: number = 0; x < width; x++) {
          let location: number = y * width * 4 + x * 4;
          let neighbors: RGB [] = this.getNeighbors(image, width, height, [x, y]);
          // do multiplication!
          let total: RGB = new RGB();
          for (let i: number = 0; i < this.kernel.width * this.kernel.height; i++) {
            total.r += this.kernel.matrix[i] * neighbors[i].r;
            total.g += this.kernel.matrix[i] * neighbors[i].g;
            total.b += this.kernel.matrix[i] * neighbors[i].b;
          }
          if (total.r > 255) total.r = 255;
          if (total.g > 255) total.g = 255;
          if (total.b > 255) total.b = 255;
          if (total.r < 0) total.r = 0;
          if (total.g < 0) total.g = 0;
          if (total.b < 0) total.b = 0;
          data[location] = total.r;
          data[location + 1] = total.g;
          data[location + 2] = total.b;
          data[location + 3] = 0xFF;
        }
      }
    }
    else if (type === 1) {
      // gauss method
      let pascal_row: number[] = [1];
      for (let i: number = 0; i < this.kernel.width - 1; i++) {
        pascal_row.push(pascal_row[i] * ((this.kernel.width - 1) - i) / (i + 1));
      }
      let sum: number = pascal_row.reduce((a, b) => a + b, 0);
      let normalize: number = 1 / (sum * sum);
      // fill kernel matrix normalized
      for (let col: number = 0; col < this.kernel.width; col++) {
        for (let row: number = 0; row < this.kernel.width; row++) {
          this.kernel.matrix[this.kernel.width * col + row] = (pascal_row[row] * pascal_row[col]) * normalize;
        }
      }
      for (let y: number = 0; y < height; y++) {
        for (let x: number = 0; x < width; x++) {
          let location: number = y * width * 4 + x * 4;
          let neighbors: RGB [] = this.getNeighbors(image, width, height, [x, y]);
          // do multiplication!
          let total: RGB = new RGB();
          for (let i: number = 0; i < this.kernel.width * this.kernel.height; i++) {
            total.r += this.kernel.matrix[i] * neighbors[i].r;
            total.g += this.kernel.matrix[i] * neighbors[i].g;
            total.b += this.kernel.matrix[i] * neighbors[i].b;
          }
          if (total.r > 255) total.r = 255;
          if (total.g > 255) total.g = 255;
          if (total.b > 255) total.b = 255;
          if (total.r < 0) total.r = 0;
          if (total.g < 0) total.g = 0;
          if (total.b < 0) total.b = 0;
          data[location] = total.r;
          data[location + 1] = total.g;
          data[location + 2] = total.b;
          data[location + 3] = 0xFF;
        }
      }
    }
    return data;
  }
  private getNeighbors(image: Uint8ClampedArray, width: number, height: number, index: [number, number]): RGB[] {
    let matrix: RGB [] = new Array<RGB>(this.kernel.width * this.kernel.height );
    // return neighbors
    let halfw: number = Math.floor(this.kernel.width / 2);
    let halfh: number = Math.floor(this.kernel.height / 2);
    // console.log({halfw: halfw, halfh: halfh, x: index[0], y: index[1], matrix: matrix.slice(0)});
    // LEFT LIMIT
    /*
    if (index[0] < halfw) {
      // set center
      let center: RGB = new RGB();
      let location: number = index[1] * width * 4 + index[0] * 4;
      center.r = image[location];
      center.g = image[location + 1];
      center.b = image[location + 2];
      matrix[halfh * this.kernel.width + halfw] = center;
      for (let i: number = 1; i <= halfw ; i++) {
        let neighbor: RGB = new RGB();
        let location: number = index[1] * width * 4 + (index[0] + i) * 4;
        neighbor.r = image[location];
        neighbor.g = image[location + 1];
        neighbor.b = image[location + 2];
        // right segment
        matrix[halfh * this.kernel.width + (halfw + i)] = neighbor;
        neighbor = new RGB();
        // left segment
        if (index[0] - i < 0) {
          neighbor.r = 0;
          neighbor.g = 0;
          neighbor.b = 0;
        } else {
          let l: number = index[1] * width * 4 + (index[0] - i) * 4;
          neighbor.r = image[l];
          neighbor.g = image[l + 1];
          neighbor.b = image[l + 2];
        }
        matrix[halfh * this.kernel.width + (halfw - i)] = neighbor;
        // console.log({i: i, matrix: matrix.slice(0)});
      }
    }
    // RIGHT LIMIT
    else if (index[0] + halfw >= width) {
      // set center
      let center: RGB = new RGB();
      let location: number = index[1] * width * 4 + index[0] * 4;
      center.r = image[location];
      center.g = image[location + 1];
      center.b = image[location + 2];
      matrix[halfh * this.kernel.width + halfw] = center;
      for (let i: number = 1; i <= halfw ; i++) {
        let neighbor: RGB = new RGB();
        let location: number = index[1] * width * 4 + (index[0] - i) * 4;
        neighbor.r = image[location];
        neighbor.g = image[location + 1];
        neighbor.b = image[location + 2];
        // left segment
        matrix[halfh * this.kernel.width + (halfw - i)] = neighbor;
        neighbor = new RGB();
        // right segment
        if (index[0] + i >= width) {
          neighbor.r = 0;
          neighbor.g = 0;
          neighbor.b = 0;
        } else {
          let l: number = index[1] * width * 4 + (index[0] + i) * 4;
          neighbor.r = image[l];
          neighbor.g = image[l + 1];
          neighbor.b = image[l + 2];
        }
        matrix[halfh * this.kernel.width + (halfw + i)] = neighbor;
        // console.log({i: i, matrix: matrix.slice(0)});
      }
    }
    else {
      // set center
      let center: RGB = new RGB();
      let location: number = index[1] * width * 4 + index[0] * 4;
      center.r = image[location];
      center.g = image[location + 1];
      center.b = image[location + 2];
      matrix[halfh * this.kernel.width + halfw] = center;
      for (let i: number = 1; i <= halfw ; i++) {
        let neighbor: RGB = new RGB();
        let location_right: number = index[1] * width * 4 + (index[0] + i) * 4;
        let location_left: number = index[1] * width * 4 + (index[0] - i) * 4;
        neighbor.r = image[location_right];
        neighbor.g = image[location_right + 1];
        neighbor.b = image[location_right + 2];
        matrix[halfh * this.kernel.width + (halfw + i)] = neighbor;
        neighbor = new RGB();
        neighbor.r = image[location_left];
        neighbor.g = image[location_left + 1];
        neighbor.b = image[location_left + 2];
        matrix[halfh * this.kernel.width + (halfw - i)] = neighbor;
        // console.log({i: i, matrix: matrix.slice(0)});
      }
    }
    // TOP LIMIT
    if (index[1] < halfh) {
      // set center
      let center: RGB = new RGB();
      let location: number = index[1] * width * 4 + index[0] * 4;
      center.r = image[location];
      center.g = image[location + 1];
      center.b = image[location + 2];
      matrix[halfh * this.kernel.width + halfw] = center;
      for (let i: number = 1; i <= halfh ; i++) {
        let neighbor: RGB = new RGB();
        let location: number = (index[1] + i) * width * 4 + index[0] * 4;
        neighbor.r = image[location];
        neighbor.g = image[location + 1];
        neighbor.b = image[location + 2];
        matrix[(halfh + i) * this.kernel.width + halfw] = neighbor;
        neighbor = new RGB();
        // up segment
        if (index[1] - i < 0) {
          neighbor.r = 0;
          neighbor.g = 0;
          neighbor.b = 0;
        } else {
          let l: number = (index[1] - i) * width * 4 + index[0] * 4;
          neighbor.r = image[l];
          neighbor.g = image[l + 1];
          neighbor.b = image[l + 2];
        }
        matrix[(halfh - i) * this.kernel.width + halfw] = neighbor;
        // console.log({i: i, matrix: matrix.slice(0)});
      }
    }
    // BOTTOM LIMIT
    else if (index[1] + halfh >= height) {
      // set center
      let center: RGB = new RGB();
      let location: number = index[1] * width * 4 + index[0] * 4;
      center.r = image[location];
      center.g = image[location + 1];
      center.b = image[location + 2];
      matrix[halfh * this.kernel.width + halfw] = center;
      for (let i: number = 1; i <= halfh ; i++) {
        let neighbor: RGB = new RGB();
        let location: number = (index[1] - i) * width * 4 + index[0] * 4;
        neighbor.r = image[location];
        neighbor.g = image[location + 1];
        neighbor.b = image[location + 2];
        matrix[(halfh - i) * this.kernel.width + halfw] = neighbor;
        neighbor = new RGB();
        // bottom segment
        if (index[1] + i >= height) {
          neighbor.r = 0;
          neighbor.g = 0;
          neighbor.b = 0;
        } else {
          let l: number = (index[1] + i) * width * 4 + index[0] * 4;
          neighbor.r = image[l];
          neighbor.g = image[l + 1];
          neighbor.b = image[l + 2];
        }
        matrix[(halfh + i) * this.kernel.width + halfw] = neighbor;
        // console.log({i: i, matrix: matrix.slice(0)});
      }
    }

    else {
      // set center
      let center: RGB = new RGB();
      let location: number = index[1] * width * 4 + index[0] * 4;
      center.r = image[location];
      center.g = image[location + 1];
      center.b = image[location + 2];
      matrix[halfh * this.kernel.width + halfw] = center;
      for (let i: number = 1; i <= halfh ; i++) {
        let neighbor: RGB = new RGB();
        let location_down: number = (index[1] + i) * width * 4 + index[0] * 4;
        let location_up: number = (index[1] - i) * width * 4 + index[0] * 4;
        neighbor.r = image[location_down];
        neighbor.g = image[location_down + 1];
        neighbor.b = image[location_down + 2];
        matrix[(halfh + i) * this.kernel.width + halfw ] = neighbor;
        neighbor = new RGB();
        neighbor.r = image[location_up];
        neighbor.g = image[location_up + 1];
        neighbor.b = image[location_up + 2];
        matrix[(halfh - i) * this.kernel.width + halfw ] = neighbor;
        // console.log({i: i, matrix: matrix.slice(0)});
      }
    }
    // console.log("go to rest!");
    */

    for (let x: number = 0; x <= halfw ; x++) {
      for (let y: number = 0; y <= halfh ; y++) {
        let neighbor: RGB[] = new Array<RGB>(4);
        let pixel: RGB = new RGB();
        // center
        if ( x === 0 && y === 0) {
          let location: number = index[1] * width * 4 + index[0] * 4;
          neighbor[0] = new RGB(image[location], image[location + 1], image[location + 2]);
          matrix[halfh * this.kernel.width + halfw] = neighbor[0];
        } else {
        // left-top
        if (index[1] - y < 0 || index[0] - x < 0) {
          neighbor[0] = new RGB();
          // console.log("left-top");
        }else {
          let location: number = (index[1] - y) * width * 4 + (index[0] - x) * 4;
          neighbor[0] = new RGB(image[location], image[location + 1], image[location + 2]);
        }
        matrix[(halfh - y) * this.kernel.width + (halfw - x) ] = neighbor[0];
        // right-top
        if (index[1]  - y < 0 || index[0]  + x >= width) {
          neighbor[1] = new RGB();
          // console.log("right-top");
        }else {
          let location: number = (index[1] - y) * width * 4 + (index[0] + x) * 4;
          neighbor[1] = new RGB(image[location], image[location + 1], image[location + 2]);
        }
        matrix[(halfh - y) * this.kernel.width + (halfw + x) ] = neighbor[1];
        // left-bottom
        if (index[1] + y >= height || index[0] - x < 0) {
          neighbor[2] = new RGB();
          // console.log("left-bottom");
        }else {
          let location: number = (index[1] + y) * width * 4 + (index[0] - x) * 4;
          neighbor[2] = new RGB(image[location], image[location + 1], image[location + 2]);
        }
        matrix[(halfh + y) * this.kernel.width + (halfw - x) ] = neighbor[2];
        // right-bottom
        if (index[1] + y >= height || index[0] + x >= width) {
          neighbor[3] = new RGB();
          // console.log("right-bottom");
        }else {
          let location: number = (index[1] + y) * width * 4 + (index[0] + x) * 4;
          neighbor[3] = new RGB(image[location], image[location + 1], image[location + 2]);
        }
        matrix[(halfh + y) * this.kernel.width + (halfw + x) ] = neighbor[3];
        // console.log({x: x, y: y, matrix: matrix.slice(0)});
        }
      }
    }
    return matrix;
  }
  public setKernel (width: number, height: number, customKernel?: number []) {
    if (customKernel) {
      // load custom kernel
    } else {
      this.kernel.height = height;
      this.kernel.width = width;
      this.kernel.matrix = new Array<number>(height * width);
    }
  }
}
