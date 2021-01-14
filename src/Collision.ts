import { CommonArea, CommonOffset } from "@akashic/pdi-types";
import { E } from "./entities/E";
import { Util } from "./Util";

// TODO collision-js を部分的に統合する？
type Vec2 = CommonOffset;

function dot(v1: Vec2, v2: Vec2): number {
	return v1.x * v2.x + v1.y * v2.y;
}

function normalize(v: Vec2): Vec2 {
	const len = Math.sqrt(dot(v, v));
	v.x /= len;
	v.y /= len;
	return v;
}

/**
 * 線分と、線分に重なる直線に投影した矩形の交差判定。
 * @param lt 矩形の頂点の一つ
 * @param rt 矩形の頂点の一つ
 * @param lb 矩形の頂点の一つ
 * @param rb 矩形の頂点の一つ
 * @param p0 線分の一端
 * @param p1 線分の一端
 */
function overlapBoxAndSegment(lt: Vec2, rt: Vec2, lb: Vec2, rb: Vec2, p0: Vec2, p1: Vec2): boolean {
	const dir = normalize({ x: p1.x - p0.x, y: p1.y - p0.y });
	const tp0 = dot(p0, dir);
	const tp1 = dot(p1, dir);
	const tlt = dot(lt, dir);
	const trt = dot(rt, dir);
	const tlb = dot(lb, dir);
	const trb = dot(rb, dir);

	const tpMin = Math.min(tp0, tp1);
	const tpMax = Math.max(tp0, tp1);
	const tbMin = Math.min(tlt, trt, tlb, trb);
	const tbMax = Math.max(tlt, trt, tlb, trb);
	return !(tbMax < tpMin || tpMax < tbMin);
}

/**
 * オブジェクトの衝突を表す。
 * - 矩形交差による衝突
 * - 2点間の距離による衝突
 */
export module Collision {
	/**
	 * 二つのエンティティの衝突判定を行い、その結果を返す。
	 *
	 * 回転・拡大されたエンティティや、親の異なるエンティティ同士も扱える汎用の衝突判定処理。
	 * ただし計算量が多いので、大量のオブジェクトとの判定には不向きである。
	 * 親が同じで回転や拡大を行わないエンティティ同士の場合は、より軽量な Collision.intersectAreas() を利用すること。
	 * 親が同じで中心座標同士の距離だけで判定してよい場合は、より軽量な Collision.withinAreas() を利用すること。
	 *
	 * エンティティの座標などを変更した場合、そのエンティティの modified() を呼び出しておく必要がある。
	 *
	 * @param e1 衝突判定するエンティティ
	 * @param e2 衝突判定するエンティティ
	 * @param area1 e1 の当たり判定領域。省略された場合、{ x: 0, y: 0, width: e1.width, hegiht: e1.height }
	 * @param area2 e2 の当たり判定領域。省略された場合、{ x: 0, y: 0, width: e2.width, hegiht: e2.height }
	 */
	export function intersectEntities(e1: E, e2: E, area1?: CommonArea, area2?: CommonArea): boolean {
		const lca = e1.findLowestCommonAncestorWith(e2);
		if (!lca) return false;

		let l1 = 0,
			t1 = 0,
			r1: number,
			b1: number;
		let l2 = 0,
			t2 = 0,
			r2: number,
			b2: number;
		if (area1) {
			l1 = area1.x;
			t1 = area1.y;
			r1 = l1 + area1.width;
			b1 = t1 + area1.height;
		} else {
			r1 = e1.width;
			b1 = e1.height;
		}
		if (area2) {
			l2 = area2.x;
			t2 = area2.y;
			r2 = l2 + area2.width;
			b2 = t2 + area2.height;
		} else {
			r2 = e2.width;
			b2 = e2.height;
		}
		const mat1 = e1.calculateMatrixTo(lca);
		const mat2 = e2.calculateMatrixTo(lca);

		// LCA の座標系に合わせたそれぞれの四隅の点
		const lt1 = mat1.multiplyPoint({ x: l1, y: t1 });
		const rt1 = mat1.multiplyPoint({ x: r1, y: t1 });
		const lb1 = mat1.multiplyPoint({ x: l1, y: b1 });
		const rb1 = mat1.multiplyPoint({ x: r1, y: b1 });
		const lt2 = mat2.multiplyPoint({ x: l2, y: t2 });
		const rt2 = mat2.multiplyPoint({ x: r2, y: t2 });
		const lb2 = mat2.multiplyPoint({ x: l2, y: b2 });
		const rb2 = mat2.multiplyPoint({ x: r2, y: b2 });

		return (
			overlapBoxAndSegment(lt1, rt1, lb1, rb1, lt2, rt2) &&
			overlapBoxAndSegment(lt1, rt1, lb1, rb1, lt2, lb2) &&
			overlapBoxAndSegment(lt2, rt2, lb2, rb2, lt1, rt1) &&
			overlapBoxAndSegment(lt2, rt2, lb2, rb2, lt1, lb1)
		);
	}

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
	 * @param {number} t1x 一点の X 座標
	 * @param {number} t1y 一点の Y 座標
	 * @param {number} t2x もう一点の X 座標
	 * @param {number} t2y もう一点の Y 座標
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
