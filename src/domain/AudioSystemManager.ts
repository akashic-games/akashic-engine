import { MusicAudioSystem, SoundAudioSystem } from "../implementations/AudioSystem";
import { AudioSystemLike } from "../interfaces/AudioSystemLike";
import { ResourceFactoryLike } from "../interfaces/ResourceFactoryLike";

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

	/**
	 * ゲームで利用可能なオーディオシステム群。デフォルトでmusicとsoundを登録する。
	 * SE・声・音楽等で分けたい場合、本プロパティにvoice等のAudioSystemを登録することで実現する。
	 * @private
	 */
	_systems: { [key: string]: AudioSystemLike };

	constructor(resourceFactory?: ResourceFactoryLike) {
		this._muted = false;
		this._playbackRate = 1.0;

		this._systems = {
			music: new MusicAudioSystem({
				id: "music",
				resourceFactory: resourceFactory
			}),
			sound: new SoundAudioSystem({
				id: "sound",
				resourceFactory: resourceFactory
			})
		};
	}

	/**
	 * AudioSystemを追加する。
	 * @param key オーディオシステムのID
	 * @param system 追加するオーディオシステム
	 */
	addSystem(key: string, system: AudioSystemLike): void {
		system.muted = this._muted;
		system.playbackRate = this._playbackRate;
		this._systems[key] = system;
	}

	/**
	 * 全ての オーディオを停止する。
	 */
	stopAll(): void {
		const audioSystemIds = Object.keys(this._systems);
		for (var i = 0; i < audioSystemIds.length; ++i) this._systems[audioSystemIds[i]].stopAll();
	}

	/**
	 * @private
	 */
	_reset(): void {
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
		if (this._playbackRate === rate) return;

		this._playbackRate = rate;
		for (var id in this._systems) {
			if (!this._systems.hasOwnProperty(id)) continue;
			this._systems[id]._setPlaybackRate(rate);
		}
	}
}
