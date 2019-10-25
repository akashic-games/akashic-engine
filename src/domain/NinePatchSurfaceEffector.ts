import { Game } from "../Game";
import { SurfaceLike } from "../interfaces/SurfaceLike";
import { CommonArea, CommonOffset, CommonRect } from "../types/commons";
import { SurfaceEffector } from "../types/SurfaceEffector";

/**
 * ナインパッチによる描画処理を提供するSurfaceEffector。
 *
 * このSurfaceEffectorは、画像素材の拡大・縮小において「枠」の表現を実現するものである。
 * 画像の上下左右の「枠」部分の幅・高さを渡すことで、上下の「枠」を縦に引き延ばすことなく、
 * また左右の「枠」を横に引き延ばすことなく画像を任意サイズに拡大・縮小できる。
 * ゲームにおけるメッセージウィンドウやダイアログの表現に利用することを想定している。
 */
export class NinePatchSurfaceEffector implements SurfaceEffector {
	game: Game;
	borderWidth: CommonRect;
	/**
	 * @private
	 */
	_surface: SurfaceLike;

	/**
	 * @private
	 */
	_beforeSrcSurface: SurfaceLike;

	/**
	 * `NinePatchSurfaceEffector` のインスタンスを生成する。
	 * @param game このインスタンスが属する `Game`
	 * @param borderWidth 上下左右の「拡大しない」領域の大きさ。すべて同じ値なら数値一つを渡すことができる。省略された場合、 `4`
	 */
	constructor(game: Game, borderWidth: CommonRect | number = 4) {
		this.game = game;
		if (typeof borderWidth === "number") {
			this.borderWidth = {
				top: borderWidth,
				bottom: borderWidth,
				left: borderWidth,
				right: borderWidth
			};
		} else {
			this.borderWidth = borderWidth;
		}
	}

	/**
	 * 指定の大きさに拡大・縮小した描画結果の `Surface` を生成して返す。詳細は `SurfaceEffector#render` の項を参照。
	 */
	render(srcSurface: SurfaceLike, width: number, height: number): SurfaceLike {
		var isCreateSurface = true;
		if (!this._surface || this._surface.width !== width || this._surface.height !== height || this._beforeSrcSurface !== srcSurface) {
			this._surface = this.game.resourceFactory.createSurface(Math.ceil(width), Math.ceil(height));
			this._beforeSrcSurface = srcSurface;
		} else {
			isCreateSurface = false;
		}

		var renderer = this._surface.renderer();
		renderer.begin();
		if (!isCreateSurface) renderer.clear();
		//    x0  x1                          x2
		// y0 +-----------------------------------+
		//    | 1 |             5             | 2 |
		// y1 |---+---------------------------+---|
		//    |   |                           |   |
		//    | 7 |             9             | 8 |
		//    |   |                           |   |
		// y2 |---+---------------------------+---|
		//    | 3 |             6             | 4 |
		//    +-----------------------------------+
		//
		// 1-4: 拡縮無し
		// 5-6: 水平方向へ拡縮
		// 7-8: 垂直方向へ拡縮
		// 9  : 全方向へ拡縮

		var sx1 = this.borderWidth.left;
		var sx2 = srcSurface.width - this.borderWidth.right;
		var sy1 = this.borderWidth.top;
		var sy2 = srcSurface.height - this.borderWidth.bottom;
		var dx1 = this.borderWidth.left;
		var dx2 = width - this.borderWidth.right;
		var dy1 = this.borderWidth.top;
		var dy2 = height - this.borderWidth.bottom;

		// Draw corners
		var srcCorners: CommonArea[] = [
			{
				x: 0,
				y: 0,
				width: this.borderWidth.left,
				height: this.borderWidth.top
			},
			{
				x: sx2,
				y: 0,
				width: this.borderWidth.right,
				height: this.borderWidth.top
			},
			{
				x: 0,
				y: sy2,
				width: this.borderWidth.left,
				height: this.borderWidth.bottom
			},
			{
				x: sx2,
				y: sy2,
				width: this.borderWidth.right,
				height: this.borderWidth.bottom
			}
		];
		var destCorners: CommonOffset[] = [{ x: 0, y: 0 }, { x: dx2, y: 0 }, { x: 0, y: dy2 }, { x: dx2, y: dy2 }];
		var i = 0;
		for (i = 0; i < srcCorners.length; ++i) {
			var c = srcCorners[i];
			renderer.save();
			renderer.translate(destCorners[i].x, destCorners[i].y);
			renderer.drawImage(srcSurface, c.x, c.y, c.width, c.height, 0, 0);
			renderer.restore();
		}
		// Draw borders
		var srcBorders: CommonArea[] = [
			{ x: sx1, y: 0, width: sx2 - sx1, height: this.borderWidth.top },
			{ x: 0, y: sy1, width: this.borderWidth.left, height: sy2 - sy1 },
			{ x: sx2, y: sy1, width: this.borderWidth.right, height: sy2 - sy1 },
			{ x: sx1, y: sy2, width: sx2 - sx1, height: this.borderWidth.bottom }
		];
		var destBorders: CommonArea[] = [
			{ x: dx1, y: 0, width: dx2 - dx1, height: this.borderWidth.top },
			{ x: 0, y: dy1, width: this.borderWidth.left, height: dy2 - dy1 },
			{ x: dx2, y: dy1, width: this.borderWidth.right, height: dy2 - dy1 },
			{ x: dx1, y: dy2, width: dx2 - dx1, height: this.borderWidth.bottom }
		];
		for (i = 0; i < srcBorders.length; ++i) {
			var s = srcBorders[i];
			var d = destBorders[i];
			renderer.save();
			renderer.translate(d.x, d.y);
			renderer.transform([d.width / s.width, 0, 0, d.height / s.height, 0, 0]);
			renderer.drawImage(srcSurface, s.x, s.y, s.width, s.height, 0, 0);
			renderer.restore();
		}
		// Draw center
		var sw = sx2 - sx1;
		var sh = sy2 - sy1;
		var dw = dx2 - dx1;
		var dh = dy2 - dy1;
		renderer.save();
		renderer.translate(dx1, dy1);
		renderer.transform([dw / sw, 0, 0, dh / sh, 0, 0]);
		renderer.drawImage(srcSurface, sx1, sy1, sw, sh, 0, 0);
		renderer.restore();

		renderer.end();
		return this._surface;
	}
}
