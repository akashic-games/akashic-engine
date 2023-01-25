import type { AudioPlayContext } from "./AudioPlayContext";
import type { Game } from "./Game";
import { Util } from "./Util";

/**
 * イージング関数。
 *
 * @param t 経過時間
 * @param b 開始位置
 * @param c 差分
 * @param d 所要時間
 */
export type EasingFunction = (t: number, b: number, c: number, d: number) => number;

export type AudioTransitionContext = {
	/**
	 * 遷移を即座に完了する。
	 * 音量は遷移完了後の値となる。
	 */
	complete: () => void;
	/**
	 * 遷移を取り消す。音量はこの関数を実行した時点での値となる。
	 * @param revert 音量を遷移実行前まで戻すかどうか。省略時は `false` 。
	 */
	cancel: (revert?: boolean) => void;
};

/**
 * linear のイージング関数。
 */
const linear: EasingFunction = (t: number, b: number, c: number, d: number) => (c * t) / d + b;

/**
 * Audio に関連するユーティリティ。
 */
export module AudioUtil {
	/**
	 * 音声をフェードインさせる。
	 *
	 * @param game 対象の `Game`。
	 * @param context 対象の `AudioPlayContext` 。
	 * @param duration フェードインの長さ (ms)。
	 * @param to フェードイン後の音量。0 未満または 1 より大きい値を指定した場合の挙動は不定である。省略時は `1` 。
	 * @param easing イージング関数。省略時は linear 。
	 */
	export function fadeIn(
		game: Game,
		context: AudioPlayContext,
		duration: number,
		to: number = 1,
		easing: EasingFunction = linear
	): AudioTransitionContext {
		context.changeVolume(0);
		context.play();
		const { complete, cancel } = transitionVolume(game, context, duration, to, easing);

		return {
			complete: () => {
				complete();
			},
			cancel: (revert: boolean = false) => {
				cancel(revert);
				if (revert) {
					context.stop();
				}
			}
		};
	}

	/**
	 * 音声をフェードアウトさせる。
	 *
	 * @param game 対象の `Game`。
	 * @param context 対象の `AudioPlayContext` 。
	 * @param duration フェードアウトの長さ (ms)。
	 * @param easing イージング関数。省略時は linear が指定される。
	 */
	export function fadeOut(
		game: Game,
		context: AudioPlayContext,
		duration: number,
		easing: EasingFunction = linear
	): AudioTransitionContext {
		const { complete, cancel } = transitionVolume(game, context, duration, 0, easing);

		return {
			complete: () => {
				complete();
				context.stop();
			},
			cancel: (revert: boolean = false) => {
				cancel(revert);
			}
		};
	}

	/**
	 * 二つの音声をクロスフェードさせる。
	 *
	 * @param game 対象の `Game`。
	 * @param fadeInContext フェードイン対象の `AudioPlayContext` 。
	 * @param fadeOutContext フェードアウト対象の `AudioPlayContext` 。
	 * @param duration クロスフェードの長さ (ms)。
	 * @param to クロスフェード後の音量。0 未満または 1 より大きい値を指定した場合の挙動は不定。省略時は `1` 。
	 * @param easing イージング関数。フェードインとフェードアウトで共通であることに注意。省略時は linear が指定される。
	 */
	export function crossFade(
		game: Game,
		fadeInContext: AudioPlayContext,
		fadeOutContext: AudioPlayContext,
		duration: number,
		to: number = 1,
		easing: EasingFunction = linear
	): AudioTransitionContext {
		const fadeInFuncs = fadeIn(game, fadeInContext, duration, to, easing);
		const fadeOutFuncs = fadeOut(game, fadeOutContext, duration, easing);

		return {
			complete: () => {
				fadeInFuncs.complete();
				fadeOutFuncs.complete();
			},
			cancel: (revert: boolean = false) => {
				fadeInFuncs.cancel(revert);
				fadeOutFuncs.cancel(revert);
			}
		};
	}

	/**
	 * 音量を指定のイージングで遷移させる。
	 *
	 * @param game 対象の `Game`。
	 * @param context 対象の `AudioPlayContext` 。
	 * @param duration 遷移の長さ (ms)。
	 * @param to 遷移後の音量。0 未満または 1 より大きい値を指定した場合の挙動は不定。
	 * @param easing イージング関数。省略時は linear が指定される。
	 */
	export function transitionVolume(
		game: Game,
		context: AudioPlayContext,
		duration: number,
		to: number,
		easing: EasingFunction = linear
	): AudioTransitionContext {
		const frame = 1000 / game.fps;
		const from = context.volume;
		let elapsed = 0;
		context.changeVolume(Util.clamp(from, 0, 1));

		const handler = (): boolean => {
			elapsed += frame;
			if (elapsed <= duration) {
				const progress = easing(elapsed, from, to - from, duration);
				context.changeVolume(Util.clamp(progress, 0, 1));
				return false;
			} else {
				context.changeVolume(to);
				return true;
			}
		};
		const remove = (): void => {
			if (game.onUpdate.contains(handler)) {
				game.onUpdate.remove(handler);
			}
		};
		game.onUpdate.add(handler);

		return {
			complete: () => {
				remove();
				context.changeVolume(to);
			},
			cancel: revert => {
				remove();
				if (revert) {
					context.changeVolume(from);
				}
			}
		};
	}
}
