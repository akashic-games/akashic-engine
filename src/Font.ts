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

		_realSize: number;

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
	export class GlyphFactory {
		/**
		 * フォントファミリ。
		 *
		 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
		 */
		fontFamily: FontFamily;

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
		 * 文字の描画スタイル。
		 *
		 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
		 */
		strokeOnly: boolean;

		/**
		 * `GlyphFactory` を生成する。
		 *
		 * @param fontFamily フォントファミリ
		 * @param fontSize フォントサイズ
		 * @param baselineHeight ベースラインの高さ
		 * @param strokeWidth 輪郭幅
		 * @param strokeColor 輪郭色
		 * @param strokeOnly 輪郭の描画スタイル
		 */
		constructor(fontFamily: FontFamily, fontSize: number, baselineHeight: number = fontSize,
		            fontColor: string = "black", strokeWidth: number = 0, strokeColor: string = "black", strokeOnly: boolean = false) {
			this.fontFamily = fontFamily;
			this.fontSize = Math.max(fontSize, this.calcMinimumDrawableFontSize());
			this.baselineHeight = baselineHeight;
			this.fontColor = fontColor;
			this.strokeWidth = strokeWidth;
			this.strokeColor = strokeColor;
			this.strokeOnly = strokeOnly;

			if (fontSize !== this.fontSize) {
				const scale = (this.fontSize / fontSize);
				this.baselineHeight = this.baselineHeight * scale;
				this.strokeWidth = this.strokeWidth * scale;
			}
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

		/**
		 * 描画可能なフォントサイズの最小値を取得する。
		 */
		calcMinimumDrawableFontSize(): number {
			throw ExceptionFactory.createPureVirtualError("GlyphFactory#calcMinimumDrawableFontSize");
		}
	}
}
