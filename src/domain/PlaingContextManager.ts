import { PlaingContextLike } from "../interfaces/PlaingContextLike";
import { PlaingContextManagerLike } from "../interfaces/PlaingContextManagerLike";
import { PlayableDataLike } from "../interfaces/PlayableDataLike";

export class PlaingContextManager implements PlaingContextManagerLike {
	_soundContexts: PlaingContextLike[];
	_musicContexts: PlaingContextLike;
	_muted: boolean;
	_playbackRate: number;
	hoge: number[];

	constructor() {
		// nop
		this._muted = false;
		this._playbackRate = 1.0;
		this._musicContexts = undefined;
		this._soundContexts = [];
		this.hoge = [];
	}

	addContext(ctx: PlaingContextLike): void {
		if (ctx.id === "music") {
			this._musicContexts = ctx;
		} else {
			this._soundContexts.push(ctx);
		}
	}
	removeContext(ctx: PlaingContextLike): void {
		if (ctx.id === "music") {
			this._musicContexts.stop();
			this._musicContexts = undefined;
		} else {
			this._soundContexts = this._soundContexts.filter(target => target !== ctx);
		}
	}

	requestDestroy(asset: PlayableDataLike): void {
		throw new Error("Method not implemented.");
	}

	findMusicContext(asset: PlayableDataLike): PlaingContextLike[] {
		// if (this.player.currentAudio && this.player.currentAudio.id === asset.id) return [this.player];
		return [this._musicContexts];
		// return [];
	}
	findSoundContext(asset: PlayableDataLike): PlaingContextLike[] {
		var ret: PlaingContextLike[] = [];
		for (let i = 0; i < this._soundContexts.length; ++i) {
			if (this._soundContexts[i].currentAudioData && this._soundContexts[i].currentAudioData.id === asset.id)
				ret.push(this._soundContexts[i]);
		}
		return ret;
	}

	findContext(asset: PlayableDataLike): PlaingContextLike[] {
		if (asset.id === "music") return this.findMusicContext(asset);
		else return this.findSoundContext(asset);
	}
	stopAll(): void {
		if (this._musicContexts) this._musicContexts.stop();

		const ctxs = this._soundContexts;
		for (let i = 0; i < ctxs.length; ++i) {
			ctxs[i].stop();
		}
	}
	_reset(): void {
		this._muted = false;
		this._playbackRate = 1.0;
		for (let i = 0; i < this._soundContexts.length; ++i) {
			this._soundContexts[i]._reset();
		}

		this._musicContexts._reset();
	}
	_setMuted(muted: boolean): void {
		if (this._muted === muted) return;

		this._muted = muted;
		for (let i = 0; i < this._soundContexts.length; ++i) {
			this._soundContexts[i]._setMuted(muted);
		}
	}
	_setPlaybackRate(value: number): void {
		throw new Error("Method not implemented.");
	}
}
