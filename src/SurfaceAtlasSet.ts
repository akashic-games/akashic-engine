import { CommonSize, ResourceFactory } from "@akashic/pdi-types";
import { Glyph } from "./Glyph";
import { SurfaceAtlas } from "./SurfaceAtlas";

function calcAtlasSize(hint: SurfaceAtlasSetHint): CommonSize {
	// @ts-ignore
	const width = Math.ceil(Math.min(hint.initialAtlasWidth!, hint.maxAtlasWidth));
	// @ts-ignore
	const height = Math.ceil(Math.min(hint.initialAtlasHeight!, hint.maxAtlasHeight));
	return { width: width, height: height };
}

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
 * SurfaceAtlasSet のコンストラクタに渡すことができるパラメータ。
 */
export interface SurfaceAtlasSetParameterObject {
	/**
	 * ゲームインスタンス。
	 */
	resourceFactory: ResourceFactory;

	/**
	 * ヒント。
	 *
	 * 詳細は `SurfaceAtlasSetHint` を参照。
	 */
	hint?: SurfaceAtlasSetHint;
}

/**
 * DynamicFont で使用される SurfaceAtlas を管理するクラス。
 *
 * 歴史的経緯のため、名前に反して DynamicFont 専用のクラスであり、汎用の SurfaceAtlas 管理クラスではない点に注意。
 */
export class SurfaceAtlasSet {
	/**
	 * SurfaceAtlas最大保持数初期値
	 */
	static INITIAL_MAX_SURFACEATLAS_NUM: number = 10;

	/**
	 * @private
	 */
	_surfaceAtlases: SurfaceAtlas[];

	/**
	 * @private
	 */
	_atlasGlyphsTable: Glyph[][];

	/**
	 * @private
	 */
	_maxAtlasNum: number;

	/**
	 * @private
	 */
	_resourceFactory: ResourceFactory;

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
		for (let i = 0; i < delteNum; ++i) {
			const atlas = this._spliceLeastFrequentlyUsedAtlas();
			if (!atlas) return;
			atlas.destroy();
		}
	}

	/**
	 * surfaceAtlases の最も利用されていない SurfaceAtlas を探し、 そのインデックスを返す。
	 *
	 * _surfaceAtlases の長さが 0 の場合、 -1 を返す。
	 * @private
	 */
	_findLeastFrequentlyUsedAtlasIndex(): number {
		let minScore = Number.MAX_VALUE;
		let lowScoreAtlasIndex = -1;
		for (let i = 0; i < this._surfaceAtlases.length; ++i) {
			if (this._surfaceAtlases[i]._accessScore <= minScore) {
				minScore = this._surfaceAtlases[i]._accessScore;
				lowScoreAtlasIndex = i;
			}
		}
		return lowScoreAtlasIndex;
	}

	/**
	 * surfaceAtlases の最も利用されていない SurfaceAtlas を切り離して返す。
	 *
	 * 返された SurfaceAtlas に紐づいていたすべての Glyph はサーフェスを失う (_isSurfaceValid が偽になる) 。
	 * _surfaceAtlases の長さが 0 の場合、 何もせず null を返す。
	 * @private
	 */
	_spliceLeastFrequentlyUsedAtlas(): SurfaceAtlas | null {
		const idx = this._findLeastFrequentlyUsedAtlasIndex();
		if (idx === -1) return null;

		if (this._currentAtlasIndex >= idx) --this._currentAtlasIndex;

		const spliced = this._surfaceAtlases.splice(idx, 1)[0];
		const glyphs = this._atlasGlyphsTable.splice(idx, 1)[0];

		for (let i = 0; i < glyphs.length; i++) {
			const glyph = glyphs[i];
			glyph.surface = undefined;
			glyph.isSurfaceValid = false;
			glyph._atlas = null;
		}
		return spliced;
	}

	/**
	 * 空き領域のある SurfaceAtlas を探索する。
	 * glyph が持つ情報を SurfaceAtlas へ移動し、移動した SurfaceAtlas の情報で glyph を置き換える。
	 * glyph が持っていた surface は破棄される。
	 *
	 * 移動に成功した場合 `true` を、失敗した (空き領域が見つからなかった) 場合 `false` を返す。
	 * @private
	 */
	_moveGlyphSurface(glyph: Glyph): boolean {
		for (let i = 0; i < this._surfaceAtlases.length; ++i) {
			const index = (this._currentAtlasIndex + i) % this._surfaceAtlases.length;
			const atlas = this._surfaceAtlases[index];
			const slot = atlas.addSurface(glyph.surface!, glyph.x, glyph.y, glyph.width, glyph.height);

			if (slot) {
				this._currentAtlasIndex = index;
				if (glyph.surface) glyph.surface.destroy();
				glyph.surface = atlas._surface;
				glyph.x = slot.x;
				glyph.y = slot.y;
				glyph._atlas = atlas;
				this._atlasGlyphsTable[index].push(glyph);
				return true;
			}
		}
		return false;
	}

	/**
	 * サーフェスアトラスの再割り当てを行う。
	 * @private
	 */
	_reallocateAtlas(): void {
		let atlas: SurfaceAtlas = null!;
		if (this._surfaceAtlases.length >= this._maxAtlasNum) {
			atlas = this._spliceLeastFrequentlyUsedAtlas()!;
			atlas.reset();
		} else {
			atlas = new SurfaceAtlas(this._resourceFactory.createSurface(this._atlasSize.width, this._atlasSize.height));
		}
		this._surfaceAtlases.push(atlas);
		this._atlasGlyphsTable.push([]);
		this._currentAtlasIndex = this._surfaceAtlases.length - 1;
	}

	/**
	 * 引数で指定されたindexのサーフェスアトラスを取得する。
	 *
	 * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
	 * @param index 取得対象のインデックス
	 */
	getAtlas(index: number): SurfaceAtlas {
		return this._surfaceAtlases[index];
	}

	/**
	 * サーフェスアトラスの保持数を取得する。
	 *
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
	 * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
	 */
	getAtlasUsedSize(): CommonSize {
		return this._atlasSize;
	}

	/**
	 * グリフを追加する。
	 *
	 * glyph が持っていたサーフェスは破棄され、このクラスが管理するいずれかの (サーフェスアトラスの) サーフェスに紐づけられる。
	 * 追加に成功した場合 `true` を、失敗した (空き領域が見つからなかった) 場合 `false` を返す。
	 *
	 * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
	 * @param glyph グリフ
	 */
	addGlyph(glyph: Glyph): boolean {
		// グリフがアトラスより大きいとき、`_atlasSet.addGlyph()`は失敗する。
		// `_reallocateAtlas()`でアトラス増やしてもこれは解決できない。
		// 無駄な空き領域探索とアトラスの再確保を避けるためにここでリターンする。
		if (glyph.width > this._atlasSize.width || glyph.height > this._atlasSize.height) {
			return false;
		}

		if (this._moveGlyphSurface(glyph)) return true;

		// retry
		this._reallocateAtlas();
		return this._moveGlyphSurface(glyph);
	}

	/**
	 * グリフの利用を通知する。
	 *
	 * サーフェスが不足した時、このクラスは最も利用頻度の低いサーフェスを解放して再利用する。
	 * このメソッドによるグリフの利用通知は、利用頻度の低いサーフェスを特定するために利用される。
	 *
	 * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
	 * @param glyph グリフ
	 */
	touchGlyph(glyph: Glyph): void {
		// スコア更新
		// NOTE: LRUを捨てる方式なら単純なタイムスタンプのほうがわかりやすいかもしれない
		// NOTE: 正確な時刻は必要ないはずで、インクリメンタルなカウンタで代用すればDate()生成コストは省略できる
		if (glyph._atlas) glyph._atlas._accessScore += 1;
		for (let i = 0; i < this._surfaceAtlases.length; i++) {
			const atlas = this._surfaceAtlases[i];
			atlas._accessScore /= 2;
		}
	}

	/**
	 * このインスタンスを破棄する。
	 */
	destroy(): void {
		for (let i = 0; i < this._surfaceAtlases.length; ++i) {
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
