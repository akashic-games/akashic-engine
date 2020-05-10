import { MusicAudioSystem, SoundAudioSystem } from "../implementations/AudioSystem";
import { AudioSystemLike } from "../pdi-types/AudioSystemLike";
import { ResourceFactoryLike } from "../pdi-types/ResourceFactoryLike";

/**
 * `AudioSystem` の管理クラス。
 *
 * 複数の `AudioSystem` に一括で必要な状態設定を行う。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
 */
export class AudioSystemManager {
	/**
	 * ループ再生可能な AudioSystem
	 */
	music: AudioSystemLike;

	/**
	 * 効果音を扱う AudioSystem
	 */
	sound: AudioSystemLike;

	/**
	 * @private
	 */
	_muted: boolean;

	constructor(resourceFactory: ResourceFactoryLike) {
		this._muted = false;
		this._initializeAudioSystems(resourceFactory);
	}

	/**
	 * @private
	 */
	_reset(): void {
		this._muted = false;
		this.music._reset();
		this.sound._reset();
	}

	/**
	 * @private
	 */
	_setMuted(muted: boolean): void {
		if (this._muted === muted) return;

		this._muted = muted;
		this.music._setMuted(muted);
		this.sound._setMuted(muted);
	}

	/**
	 * @private
	 */
	_setPlaybackRate(rate: number): void {
		this.music._setPlaybackRate(rate);
		this.sound._setPlaybackRate(rate);
	}

	/**
	 * @private
	 */
	_initializeAudioSystems(resourceFactory: ResourceFactoryLike): void {
		this.music = new MusicAudioSystem({
			id: "music",
			muted: this._muted,
			resourceFactory: resourceFactory
		});
		this.sound = new SoundAudioSystem({
			id: "sound",
			muted: this._muted,
			resourceFactory: resourceFactory
		});
	}
}
