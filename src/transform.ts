enum Algorithm {Neighbor, Interpolation};
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
    let cx: number = owidth / iwidth;
    let cy: number = oheight / iheight;
    let data: any = new Uint8ClampedArray(owidth * oheight * 4);
    let pos: number = 0;
    for (let y: number = 0; y < oheight; y++) {
      for (let x: number = 0; x < owidth; x++) {
        let olocation: number = y * owidth * 4 + x * 4;
        let ix: number = this.neighbor(x / cx);
        let iy: number = this.neighbor(y / cy);
        let ilocation: number = iy * iwidth * 4 + ix * 4;
        data[olocation] = currentData[ilocation];
        data[olocation + 1] = currentData[ilocation + 1];
        data[olocation + 2] = currentData[ilocation + 2];
        data[olocation + 3] =  0xFF;
      }
    }
    return data;
  }

  public neighbor(value: number): number {
    return Math.floor(value + 0.5);
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
