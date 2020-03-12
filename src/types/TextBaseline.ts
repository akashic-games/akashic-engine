import { Util } from "../domain/Util";

/**
 * 文字列描画のベースライン。
 * @deprecated 非推奨である。将来的に削除される。代わりに `TextBaselineString` を利用すること。
 */
export enum TextBaseline {
	/**
	 * em squareの上。
	 */
	Top,
	/**
	 * em squareの中央。
	 */
	Middle,
	/**
	 * 標準的とされるベースライン。Bottomよりやや上方。
	 */
	Alphabetic,
	/**
	 * em squareの下。
	 */
	Bottom
}

export type TextBaselineString = "top" | "middle" | "alphabetic" | "bottom";

/** TextBaselineを対応する文字列に変換する */
export const toTextBaselineString = (textBaseline: TextBaseline): string => {
	return Util.toLowerCamel(TextBaseline[textBaseline]);
};
