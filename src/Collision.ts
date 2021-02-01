import { CommonArea, CommonOffset } from "@akashic/pdi-types";
import { E } from "./entities/E";
import { Util } from "./Util";

// 外積の絶対値
function absCross(v1: CommonOffset, v2: CommonOffset): number {
	return v1.x * v2.y - v1.y * v2.x;
}

// 二次元ベクトルの減算
function sub(v1: CommonOffset, v2: CommonOffset): CommonOffset {
	return { x: v1.x - v2.x, y: v1.y - v2.y };
}

/**
 * オブジェクトなどの衝突判定機能を提供する。
 */
export module Collision {
	/**
	 * 二つのエンティティの衝突判定を行い、その結果を返す。
	 *
	 * 回転・拡大されたエンティティや、親の異なるエンティティ同士も扱える汎用の衝突判定処理。
	 * ただし計算量が多いので、大量のエンティティ間のすべての衝突を確認するような状況では利用を避けることが望ましい。
	 * 親が同じで回転・拡大を行わないエンティティ同士の場合は、より軽量な Collision.intersectAreas() を利用すること。
	 * 親が同じで中心座標同士の距離だけで判定してよい場合は、より軽量な Collision.withinAreas() を利用すること。
	 *
	 * 対象のエンティティの座標や大きさなどを変更した場合、
	 * この関数の呼び出し前にそのエンティティの modified() を呼び出しておく必要がある。
	 *
	 * @param e1 衝突判定するエンティティ
	 * @param e2 衝突判定するエンティティ
	 * @param area1 e1 の当たり判定領域。省略された場合、`{ x: 0, y: 0, width: e1.width, hegiht: e1.height }`
	 * @param area2 e2 の当たり判定領域。省略された場合、`{ x: 0, y: 0, width: e2.width, hegiht: e2.height }`
	 */
	export function intersectEntities(e1: E, e2: E, area1?: CommonArea | null, area2?: CommonArea | null): boolean {
		const lca = e1._findLowestCommonAncestorWith(e2);
		if (!lca) return false;

		const r1 = area1
			? { left: area1.x, top: area1.y, right: area1.x + area1.width, bottom: area1.y + area1.height }
			: { left: 0, top: 0, right: e1.width, bottom: e1.height };
		const r2 = area2
			? { left: area2.x, top: area2.y, right: area2.x + area2.width, bottom: area2.y + area2.height }
			: { left: 0, top: 0, right: e2.width, bottom: e2.height };

		const mat1 = e1._calculateMatrixTo(lca);
		const mat2 = e2._calculateMatrixTo(lca);

		// 座標系を合わせる: 共通祖先の座標系に合わせたそれぞれの四隅の点を求める。
		const lt1 = mat1.multiplyPoint({ x: r1.left, y: r1.top });
		const rt1 = mat1.multiplyPoint({ x: r1.right, y: r1.top });
		const lb1 = mat1.multiplyPoint({ x: r1.left, y: r1.bottom });
		const rb1 = mat1.multiplyPoint({ x: r1.right, y: r1.bottom });
		const lt2 = mat2.multiplyPoint({ x: r2.left, y: r2.top });
		const rt2 = mat2.multiplyPoint({ x: r2.right, y: r2.top });
		const lb2 = mat2.multiplyPoint({ x: r2.left, y: r2.bottom });
		const rb2 = mat2.multiplyPoint({ x: r2.right, y: r2.bottom });

		// AABB で枝狩りする。(高速化だけでなく後続の条件を単純化するのにも必要である点に注意)
		const minX1 = Math.min(lt1.x, rt1.x, lb1.x, rb1.x);
		const maxX1 = Math.max(lt1.x, rt1.x, lb1.x, rb1.x);
		const minX2 = Math.min(lt2.x, rt2.x, lb2.x, rb2.x);
		const maxX2 = Math.max(lt2.x, rt2.x, lb2.x, rb2.x);
		if (maxX1 < minX2 || maxX2 < minX1) return false;
		const minY1 = Math.min(lt1.y, rt1.y, lb1.y, rb1.y);
		const maxY1 = Math.max(lt1.y, rt1.y, lb1.y, rb1.y);
		const minY2 = Math.min(lt2.y, rt2.y, lb2.y, rb2.y);
		const maxY2 = Math.max(lt2.y, rt2.y, lb2.y, rb2.y);
		if (maxY1 < minY2 || maxY2 < minY1) return false;

		// 二つの四角形それぞれのいずれかの辺同士が交差するなら衝突している。
		if (
			Collision.intersectLineSegments(lt1, rt1, lt2, rt2) ||
			Collision.intersectLineSegments(lt1, rt1, rt2, rb2) ||
			Collision.intersectLineSegments(lt1, rt1, rb2, lb2) ||
			Collision.intersectLineSegments(lt1, rt1, lb2, lt2) ||
			Collision.intersectLineSegments(rt1, rb1, lt2, rt2) ||
			Collision.intersectLineSegments(rt1, rb1, rt2, rb2) ||
			Collision.intersectLineSegments(rt1, rb1, rb2, lb2) ||
			Collision.intersectLineSegments(rt1, rb1, lb2, lt2) ||
			Collision.intersectLineSegments(rb1, lb1, lt2, rt2) ||
			Collision.intersectLineSegments(rb1, lb1, rt2, rb2) ||
			Collision.intersectLineSegments(rb1, lb1, rb2, lb2) ||
			Collision.intersectLineSegments(rb1, lb1, lb2, lt2) ||
			Collision.intersectLineSegments(lb1, lt1, lt2, rt2) ||
			Collision.intersectLineSegments(lb1, lt1, rt2, rb2) ||
			Collision.intersectLineSegments(lb1, lt1, rb2, lb2) ||
			Collision.intersectLineSegments(lb1, lt1, lb2, lt2)
		) {
			return true;
		}

		// そうでない場合、e1 が e2 を包含しているなら衝突している。
		// ここで辺は交差していないので、e1 が e2 の頂点一つ (lt2) を包含しているなら、全体を包含している。
		// cf. https://ksta.skr.jp/topic/diaryb09.html#040528 "各辺の内側判定による内外判定"
		const s1 = absCross(sub(lt1, rt1), sub(lt2, rt1));
		if (
			s1 * absCross(sub(lb1, lt1), sub(lt2, lt1)) >= 0 &&
			s1 * absCross(sub(rb1, lb1), sub(lt2, lb1)) >= 0 &&
			s1 * absCross(sub(rt1, rb1), sub(lt2, rb1)) >= 0
		) {
			return true;
		}

		// そうでない場合、e2 が e1 を包含しているなら衝突している。
		const s2 = absCross(sub(lt2, rt2), sub(lt1, rt2));
		return (
			s2 * absCross(sub(lb2, lt2), sub(lt1, lt2)) >= 0 &&
			s2 * absCross(sub(rb2, lb2), sub(lt1, lb2)) >= 0 &&
			s2 * absCross(sub(rt2, rb2), sub(lt1, rb2)) >= 0
		);
	}

	/**
	 * 線分同士の衝突判定 (交差判定) を行い、その結果を返す。
	 *
	 * @param {CommonOffset} p1 線分の端点の一つ
	 * @param {CommonOffset} p2 線分の端点の一つ
	 * @param {CommonOffset} q1 もう一つの線分の端点の一つ
	 * @param {CommonOffset} q2 もう一つの線分の端点の一つ
	 */
	export function intersectLineSegments(p1: CommonOffset, p2: CommonOffset, q1: CommonOffset, q2: CommonOffset): boolean {
		// cf. https://ksta.skr.jp/topic/diaryb09.html#040518
		const p = sub(p2, p1);
		const q = sub(q2, q1);
		return (
			absCross(sub(q1, p1), p) * absCross(sub(q2, p1), p) <= 0 && absCross(sub(p1, q1), q) * absCross(sub(p2, q1), q) <= 0 // 符号が違うことを積の符号で判定している
		);
	}

	/**
	 * 矩形交差による衝突判定を行い、その結果を返す。
	 * 戻り値は、二つの矩形t1, t2が交差しているとき真、でなければ偽。
	 *
	 * @param {number} x1 t1のX座標
	 * @param {number} y1 t1のY座標
	 * @param {number} width1 t1の幅
	 * @param {number} height1 t1の高さ
	 * @param {number} x2 t2のX座標
	 * @param {number} y2 t2のY座標
	 * @param {number} width2 t2の幅
	 * @param {number} height2 t2の高さ
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
	 *
	 * 特に、回転・拡大を利用していない、親が同じエンティティ同士の衝突判定に利用することができる。
	 * 条件を満たさない場合は `withinAreas()` や、より重いが正確な `intersectEntities()` の利用を検討すること。
	 *
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
