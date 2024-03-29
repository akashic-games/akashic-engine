import type { Renderer } from "@akashic/pdi-types";

/**
 * カメラを表すインターフェース。
 */
export interface Camera {
	/**
	 * このカメラがローカルであるか否か。
	 */
	local: boolean;

	/**
	 * @private
	 */
	_applyTransformToRenderer: (renderer: Renderer) => void;

	serialize(): any;
}
