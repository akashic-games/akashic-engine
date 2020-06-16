import { GlyphLike } from "../pdi-types/GlyphLike";
import { SurfaceAtlasLike } from "../pdi-types/SurfaceAtlasLike";
import { SurfaceLike } from "../pdi-types/SurfaceLike";

/**
 * グリフ。
 *
 * @deprecated 非推奨である。将来的に削除される予定である。
 */
export class Glyph implements GlyphLike {
	/**
	 * 文字コード。
	 */
	code: number;

	/**
	 * サーフェス上の文字のX座標。
	 *
	 * `this.surface` が `undefined` である時、この値は不定である。
	 */
	x: number;

	/**
	 * サーフェス上の文字のY座標。
	 *
	 * `this.surface` が `undefined` である時、この値は不定である。
	 */
	y: number;

	/**
	 * 文字の横幅。
	 *
	 * `this.surface` が `undefined` である時、この値は不定である。
	 */
	width: number;

	/**
	 * 文字の縦幅。
	 *
	 * `this.surface` が `undefined` である時、この値は不定である。
	 */
	height: number;

	/**
	 * 文字を印字したサーフェス。
	 *
	 * 描画すべき内容がない場合 `surface` は `undefined` である。
	 */
	surface: SurfaceLike | undefined;

	/**
	 * X軸方向についての描画位置調整量。
	 *
	 * 基準座標からこの値を加算した位置に描画することで正しい文字間隔に配置される。
	 *
	 * `this.surface` が `undefined` である時、この値は不定である。
	 */
	offsetX: number;

	/**
	 * Y軸方向についての描画位置調整量。
	 *
	 * 基準座標からこの値を加算した位置に描画することで文字のベースラインが一致する。
	 *
	 * `this.surface` が `undefined` である時、この値は不定である。
	 */
	offsetY: number;

	/**
	 * この文字の次の文字の開始位置までの幅。
	 */
	advanceWidth: number;

	/**
	 * `this.surface` が有効か否か。
	 *
	 * `this.surface` が破棄された、または生成後に書き換えられた時は偽。
	 */
	isSurfaceValid: boolean;

	/**
	 * @private
	 * NOTE: 接頭辞に_は付いているが、他クラスから参照されているので @private していいか不明
	 */
	_atlas: SurfaceAtlasLike | null;

	/**
	 * `Glyph` のインスタンスを生成する。
	 * @deprecated 非推奨である。将来的に削除される予定である。
	 */
	constructor(
		code: number,
		x: number,
		y: number,
		width: number,
		height: number,
		offsetX: number = 0,
		offsetY: number = 0,
		advanceWidth: number = width,
		surface?: SurfaceLike,
		isSurfaceValid: boolean = !!surface
	) {
		this.code = code;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.offsetX = offsetX;
		this.offsetY = offsetY;
		this.advanceWidth = advanceWidth;
		this.surface = surface;
		this.isSurfaceValid = isSurfaceValid;
		this._atlas = null;
	}

	/**
	 * グリフの描画上の幅を求める。
	 * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
	 * @param fontSize フォントサイズ
	 */
	renderingWidth(fontSize: number): number {
		if (!this.width || !this.height) {
			return 0;
		}
		return (fontSize / this.height) * this.width;
	}
}
