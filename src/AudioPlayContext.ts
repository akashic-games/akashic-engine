import type { AudioAsset, AudioPlayer, AudioSystem, ResourceFactory } from "@akashic/pdi-types";
import { Trigger } from "@akashic/trigger";

export interface AudioPlayContextPlayEvent {}
export interface AudioPlayContextStopEvent {}

export interface AudioPlayContextParameterObject {
	id: string;
	resourceFactory: ResourceFactory;
	system: AudioSystem; // TODO: AudioSystem への依存を削除
	systemId: string;
	asset: AudioAsset;
	volume?: number;
}

export class AudioPlayContext {
	/**
	 * この AudioPlayContext に紐づく音声アセット。
	 */
	readonly asset: AudioAsset;

	/**
	 * `play()` が呼び出された時に通知される `Trigger` 。
	 */
	readonly onPlay: Trigger<AudioPlayContextPlayEvent> = new Trigger();

	/**
	 * `stop()` が呼び出された時に通知される `Trigger` 。
	 */
	readonly onStop: Trigger<AudioPlayContextStopEvent> = new Trigger();

	/**
	 * @private
	 */
	_system: AudioSystem;

	/**
	 * @private
	 */
	_resourceFactory: ResourceFactory;

	/**
	 * @private
	 */
	_player: AudioPlayer;

	/**
	 * @private
	 */
	_volume: number;

	/**
	 * @private
	 */
	_id: string;

	/**
	 * @private
	 */
	_systemId: string;

	get volume(): number {
		return this._volume;
	}

	constructor(param: AudioPlayContextParameterObject) {
		this.asset = param.asset;
		this._system = param.system;
		this._resourceFactory = param.resourceFactory;
		this._volume = param.volume ?? 1.0;
		this._id = param.id;
		this._systemId = param.systemId;
		this._player = this._createAudioPlayer();

		this.asset.onDestroyed.addOnce(this.stop, this);
	}

	play(): void {
		this._player.play(this.asset);
	}

	stop(): void {
		this._player.stop();
	}

	changeVolume(vol: number): void {
		this._volume = vol;
		this._player.changeVolume(vol);
	}

	/**
	 * @private
	 */
	_startSuppress(): void {
		if (this._systemId === "music") {
			this._player.changeVolume(0);
			return;
		}

		this.stop();
	}

	/**
	 * @private
	 */
	_endSuppress(): void {
		if (this._systemId === "music") {
			this._player.changeVolume(this._volume);
			return;
		}
	}

	private _createAudioPlayer(): AudioPlayer {
		const audioPlayer = this._resourceFactory.createAudioPlayer(this._system);
		audioPlayer.changeVolume(this._volume);
		audioPlayer.onPlay.add(this.onPlay.fire, this.onPlay);
		audioPlayer.onStop.add(this.onStop.fire, this.onStop);
		return audioPlayer;
	}
}
