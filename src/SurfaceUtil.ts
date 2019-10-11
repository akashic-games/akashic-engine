import { Asset } from "./Asset";
import { ExceptionFactory } from "./errors";
import { ImageAsset } from "./ImageAsset";
import { Surface } from "./Surface";

export module SurfaceUtil {
	/**
	 * 引数 `src` が `undefined` または `Surface` でそのまま返す。
	 * そうでなくかつ `ImageAsset` であれば `Surface` に変換して返す。
	 *
	 * @param src
	 */
	export function asSurface(src: Asset | Surface): Surface {
		if (!src) {
			return src as Surface;
		} else if (src instanceof Surface) {
			return src;
		} else if (src instanceof ImageAsset) {
			return src.asSurface();
		}
		throw ExceptionFactory.createTypeMismatchError("Surface#asSurface", "ImageAsset|Surface", src);
	}

	// TODO: 以下の型と関数については、Dynamicなsurfaceに関する処理を切り出して再利用性の高いオブジェクトを作成
	export type AnimatingHandler = {
		/**
		 * @private
		 */
		_onAnimatingStarted: () => void;

		/**
		 * @private
		 */
		_onAnimatingStopped: () => void;
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
		if (surface.isDynamic) {
			surface.animatingStarted.add(animatingHandler._onAnimatingStarted, animatingHandler);
			surface.animatingStopped.add(animatingHandler._onAnimatingStopped, animatingHandler);
			if (surface.isPlaying()) {
				animatingHandler._onAnimatingStarted();
			}
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
	export function migrateAnimatingHandler(animatingHandler: AnimatingHandler, beforeSurface: Surface, afterSurface: Surface): void {
		animatingHandler._onAnimatingStopped();

		if (!beforeSurface.destroyed() && beforeSurface.isDynamic) {
			beforeSurface.animatingStarted.remove(animatingHandler._onAnimatingStarted, animatingHandler);
			beforeSurface.animatingStopped.remove(animatingHandler._onAnimatingStopped, animatingHandler);
		}

		if (afterSurface.isDynamic) {
			afterSurface.animatingStarted.add(animatingHandler._onAnimatingStarted, animatingHandler);
			afterSurface.animatingStopped.add(animatingHandler._onAnimatingStopped, animatingHandler);
			if (afterSurface.isPlaying()) {
				animatingHandler._onAnimatingStarted();
			}
		}
	}
}
