import { Util } from "../domain/Util";

/**
 * 描画時の合成方法。
 * @deprecated 非推奨である。将来的に削除される。代わりに `CompositeOperationString` を利用すること。
 */
export enum CompositeOperation {
	/**
	 * 先に描画された領域の上に描画する。
	 */
	SourceOver,
	/**
	 * 先に描画された領域と重なった部分のみを描画する。
	 */
	SourceAtop,
	/**
	 * 先に描画された領域と重なった部分の色を加算して描画する。
	 */
	Lighter,
	/**
	 * 先に描画された領域を全て無視して描画する。
	 */
	Copy,
	/**
	 * 先に描画された領域と重なった部分に描画を行い、それ以外の部分を透明にする。
	 * 環境により、描画結果が大きく異なる可能性があるため、試験的導入である。
	 */
	ExperimentalSourceIn,
	/**
	 * 先に描画された領域と重なっていない部分に描画を行い、それ以外の部分を透明にする。
	 * 環境により、描画結果が大きく異なる可能性があるため、試験的導入である。
	 */
	ExperimentalSourceOut,
	/**
	 * 描画する領域だけを表示し、先に描画された領域と重なった部分は描画先を表示する。
	 * 環境により、描画結果が大きく異なる可能性があるため、試験的導入である。
	 */
	ExperimentalDestinationAtop,
	/**
	 * 先に描画された領域と重なっていない部分を透明にし、重なった部分は描画先を表示する。
	 * 環境により、描画結果が大きく異なる可能性があるため、試験的導入である。
	 */
	ExperimentalDestinationIn,
	/**
	 * 描画する領域を透明にする。
	 */
	DestinationOut,
	/**
	 * 先に描画された領域の下に描画する。
	 */
	DestinationOver,
	/**
	 * 先に描画された領域と重なった部分のみ透明にする。
	 */
	Xor
}

export type CompositeOperationString =
	| "sourceOver"
	| "sourceAtop"
	| "lighter"
	| "copy"
	| "experimentalSourceIn"
	| "experimentalSourceOut"
	| "experimentalDestinationAtop"
	| "experimentalDestinationIn"
	| "destinationOut"
	| "destinationOver"
	| "xor";

/** CompositeOperationを対応する文字列に変換する */
export const toCompositeOperationString = (operation: CompositeOperation): string => {
	return Util.toLowerCamel(CompositeOperation[operation]);
};
