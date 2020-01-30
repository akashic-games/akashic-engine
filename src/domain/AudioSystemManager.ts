import { MusicAudioSystem, SoundAudioSystem } from "../implementations/AudioSystem";
import { AudioSystemLike } from "../interfaces/AudioSystemLike";
import { ResourceFactoryLike } from "../interfaces/ResourceFactoryLike";

export interface AudioSystems {
	[key: string]: AudioSystemLike;
	music: AudioSystemLike;
	sound: AudioSystemLike;
}

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

	/*
	 * @private
	 */
	_systems: AudioSystems;

	constructor() {
		this._muted = false;
	}

	/**
	 * @private
	 */
	_reset(): void {
		this._muted = false;
		for (var id in this._systems) {
			if (!this._systems.hasOwnProperty(id)) continue;
			this._systems[id]._reset();
		}
	}

	/**
	 * @private
	 */
	_setMuted(muted: boolean): void {
		if (this._muted === muted) return;

		this._muted = muted;

		for (var id in this._systems) {
			if (!this._systems.hasOwnProperty(id)) continue;
			this._systems[id]._setMuted(muted);
		}
	}

	/**
	 * @private
	 */
	_setPlaybackRate(rate: number): void {
		for (var id in this._systems) {
			if (!this._systems.hasOwnProperty(id)) continue;
			this._systems[id]._setPlaybackRate(rate);
		}
	}

	/**
	 * @private
	 */
	_createAudioSystems(resourceFactory: ResourceFactoryLike): AudioSystems {
		this._systems = {
			music: new MusicAudioSystem({
				id: "music",
				muted: this._muted,
				resourceFactory: resourceFactory
			}),
			sound: new SoundAudioSystem({
				id: "sound",
				muted: this._muted,
				resourceFactory: resourceFactory
			})
		};
		return this._systems;
	}
}
