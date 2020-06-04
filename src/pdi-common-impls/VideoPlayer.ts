import { Trigger } from "@akashic/trigger";
import { VideoAssetLike } from "../pdi-types/VideoAssetLike";
import { VideoPlayerEvent, VideoPlayerLike } from "../pdi-types/VideoPlayerLike";

/**
 * ビデオ再生を行うクラス。
 *
 * ゲーム開発者は本クラスのインスタンスを直接生成すべきではない。
 */
export class VideoPlayer implements VideoPlayerLike {
	/**
	 * 再生中のビデオアセット。
	 * 再生中のものがない場合、 `undefined` 。
	 */
	currentVideo: VideoAssetLike | undefined;

	/**
	 * `play()` が呼び出された時に通知される `Trigger` 。
	 */
	onPlay: Trigger<VideoPlayerEvent>;

	/**
	 * `stop()` が呼び出された時に通知される `Trigger` 。
	 */
	onStop: Trigger<VideoPlayerEvent>;

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
	played: Trigger<VideoPlayerEvent>;

	/**
	 * `stop()` が呼び出された時に通知される `Trigger` 。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onStop` を利用すること。
	 */
	stopped: Trigger<VideoPlayerEvent>;

	/**
	 * @private
	 */
	_loop: boolean;

	/**
	 * `VideoPlayer` のインスタンスを生成する。
	 */
	constructor(loop?: boolean) {
		this._loop = !!loop;
		this.onPlay = new Trigger<VideoPlayerEvent>();
		this.onStop = new Trigger<VideoPlayerEvent>();
		this.played = this.onPlay;
		this.stopped = this.onStop;
		this.currentVideo = undefined;
		this.volume = 1.0;
	}

	/**
	 * `VideoAsset` を再生する。
	 *
	 * 再生後、 `this.onPlay` がfireされる。
	 * @param Video 再生するビデオアセット
	 */
	play(videoAsset: VideoAssetLike): void {
		this.currentVideo = videoAsset;
		this.onPlay.fire({
			player: this,
			video: videoAsset
		});
	}

	/**
	 * 再生を停止する。
	 *
	 * 再生中でない場合、何もしない。
	 * 停止後、 `this.onStop` がfireされる。
	 */
	stop(): void {
		var videoAsset = this.currentVideo;
		this.onStop.fire({
			player: this,
			video: videoAsset
		});
	}

	/**
	 * 音量を変更する。
	 *
	 * エンジンユーザが `VideoPlayer` の派生クラスを実装する場合は、
	 *  このメソッドをオーバーライドして実際に音量を変更する処理を行うこと。
	 *  オーバーライド先のメソッドはこのメソッドを呼びださなければならない。
	 * @param volume 音量。0以上1.0以下でなければならない
	 */
	changeVolume(volume: number): void {
		this.volume = volume;
	}
}
