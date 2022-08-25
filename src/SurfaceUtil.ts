import type { CommonArea, CommonOffset, CommonRect, ImageAsset, Renderer, Surface } from "@akashic/pdi-types";
import { ExceptionFactory } from "./ExceptionFactory";

/**
 * Surface に関連するユーティリティ。
 */
export module SurfaceUtil {
	/**
	 * 引数 `src` が `undefined` または `Surface` でそのまま返す。
	 * そうでなくかつ `ImageAsset` であれば `Surface` に変換して返す。
	 *
	 * @param src
	 */
	export function asSurface(src: ImageAsset | Surface | undefined): Surface | undefined {
		if (!src) {
			return undefined;
		} else if ("type" in src && src.type === "image") {
			return src.asSurface();
		} else if ("_drawable" in src) {
			return src;
		}
		throw ExceptionFactory.createTypeMismatchError("SurfaceUtil#asSurface", "ImageAsset|Surface", src);
	}

	// TODO: 以下の型と関数については、Dynamicなsurfaceに関する処理を切り出して再利用性の高いオブジェクトを作成
	export type AnimatingHandler = {
		/**
		 * @private
		 */
		_handleAnimationStart: () => void;

		/**
		 * @private
		 */
		_handleAnimationStop: () => void;
	};

	/**
	 * サーフェスのアニメーティングイベントへのハンドラ登録。
	 *
	 * これはエンジンが利用するものであり、ゲーム開発者が呼び出す必要はない。
	 *
	 * @param animatingHandler アニメーティングハンドラ
	 * @param surface サーフェス
	 */
	export function setupAnimatingHandler(animatingHandler: AnimatingHandler, surface: Surface): void {
		if (surface.isPlaying()) {
			animatingHandler._handleAnimationStart();
		}
	}

	/**
	 * アニメーティングハンドラを別のサーフェスへ移動する。
	 *
	 * これはエンジンが利用するものであり、ゲーム開発者が呼び出す必要はない。
	 *
	 * @param animatingHandler アニメーティングハンドラ
	 * @param beforeSurface ハンドラ登録を解除するサーフェス
	 * @param afterSurface ハンドラを登録するサーフェス
	 */
	export function migrateAnimatingHandler(animatingHandler: AnimatingHandler, _beforeSurface: Surface, afterSurface: Surface): void {
		animatingHandler._handleAnimationStop();

		if (afterSurface.isPlaying()) {
			animatingHandler._handleAnimationStart();
		}
	}

	/**
	 * 対象の `Surface` にナインパッチ処理された `Surface` を描画する。
	 *
	 * これは、画像素材の拡大・縮小において「枠」の表現を実現するものである。
	 * 画像の上下左右の「枠」部分の幅・高さを渡すことで、上下の「枠」を縦に引き延ばすことなく、
	 * また左右の「枠」を横に引き延ばすことなく画像を任意サイズに拡大・縮小できる。
	 * ゲームにおけるメッセージウィンドウやダイアログの表現に利用することを想定している。
	 *
	 * @param destSurface 描画先 `Surface`
	 * @param srcSurface 描画元 `Surface`
	 * @param borderWidth 上下左右の「拡大しない」領域の大きさ。すべて同じ値なら数値一つを渡すことができる。省略された場合、 `4`
	 */
	export function drawNinePatch(destSurface: Surface, srcSurface: Surface, borderWidth: CommonRect | number = 4): void {
		const renderer = destSurface.renderer();
		renderer.begin();
		renderer.clear();
		renderNinePatch(renderer, destSurface.width, destSurface.height, srcSurface, borderWidth);
		renderer.end();
	}

	/**
	 * 対象の `Renderer` にナインパッチ処理された `Surface` を描画する。
	 *
	 * 開発者は以下のような状況でこの関数を利用すべきである。
	 * * E を継承した独自の Entity を renderSelf() メソッドで描画する場合。この場合描画先の Surface が不明なので drawNinePatch() よりもこの関数の方が適している。
	 * * Surface全体ではなく部分的に描画したい場合。drawNinePatch() では Surface 全体の描画にしか対応していないため。
	 *
	 * @param renderer 描画先 `Renderer`
	 * @param width 描画先の横幅
	 * @param height 描画先の縦幅
	 * @param surface 描画元 `Surface`
	 * @param borderWidth 上下左右の「拡大しない」領域の大きさ。すべて同じ値なら数値一つを渡すことができる。省略された場合、 `4`
	 */
	export function renderNinePatch(
		renderer: Renderer,
		width: number,
		height: number,
		surface: Surface,
		borderWidth: CommonRect | number = 4
	): void {
		let border: CommonRect;
		if (typeof borderWidth === "number") {
			border = {
				top: borderWidth,
				bottom: borderWidth,
				left: borderWidth,
				right: borderWidth
			};
		} else {
			border = borderWidth;
		}
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

		const sx1 = border.left;
		const sx2 = surface.width - border.right;
		const sy1 = border.top;
		const sy2 = surface.height - border.bottom;
		const dx1 = border.left;
		const dx2 = width - border.right;
		const dy1 = border.top;
		const dy2 = height - border.bottom;

		// Draw corners
		const srcCorners: CommonArea[] = [
			{
				x: 0,
				y: 0,
				width: border.left,
				height: border.top
			},
			{
				x: sx2,
				y: 0,
				width: border.right,
				height: border.top
			},
			{
				x: 0,
				y: sy2,
				width: border.left,
				height: border.bottom
			},
			{
				x: sx2,
				y: sy2,
				width: border.right,
				height: border.bottom
			}
		];
		const destCorners: CommonOffset[] = [
			{ x: 0, y: 0 },
			{ x: dx2, y: 0 },
			{ x: 0, y: dy2 },
			{ x: dx2, y: dy2 }
		];
		renderer.save();
		for (let i = 0; i < srcCorners.length; ++i) {
			const c = srcCorners[i];
			renderer.save();
			renderer.translate(destCorners[i].x, destCorners[i].y);
			renderer.drawImage(surface, c.x, c.y, c.width, c.height, 0, 0);
			renderer.restore();
		}
		// Draw borders
		const srcBorders: CommonArea[] = [
			{ x: sx1, y: 0, width: sx2 - sx1, height: border.top },
			{ x: 0, y: sy1, width: border.left, height: sy2 - sy1 },
			{ x: sx2, y: sy1, width: border.right, height: sy2 - sy1 },
			{ x: sx1, y: sy2, width: sx2 - sx1, height: border.bottom }
		];
		const destBorders: CommonArea[] = [
			{ x: dx1, y: 0, width: dx2 - dx1, height: border.top },
			{ x: 0, y: dy1, width: border.left, height: dy2 - dy1 },
			{ x: dx2, y: dy1, width: border.right, height: dy2 - dy1 },
			{ x: dx1, y: dy2, width: dx2 - dx1, height: border.bottom }
		];
		for (let i = 0; i < srcBorders.length; ++i) {
			const s = srcBorders[i];
			const d = destBorders[i];
			renderer.save();
			renderer.translate(d.x, d.y);
			renderer.transform([d.width / s.width, 0, 0, d.height / s.height, 0, 0]);
			renderer.drawImage(surface, s.x, s.y, s.width, s.height, 0, 0);
			renderer.restore();
		}
		// Draw center
		const sw = sx2 - sx1;
		const sh = sy2 - sy1;
		const dw = dx2 - dx1;
		const dh = dy2 - dy1;
		renderer.translate(dx1, dy1);
		renderer.transform([dw / sw, 0, 0, dh / sh, 0, 0]);
		renderer.drawImage(surface, sx1, sy1, sw, sh, 0, 0);
		renderer.restore();
	}
}
