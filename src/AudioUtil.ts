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

export type AudioFadeContext = {
	/**
	 * フェードイン・フェードアウトを即座に完了する。
	 */
	complete: () => void;
	/**
	 * フェードイン・フェードアウトを取り消す。
	 * @param revert イージング実行前まで戻すかどうか。省略時は `false` 。
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
	): AudioFadeContext {
		context.changeVolume(0);
		context.play();
		const cancel = fade(game, context, duration, 0, to, easing);

		return {
			complete: () => {
				cancel();
				context.changeVolume(to);
			},
			cancel: (revert: boolean = false) => {
				cancel();
				if (revert) {
					context.changeVolume(0);
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
	 * @param duration フェードインの長さ (ms)。
	 * @param easing イージング関数。省略時は linear が指定される。
	 */
	export function fadeOut(game: Game, context: AudioPlayContext, duration: number, easing: EasingFunction = linear): AudioFadeContext {
		const from = context.volume;
		const cancel = fade(game, context, duration, from, -from, easing);

		return {
			complete: () => {
				cancel();
				context.changeVolume(0);
				context.stop();
			},
			cancel: (revert: boolean = false) => {
				cancel();
				if (revert) {
					context.changeVolume(from);
				}
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
	): AudioFadeContext {
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

	function fade(game: Game, context: AudioPlayContext, duration: number, from: number, to: number, easing: EasingFunction): () => void {
		const frame = 1000 / game.fps;
		let elapsed = 0;

		const handler = (): boolean => {
			elapsed = Math.min(elapsed + frame, duration);
			const progress = easing(elapsed, from, to, duration);
			context.changeVolume(Util.clamp(progress, 0, 1));
			return duration <= elapsed;
		};
		game.onUpdate.add(handler);

		return (): void => {
			if (game.onUpdate.contains(handler)) {
				game.onUpdate.remove(handler);
			}
		};
	}
}
