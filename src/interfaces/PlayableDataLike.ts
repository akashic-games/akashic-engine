import { AudioAssetHint } from "../types/AssetConfiguration";

export interface PlayableDataLike {
	id: string;
	duration: number;
	loop: boolean;
	hint: AudioAssetHint;

	volume: number;

	/**
	 * ミュート中か否か。
	 * @private
	 */
	_muted?: boolean;

	/**
	 * 再生速度の倍率。
	 * @private
	 */
	_playbackRate?: number;

	play(): void;

	stop(): void;

	destroy(): void;

	isDestroy(): boolean;
}
