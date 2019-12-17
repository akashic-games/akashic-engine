import { ExceptionFactory } from "../commons/ExceptionFactory";
import { AudioSystemLike } from "../interfaces/AudioSystemLike";

/**
 * `Game#audio` の管理クラス。
 *
 * 複数の `AudioSystem` に一括で必要な状態設定を行う。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
 */
export class AudioSystemManager {
	/**
	 * @private
	 */
	_muted: boolean;

	/**
	 * @private
	 */
	_playbackRate: number;

	systems: { [key: string]: AudioSystemLike };

	constructor() {
		this._muted = false;
		this._playbackRate = 1.0;
	}

	/**
	 * 全てのAudioSystemの音量を設定する。
	 *
	 * @param volume 音量。0以上1.0以下でなければならない。
	 */
	setVolume(volume: number): void {
		if (volume < 0 || volume > 1 || isNaN(volume) || typeof volume !== "number")
			throw ExceptionFactory.createAssertionError("AudioSystemManager#volume: expected: 0.0-1.0, actual: " + volume);

		for (let id in this.systems) {
			if (!this.systems.hasOwnProperty(id)) continue;
			this.systems[id].volume = volume;
		}
	}

	/**
	 * @private
	 */
	_reset(): void {
		this._muted = false;
		this._playbackRate = 1.0;
		for (var id in this.systems) {
			if (!this.systems.hasOwnProperty(id)) continue;
			this.systems[id]._reset();
		}
	}

	/**
	 * @private
	 */
	_setMuted(muted: boolean): void {
		if (this._muted === muted) return;

		this._muted = muted;
		for (var id in this.systems) {
			if (!this.systems.hasOwnProperty(id)) continue;
			this.systems[id]._setMuted(muted);
		}
	}

	/**
	 * @private
	 */
	_setPlaybackRate(rate: number): void {
		if (this._playbackRate === rate) return;

		this._playbackRate = rate;
		for (var id in this.systems) {
			if (!this.systems.hasOwnProperty(id)) continue;
			this.systems[id]._setPlaybackRate(rate);
		}
	}
}
