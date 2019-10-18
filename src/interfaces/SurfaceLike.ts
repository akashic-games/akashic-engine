import { Trigger } from "../Trigger";
import { CommonSize } from "./commons";
import { Destroyable } from "./Destroyable";
import { RendererLike } from "./RendererLike";

/**
 * 描画領域を表すインターフェース。
 */
export interface SurfaceLike extends CommonSize, Destroyable {
	/**
	 * 描画領域の幅。
	 * この値を直接書き換えてはならない。
	 */
	width: number;

	/**
	 * 描画領域の高さ。
	 * この値を直接書き換えてはならない。
	 */
	height: number;

	/**
	 * 本Surfaceの画像が動画であるかを示す値。真の時、動画。
	 * この値は参照のみに利用され、変更してはならない。
	 */
	isDynamic: boolean;

	/**
	 * アニメーション再生開始イベント。
	 * isDynamicが偽の時undefined。
	 */
	animatingStarted: Trigger<void>;

	/**
	 * アニメーション再生停止イベント。
	 * isDynamicが偽の時undefined。
	 */
	animatingStopped: Trigger<void>;

	/**
	 * 描画可能な実体。
	 * 具体的には renderer().drawImage() の実装が描画対象として利用できる値。
	 * @private
	 */
	_drawable: any;

	/**
	 * このSurfaceへの描画手段を提供するRendererを生成して返す。
	 */
	renderer(): RendererLike;

	/**
	 * このSurfaceが動画を再生中であるかどうかを判定する。
	 */
	isPlaying(): boolean;
}
