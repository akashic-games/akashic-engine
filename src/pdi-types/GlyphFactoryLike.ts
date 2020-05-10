import { FontWeightString } from "./FontWeightString";
import { GlyphLike } from "./GlyphLike";

/**
 * グリフファクトリ。
 *
 * `DynamicFont` はこれを利用してグリフを生成する。
 *
 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
 */
export interface GlyphFactoryLike {
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
	 * グリフの生成。
	 *
	 * `DynamicFont` はこれを用いてグリフを生成する。
	 *
	 * @param code 文字コード
	 */
	create(code: number): GlyphLike;
}
