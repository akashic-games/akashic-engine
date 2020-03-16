import { Trigger } from "@akashic/trigger";
import { CommonSize } from "../types/commons";
import { RendererLike } from "./RendererLike";

/**
 * 描画領域を表すインターフェース。
 */
export interface SurfaceLike extends CommonSize {
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
	onAnimationStart: Trigger<void>;

	/**
	 * アニメーション再生停止イベント。
	 * isDynamicが偽の時undefined。
	 */
	onAnimationStop: Trigger<void>;

	/**
	 * アニメーション再生開始イベント。
	 * isDynamicが偽の時undefined。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onAnimationStart` を利用すること。
	 */
	animatingStarted: Trigger<void>;

	/**
	 * アニメーション再生停止イベント。
	 * isDynamicが偽の時undefined。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onAnimationStop` を利用すること。
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

	/**
	 * オブジェクトを破棄する。
	 */
	destroy(): void;

	/**
	 * 破棄されたオブジェクトかどうかを判定する。
	 */
	destroyed(): boolean;
}
