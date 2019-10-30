import { CommonSize } from "../types/commons";
import { Destroyable } from "../types/Destroyable";
import { SurfaceAtlasSlotLike } from "./SurfaceAtlasSlotLike";
import { SurfaceLike } from "./SurfaceLike";

/**
 * サーフェスアトラス。
 *
 * 与えられたサーフェスの指定された領域をコピーし一枚のサーフェスにまとめる。
 */
export interface SurfaceAtlasLike extends Destroyable {
	/**
	 * @private
	 */
	_surface: SurfaceLike;

	/**
	 * @private
	 */
	_accessScore: number;

	/**
	 * サーフェスを追加する。
	 *
	 * @param surface 追加するサーフェス
	 */
	addSurface(surface: SurfaceLike, offsetX: number, offsetY: number, width: number, height: number): SurfaceAtlasSlotLike;

	/**
	 * サーフェスアトラスの大きさを取得する。
	 */
	getAtlasSize(): CommonSize;
}
