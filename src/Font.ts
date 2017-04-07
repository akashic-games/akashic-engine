namespace g {
	/**
	 * フォント。
	 */
	export interface Font extends Destroyable {
		/**
		 * フォントサイズ。
		 *
		 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
		 */
		size: number;

		/**
		 * グリフの取得。
		 *
		 * 取得に失敗するとnullが返る。
		 *
		 * @param code 文字コード
		 */
		glyphForCharacter(code: number): Glyph;
	}
	/**
	 * グリフファクトリ。
	 *
	 * `DynamicFont` はこれを利用してグリフを生成する。
	 *
	 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
	 */
	export abstract class GlyphFactory {
		/**
		 * フォントファミリ。
		 *
		 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
		 */
		fontFamily: FontFamily;

		/**
		 * フォント名。
		 *
		 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
		 */
		abstract get fontName(): string;

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
		fontWeight: g.FontWeight;

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
		 * @param fontFamilyOrName フォントファミリ。g.FontFamilyの定義する定数、フォント名、またはフォント名の配列
		 * @param fontSize フォントサイズ
		 * @param baselineHeight ベースラインの高さ
		 * @param strokeWidth 輪郭幅
		 * @param strokeColor 輪郭色
		 * @param strokeOnly 輪郭を描画するか否か
		 * @param fontWeight フォントウェイト
		 */
		constructor(fontFamilyOrName: FontFamily|string|string[], fontSize: number, baselineHeight: number = fontSize,
		            fontColor: string = "black", strokeWidth: number = 0, strokeColor: string = "black", strokeOnly: boolean = false,
		            fontWeight: FontWeight = FontWeight.Normal) {
			if (typeof fontFamilyOrName === "number") {
				this.fontFamily = fontFamilyOrName;
			} else {
				this.fontFamily = FontFamily.Other;
			}
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
		create(code: number): Glyph {
			throw ExceptionFactory.createPureVirtualError("GlyphFactory#create");
		}
	}
}
