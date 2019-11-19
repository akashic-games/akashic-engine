import { Trigger } from "../Trigger";
import { PlayableDataLike } from "./PlayableDataLike";

export interface AudioContextEvent {
	context: PlaingContextLike;
	audioData: PlayableDataLike;
}

export interface PlaingContextLike {
	id: string;

	/**
	 * @private
	 */
	_volume: number;

	/**
	 * @private
	 */
	_muted: boolean;

	/**
	 * @private
	 */
	// _destroyRequestedAssets: { [key: string]: PlayableDataLike };

	/**
	 * @private
	 */
	_playbackRate: number;

	/**
	 * 再生中のオーディオアセット。
	 * 再生中のものがない場合、 `undefined` 。
	 */
	currentAudioData: PlayableDataLike;

	/**
	 * `play()` が呼び出された時に通知される `Trigger` 。
	 */
	played: Trigger<AudioContextEvent>;

	/**
	 * `stop()` が呼び出された時に通知される `Trigger` 。
	 */
	stopped: Trigger<AudioContextEvent>;

	/**
	 * `AudioAsset` を再生する。
	 *
	 * 再生後、 `this.played` がfireされる。
	 * @param audio 再生するオーディオアセット
	 */
	play(audio: PlayableDataLike): void;

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
	 * エンジンユーザが `AudioPlayer` の派生クラスを実装し、
	 * かつ `this._supportsPlaybackRate()` をオーバライドして真を返すようにするならば、
	 * このメソッドもオーバーライドして実際に再生速度を変更する処理を行うこと。
	 * オーバーライド先のメソッドはこのメソッドを呼びださなければならない。
	 *
	 * @param rate 再生速度の倍率。0以上でなければならない。1.0で等倍である。
	 * @private
	 */
	_changePlaybackRate(rate: number): void;

	/**
	 * 再生速度の変更に対応するか否か。
	 *
	 * エンジンユーザが `AudioPlayer` の派生クラスを実装し、
	 * 再生速度の変更に対応する場合、このメソッドをオーバーライドして真を返さねばならない。
	 * その場合 `_changePlaybackRate()` もオーバーライドし、実際の再生速度変更処理を実装しなければならない。
	 *
	 * なおここで「再生速度の変更に対応する」は、任意の速度で実際に再生できることを意味しない。
	 * 実装は等倍速 (再生速度1.0) で実際に再生できなければならない。
	 * しかしそれ以外の再生速度が指定された場合、実装はまるで音量がゼロであるかのように振舞ってもよい。
	 *
	 * このメソッドが偽を返す場合、エンジンは音声の非等倍速度再生に対するデフォルトの処理を実行する。
	 * @private
	 */
	_supportsPlaybackRate(): boolean;

	/**
	 * 音量の変更を通知する。
	 * @deprecated このメソッドは実験的に導入されたが、利用されていない。将来的に削除される。
	 */
	_onVolumeChanged(): void;

	_onPlaybackRateChanged(): void;

	_onMutedChanged(): void;

	_reset(): void;

	_setMuted(value: boolean): void;

	_setPlaybackRate(value: number): void;

	stopAll(): void;
}

export interface MusicContextLike extends PlaingContextLike {
	type: "music";
	// _suppressingAudio: AudioAssetLike2;
}

export interface SoundContextLike extends PlaingContextLike {
	type: "sound";
	_onPlayerPlayed(e: AudioContextEvent): void;
	_onPlayerStopped(e: AudioContextEvent): void;
}
