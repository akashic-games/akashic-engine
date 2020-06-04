import { SurfaceAtlasLike } from "./SurfaceAtlasLike";
import { SurfaceLike } from "./SurfaceLike";

/**
 * グリフの領域を表すインターフェース。
 */
export interface GlyphArea {
	x: number;
	y: number;
	width?: number;
	height?: number;
	offsetX?: number;
	offsetY?: number;
	advanceWidth?: number;
}

/**
 * グリフ。
 */
export interface GlyphLike {
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

	_atlas: SurfaceAtlasLike | null;
}
