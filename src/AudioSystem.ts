namespace g {
	export class AudioSystem {
		id: string;
		game: Game;
		_volume: number;
		_muted: boolean;
		_destroyRequestedAssets:  {[key: string]: Asset};
		_playbackRate: number;

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

		constructor(id: string, game: Game) {
			var audioSystemManager = game._audioSystemManager;
			this.id = id;
			this.game = game;
			this._volume = 1;
			this._destroyRequestedAssets = {};
			this._muted = audioSystemManager._muted;
			this._playbackRate = audioSystemManager._playbackRate;
		}

		stopAll(): void {
			throw ExceptionFactory.createPureVirtualError("AudioSystem#stopAll");
		}

		findPlayers(asset: AudioAsset): AudioPlayer[] {
			throw ExceptionFactory.createPureVirtualError("AudioSystem#findPlayers");
		}

		createPlayer(): AudioPlayer {
			throw ExceptionFactory.createPureVirtualError("AudioSystem#createPlayer");
		}

		requestDestroy(asset: Asset): void {
			this._destroyRequestedAssets[asset.id] = asset;
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

		_onVolumeChanged(): void {
			throw ExceptionFactory.createPureVirtualError("AudioSystem#_onVolumeChanged");
		}

		_onMutedChanged(): void {
			throw ExceptionFactory.createPureVirtualError("AudioSystem#_onMutedChanged");
		}

		_onPlaybackRateChanged(): void {
			throw ExceptionFactory.createPureVirtualError("AudioSystem#_onPlaybackRateChanged");
		}
	}

	export class MusicAudioSystem extends AudioSystem {
		_player: AudioPlayer;

		/**
		 * 再生を抑止されている `AudioAsset` 。
		 *
		 * 再生速度に非対応の `AudioPlayer` の場合に、等倍速でない速度で再生を試みたアセット。
		 * 再生速度が戻された場合に改めて再生されなおす。
		 * この値は、 `this._player._supportsPlaybackRate()` が偽ある場合にのみ利用される。
		 */
		_suppressingAudio: AudioAsset;

		// Note: 音楽のないゲームの場合に無駄なインスタンスを作るのを避けるため、アクセサを使う
		get player(): AudioPlayer {
			if (! this._player) {
				this._player = this.game.resourceFactory.createAudioPlayer(this);
				this._player.played.handle(this, this._onPlayerPlayed);
				this._player.stopped.handle(this, this._onPlayerStopped);
			}
			return this._player;
		}
		set player(v: AudioPlayer) {
			this._player = v;
		}

		constructor(id: string, game: Game) {
			super(id, game);
			this._player = undefined;
			this._suppressingAudio = undefined;
		}

		findPlayers(asset: AudioAsset): AudioPlayer[] {
			if (this.player.currentAudio && this.player.currentAudio.id === asset.id)
				return [this.player];
			return [];
		}

		createPlayer(): AudioPlayer {
			return this.player;
		}

		stopAll(): void {
			if (!this._player) return;
			this._player.stop();
		}

		_onVolumeChanged(): void {
			this.player.changeVolume(this._volume);
		}

		_onMutedChanged(): void {
			this.player._changeMuted(this._muted);
		}

		_onPlaybackRateChanged(): void {
			var player = this.player;
			player._changePlaybackRate(this._playbackRate);
			if (!player._supportsPlaybackRate()) {
				this._onUnsupportedPlaybackRateChanged();
			}
		}

		_onUnsupportedPlaybackRateChanged(): void {
			// 再生速度非対応の場合のフォールバック: 鳴らそうとして止めていた音があれば鳴らし直す
			if (this._playbackRate === 1.0) {
				if (this._suppressingAudio) {
					var audio = this._suppressingAudio;
					this._suppressingAudio = undefined;
					if (!audio.destroyed()) {
						this.player.play(audio);
					}
				}
			}
		}

		_onPlayerPlayed(e: AudioPlayerEvent): void {
			if (e.player !== this._player)
				throw ExceptionFactory.createAssertionError("MusicAudioSystem#_onPlayerPlayed: unexpected audio player");

			if (e.player._supportsPlaybackRate())
				return;

			// 再生速度非対応の場合のフォールバック: 鳴らさず即止める
			if (this._playbackRate !== 1.0) {
				e.player.stop();
				this._suppressingAudio = e.audio;
			}
		}

		_onPlayerStopped(e: AudioPlayerEvent): void {
			if (this._destroyRequestedAssets[e.audio.id]) {
				delete this._destroyRequestedAssets[e.audio.id];
				e.audio.destroy();
			}
		}
	}

	export class SoundAudioSystem extends AudioSystem {
		players: AudioPlayer[];

		constructor(id: string, game: Game) {
			super(id, game);
			this.players = [];
		}

		createPlayer(): AudioPlayer {
			var player = this.game.resourceFactory.createAudioPlayer(this);
			if (player.canHandleStopped())
				this.players.push(player);

			player.played.handle(this, this._onPlayerPlayed);
			player.stopped.handle(this, this._onPlayerStopped);

			return player;
		}

		findPlayers(asset: AudioAsset): AudioPlayer[] {
			var ret: AudioPlayer[] = [];
			for (var i = 0; i < this.players.length; ++i) {
				if (this.players[i].currentAudio && this.players[i].currentAudio.id === asset.id)
					ret.push(this.players[i]);
			}
			return ret;
		}

		stopAll(): void {
			var players = this.players.concat();
			for (var i = 0; i < players.length; ++i) {
				players[i].stop();	// auto remove
			}
		}

		_onMutedChanged(): void {
			var players = this.players;
			for (var i = 0; i < players.length; ++i) {
				players[i]._changeMuted(this._muted);
			}
		}

		_onPlaybackRateChanged(): void {
			var players = this.players;
			for (var i = 0; i < players.length; ++i) {
				players[i]._changePlaybackRate(this._playbackRate);
			}
		}

		_onPlayerPlayed(e: AudioPlayerEvent): void {
			if (e.player._supportsPlaybackRate())
				return;

			// 再生速度非対応の場合のフォールバック: 鳴らさず即止める
			if (this._playbackRate !== 1.0) {
				e.player.stop();
			}
		}

		_onPlayerStopped(e: AudioPlayerEvent): void {
			var index = this.players.indexOf(e.player);
			if (index < 0)
				return;

			e.player.stopped.remove(this, this._onPlayerStopped);

			this.players.splice(index, 1);

			if (this._destroyRequestedAssets[e.audio.id]) {
				delete this._destroyRequestedAssets[e.audio.id];
				e.audio.destroy();
			}
		}

		_onVolumeChanged(): void {
			for (var i = 0; i < this.players.length; ++i) {
				this.players[i].changeVolume(this._volume);
			}
		}
	}
}
