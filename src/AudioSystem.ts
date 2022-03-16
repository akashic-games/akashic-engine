import type { AudioAsset, AudioPlayer, AudioPlayerEvent, ResourceFactory, AudioSystem as PdiAudioSystem } from "@akashic/pdi-types";
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
	resourceFactory: ResourceFactory;
}

export abstract class AudioSystem implements PdiAudioSystem {
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
	_destroyRequestedAssets: { [key: string]: AudioAsset };

	/**
	 * 再生速度が等倍以外に指定された等の要因により、音声再生が抑制されているかどうか。
	 * @private
	 */
	_suppressed: boolean;

	/**
	 * @private
	 */
	_resourceFactory: ResourceFactory;

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

	abstract findPlayers(asset: AudioAsset): AudioPlayer[];

	abstract createPlayer(): AudioPlayer;

	requestDestroy(asset: AudioAsset): void {
		this._destroyRequestedAssets[asset.id] = asset;
	}

	/**
	 * `this.requestDestroy()` により破棄要求されているアセットの破棄を取り消す。
	 * @param asset アセット。
	 */
	// NOTE: akashic-engine の独自仕様
	cancelRequestDestroy(asset: AudioAsset): void {
		delete this._destroyRequestedAssets[asset.id];
	}

	/**
	 * `this.requestDestroy()` により破棄要求されていて、まだ実際には破棄されていないアセット。
	 * 対象のアセットが破棄要求されていなければ `null` を返す。
	 * @param assetId アセットID。
	 */
	// NOTE: akashic-engine の独自仕様
	getDestroyRequestedAsset(assetId: string): AudioAsset | null {
		if (this._destroyRequestedAssets.hasOwnProperty(assetId)) {
			return this._destroyRequestedAssets[assetId];
		}

		return null;
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
		const before = this._explicitMuted;
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
	_player: AudioPlayer | undefined;

	// Note: 音楽のないゲームの場合に無駄なインスタンスを作るのを避けるため、アクセサを使う
	get player(): AudioPlayer {
		if (!this._player) {
			this._player = this._resourceFactory.createAudioPlayer(this);
			this._player.onPlay.add(this._handlePlay, this);
			this._player.onStop.add(this._handleStop, this);
		}
		return this._player;
	}
	set player(v: AudioPlayer) {
		this._player = v;
	}

	constructor(param: AudioSystemParameterObject) {
		super(param);
		this._player = undefined;
	}

	findPlayers(asset: AudioAsset): AudioPlayer[] {
		if (this.player.currentAudio && this.player.currentAudio.id === asset.id) return [this.player];
		return [];
	}

	createPlayer(): AudioPlayer {
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
	players: AudioPlayer[];

	constructor(param: AudioSystemParameterObject) {
		super(param);
		this.players = [];
	}

	createPlayer(): AudioPlayer {
		const player = this._resourceFactory.createAudioPlayer(this);
		if (player.canHandleStopped()) this.players.push(player);

		player.onPlay.add(this._handlePlay, this);
		player.onStop.add(this._handleStop, this);

		return player;
	}

	findPlayers(asset: AudioAsset): AudioPlayer[] {
		const ret: AudioPlayer[] = [];
		for (let i = 0; i < this.players.length; ++i) {
			const currentAudio = this.players[i].currentAudio;
			if (currentAudio && currentAudio.id === asset.id) ret.push(this.players[i]);
		}
		return ret;
	}

	stopAll(): void {
		const players = this.players.concat();
		for (let i = 0; i < players.length; ++i) {
			players[i].stop(); // auto remove
		}
	}

	/**
	 * @private
	 */
	_reset(): void {
		super._reset();
		for (let i = 0; i < this.players.length; ++i) {
			const player = this.players[i];
			player.onPlay.remove(this._handlePlay, this);
			player.onStop.remove(this._handleStop, this);
		}
		this.players = [];
	}

	/**
	 * @private
	 */
	_onMutedChanged(): void {
		const players = this.players;
		for (let i = 0; i < players.length; ++i) {
			players[i]._changeMuted(this._muted);
		}
	}

	/**
	 * @private
	 */
	_setPlaybackRate(rate: number): void {
		super._setPlaybackRate(rate);

		const players = this.players;
		if (this._suppressed) {
			for (let i = 0; i < players.length; ++i) {
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
		const index = this.players.indexOf(e.player);
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
		for (let i = 0; i < this.players.length; ++i) {
			this.players[i]._notifyVolumeChanged();
		}
	}
}
