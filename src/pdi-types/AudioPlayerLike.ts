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
	currentAudio: AudioAssetLike | undefined;

	/**
	 * `play()` が呼び出された時に通知される `Trigger` 。
	 */
	onPlay: Trigger<AudioPlayerEvent>;

	/**
	 * `stop()` が呼び出された時に通知される `Trigger` 。
	 */
	onStop: Trigger<AudioPlayerEvent>;

	/**
	 * 音量。
	 *
	 * 0 (無音) 以上 1.0 (最大) 以下の数値である。
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更してはならない。
	 * 音量を変更したい場合、  `changeVolume()` メソッドを用いること。
	 */
	volume: number;

	/**
	 * `play()` が呼び出された時に通知される `Trigger` 。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onPlay` を利用すること。
	 */
	played: Trigger<AudioPlayerEvent>;

	/**
	 * `stop()` が呼び出された時に通知される `Trigger` 。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onStop` を利用すること。
	 */
	stopped: Trigger<AudioPlayerEvent>;

	/**
	 * ミュート中か否か。
	 * @private
	 */
	_muted: boolean;
	/**
	 * `AudioAsset` を再生する。
	 *
	 * 再生後、 `this.onPlay` がfireされる。
	 * @param audio 再生するオーディオアセット
	 */
	play(audio: AudioAssetLike): void;

	/**
	 * 再生を停止する。
	 *
	 * 停止後、 `this.onStop` がfireされる。
	 * 再生中でない場合、何もしない(`onStop` もfireされない)。
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
	 * 音量の変更を通知する。
	 * @private
	 */
	_notifyVolumeChanged(): void;
}
