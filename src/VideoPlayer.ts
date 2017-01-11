namespace g {
	export interface VideoPlayerEvent {
		player: VideoPlayer;
		video: VideoAsset;
	}

	/**
	 * ビデオ再生を行うクラス。
	 *
	 * ゲーム開発者は本クラスのインスタンスを直接生成すべきではない。
	 */
	export class VideoPlayer {
		/**
		 * 再生中のビデオアセット。
		 * 再生中のものがない場合、 `undefined` 。
		 */
		currentVideo: VideoAsset;

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

		_loop: boolean;

		/**
		 * `VideoPlayer` のインスタンスを生成する。
		 */
		constructor(loop?: boolean) {
			this._loop = !!loop;
			this.played = new Trigger<VideoPlayerEvent>();
			this.stopped = new Trigger<VideoPlayerEvent>();
			this.currentVideo = undefined;
			this.volume = 1.0;
		}

		/**
		 * `VideoAsset` を再生する。
		 *
		 * 再生後、 `this.played` がfireされる。
		 * @param Video 再生するビデオアセット
		 */
		play(videoAsset: VideoAsset): void {
			this.currentVideo = videoAsset;
			this.played.fire({
				player: this,
				video: videoAsset
			});
			videoAsset.asSurface().animatingStarted.fire();
		}

		/**
		 * 再生を停止する。
		 *
		 * 再生中でない場合、何もしない。
		 * 停止後、 `this.stopped` がfireされる。
		 */
		stop(): void {
			var videoAsset = this.currentVideo;
			this.stopped.fire({
				player: this,
				video: videoAsset
			});
			videoAsset.asSurface().animatingStopped.fire();
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
}
