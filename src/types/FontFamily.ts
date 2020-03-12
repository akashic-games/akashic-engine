import { Util } from "../domain/Util";

/**
 * 文字列描画のフォントファミリ。
 * 現バージョンのakashic-engineの `SystemLabel` 及び `DynamicFont` において、この値の指定は参考値に過ぎない。
 * そのため、 それらにおいて 'fontFamily` プロパティを指定した際、実行環境によっては無視される事がありえる。
 */
export enum FontFamily {
	/**
	 * サンセリフ体。ＭＳ Ｐゴシック等
	 */
	SansSerif,
	/**
	 * セリフ体。ＭＳ 明朝等
	 */
	Serif,
	/**
	 * 等幅。ＭＳ ゴシック等
	 */
	Monospace
}

export type FontFamilyString = "sansSerif" | "serif" | "monospace";

export const toFontFamilyString = (family: FontFamily): string => {
	return Util.toLowerCamel(FontFamily[family]);
};
