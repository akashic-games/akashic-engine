import { Trigger } from "@akashic/trigger";
import { VideoAssetLike } from "./VideoAssetLike";

export interface VideoPlayerEvent {
	player: VideoPlayerLike;
	video: VideoAssetLike;
}

/**
 * ビデオ再生を行うインターフェース。
 *
 * ゲーム開発者は本クラスのインスタンスを直接生成すべきではない。
 */
export interface VideoPlayerLike {
	/**
	 * 再生中のビデオアセット。
	 * 再生中のものがない場合、 `undefined` 。
	 */
	currentVideo: VideoAssetLike;

	/**
	 * `play()` が呼び出された時に通知される `Trigger` 。
	 */
	played: Trigger<VideoPlayerEvent>;

	/**
	 * `stop()` が呼び出された時に通知される `Trigger` 。
	 */
	stopped: Trigger<VideoPlayerEvent>;

	/**
	 * 音量。
	 *
	 * 0 (無音) 以上 1.0 (最大) 以下の数値である。
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更してはならない。
	 * 音量を変更したい場合、  `changeVolume()` メソッドを用いること。
	 */
	volume: number;

	/**
	 * @private
	 */
	_loop: boolean;

	/**
	 * `VideoAsset` を再生する。
	 *
	 * 再生後、 `this.played` がfireされる。
	 * @param Video 再生するビデオアセット
	 */
	play(videoAsset: VideoAssetLike): void;

	/**
	 * 再生を停止する。
	 *
	 * 再生中でない場合、何もしない。
	 * 停止後、 `this.stopped` がfireされる。
	 */
	stop(): void;

	/**
	 * 音量を変更する。
	 *
	 * エンジンユーザが `VideoPlayer` の派生クラスを実装する場合は、
	 *  このメソッドをオーバーライドして実際に音量を変更する処理を行うこと。
	 *  オーバーライド先のメソッドはこのメソッドを呼びださなければならない。
	 * @param volume 音量。0以上1.0以下でなければならない
	 */
	changeVolume(volume: number): void;
}
