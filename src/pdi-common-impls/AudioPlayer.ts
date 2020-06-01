import { Trigger } from "@akashic/trigger";
import { AudioAssetLike } from "../pdi-types/AudioAssetLike";
import { AudioPlayerEvent, AudioPlayerLike } from "../pdi-types/AudioPlayerLike";
import { AudioSystemLike } from "../pdi-types/AudioSystemLike";

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
	 * @private
	 */
	_system: AudioSystemLike;

	/**
	 * `AudioPlayer` のインスタンスを生成する。
	 */
	constructor(system: AudioSystemLike) {
		this.onPlay = new Trigger<AudioPlayerEvent>();
		this.onStop = new Trigger<AudioPlayerEvent>();
		this.played = this.onPlay;
		this.stopped = this.onStop;
		this.currentAudio = undefined;
		this.volume = system.volume;
		this._muted = system._muted;
		this._system = system;
	}

	/**
	 * `AudioAsset` を再生する。
	 *
	 * 再生後、 `this.onPlay` がfireされる。
	 * @param audio 再生するオーディオアセット
	 */
	play(audio: AudioAssetLike): void {
		this.currentAudio = audio;
		this.onPlay.fire({
			player: this,
			audio: audio
		});
	}

	/**
	 * 再生を停止する。
	 *
	 * 停止後、 `this.onStop` がfireされる。
	 * 再生中でない場合、何もしない(`onStop` もfireされない)。
	 */
	stop(): void {
		var audio = this.currentAudio;
		if (!audio) return;
		this.currentAudio = undefined;
		this.onStop.fire({
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

	/**
	 * 音量の変更を通知する。
	 * @private
	 */
	_notifyVolumeChanged(): void {
		// AudioPlayerの音量を AudioSystem の音量で上書きしていたため、最終音量が正常に計算できていなかった。
		// 暫定対応として、 changeVolume() に AudioPlayer 自身の音量を渡す事により最終音量の計算を実行させる。
		this.changeVolume(this.volume);
	}
}
