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
	_isSuppressed: boolean;

	systems: { [key: string]: AudioSystemLike };

	constructor() {
		this._muted = false;
		this._isSuppressed = false;
	}

	/**
	 * @private
	 */
	_reset(): void {
		this._muted = false;
		this._isSuppressed = false;
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
	_changePlaybackRate(rate: number): void {
		if (this._isSuppressed === (rate !== 1.0)) return;

		this._isSuppressed = rate !== 1.0;
		for (var id in this.systems) {
			if (!this.systems.hasOwnProperty(id)) continue;
			this.systems[id]._setSuppressed(this._isSuppressed);
		}
	}
}
