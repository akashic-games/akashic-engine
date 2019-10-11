import { CommonSize } from "./commons";

/**
 * 描画領域のピクセル情報を表すインターフェース。
 */
export interface ImageData extends CommonSize {
	/**
	 * 描画領域の横幅のピクセル数。
	 */
	width: number;
	/**
	 * 描画領域の縦幅のピクセル数。
	 */
	height: number;
	/**
	 * 描画領域のピクセル情報を、RGBAの各色成分を1byteとした一次配列 (Non-Premultiplied Alpha) として返す。
	 * 各要素の順番は、描画領域の左上から右へ進み、右端に到達したら下の列を走査したものとなる。
	 */
	data: Uint8ClampedArray;
}
