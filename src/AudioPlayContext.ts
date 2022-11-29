import type { AudioAsset, AudioPlayer, AudioSystem, ResourceFactory } from "@akashic/pdi-types";
import { Trigger } from "@akashic/trigger";

export interface AudioPlayContextPlayEvent {}
export interface AudioPlayContextStopEvent {}

export interface AudioPlayContextParameterObject {
	resourceFactory: ResourceFactory;
	system: AudioSystem; // TODO: AudioSystem への依存を削除
	asset: AudioAsset;
	volume?: number;
	muted?: boolean;
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
	_player: AudioPlayer | null = null;

	/**
	 * @private
	 */
	_volume: number;

	/**
	 * @private
	 */
	_muted: boolean;

	get volume(): number {
		return this._volume;
	}

	get muted(): boolean {
		return this._muted;
	}

	constructor(param: AudioPlayContextParameterObject) {
		this.asset = param.asset;
		this._system = param.system;
		this._resourceFactory = param.resourceFactory;
		this._volume = param.volume ?? 1.0;
		this._muted = !!param.muted;

		this.onPlay.add(this._handlePlay, this);
		this.onStop.add(this._handleStop, this);
	}

	play(): void {
		if (this._player) {
			// 一つの Context で再生できる AudioPlayer は一つまでとする
			this.stop();
		}

		this._player = this._createPlayer();
		this._player.play(this.asset);
	}

	stop(): void {
		// NOTE: AudioPlayer#stop() を呼んだ時点で AudioPlayer が開放される
		this._player?.stop();
		this._player = null;
	}

	changeVolume(vol: number): void {
		this._volume = vol;
		this._player?.changeVolume(vol);
	}

	changeMute(muted: boolean): void {
		this._muted = muted;
		this._player?._changeMuted(muted);
	}

	private _createPlayer(): AudioPlayer {
		const audioPlayer = this._resourceFactory.createAudioPlayer(this._system);
		audioPlayer.changeVolume(this._volume);
		audioPlayer._changeMuted(this._muted);
		audioPlayer.onPlay.add(this._handleAudioPlayerPlay, this);
		audioPlayer.onStop.add(this._handleAudioPlayerStop, this);
		return audioPlayer;
	}

	private _handleAudioPlayerPlay(): void {
		this.onPlay.fire({});
	}

	private _handleAudioPlayerStop(): void {
		this.onStop.fire({});
	}

	private _handlePlay(): void {
		// do nothing
	}

	private _handleStop(): void {
		// do nothing
	}
}
