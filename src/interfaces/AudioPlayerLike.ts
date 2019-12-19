import { Trigger } from "@akashic/trigger";
import { AudioAssetLike } from "./AudioAssetLike";

export interface AudioPlayerEvent {
	player: AudioPlayerLike;
	audio: AudioAssetLike;
}

/**
 * サウンド再生を行うインターフェース。
 *
 * 本クラスのインスタンスは、 `AudioSystem#createPlayer()` によって明示的に、
 * または `AudioAsset#play()` によって暗黙的に生成される。
 * ゲーム開発者は本クラスのインスタンスを直接生成すべきではない。
 */
export interface AudioPlayerLike {
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
	 * 再生速度の倍率。
	 * @private
	 */
	_playbackRate: number;

	/**
	 * 非等倍速度で開始したか否か。
	 * @private
	 */
	_isStartSkipping: boolean;

	/**
	 * `AudioAsset` を再生する。
	 *
	 * 再生後、 `this.played` がfireされる。
	 * @param audio 再生するオーディオアセット
	 */
	play(audio: AudioAssetLike): void;

	/**
	 * 再生を停止する。
	 *
	 * 停止後、 `this.stopped` がfireされる。
	 * 再生中でない場合、何もしない(`stopped` もfireされない)。
	 */
	stop(): void;

	/**
	 * 音声の終了を検知できるか否か。
	 * 通常、ゲーム開発者がこのメソッドを利用する必要はない。
	 */
	canHandleStopped(): boolean;

	/**
	 * 音量を変更する。
	 *
	 * @param volume 音量。0以上1.0以下でなければならない
	 */
	// エンジンユーザが `AudioPlayer` の派生クラスを実装する場合は、
	// `_changeMuted()` などと同様、このメソッドをオーバーライドして実際に音量を変更する処理を行うこと。
	// オーバーライド先のメソッドはこのメソッドを呼びださなければならない。
	changeVolume(volume: number): void;

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
	_changeMuted(muted: boolean): void;

	/**
	 * 再生速度を変更する。
	 *
	 * エンジンユーザが `AudioPlayer` の派生クラスを実装する場合、
	 * このメソッドをオーバーライドして実際に再生速度を変更する処理を行うこと。
	 * オーバーライド先のメソッドはこのメソッドを呼びださなければならない。
	 *
	 * @param rate 再生速度の倍率。0以上でなければならない。1.0で等倍である。
	 * @private
	 */
	_changePlaybackRate(rate: number): void;

	/**
	 * AudioSystemによる音量変更通知。
	 * @param volume
	 */
	_notifySystemVolumeChanged(volume: number): void;
	/**
	 * AudioSystemによるミュート状態変更通知。
	 * @param muted
	 */
	_notifyMutedChanged(muted: boolean): void;
	/**
	 * AudioSystemによる再生速度の変更通知。
	 *
	 * 等倍速度から非等倍速度へ変更となった場合、ミュートにする。
	 * ただし、変更前に等倍速度で再生されていた音はミュートにしない。
	 * 非等倍速度から等倍速度へ変更となった場合、AudioSystemが非ミュートでプレイヤーがミュート状態であればミュートを解除する。
	 *
	 * @param rate 再生速度の倍率。0以上でなければならない。1.0で等倍である。
	 */
	_notifyPlaybackRateChanged(rate: number): void;
}
