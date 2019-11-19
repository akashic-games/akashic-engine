import { PlaingContextLike } from "./PlaingContextLike";
import { PlayableDataLike } from "./PlayableDataLike";

export interface PlaingContextManagerLike {
	_soundContexts: PlaingContextLike[];
	_musicContexts: PlaingContextLike;

	addContext(ctx: PlaingContextLike): void;

	removeContext(ctx: PlaingContextLike): void;

	stopAll(): void;

	findContext(asset: PlayableDataLike): PlaingContextLike[];

	findMusicContext(asset: PlayableDataLike): PlaingContextLike[];

	findSoundContext(asset: PlayableDataLike): PlaingContextLike[];

	requestDestroy(asset: PlayableDataLike): void;

	/**
	 * @private
	 */
	_reset(): void;

	/**
	 * @private
	 */
	// _setMuted(value: boolean): void;
	_setMuted(muted: boolean, systems: { [key: string]: PlaingContextLike }): void;

	/**
	 * @private
	 */
	_setPlaybackRate(value: number): void;
}
