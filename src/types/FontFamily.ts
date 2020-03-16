/**
 * 文字列描画のフォントファミリ。
 * 現バージョンのakashic-engineの `SystemLabel` 及び `DynamicFont` において、この値の指定は参考値に過ぎない。
 * そのため、 それらにおいて 'fontFamily` プロパティを指定した際、実行環境によっては無視される事がありえる。
 * @deprecated 非推奨である。将来的に削除される。代わりに `FontFamilyString` を利用すること。
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

export type FontFamilyString = "sans-serif" | "serif" | "monospace";
