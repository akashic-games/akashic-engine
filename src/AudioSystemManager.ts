import type { AudioAsset, ResourceFactory } from "@akashic/pdi-types";
import type { AudioPlayContext } from "./AudioPlayContext";
import type { AudioSystem } from "./AudioSystem";
import { MusicAudioSystem, SoundAudioSystem } from "./AudioSystem";
import { ExceptionFactory } from "./ExceptionFactory";

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
	music: AudioSystem;

	/**
	 * 効果音を扱う AudioSystem
	 */
	sound: AudioSystem;

	/**
	 * @private
	 */
	_muted: boolean = false;

	/**
	 * @private
	 */
	_resourceFactory: ResourceFactory;

	constructor(resourceFactory: ResourceFactory) {
		this._resourceFactory = resourceFactory;
		this.music = new MusicAudioSystem({
			id: "music",
			muted: this._muted,
			resourceFactory
		});
		this.sound = new SoundAudioSystem({
			id: "sound",
			muted: this._muted,
			resourceFactory
		});
	}

	/**
	 * 対象の音声アセットの AudioPlayContext を生成する。
	 *
	 * @param asset 音声アセット
	 */
	create(asset: AudioAsset): AudioPlayContext {
		if (asset._system.id === "music") {
			return this.music.create(asset);
		} else if (asset._system.id === "sound") {
			return this.sound.create(asset);
		} else {
			throw ExceptionFactory.createAssertionError(
				`AudioSystemManager#create(): unknown systemId "${asset._system.id}" for asset ID "${asset.id}"`
			);
		}
	}

	/**
	 * 対象の音声アセットの AudioPlayContext を生成し、再生する。
	 *
	 * @param asset 音声アセット
	 */
	play(asset: AudioAsset): AudioPlayContext {
		if (asset._system.id === "music") {
			return this.music.play(asset);
		} else if (asset._system.id === "sound") {
			return this.sound.play(asset);
		} else {
			throw ExceptionFactory.createAssertionError(
				`AudioSystemManager#play(): unknown systemId "${asset._system.id}" for asset ID "${asset.id}"`
			);
		}
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

	_startSuppress(): void {
		this.music._startSuppress();
		this.sound._startSuppress();
	}

	_endSuppress(): void {
		this.music._endSuppress();
		this.sound._endSuppress();
	}

	stopAll(): void {
		this.music.stopAll();
		this.sound.stopAll();
	}
}
