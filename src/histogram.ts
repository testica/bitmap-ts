export class Histogram {
  private _histogram_r: number[];
  private _histogram_g: number[];
  private _histogram_b: number[];
  private _histogram_avg: number[];

  constructor() {
    this._histogram_r = [];
    this._histogram_g = [];
    this._histogram_b = [];
    this._histogram_avg = [];
    for (let i: number = 0; i < 256; i++) {
       this._histogram_r[i] = 0;
       this._histogram_g[i] = 0;
       this._histogram_b[i] = 0;
       this._histogram_avg[i] = 0;
     }
  }
  public fillAll(imageData: Uint8Array) {
    for (let i: number = 0; i < imageData.length; i += 4) {
      this._histogram_r[imageData[i]]++;
      this._histogram_g[imageData[i + 1]]++;
      this._histogram_b[imageData[i + 2]]++;
    }
    this.fillAvg();
  }

  public fillAvg() {
    for (let i: number = 0; i < 256; i++) {
      this._histogram_avg[i] = (this._histogram_r[i] + this._histogram_g[i] + this._histogram_b[i]) / 3;
      this._histogram_avg[i] = Math.floor(this._histogram_avg[i]);
    }
  }
  public fill(r: number, g: number, b: number) {
    this._histogram_r[r]++;
    this._histogram_g[g]++;
    this._histogram_b[b]++;
  }

  public draw_r(canvas: HTMLCanvasElement) {
    let max: number = Math.max.apply(null, this._histogram_r);
    let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgb(255,0,0)";
    for (let i: number = 0; i < 256; i++) {
      let pct: number = (this._histogram_r[i] / max) * 100;
      ctx.fillRect(i, 100, 1, -Math.round(pct));
    }
  }
  public draw_g(canvas: HTMLCanvasElement) {
    let max: number = Math.max.apply(null, this._histogram_g);
    let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgb(0,255,0)";
    for (let i: number = 0; i < 256; i++) {
      let pct: number = (this._histogram_g[i] / max) * 100;
      ctx.fillRect(i, 100, 1, -Math.round(pct));
    }
  }

  public get histogram_avg(): number[] { return this._histogram_avg; };
  public get histogram_r(): number[] { return this._histogram_r; };
  public get histogram_g(): number[] { return this._histogram_g; };
  public get histogram_b(): number[] { return this._histogram_b; };

  public draw_b(canvas: HTMLCanvasElement) {
    let max: number = Math.max.apply(null, this._histogram_b);
    let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgb(0,0,255)";
    for (let i: number = 0; i < 256; i++) {
      let pct: number = (this._histogram_b[i] / max) * 100;
      ctx.fillRect(i, 100, 1, -Math.round(pct));
    }
  }

  public draw_avg(canvas: HTMLCanvasElement) {
    let rmax: number = Math.max.apply(null, this._histogram_r);
    let gmax: number = Math.max.apply(null, this._histogram_g);
    let bmax: number = Math.max.apply(null, this._histogram_b);
    let max: number = Math.max.apply(null, [rmax, gmax, bmax]);
    let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgb(0,0,0)";
    for (let i: number = 0; i < 256; i++) {
      let pct: number = (this._histogram_avg[i] / max) * 100;
      ctx.fillRect(i, 100, 1, -Math.round(pct));
    }
  }



}
