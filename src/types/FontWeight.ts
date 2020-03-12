import { Util } from "../domain/Util";

/**
 * 文字列描画のフォントウェイト。
 * @deprecated 非推奨である。将来的に削除される。代わりに `FontWeightString` を利用すること。
 */
export enum FontWeight {
	/**
	 * 通常のフォントウェイト。
	 */
	Normal,
	/**
	 * 太字のフォントウェイト。
	 */
	Bold
}

export type FontWeightString = "normal" | "bold";

/** FontWeightを対応する文字列に変換する */
export const toFontWeightString = (weight: FontWeight): string => {
	return Util.toLowerCamel(FontWeight[weight]);
};
