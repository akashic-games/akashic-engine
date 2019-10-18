import { ExceptionFactory } from "../commons/ExceptionFactory";
import { ImageAssetLike } from "../interfaces/ImageAssetLike";
import { SurfaceLike } from "../interfaces/SurfaceLike";

export module SurfaceUtil {
	/**
	 * 引数 `src` が `undefined` または `Surface` でそのまま返す。
	 * そうでなくかつ `ImageAsset` であれば `Surface` に変換して返す。
	 *
	 * @param src
	 */
	export function asSurface(src: ImageAssetLike | SurfaceLike): SurfaceLike {
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
	export function setupAnimatingHandler(animatingHandler: AnimatingHandler, surface: SurfaceLike): void {
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
	export function migrateAnimatingHandler(
		animatingHandler: AnimatingHandler,
		beforeSurface: SurfaceLike,
		afterSurface: SurfaceLike
	): void {
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
