import { RendererLike } from "../pdi-types/RendererLike";

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
	_applyTransformToRenderer: (renderer: RendererLike) => void;

	serialize(): any;
}
