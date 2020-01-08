import { Trigger } from "@akashic/trigger";
import { AudioAssetLike } from "../interfaces/AudioAssetLike";
import { AudioPlayerEvent, AudioPlayerLike } from "../interfaces/AudioPlayerLike";

export interface AudioPlayerParameterObject {
	volume: number;
	muted: boolean;
}

/**
 * サウンド再生を行うクラス。
 *
 * 本クラスのインスタンスは、 `AudioSystem#createPlayer()` によって明示的に、
 * または `AudioAsset#play()` によって暗黙的に生成される。
 * ゲーム開発者は本クラスのインスタンスを直接生成すべきではない。
 */
export class AudioPlayer implements AudioPlayerLike {
	/**
	 * 再生中のオーディオアセット。
	 * 再生中のものがない場合、 `undefined` 。
	 */
	currentAudio: AudioAssetLike;

	/**
	 * `play()` が呼び出された時に通知される `Trigger` 。
	 */
	played: Trigger<AudioPlayerEvent>;

	/**
	 * `stop()` が呼び出された時に通知される `Trigger` 。
	 */
	stopped: Trigger<AudioPlayerEvent>;

	/**
	 * 音量。
	 *
	 * 0 (無音) 以上 1.0 (最大) 以下の数値である。
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更してはならない。
	 * 音量を変更したい場合、  `changeVolume()` メソッドを用いること。
	 */
	volume: number;

	/**
	 * ミュート中か否か。
	 * @private
	 */
	_muted: boolean;

	/**
	 * `AudioPlayer` のインスタンスを生成する。
	 */
	constructor(param: AudioPlayerParameterObject) {
		this.played = new Trigger<AudioPlayerEvent>();
		this.stopped = new Trigger<AudioPlayerEvent>();
		this.currentAudio = undefined;
		this.volume = param.volume;
		this._muted = param.muted;
	}

	/**
	 * `AudioAsset` を再生する。
	 *
	 * 再生後、ミュート中でなければ `this.played` がfireされる。
	 * @param audio 再生するオーディオアセット
	 */
	play(audio: AudioAssetLike): void {
		this.currentAudio = audio;
		if (this._muted) return;
		this.played.fire({
			player: this,
			audio: audio
		});
	}

	/**
	 * 再生を停止する。
	 *
	 * 停止後、 `this.stopped` がfireされる。
	 * 再生中でない場合、何もしない(`stopped` もfireされない)。
	 */
	stop(): void {
		var audio = this.currentAudio;
		if (!audio) return;
		this.currentAudio = undefined;
		this.stopped.fire({
			player: this,
			audio: audio
		});
	}

	/**
	 * 音声の終了を検知できるか否か。
	 * 通常、ゲーム開発者がこのメソッドを利用する必要はない。
	 */
	canHandleStopped(): boolean {
		return true;
	}

	/**
	 * 音量を変更する。
	 *
	 * @param volume 音量。0以上1.0以下でなければならない
	 */
	// エンジンユーザが `AudioPlayer` の派生クラスを実装する場合は、
	// `_changeMuted()` などと同様、このメソッドをオーバーライドして実際に音量を変更する処理を行うこと。
	// オーバーライド先のメソッドはこのメソッドを呼びださなければならない。
	changeVolume(volume: number): void {
		this.volume = volume;
	}

	/**
	 * ミュート状態を変更する。
	 *
	 * エンジンユーザが `AudioPlayer` の派生クラスを実装する場合は、
	 * このメソッドをオーバーライドして実際にミュート状態を変更する処理を行うこと。
	 * オーバーライド先のメソッドはこのメソッドを呼びださなければならない。
	 *
	 * @param muted ミュート状態にするか否か
	 * @private
	 */
	_changeMuted(muted: boolean): void {
		this._muted = muted;
	}
}
