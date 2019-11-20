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

	_systems: { [key: string]: AudioSystemLike };

	set systems(system: { [key: string]: AudioSystemLike }) {
		this._systems = system;
	}

	constructor() {
		this._muted = false;
		this._playbackRate = 1.0;
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
