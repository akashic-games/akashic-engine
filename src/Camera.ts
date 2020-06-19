import { Renderer } from "@akashic/akashic-pdi";

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
