import { AudioAssetLike } from "./AudioAssetLike";
import { AudioPlayerLike } from "./AudioPlayerLike";

export interface AudioSystemLike {
	id: string;
	volume: number;

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
}
