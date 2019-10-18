import { CommonArea } from "../interfaces/commons";
import { Util } from "./Util";

/**
 * オブジェクトの衝突を表す。
 * - 矩形交差による衝突
 * - 2点間の距離による衝突
 */
export module Collision {
	/**
	 * 矩形交差による衝突判定を行い、その結果を返す。
	 * 戻り値は、矩形t1, t2が交差しているとき真、でなければ偽。
	 * @param {number} x1 t1-X
	 * @param {number} y1 t1-Y
	 * @param {number} width1 t1幅
	 * @param {number} height1 t1高さ
	 * @param {number} x2 t2-X
	 * @param {number} y2 t2-Y
	 * @param {number} width2 t2幅
	 * @param {number} height2 t2高さ
	 */
	export function intersect(
		x1: number,
		y1: number,
		width1: number,
		height1: number,
		x2: number,
		y2: number,
		width2: number,
		height2: number
	): boolean {
		return x1 <= x2 + width2 && x2 <= x1 + width1 && y1 <= y2 + height2 && y2 <= y1 + height1;
	}

	/**
	 * 矩形交差による衝突判定を行い、その結果を返す。
	 * 戻り値は、矩形t1, t2が交差しているとき真、でなければ偽。
	 * @param {CommonArea} t1 矩形1
	 * @param {CommonArea} t2 矩形2
	 */
	export function intersectAreas(t1: CommonArea, t2: CommonArea): boolean {
		return Collision.intersect(t1.x, t1.y, t1.width, t1.height, t2.x, t2.y, t2.width, t2.height);
	}

	/**
	 * 2点間の距離による衝突判定を行い、その結果を返す。
	 * 戻り値は、2点間の距離が閾値以内であるとき真、でなければ偽。
	 * @param {number} t1x t1-X
	 * @param {number} t1y t1-X
	 * @param {number} t2x t1-X
	 * @param {number} t2y t1-X
	 * @param {number} [distance=1] 衝突判定閾値 [pixel]
	 */
	export function within(t1x: number, t1y: number, t2x: number, t2y: number, distance: number = 1): boolean {
		return distance >= Util.distance(t1x, t1y, t2x, t2y);
	}

	/**
	 * 2つの矩形の中心座標間距離による衝突判定を行い、その結果を返す。
	 * 戻り値は、2点間の距離が閾値以内であるとき真、でなければ偽。
	 * @param {CommonArea} t1 矩形1
	 * @param {CommonArea} t2 矩形2
	 * @param {number} [distance=1] 衝突判定閾値 [pixel]
	 */
	export function withinAreas(t1: CommonArea, t2: CommonArea, distance: number = 1): boolean {
		return distance >= Util.distanceBetweenAreas(t1, t2);
	}
}
