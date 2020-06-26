import { CommonRect, Surface } from "@akashic/pdi-types";
import { Game } from "./Game";
import { getGameInAssetContext } from "./getGameInAssetContext";
import { SurfaceEffector } from "./SurfaceEffector";
import { SurfaceUtil } from "./SurfaceUtil";

/**
 * ナインパッチによる描画処理を提供するSurfaceEffector。
 *
 * このSurfaceEffectorは、画像素材の拡大・縮小において「枠」の表現を実現するものである。
 * 画像の上下左右の「枠」部分の幅・高さを渡すことで、上下の「枠」を縦に引き延ばすことなく、
 * また左右の「枠」を横に引き延ばすことなく画像を任意サイズに拡大・縮小できる。
 * ゲームにおけるメッセージウィンドウやダイアログの表現に利用することを想定している。
 *
 * @deprecated 非推奨である。将来的に削除される。代わりに `SurfaceUtil#drawNinePatch()` を利用すること。
 */
export class NinePatchSurfaceEffector implements SurfaceEffector {
	game: Game;
	borderWidth: CommonRect;

	/**
	 * @private
	 */
	_surface: Surface | undefined;

	/**
	 * @private
	 */
	_beforeSrcSurface: Surface | undefined;

	/**
	 * `NinePatchSurfaceEffector` のインスタンスを生成する。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `SurfaceUtil#drawNinePatch()` を利用すること。
	 * @param game このインスタンスが属する `Game`。ゲーム開発者が指定する必要はない。
	 * @param borderWidth 上下左右の「拡大しない」領域の大きさ。すべて同じ値なら数値一つを渡すことができる。省略された場合、 `4`
	 */
	constructor(game: Game | null, borderWidth: CommonRect | number = 4) {
		this.game = game || getGameInAssetContext();
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
	render(srcSurface: Surface, width: number, height: number): Surface {
		if (!this._surface || this._surface.width !== width || this._surface.height !== height || this._beforeSrcSurface !== srcSurface) {
			this._surface = this.game.resourceFactory.createSurface(Math.ceil(width), Math.ceil(height));
			this._beforeSrcSurface = srcSurface;
		}
		SurfaceUtil.drawNinePatch(this._surface, srcSurface, this.borderWidth);
		return this._surface;
	}
}
