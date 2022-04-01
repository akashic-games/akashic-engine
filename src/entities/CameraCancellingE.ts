import type { Renderer } from "@akashic/pdi-types";
import type { Camera } from "../Camera";
import type { Camera2D } from "../Camera2D";
import { Object2D } from "../Object2D";
import type { EParameterObject } from "./E";
import { E } from "./E";

/**
 * カメラのtransformを戻すエンティティ。
 * 特定シーンのエンティティがカメラの影響を受けないようにするための内部エンティティ。
 */
export class CameraCancellingE extends E {
	_canceller: Object2D;

	constructor(param: EParameterObject) {
		super(param);
		this._canceller = new Object2D();
	}

	renderSelf(renderer: Renderer, camera?: Camera): boolean {
		if (!this.children) return false;

		if (camera) {
			const c = camera as Camera2D;
			const canceller = this._canceller;
			if (
				c.x !== canceller.x ||
				c.y !== canceller.y ||
				c.angle !== canceller.angle ||
				c.scaleX !== canceller.scaleX ||
				c.scaleY !== canceller.scaleY
			) {
				canceller.x = c.x;
				canceller.y = c.y;
				canceller.angle = c.angle;
				canceller.scaleX = c.scaleX;
				canceller.scaleY = c.scaleY;
				if (canceller._matrix) {
					canceller._matrix._modified = true;
				}
			}
			renderer.save();
			renderer.transform(canceller.getMatrix()._matrix);
		}

		// Note: concatしていないのでunsafeだが、render中に配列の中身が変わる事はない前提とする
		const children = this.children;
		for (let i = 0; i < children.length; ++i) children[i].render(renderer, camera);

		if (camera) {
			renderer.restore();
		}
		return false;
	}
}
