namespace g {
	/**
	 * フォント。
	 */
	export abstract class Font implements Destroyable {
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
		abstract glyphForCharacter(code: number): Glyph;

		abstract destroy(): void;

		abstract destroyed(): boolean;

		/**
		 * 対象の文字列を一行で描画した際の計測情報を返す。
		 *
		 * @param text 文字列
		 */
		measureText(text: string): TextMetrix {
			let width = 0;
			let offsetX = 0;

			for (let i = 0; i < text.length; i++) {
				const code = g.Util.charCodeAt(text, i);
				if (! code) continue;

				const glyph = this.glyphForCharacter(code);
				if (glyph.x < 0 || glyph.y < 0) continue;
				if (glyph.width < 0 || glyph.height < 0) continue;

				offsetX += glyph.advanceWidth;
				width = offsetX + (glyph.offsetX + glyph.width - glyph.advanceWidth);
			}

			return { width };
		}
	}
}
