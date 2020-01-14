import { ExceptionFactory } from "../commons/ExceptionFactory";
import { AudioAssetLike } from "../interfaces/AudioAssetLike";
import { AudioPlayerEvent, AudioPlayerLike } from "../interfaces/AudioPlayerLike";
import { AudioSystemLike, MusicAudioSystemLike, SoundAudioSystemLike } from "../interfaces/AudioSystemLike";
import { ResourceFactoryLike } from "../interfaces/ResourceFactoryLike";

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
	_isSuppressed: boolean;

	/**
	 * @private
	 */
	_resourceFactory: ResourceFactoryLike;

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
		this._muted = param.muted || false;
		this._isSuppressed = false;
		this._resourceFactory = param.resourceFactory;
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
		this._isSuppressed = false;
	}

	/**
	 * @private
	 */
	_setMuted(value: boolean): void {
		var before = this._muted;
		this._muted = !!value;
		if (this._muted !== before) {
			this._onMutedChanged();
		}
	}

	/**
	 * @private
	 */
	_setPlaybackRate(value: number): void {
		if (value < 0 || isNaN(value) || typeof value !== "number")
			throw ExceptionFactory.createAssertionError("AudioSystem#playbackRate: expected: greater or equal to 0.0, actual: " + value);
	}

	/**
	 * @private
	 */
	abstract _onVolumeChanged(): void;

	/**
	 * @private
	 */
	abstract _onMutedChanged(): void;

	/**
	 * @private
	 */
	abstract _onPlayerPlayed(e: AudioPlayerEvent): void;

	/**
	 * @private
	 */
	abstract _onPlayerStopped(e: AudioPlayerEvent): void;
}

export class MusicAudioSystem extends AudioSystem implements MusicAudioSystemLike {
	/**
	 * @private
	 */
	_player: AudioPlayerLike;

	// Note: 音楽のないゲームの場合に無駄なインスタンスを作るのを避けるため、アクセサを使う
	get player(): AudioPlayerLike {
		if (!this._player) {
			this._player = this._resourceFactory.createAudioPlayer(this);
			this._player.played.add(this._onPlayerPlayed, this);
			this._player.stopped.add(this._onPlayerStopped, this);
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
			this._player.played.remove({ owner: this, func: this._onPlayerPlayed });
			this._player.stopped.remove({ owner: this, func: this._onPlayerStopped });
		}
		this._player = undefined;
	}

	/**
	 * @private
	 */
	_onVolumeChanged(): void {
		this.player.changeVolume(this._volume);
	}

	/**
	 * @private
	 */
	_onMutedChanged(): void {
		// TODO: 現状 _changeMuted() を呼んでいるが、PDI側を修正できるタイミングで AudioSystem から変更通知される `AudioPlayer#_notifyChangeMuted()` を作成し置き換える。
		//       AudioSystemのミュート状態が変更となった時にAudioPlayerへ通知し、AudioPlayerは AudioSystem._muted を参照する。
		//       (AudioPlayerのミュートは公開APIではないので、AudioPlayerのミュートをAudioSystemのミュートで使用する。)
		this.player._changeMuted(this._muted);
	}

	/**
	 * @private
	 */
	_setPlaybackRate(rate: number): void {
		super._setPlaybackRate(rate);
		this._isSuppressed = rate !== 1.0;
		this.player._changeMuted(this._isSuppressed || this._muted);
	}

	/**
	 * @private
	 */
	_onPlayerPlayed(e: AudioPlayerEvent): void {
		if (e.player !== this._player)
			throw ExceptionFactory.createAssertionError("MusicAudioSystem#_onPlayerPlayed: unexpected audio player");
	}

	/**
	 * @private
	 */
	_onPlayerStopped(e: AudioPlayerEvent): void {
		if (this._destroyRequestedAssets[e.audio.id]) {
			delete this._destroyRequestedAssets[e.audio.id];
			e.audio.destroy();
		}
	}
}

export class SoundAudioSystem extends AudioSystem implements SoundAudioSystemLike {
	players: AudioPlayerLike[];

	constructor(param: AudioSystemParameterObject) {
		super(param);
		this.players = [];
	}

	createPlayer(): AudioPlayerLike {
		var player = this._resourceFactory.createAudioPlayer(this);
		if (player.canHandleStopped()) this.players.push(player);

		player.played.add(this._onPlayerPlayed, this);
		player.stopped.add(this._onPlayerStopped, this);

		return player;
	}

	findPlayers(asset: AudioAssetLike): AudioPlayerLike[] {
		var ret: AudioPlayerLike[] = [];
		for (var i = 0; i < this.players.length; ++i) {
			if (this.players[i].currentAudio && this.players[i].currentAudio.id === asset.id) ret.push(this.players[i]);
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
			player.played.remove({ owner: this, func: this._onPlayerPlayed });
			player.stopped.remove({ owner: this, func: this._onPlayerStopped });
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
		this._isSuppressed = rate !== 1.0;

		var players = this.players;
		if (this._isSuppressed) {
			for (var i = 0; i < players.length; ++i) {
				players[i]._changeMuted(true);
			}
		}
	}

	/**
	 * @private
	 */
	_onPlayerPlayed(e: AudioPlayerEvent): void {
		// do nothing
	}

	/**
	 * @private
	 */
	_onPlayerStopped(e: AudioPlayerEvent): void {
		var index = this.players.indexOf(e.player);
		if (index < 0) return;

		e.player.stopped.remove({ owner: this, func: this._onPlayerStopped });
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
			this.players[i].changeVolume(this._volume);
		}
	}
}
