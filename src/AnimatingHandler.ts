// TODO: Dynamicなsurfaceに関する処理を切り出して、再利用性の高いオブジェクトを作成
import { Surface } from "./Surface";

export type AnimatingHandler = {
	/**
	 * @private
	 */
	_onAnimatingStarted: () => void,

	/**
	 * @private
	 */
	_onAnimatingStopped: () => void
};

/**
 * サーフェスのアニメーティングイベントへのハンドラ登録。
 *
 * これはゲームエンジンが利用するものであり、ゲーム開発者が呼び出す必要はない。
 *
 * @param animatingHandler アニメーティングハンドラ
 * @param surface サーフェス
 */
export function _setupAnimatingHandler(animatingHandler: AnimatingHandler, surface: Surface): void {
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
 * これはゲームエンジンが利用するものであり、ゲーム開発者が呼び出す必要はない。
 *
 * @param animatingHandler アニメーティングハンドラ
 * @param beforeSurface ハンドラ登録を解除するサーフェス
 * @param afterSurface ハンドラを登録するサーフェス
 */
export function _migrateAnimatingHandler(animatingHandler: AnimatingHandler, beforeSurface: Surface, afterSurface: Surface): void {
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
