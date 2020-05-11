/**
 * 描画時の合成方法。
 *
 * - `"source-over"`: 先に描画された領域の上に描画する。
 * - `"source-atop"`: 先に描画された領域と重なった部分のみを描画する。
 * - `"lighter"`: 先に描画された領域と重なった部分の色を加算して描画する。
 * - `"copy"`: 先に描画された領域を全て無視して描画する。
 * - `"experimental-source-in"`: 先に描画された領域と重なった部分に描画を行い、それ以外の部分を透明にする。
 * - `"experimental-source-out"`: 先に描画された領域と重なっていない部分に描画を行い、それ以外の部分を透明にする。
 * - `"experimental-destination-atop"`: 描画する領域だけを表示し、先に描画された領域と重なった部分は描画先を表示する。
 * - `"experimental-destination-in"`: 先に描画された領域と重なっていない部分を透明にし、重なった部分は描画先を表示する。
 * - `"destination-out"`: 描画する領域を透明にする。
 * - `"destination-over"`: 先に描画された領域の下に描画する。
 * - `"xor"`: 先に描画された領域と重なった部分のみ透明にする。
 *
 * `experimental-` がつくものは、環境によって描画結果が大きく異なることがある。
 * 動作については HTML5 Canvas の globalCompositeOperation も参照のこと。
 * (ただし将来にわたってそれと互換である保証はない)
 */
export type CompositeOperationString =
	| "source-over"
	| "source-atop"
	| "lighter"
	| "copy"
	| "experimental-source-in"
	| "experimental-source-out"
	| "experimental-destination-atop"
	| "experimental-destination-in"
	| "destination-out"
	| "destination-over"
	| "xor";
