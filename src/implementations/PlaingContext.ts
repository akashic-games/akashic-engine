import { ExceptionFactory } from "../commons/ExceptionFactory";
// import { AudioSystemManager } from "../domain/AudioSystemManager";
import { AudioContextEvent, PlaingContextLike } from "../interfaces/PlaingContextLike";
// import { PlaingContextManagerLike } from "../interfaces/PlaingContextManagerLike";
import { PlayableDataLike } from "../interfaces/PlayableDataLike";
import { ResourceFactoryLike } from "../interfaces/ResourceFactoryLike";
import { Trigger } from "../Trigger";

export interface PlaingContextParameterObject {
	id: string;

	// plaingContextManager: PlaingContextManagerLike;

	resourceFactory: ResourceFactoryLike;
}

export abstract class PlaingContext implements PlaingContextLike {
	id: string;
	_volume: number;
	_muted: boolean;
	_destroyRequestedAssets: { [key: string]: PlayableDataLike };
	_playbackRate: number;
	currentAudioData: PlayableDataLike;
	played: Trigger<AudioContextEvent>;
	stopped: Trigger<AudioContextEvent>;
	_resourceFactory: ResourceFactoryLike;
	// _contextManager: any;

	// volumeの変更時には通知が必要なのでアクセサを使う。
	// 呼び出し頻度が少ないため許容。
	get volume(): number {
		return this._volume;
	}

	set volume(value: number) {
		if (value < 0 || value > 1 || isNaN(value) || typeof value !== "number")
			throw ExceptionFactory.createAssertionError("AudioSystem#volume: expected: 0.0-1.0, actual: " + value);

		this._volume = value;
		this._onVolumeChanged();
	}

	constructor(param: PlaingContextParameterObject) {
		this.id = param.id;
		this._volume = 1;
		this._resourceFactory = param.resourceFactory;
	}

	play(playData: PlayableDataLike): void {
		this.currentAudioData = playData;
		this.played.fire({
			context: this,
			audioData: playData
		});
	}
	stop(): void {
		if (!this.currentAudioData) return;
		this.currentAudioData = undefined;
		this.stopped.fire({
			context: this,
			audioData: this.currentAudioData
		});
	}

	requestDestroy(playData: PlayableDataLike): void {
		this._destroyRequestedAssets[playData.id] = playData;
	}

	/**
	 * 音声の終了を検知できるか否か。
	 * 通常、ゲーム開発者がこのメソッドを利用する必要はない。
	 */
	canHandleStopped(): boolean {
		return true;
	}
	changeVolume(volume: number): void {
		this.volume = volume;
	}

	abstract _onMutedChanged(): void;
	abstract _onPlaybackRateChanged(): void;
	abstract stopAll(): void;

	_reset(): void {
		this.stopAll();
		this._volume = 1;
		this._destroyRequestedAssets = {};
		this._muted = this._muted;
		this._playbackRate = this._playbackRate;
	}

	_changeMuted(muted: boolean): void {
		this._muted = muted;
	}
	_changePlaybackRate(rate: number): void {
		this._playbackRate = rate;
	}
	_supportsPlaybackRate(): boolean {
		return false;
	}
	_onVolumeChanged(): void {
		this.changeVolume(this._volume);
	}

	_setMuted(value: boolean): void {
		var before = this._muted;
		this._muted = !!value;
		if (this._muted !== before) {
			this._onMutedChanged();
		}
	}
	_setPlaybackRate(value: number): void {
		if (value < 0 || isNaN(value) || typeof value !== "number")
			throw ExceptionFactory.createAssertionError("AudioSystem#playbackRate: expected: greater or equal to 0.0, actual: " + value);

		var before = this._playbackRate;
		this._playbackRate = value;
		if (this._playbackRate !== before) {
			this._onPlaybackRateChanged();
		}
	}
}

export class MusicContext extends PlaingContext {
	get context(): PlaingContextLike {
		if (!this._context) {
			this._context = this._resourceFactory.createAudioContext(this);
			this._context.played.add(this._onPlayerPlayed, this);
			this._context.stopped.add(this._onPlayerStopped, this);
		}
		return this._context;
	}
	set context(ctx: PlaingContextLike) {
		this._context = ctx;
	}
	_context: PlaingContextLike;
	_suppressingAudio: PlayableDataLike;

	constructor(param: PlaingContextParameterObject) {
		super(param);
		this._context = undefined;
		this._suppressingAudio = undefined;
	}

	stopAll(): void {
		if (!this._context) return;
		this._context.stop();
	}

	_onMutedChanged(): void {
		this.context.changeVolume(this._volume);
	}

	_onPlaybackRateChanged(): void {
		this.context._changePlaybackRate(this._playbackRate);
		if (!this.context._supportsPlaybackRate()) {
			this._onUnsupportedPlaybackRateChanged();
		}
	}
	_onUnsupportedPlaybackRateChanged(): void {
		// 再生速度非対応の場合のフォールバック: 鳴らそうとしてミュートしていた音があれば鳴らし直す
		if (this._playbackRate === 1.0) {
			if (this._suppressingAudio) {
				const audio = this._suppressingAudio;
				this._suppressingAudio = undefined;
				if (!audio.isDestroy()) {
					this.context._changeMuted(false);
				}
			}
		}
	}

	_reset(): void {
		super._reset();
		if (this._context) {
			this._context.played.remove({ owner: this, func: this._onPlayerPlayed });
			this._context.stopped.remove({ owner: this, func: this._onPlayerStopped });
		}
		this._context = undefined;
		this._suppressingAudio = undefined;
	}

	_onPlayerPlayed(e: AudioContextEvent): void {
		if (e.context !== this._context)
			throw ExceptionFactory.createAssertionError("MusicAudioSystem#_onPlayerPlayed: unexpected audio player");

		if (e.context._supportsPlaybackRate()) return;

		// 再生速度非対応の場合のフォールバック: 鳴らさず即ミュートにする
		if (this._playbackRate !== 1.0) {
			e.context._changeMuted(true);
			this._suppressingAudio = e.audioData;
		}
	}
	_onPlayerStopped(e: AudioContextEvent): void {
		if (this._suppressingAudio) {
			this._suppressingAudio = undefined;
			this.context._changeMuted(false);
		}
		if (this._destroyRequestedAssets[e.context.id]) {
			delete this._destroyRequestedAssets[e.context.id];
			e.audioData.destroy();
		}
	}

	_onVolumeChanged(): void {
		this.context.changeVolume(this._volume);
	}
}

export class SoundContext extends PlaingContext {
	contexts: PlaingContextLike[];

	constructor(param: PlaingContextParameterObject) {
		super(param);
		this.contexts = [];
	}

	/**
	 * @private
	 */
	_onMutedChanged(): void {
		var ctxs = this.contexts;
		for (var i = 0; i < ctxs.length; ++i) {
			ctxs[i]._changeMuted(this._muted);
		}
	}
	/**
	 * @private
	 */
	_onPlaybackRateChanged(): void {
		var ctxs = this.contexts;
		for (var i = 0; i < ctxs.length; ++i) {
			ctxs[i]._changePlaybackRate(this._playbackRate);

			// 再生速度非対応の場合のフォールバック: 即止める
			if (!ctxs[i]._supportsPlaybackRate() && this._playbackRate !== 1.0) {
				ctxs[i].stop();
			}
		}
	}
	/**
	 * @private
	 */
	_onPlayerPlayed(e: AudioContextEvent): void {
		if (e.context._supportsPlaybackRate()) return;

		// 再生速度非対応の場合のフォールバック: 鳴らさず即止める
		if (this._playbackRate !== 1.0) {
			e.context.stop();
		}
	}
	/**
	 * @private
	 */
	_onPlayerStopped(e: AudioContextEvent): void {
		var index = this.contexts.indexOf(e.context);
		if (index < 0) return;

		e.context.stopped.remove({ owner: this, func: this._onPlayerStopped });
		this.contexts.splice(index, 1);
		if (this._destroyRequestedAssets[e.audioData.id]) {
			delete this._destroyRequestedAssets[e.audioData.id];
			e.audioData.destroy();
		}
	}

	/**
	 * @private
	 */
	_onVolumeChanged(): void {
		for (var i = 0; i < this.contexts.length; ++i) {
			this.contexts[i].changeVolume(this._volume);
		}
	}

	_reset(): void {
		super._reset();
		for (var i = 0; i < this.contexts.length; ++i) {
			const ctx = this.contexts[i];
			ctx.played.remove({ owner: this, func: this._onPlayerPlayed });
			ctx.stopped.remove({ owner: this, func: this._onPlayerStopped });
		}
		this.contexts = [];
	}

	stopAll(): void {
		for (var i = 0; i < this.contexts.length; ++i) {
			this.contexts[i].stop(); // auto remove
		}
	}
}
