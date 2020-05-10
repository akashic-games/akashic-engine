import { FontWeightString } from "../pdi-types/FontWeightString";
import { GlyphFactoryLike } from "../pdi-types/GlyphFactoryLike";
import { GlyphLike } from "../pdi-types/GlyphLike";

/**
 * グリフファクトリ。
 *
 * `DynamicFont` はこれを利用してグリフを生成する。
 *
 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
 */
export abstract class GlyphFactory implements GlyphFactoryLike {
	/**
	 * フォントファミリ。
	 *
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 */
	fontFamily: string | string[];

	/**
	 * フォントサイズ。
	 *
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 */
	fontSize: number;

	/**
	 * ベースライン。
	 *
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 */
	baselineHeight: number;

	/**
	 * フォント色。CSS Colorで指定する。
	 *
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 */
	fontColor: string;

	/**
	 * フォントウェイト。
	 *
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 */
	fontWeight: FontWeightString;

	/**
	 * 輪郭幅。
	 *
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 */
	strokeWidth: number;

	/**
	 * 輪郭色。
	 *
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 */
	strokeColor: string;

	/**
	 * 輪郭を描画しているか否か。
	 *
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 */
	strokeOnly: boolean;

	/**
	 * `GlyphFactory` を生成する。
	 *
	 * @param fontFamily フォントファミリ。フォント名、またはそれらの配列
	 * @param fontSize フォントサイズ
	 * @param baselineHeight ベースラインの高さ
	 * @param strokeWidth 輪郭幅
	 * @param strokeColor 輪郭色
	 * @param strokeOnly 輪郭を描画するか否か
	 * @param fontWeight フォントウェイト
	 */
	constructor(
		fontFamily: string | string[],
		fontSize: number,
		baselineHeight: number = fontSize,
		fontColor: string = "black",
		strokeWidth: number = 0,
		strokeColor: string = "black",
		strokeOnly: boolean = false,
		fontWeight: FontWeightString = "normal"
	) {
		this.fontFamily = fontFamily;
		this.fontSize = fontSize;
		this.fontWeight = fontWeight;
		this.baselineHeight = baselineHeight;
		this.fontColor = fontColor;
		this.strokeWidth = strokeWidth;
		this.strokeColor = strokeColor;
		this.strokeOnly = strokeOnly;
	}

	/**
	 * グリフの生成。
	 *
	 * `DynamicFont` はこれを用いてグリフを生成する。
	 *
	 * @param code 文字コード
	 */
	abstract create(code: number): GlyphLike;
}
