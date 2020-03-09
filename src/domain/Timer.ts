import { Trigger } from "@akashic/trigger";
import { Destroyable } from "../types/Destroyable";

/**
 * 一定時間で繰り返される処理を表すタイマー。
 *
 * ゲーム開発者が本クラスのインスタンスを直接生成することはなく、
 * 通常はScene#setTimeout、Scene#setIntervalによって間接的に利用する。
 */
export class Timer implements Destroyable {
	/**
	 * 実行間隔（ミリ秒）。
	 * この値は参照のみに利用され、直接値を変更することはできない。
	 */
	interval: number;

	/**
	 * `this.interval` 経過時にfireされるTrigger。
	 */
	onElapse: Trigger<void>;

	/**
	 * `this.interval` 経過時にfireされるTrigger。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onElapse` を利用すること。
	 */
	elapsed: Trigger<void>;

	/**
	 * @private
	 */
	// NOTE: 経過時間（ミリ秒）の計算はtick()の呼び出し時に1000 / fpsを計算する必要があるが、
	// 計算結果が浮動小数となる可能性があり、計算誤差が発生してしまう。
	// これを避けるために、経過時間をfps倍し、整数としたものthis._scaledElapsedとして管理する。
	// さらに比較対象となるintervalもfps倍し、this._scaledIntervalとして管理する。
	_scaledInterval: number;

	/**
	 * @private
	 */
	_scaledElapsed: number;

	constructor(interval: number, fps: number) {
		this.interval = interval;
		// NOTE: intervalが浮動小数の場合があるため念のため四捨五入する
		this._scaledInterval = Math.round(interval * fps);
		this.onElapse = new Trigger<void>();
		this.elapsed = this.onElapse;
		this._scaledElapsed = 0;
	}

	tick(): void {
		// NOTE: 1000 / fps * fps = 1000
		this._scaledElapsed += 1000;
		while (this._scaledElapsed >= this._scaledInterval) {
			// NOTE: this.elapsed.fire()内でdestroy()される可能性があるため、destroyed()を判定する
			if (!this.onElapse) {
				break;
			}
			this.onElapse.fire();
			this._scaledElapsed -= this._scaledInterval;
		}
	}

	canDelete(): boolean {
		return !this.onElapse || this.onElapse.length === 0;
	}

	destroy(): void {
		this.interval = undefined;
		this.onElapse.destroy();
		this.onElapse = undefined;
		this.elapsed = undefined;
		this._scaledInterval = 0;
		this._scaledElapsed = 0;
	}

	destroyed(): boolean {
		return this.onElapse === undefined;
	}
}
