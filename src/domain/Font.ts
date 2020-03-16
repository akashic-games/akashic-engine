import { GlyphLike } from "../interfaces/GlyphLike";
import { Destroyable } from "../types/Destroyable";
import { TextMetrics } from "../types/TextMetrix";
import { Util } from "./Util";

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
	abstract glyphForCharacter(code: number): GlyphLike;

	abstract destroy(): void;

	abstract destroyed(): boolean;

	/**
	 * 対象の文字列を一行で描画した際の計測情報を返す。
	 *
	 * @param text 文字列
	 */
	measureText(text: string): TextMetrics {
		let width = 0;
		let actualBoundingBoxLeft = 0;
		let actualBoundingBoxRight = 0;
		let lastGlyph: GlyphLike;

		for (let i = 0; i < text.length; i++) {
			const code = Util.charCodeAt(text, i);
			if (!code) continue;

			const glyph = this.glyphForCharacter(code);
			if (!glyph || glyph.x < 0 || glyph.y < 0 || glyph.width < 0 || glyph.height < 0) continue;

			if (i === 0) {
				actualBoundingBoxLeft = -glyph.offsetX;
			}

			lastGlyph = glyph;
			width += glyph.advanceWidth;
		}

		if (lastGlyph) {
			actualBoundingBoxRight = width + lastGlyph.offsetX + lastGlyph.width - lastGlyph.advanceWidth;
		}

		return {
			width,
			actualBoundingBoxLeft,
			actualBoundingBoxRight
		};
	}
}
