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
		 * @param codeOrGraphemes 文字コード、もしくはgrapheme cluster
		 */
		glyphForCharacter(codeOrGraphemes: number | string): Glyph;
	}
}
