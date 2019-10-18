import { RendererLike } from "../interfaces/RendererLike";

/**
 * カメラを表すインターフェース。
 */
export interface Camera {
	/**
	 * このカメラのID。
	 * カメラ生成時に暗黙に設定される値。
	 * `local` が真である場合、この値は `undefined` である。
	 */
	id: number;

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
