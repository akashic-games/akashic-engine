import { PlaingContextLike } from "../interfaces/PlaingContextLike";
import { PlayableDataLike } from "../interfaces/PlayableDataLike";
import { Trigger } from "../Trigger";
import { AudioAssetHint } from "../types/AssetConfiguration";

interface PlayableDataParameter {
	id: string;
	duration: number;
	loop: boolean;
	hint: AudioAssetHint;
	volume: number;
	_muted?: boolean;
	_playbackRate?: number;
}

export class PlayableData implements PlayableDataLike {
	id: string;
	duration: number;
	loop: boolean;
	hint: AudioAssetHint;
	volume: number;
	_muted: boolean;
	_playbackRate: number;
	destroyed: Trigger<void>;
	playStart: Trigger<PlaingContextLike>;
	playStop: Trigger<void>;

	constructor(params: PlayableDataParameter) {
		this.id = params.id;
		this.duration = params.duration;
		this.loop = params.loop;
		this.hint = params.hint;
		this._muted = params._muted;
		this._playbackRate = params._playbackRate;
		this.destroyed = new Trigger<void>();
		this.playStart = new Trigger<PlaingContextLike>();
		this.playStop = new Trigger<void>();
	}

	play(): void {
		this.playStart.fire();
	}
	stop(): void {
		this.playStop.fire();
	}

	destroy(): void {
		this.destroyed.fire();
		this.id = undefined;
	}
	isDestroy(): boolean {
		return this.id === undefined;
	}
}
