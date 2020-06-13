import { AudioAssetLike } from "../pdi-types/AudioAssetLike";
import { AudioPlayerEvent, AudioPlayerLike } from "../pdi-types/AudioPlayerLike";
import { AudioSystemLike } from "../pdi-types/AudioSystemLike";
import { ResourceFactoryLike } from "../pdi-types/ResourceFactoryLike";
import { ExceptionFactory } from "./ExceptionFactory";

export interface AudioSystemParameterObject {
	/**
	 * オーディオシステムのID
	 */
	id: string;

	/**
	 * オーディオのボリューム
	 */
	volume?: number;

	/**
	 * ミュート中か否か。
	 */
	muted?: boolean;

	/**
	 * 各種リソースのファクトリ
	 */
	resourceFactory: ResourceFactoryLike;
}

export abstract class AudioSystem implements AudioSystemLike {
	id: string;

	/**
	 * @private
	 */
	_volume: number;

	/**
	 * @private
	 */
	_muted: boolean;

	/**
	 * @private
	 */
	_destroyRequestedAssets: { [key: string]: AudioAssetLike };

	/**
	 * 再生速度が等倍以外に指定された等の要因により、音声再生が抑制されているかどうか。
	 * @private
	 */
	_suppressed: boolean;

	/**
	 * @private
	 */
	_resourceFactory: ResourceFactoryLike;

	/**
	 * 明示的に設定された、ミュート中か否か。
	 * @private
	 */
	_explicitMuted: boolean;

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

	constructor(param: AudioSystemParameterObject) {
		this.id = param.id;
		this._volume = param.volume || 1;
		this._destroyRequestedAssets = {};
		this._explicitMuted = param.muted || false;
		this._suppressed = false;
		this._muted = false;
		this._resourceFactory = param.resourceFactory;
		this._updateMuted();
	}

	abstract stopAll(): void;

	abstract findPlayers(asset: AudioAssetLike): AudioPlayerLike[];

	abstract createPlayer(): AudioPlayerLike;

	requestDestroy(asset: AudioAssetLike): void {
		this._destroyRequestedAssets[asset.id] = asset;
	}

	/**
	 * @private
	 */
	_reset(): void {
		this.stopAll();
		this._volume = 1;
		this._destroyRequestedAssets = {};
		this._muted = false;
		this._suppressed = false;
		this._explicitMuted = false;
	}

	/**
	 * @private
	 */
	_setMuted(value: boolean): void {
		var before = this._explicitMuted;
		this._explicitMuted = !!value;
		if (this._explicitMuted !== before) {
			this._updateMuted();
			this._onMutedChanged();
		}
	}

	/**
	 * @private
	 */
	_setPlaybackRate(value: number): void {
		if (value < 0 || isNaN(value) || typeof value !== "number")
			throw ExceptionFactory.createAssertionError("AudioSystem#playbackRate: expected: greater or equal to 0.0, actual: " + value);

		this._suppressed = value !== 1.0;
		this._updateMuted();
	}

	/**
	 * @private
	 */
	_updateMuted(): void {
		this._muted = this._explicitMuted || this._suppressed;
	}

	/**
	 * @private
	 */
	abstract _onVolumeChanged(): void;

	/**
	 * @private
	 */
	abstract _onMutedChanged(): void;
}

export class MusicAudioSystem extends AudioSystem {
	/**
	 * @private
	 */
	_player: AudioPlayerLike | undefined;

	// Note: 音楽のないゲームの場合に無駄なインスタンスを作るのを避けるため、アクセサを使う
	get player(): AudioPlayerLike {
		if (!this._player) {
			this._player = this._resourceFactory.createAudioPlayer(this);
			this._player.onPlay.add(this._handlePlay, this);
			this._player.onStop.add(this._handleStop, this);
		}
		return this._player;
	}
	set player(v: AudioPlayerLike) {
		this._player = v;
	}

	constructor(param: AudioSystemParameterObject) {
		super(param);
		this._player = undefined;
	}

	findPlayers(asset: AudioAssetLike): AudioPlayerLike[] {
		if (this.player.currentAudio && this.player.currentAudio.id === asset.id) return [this.player];
		return [];
	}

	createPlayer(): AudioPlayerLike {
		return this.player;
	}

	stopAll(): void {
		if (!this._player) return;
		this._player.stop();
	}

	/**
	 * @private
	 */
	_reset(): void {
		super._reset();
		if (this._player) {
			this._player.onPlay.remove(this._handlePlay, this);
			this._player.onStop.remove(this._handleStop, this);
		}
		this._player = undefined;
	}

	/**
	 * @private
	 */
	_onVolumeChanged(): void {
		this.player._notifyVolumeChanged();
	}

	/**
	 * @private
	 */
	_onMutedChanged(): void {
		this.player._changeMuted(this._muted);
	}

	/**
	 * @private
	 */
	_setPlaybackRate(rate: number): void {
		super._setPlaybackRate(rate);
		this.player._changeMuted(this._muted);
	}

	/**
	 * @private
	 */
	_handlePlay(e: AudioPlayerEvent): void {
		if (e.player !== this._player)
			throw ExceptionFactory.createAssertionError("MusicAudioSystem#_onPlayerPlayed: unexpected audio player");
	}

	/**
	 * @private
	 */
	_handleStop(e: AudioPlayerEvent): void {
		if (this._destroyRequestedAssets[e.audio.id]) {
			delete this._destroyRequestedAssets[e.audio.id];
			e.audio.destroy();
		}
	}
}

export class SoundAudioSystem extends AudioSystem {
	players: AudioPlayerLike[];

	constructor(param: AudioSystemParameterObject) {
		super(param);
		this.players = [];
	}

	createPlayer(): AudioPlayerLike {
		var player = this._resourceFactory.createAudioPlayer(this);
		if (player.canHandleStopped()) this.players.push(player);

		player.onPlay.add(this._handlePlay, this);
		player.onStop.add(this._handleStop, this);

		return player;
	}

	findPlayers(asset: AudioAssetLike): AudioPlayerLike[] {
		var ret: AudioPlayerLike[] = [];
		for (var i = 0; i < this.players.length; ++i) {
			const currentAudio = this.players[i].currentAudio;
			if (currentAudio && currentAudio.id === asset.id) ret.push(this.players[i]);
		}
		return ret;
	}

	stopAll(): void {
		var players = this.players.concat();
		for (var i = 0; i < players.length; ++i) {
			players[i].stop(); // auto remove
		}
	}

	/**
	 * @private
	 */
	_reset(): void {
		super._reset();
		for (var i = 0; i < this.players.length; ++i) {
			var player = this.players[i];
			player.onPlay.remove(this._handlePlay, this);
			player.onStop.remove(this._handleStop, this);
		}
		this.players = [];
	}

	/**
	 * @private
	 */
	_onMutedChanged(): void {
		var players = this.players;
		for (var i = 0; i < players.length; ++i) {
			players[i]._changeMuted(this._muted);
		}
	}

	/**
	 * @private
	 */
	_setPlaybackRate(rate: number): void {
		super._setPlaybackRate(rate);

		var players = this.players;
		if (this._suppressed) {
			for (var i = 0; i < players.length; ++i) {
				players[i]._changeMuted(true);
			}
		}
	}

	/**
	 * @private
	 */
	_handlePlay(_e: AudioPlayerEvent): void {
		// do nothing
	}

	/**
	 * @private
	 */
	_handleStop(e: AudioPlayerEvent): void {
		var index = this.players.indexOf(e.player);
		if (index < 0) return;

		e.player.onStop.remove(this._handleStop, this);
		this.players.splice(index, 1);
		if (this._destroyRequestedAssets[e.audio.id]) {
			delete this._destroyRequestedAssets[e.audio.id];
			e.audio.destroy();
		}
	}

	/**
	 * @private
	 */
	_onVolumeChanged(): void {
		for (var i = 0; i < this.players.length; ++i) {
			this.players[i]._notifyVolumeChanged();
		}
	}
}
