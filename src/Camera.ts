import { Renderer } from "./pdiTypes";

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
