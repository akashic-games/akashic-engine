import { CommonSize } from "../types/commons";
import { Destroyable } from "../types/Destroyable";
import { GlyphLike } from "./GlyphLike";
import { SurfaceAtlasLike } from "./SurfaceAtlasLike";

/**
 * SurfaceAtlasが効率よく動作するためのヒント。
 *
 * ゲーム開発者はSurfaceAtlasが効率よく動作するための各種初期値・最大値などを提示できる。
 * SurfaceAtlasはこれを参考にするが、そのまま採用するとは限らない。
 */
export interface SurfaceAtlasSetHint {
	/**
	 * 初期アトラス幅。
	 */
	initialAtlasWidth?: number;

	/**
	 * 初期アトラス高さ。
	 */
	initialAtlasHeight?: number;

	/**
	 * 最大アトラス幅。
	 */
	maxAtlasWidth?: number;

	/**
	 * 最大アトラス高さ。
	 */
	maxAtlasHeight?: number;

	/**
	 * 最大アトラス保持数。
	 */
	maxAtlasNum?: number;
}

/**
 * DynamicFontで使用される、SurfaceAtlasを管理する。
 */
export interface SurfaceAtlasSetLike extends Destroyable {
	/**
	 * サーフェスアトラスを追加する。
	 *
	 * 保持している_surfaceAtlasesの数が最大値以上の場合、削除してから追加する。
	 *
	 * このメソッドは、このSurfaceAtlasSetに紐づいている `DynamnicFont` の `constructor` から暗黙に呼び出される。
	 * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
	 */
	addAtlas(): void;

	/**
	 * 引数で指定されたindexのサーフェスアトラスを取得する。
	 *
	 * このメソッドは、このSurfaceAtlasSetに紐づいている `DynamnicFont` の `glyphForCharacter()` から暗黙に呼び出される。
	 * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
	 * @param index 取得対象のインデックス
	 */
	getAtlas(index: number): SurfaceAtlasLike;

	/**
	 * サーフェスアトラスの保持数を取得する。
	 *
	 * このメソッドは、このSurfaceAtlasSetに紐づいている `DynamnicFont` の `glyphForCharacter()` から暗黙に呼び出される。
	 * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
	 */
	getAtlasNum(): number;

	/**
	 * 最大サーフェスアトラス保持数取得する。
	 */
	getMaxAtlasNum(): number;

	/**
	 * 最大アトラス保持数設定する。
	 *
	 * 設定された値が、現在保持している_surfaceAtlasesの数より大きい場合、
	 * removeLeastFrequentlyUsedAtlas()で設定値まで削除する。
	 * @param value 設定値
	 */
	changeMaxAtlasNum(value: number): void;

	/**
	 * サーフェスアトラスのサイズを取得する。
	 *
	 * このメソッドは、このSurfaceAtlasSetに紐づいている `DynamnicFont` の `glyphForCharacter()` から暗黙に呼び出される。
	 * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
	 */
	getAtlasSize(): CommonSize;

	/**
	 * サーフェスアトラスにグリフを追加する。
	 *
	 * このメソッドは、このSurfaceAtlasSetに紐づいている `DynamnicFont` の `glyphForCharacter()` から暗黙に呼び出される。
	 * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
	 * @param glyph グリフ
	 */
	addGlyph(glyph: GlyphLike): SurfaceAtlasLike;
}
