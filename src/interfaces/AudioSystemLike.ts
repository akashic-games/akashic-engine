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

	player: AudioPlayerLike;
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
