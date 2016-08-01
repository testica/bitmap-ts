enum Algorithm {Neighbor, Interpolation};
class RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
  constructor() {
    this.r = this.g = this.b = this.a = 0;
  }
}
export class Transform {
  private algorithmType: Algorithm = Algorithm.Neighbor;


  /* Scale function
   * oheight -> output height
   * owidth -> output widht
   * currentData -> current array of pixels
   * iheight -> input height
   * iwidth -> input widht
   * return new array of pixels (scaled image)
   */
  public scale(owidth: number, oheight: number, currentData: Uint8ClampedArray, iwidth: number, iheight: number): Uint8ClampedArray {
    switch (this.algorithmType) {
      case Algorithm.Neighbor:
        return this.scaleWithNearestNeighbor(owidth, oheight, currentData, iwidth, iheight);
      case Algorithm.Interpolation:
        return this.scaleWithInterpolation(owidth, oheight, currentData, iwidth, iheight);
    }
  }
  private scaleWithNearestNeighbor(owidth: number, oheight: number, currentData: Uint8ClampedArray, iwidth: number, iheight: number): Uint8ClampedArray {
    let cx: number = owidth / iwidth;
    let cy: number = oheight / iheight;
    let data: any = new Uint8ClampedArray(owidth * oheight * 4);
    for (let y: number = 0; y < oheight; y++) {
      for (let x: number = 0; x < owidth; x++) {
        let olocation: number = y * owidth * 4 + x * 4;
        // nearest neighbor for each axis
        let ix: number = this.neighbor(x / cx, iwidth - 1);
        let iy: number = this.neighbor(y / cy, iheight - 1);
        let ilocation: number = iy * iwidth * 4 + ix * 4;
        data[olocation] = currentData[ilocation];
        data[olocation + 1] = currentData[ilocation + 1];
        data[olocation + 2] = currentData[ilocation + 2];
        data[olocation + 3] =  0xFF;
      }
    }
    return data;
  }
  private scaleWithInterpolation(owidth: number, oheight: number, currentData: Uint8ClampedArray, iwidth: number, iheight: number): Uint8ClampedArray {
    let cx: number = owidth / iwidth;
    let cy: number = oheight / iheight;
    let data: any = new Uint8ClampedArray(owidth * oheight * 4);
    let ilocation: number;
    let x1: number, x2: number, y1: number, y2: number;
    for (let y: number = 0; y < oheight; y++) {
      for (let x: number = 0; x < owidth; x++) {
        let olocation: number = y * owidth * 4 + x * 4;
        let ix: number = (x / cx);
        let iy: number = (y / cy);
        // 4 nearest neighbors
        let neighbor: Array<[number, number]> = this.neighbor2x2([ix, iy], iwidth - 1, iheight - 1);
        x2 = neighbor[1][0];
        x1 = neighbor[0][0];
        y2 = neighbor[2][1];
        y1 = neighbor[0][1];
        let fixed: number = (1 / ((x2 - x1) * (y2 - y1)));
        let neighborColors: RGBA[] = [new RGBA(), new RGBA(), new RGBA(), new RGBA()];
        // fill neighborColors
        for (let n: number = 0; n < 4; n ++) {
          ilocation = neighbor[n][1] * iwidth * 4 + neighbor[n][0] * 4;
          neighborColors[n].r = currentData[ilocation];
          neighborColors[n].g = currentData[ilocation + 1];
          neighborColors[n].b = currentData[ilocation + 2];
        }
        let finalPixel: RGBA = new RGBA();
        // Doing interpolation for each color!
        finalPixel.r = fixed * ((neighborColors[0].r * (x2 - ix) * (y2 - iy)) +
                               (neighborColors[1].r * (ix - x1) * (y2 - iy)) +
                               (neighborColors[2].r * (x2 - ix) * (iy - y1)) +
                               (neighborColors[3].r * (ix - x1) * (iy - y1)));

        finalPixel.g = fixed * ((neighborColors[0].g * (x2 - ix) * (y2 - iy)) +
                                (neighborColors[1].g * (ix - x1) * (y2 - iy)) +
                                (neighborColors[2].g * (x2 - ix) * (iy - y1)) +
                                (neighborColors[3].g * (ix - x1) * (iy - y1)));

        finalPixel.b = fixed * ((neighborColors[0].b * (x2 - ix) * (y2 - iy)) +
                                (neighborColors[1].b * (ix - x1) * (y2 - iy)) +
                                (neighborColors[2].b * (x2 - ix) * (iy - y1)) +
                                (neighborColors[3].b * (ix - x1) * (iy - y1)));

        data[olocation] = Math.floor(finalPixel.r);
        data[olocation + 1] = Math.floor(finalPixel.g);
        data[olocation + 2] =  Math.floor(finalPixel.b);
        data[olocation + 3] =  0xFF;
      }
    }
    return data;
  }

  public rotate(angle: number, owidth: number, oheight: number, dx: number, dy: number, currentData: Uint8ClampedArray, iwidth: number, iheight: number): Uint8ClampedArray {
    let data: any = new Uint8ClampedArray(owidth * oheight * 4);
    let ilocation: number;
    let coseno: number = Math.cos(-angle);
    let seno: number = Math.sin(-angle);

    let x1: number, x2: number, y1: number, y2: number;
    for (let y: number = 0; y < oheight; y++) {
      for (let x: number = 0; x < owidth; x++) {
        let olocation: number = y * owidth * 4 + x * 4;
        let ix: number = (x + dx) * coseno + (y + dy) * seno + 1e-5;
        let iy: number = -(x + dx) * seno + (y + dy) * coseno + 1e-5;

        if ( ix >= 0 && ix <= iwidth && iy >= 0 && iy <= iheight) {
          // 4 nearest neighbors
          let neighbor: Array<[number, number]> = this.neighbor2x2([ix, iy], iwidth - 1, iheight - 1);
          x2 = neighbor[1][0];
          x1 = neighbor[0][0];
          y2 = neighbor[2][1];
          y1 = neighbor[0][1];
          let fixed: number = (1 / ((x2 - x1) * (y2 - y1)));
          let neighborColors: RGBA[] = [new RGBA(), new RGBA(), new RGBA(), new RGBA()];
          // fill neighborColors
          for (let n: number = 0; n < 4; n ++) {
            ilocation = neighbor[n][1] * iwidth * 4 + neighbor[n][0] * 4;
            neighborColors[n].r = currentData[ilocation];
            neighborColors[n].g = currentData[ilocation + 1];
            neighborColors[n].b = currentData[ilocation + 2];
          }
          let finalPixel: RGBA = new RGBA();

          // Doing interpolation to each color!
          finalPixel.r = fixed * ((neighborColors[0].r * (x2 - ix) * (y2 - iy)) +
                                 (neighborColors[1].r * (ix - x1) * (y2 - iy)) +
                                 (neighborColors[2].r * (x2 - ix) * (iy - y1)) +
                                 (neighborColors[3].r * (ix - x1) * (iy - y1)));

          finalPixel.g = fixed * ((neighborColors[0].g * (x2 - ix) * (y2 - iy)) +
                                  (neighborColors[1].g * (ix - x1) * (y2 - iy)) +
                                  (neighborColors[2].g * (x2 - ix) * (iy - y1)) +
                                  (neighborColors[3].g * (ix - x1) * (iy - y1)));

          finalPixel.b = fixed * ((neighborColors[0].b * (x2 - ix) * (y2 - iy)) +
                                  (neighborColors[1].b * (ix - x1) * (y2 - iy)) +
                                  (neighborColors[2].b * (x2 - ix) * (iy - y1)) +
                                  (neighborColors[3].b * (ix - x1) * (iy - y1)));

          data[olocation] = Math.floor(finalPixel.r);
          data[olocation + 1] = Math.floor(finalPixel.g);
          data[olocation + 2] =  Math.floor(finalPixel.b);
          data[olocation + 3] =  0xFF;
        }
        else {
          data[olocation] = 0x00;
          data[olocation + 1] = 0x00;
          data[olocation + 2] = 0x00;
          data[olocation + 3] = 0xFF;
        }
      }
    }
    return data;
  }

  private neighbor(value: number, max: number): number {
    if ( Math.floor(value) === max) {
      return max;
    }
    return Math.floor(value + 0.5);
  }

  private neighbor2x2(value: [number, number], xmax: number, ymax: number): Array<[number, number]> {
    // Asumming that image is greater or equal to 2x2
    // Find 4 Nearest neighbor
    let upleft: [number, number] = [Math.floor(value[0]), Math.floor(value[1])];
    let upright: [number, number] = [Math.floor(value[0]) + 1, Math.floor(value[1])];
    let downleft: [number, number] = [Math.floor(value[0]), Math.floor(value[1]) + 1];
    let downright: [number, number] = [Math.floor(value[0]) + 1, Math.floor(value[1]) + 1];

    // resolving y limits
    if ( Math.floor(value[1]) === 0) {
      upleft[1] = 0;
      upright[1] = 0;
      downleft[1] = 1;
      downright[1] = 1;
    } else if (Math.floor(value[1]) === ymax) {
      upleft[1] = ymax - 1;
      upright[1] = ymax - 1;
      downleft[1] = ymax;
      downright[1] = ymax;
    }
    // resolving x limits
    if ( Math.floor(value[0]) === 0) {
      upleft[0] = 0;
      upright[0] = 1;
      downleft[0] = 0;
      downright[0] = 1;
    } else if (Math.floor(value[0]) === xmax) {
      upleft[0] = xmax - 1;
      upright[0] = xmax;
      downleft[0] = xmax - 1;
      downright[0] = xmax;
    }

    return new Array(upleft, upright, downleft, downright);
  }
  // SET Algorithm type to Nearest Neighbor
  public setNeighbor() {
    this.algorithmType = Algorithm.Neighbor;
  }
  // SET Algorithm type to Bi-linear Interpolation
  public setInterpolation() {
    this.algorithmType = Algorithm.Interpolation;
  }
}
