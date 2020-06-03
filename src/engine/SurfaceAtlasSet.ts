import { CommonSize } from "../pdi-types/commons";
import { GlyphLike } from "../pdi-types/GlyphLike";
import { ResourceFactoryLike } from "../pdi-types/ResourceFactoryLike";
import { SurfaceAtlasLike } from "../pdi-types/SurfaceAtlasLike";
import { SurfaceAtlasSetHint, SurfaceAtlasSetLike } from "./SurfaceAtlasSetLike";

function calcAtlasSize(hint: SurfaceAtlasSetHint): CommonSize {
	var width = Math.ceil(Math.min(hint.initialAtlasWidth, hint.maxAtlasWidth));
	var height = Math.ceil(Math.min(hint.initialAtlasHeight, hint.maxAtlasHeight));
	return { width: width, height: height };
}

/**
 * 削除対象のデータ
 */
export interface RemoveAtlasData {
	/**
	 * 削除対象のSurfaceAtlas
	 */
	surfaceAtlases: SurfaceAtlasLike[];

	/**
	 * 削除対象のグリフ
	 */
	glyphs: GlyphLike[][];
}

/**
 * SurfaceAtlasSet のコンストラクタに渡すことができるパラメータ。
 */
export interface SurfaceAtlasSetParameterObject {
	/**
	 * ゲームインスタンス。
	 */
	resourceFactory: ResourceFactoryLike;

	/**
	 * ヒント。
	 *
	 * 詳細は `SurfaceAtlasSetHint` を参照。
	 */
	hint?: SurfaceAtlasSetHint;
}

/**
 * DynamicFontで使用される、SurfaceAtlasを管理する。
 */
export class SurfaceAtlasSet implements SurfaceAtlasSetLike {
	/**
	 * SurfaceAtlas最大保持数初期値
	 */
	static INITIAL_MAX_SURFACEATLAS_NUM: number = 10;

	/**
	 * @private
	 */
	_surfaceAtlases: SurfaceAtlasLike[];

	/**
	 * @private
	 */
	_atlasGlyphsTable: GlyphLike[][];

	/**
	 * @private
	 */
	_maxAtlasNum: number;

	/**
	 * @private
	 */
	_resourceFactory: ResourceFactoryLike;

	/**
	 * @private
	 */
	_atlasSize: CommonSize;

	/**
	 * @private
	 */
	_currentAtlasIndex: number;

	constructor(params: SurfaceAtlasSetParameterObject) {
		this._surfaceAtlases = [];
		this._atlasGlyphsTable = [];
		this._resourceFactory = params.resourceFactory;
		this._currentAtlasIndex = 0;
		const hint = params.hint ? params.hint : {};
		this._maxAtlasNum = hint.maxAtlasNum ? hint.maxAtlasNum : SurfaceAtlasSet.INITIAL_MAX_SURFACEATLAS_NUM;

		// 指定がないとき、やや古いモバイルデバイスでも確保できると言われる
		// 縦横512pxのテクスチャ一枚のアトラスにまとめる形にする
		// 2048x2048で確保してしまうと、Edge, Chrome にて処理が非常に遅くなることがある
		hint.initialAtlasWidth = hint.initialAtlasWidth ? hint.initialAtlasWidth : 512;
		hint.initialAtlasHeight = hint.initialAtlasHeight ? hint.initialAtlasHeight : 512;
		hint.maxAtlasWidth = hint.maxAtlasWidth ? hint.maxAtlasWidth : 512;
		hint.maxAtlasHeight = hint.maxAtlasHeight ? hint.maxAtlasHeight : 512;
		this._atlasSize = calcAtlasSize(hint);
	}

	/**
	 * @private
	 */
	_deleteAtlas(delteNum: number): void {
		const removedObject = this._removeLeastFrequentlyUsedAtlas(delteNum);
		const removedAtlases = removedObject.surfaceAtlases;
		for (let i = 0; i < removedAtlases.length; ++i) {
			removedAtlases[i].destroy();
		}
	}

	/**
	 * 使用度の低いサーフェスアトラスを配列から削除する。
	 * @private
	 */
	_removeLeastFrequentlyUsedAtlas(removedNum: number): RemoveAtlasData {
		const removedAtlases = [];
		const removedGlyphs = [];

		for (var n = 0; n < removedNum; ++n) {
			var minScore = Number.MAX_VALUE;
			var lowScoreAtlasIndex = -1;
			for (var i = 0; i < this._surfaceAtlases.length; ++i) {
				if (this._surfaceAtlases[i]._accessScore <= minScore) {
					minScore = this._surfaceAtlases[i]._accessScore;
					lowScoreAtlasIndex = i;
				}
			}
			const removedAtlas = this._surfaceAtlases.splice(lowScoreAtlasIndex, 1)[0];
			removedAtlases.push(removedAtlas);
			removedGlyphs.push(this._atlasGlyphsTable.splice(lowScoreAtlasIndex, 1)[0]);
		}

		return { surfaceAtlases: removedAtlases, glyphs: removedGlyphs };
	}

	/**
	 * 空き領域のあるSurfaceAtlasを探索する。
	 * glyphが持つ情報をSurfaceAtlasへ移動し、移動したSurfaceAtlasの情報でglyphを置き換える。
	 * @private
	 */
	_moveGlyphSurface(glyph: GlyphLike): SurfaceAtlasLike | null {
		for (let i = 0; i < this._surfaceAtlases.length; ++i) {
			const index = (this._currentAtlasIndex + i) % this._surfaceAtlases.length;
			const atlas = this._surfaceAtlases[index];
			const slot = atlas.addSurface(glyph.surface, glyph.x, glyph.y, glyph.width, glyph.height);

			if (slot) {
				this._currentAtlasIndex = index;
				glyph.surface.destroy();
				glyph.surface = atlas._surface;
				glyph.x = slot.x;
				glyph.y = slot.y;
				if (!this._atlasGlyphsTable[index]) this._atlasGlyphsTable[index] = [];
				this._atlasGlyphsTable[index].push(glyph);
				return atlas;
			}
		}
		return null;
	}

	/**
	 * サーフェスアトラスの再割り当てを行う。
	 * @private
	 */
	_reallocateAtlas(): void {
		if (this._surfaceAtlases.length >= this._maxAtlasNum) {
			const removedObject = this._removeLeastFrequentlyUsedAtlas(1);
			const atlas = removedObject.surfaceAtlases[0];
			const glyphs = removedObject.glyphs[0];

			for (let i = 0; i < glyphs.length; i++) {
				const glyph = glyphs[i];
				glyph.surface = undefined;
				glyph.isSurfaceValid = false;
				glyph._atlas = null;
			}
			atlas.destroy();
		}

		this._surfaceAtlases.push(this._resourceFactory.createSurfaceAtlas(this._atlasSize.width, this._atlasSize.height));
		this._currentAtlasIndex = this._surfaceAtlases.length - 1;
	}

	/**
	 * サーフェスアトラスを追加する。
	 *
	 * 保持している_surfaceAtlasesの数が最大値以上の場合、削除してから追加する。
	 *
	 * このメソッドは、このSurfaceAtlasSetに紐づいている `DynamnicFont` の `constructor` から暗黙に呼び出される。
	 * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
	 */
	addAtlas(): void {
		// removeLeastFrequentlyUsedAtlas()では、SurfaceAtlas#_accessScoreの一番小さい値を持つSurfaceAtlasを削除するため、
		// SurfaceAtlas作成時は_accessScoreは0となっているため、削除判定後に作成,追加処理を行う。
		if (this._surfaceAtlases.length >= this._maxAtlasNum) {
			this._deleteAtlas(1);
		}
		this._surfaceAtlases.push(this._resourceFactory.createSurfaceAtlas(this._atlasSize.width, this._atlasSize.height));
	}

	/**
	 * 引数で指定されたindexのサーフェスアトラスを取得する。
	 *
	 * このメソッドは、このSurfaceAtlasSetに紐づいている `DynamnicFont` の `glyphForCharacter()` から暗黙に呼び出される。
	 * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
	 * @param index 取得対象のインデックス
	 */
	getAtlas(index: number): SurfaceAtlasLike {
		return this._surfaceAtlases[index];
	}

	/**
	 * サーフェスアトラスの保持数を取得する。
	 *
	 * このメソッドは、このSurfaceAtlasSetに紐づいている `DynamnicFont` の `glyphForCharacter()` から暗黙に呼び出される。
	 * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
	 */
	getAtlasNum(): number {
		return this._surfaceAtlases.length;
	}

	/**
	 * 最大サーフェスアトラス保持数取得する。
	 */
	getMaxAtlasNum(): number {
		return this._maxAtlasNum;
	}

	/**
	 * 最大アトラス保持数設定する。
	 *
	 * 設定された値が、現在保持している_surfaceAtlasesの数より大きい場合、
	 * removeLeastFrequentlyUsedAtlas()で設定値まで削除する。
	 * @param value 設定値
	 */
	changeMaxAtlasNum(value: number): void {
		this._maxAtlasNum = value;
		if (this._surfaceAtlases.length > this._maxAtlasNum) {
			const diff = this._surfaceAtlases.length - this._maxAtlasNum;
			this._deleteAtlas(diff);
		}
	}

	/**
	 * サーフェスアトラスのサイズを取得する。
	 *
	 * このメソッドは、このSurfaceAtlasSetに紐づいている `DynamnicFont` の `glyphForCharacter()` から暗黙に呼び出される。
	 * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
	 */
	getAtlasUsedSize(): CommonSize {
		return this._atlasSize;
	}

	/**
	 * サーフェスアトラスにグリフを追加する。
	 *
	 * このメソッドは、このSurfaceAtlasSetに紐づいている `DynamnicFont` の `glyphForCharacter()` から暗黙に呼び出される。
	 * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
	 * @param glyph グリフ
	 */
	addGlyph(glyph: GlyphLike): SurfaceAtlasLike | null {
		// グリフがアトラスより大きいとき、`_atlasSet.addGlyph()`は失敗する。
		// `_reallocateAtlas()`でアトラス増やしてもこれは解決できない。
		// 無駄な空き領域探索とアトラスの再確保を避けるためにここでリターンする。
		if (glyph.width > this._atlasSize.width || glyph.height > this._atlasSize.height) {
			return null;
		}

		let atlas = this._moveGlyphSurface(glyph);
		if (!atlas) {
			// retry
			this._reallocateAtlas();
			atlas = this._moveGlyphSurface(glyph);
		}

		return atlas;
	}

	/**
	 * このインスタンスを破棄する。
	 */
	destroy(): void {
		for (var i = 0; i < this._surfaceAtlases.length; ++i) {
			this._surfaceAtlases[i].destroy();
		}
		this._surfaceAtlases = undefined!;
		this._resourceFactory = undefined!;
		this._atlasGlyphsTable = undefined!;
	}

	/**
	 * このインスタンスが破棄済みであるかどうかを返す。
	 */
	destroyed(): boolean {
		return this._surfaceAtlases === undefined;
	}
}
