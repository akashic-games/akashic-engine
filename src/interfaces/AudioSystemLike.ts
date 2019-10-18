import { AudioAssetLike } from "./AudioAssetLike";
import { AudioPlayerEvent, AudioPlayerLike } from "./AudioPlayerLike";

export interface AudioSystemLike {
	id: string;
	volume: number;

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
	 * @private
	 */
	_playbackRate: number;

	stopAll(): void;

	findPlayers(asset: AudioAssetLike): AudioPlayerLike[];

	createPlayer(): AudioPlayerLike;

	requestDestroy(asset: AudioAssetLike): void;

	/**
	 * @private
	 */
	_reset(): void;

	/**
	 * @private
	 */
	_setMuted(value: boolean): void;

	/**
	 * @private
	 */
	_setPlaybackRate(value: number): void;

	/**
	 * @private
	 */
	_onVolumeChanged(): void;

	/**
	 * @private
	 */
	_onMutedChanged(): void;

	/**
	 * @private
	 */
	_onPlaybackRateChanged(): void;
}

export interface MusicAudioSystemLike extends AudioSystemLike {
	/**
	 * @private
	 */
	_player: AudioPlayerLike;

	/**
	 * 再生を抑止されている `AudioAsset` 。
	 *
	 * 再生速度に非対応の `AudioPlayer` の場合に、等倍速でない速度で再生を試みたアセット。
	 * 再生速度が戻された場合に改めて再生されなおす。
	 * この値は、 `this._player._supportsPlaybackRate()` が偽ある場合にのみ利用される。
	 * @private
	 */
	_suppressingAudio: AudioAssetLike;

	player: AudioPlayerLike;

	/**
	 * @private
	 */
	_onUnsupportedPlaybackRateChanged(): void;
}

export interface SoundAudioSystemLike extends AudioSystemLike {
	players: AudioPlayerLike[];

	/**
	 * @private
	 */
	_onPlayerStopped(e: AudioPlayerEvent): void;

	/**
	 * @private
	 */
	_onPlayerPlayed(e: AudioPlayerEvent): void;
}
