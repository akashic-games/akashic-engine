import { CommonSize } from "./commons";
import { Destroyable } from "./Destroyable";
import { Surface } from "./Surface";
import { Glyph } from "./Glyph";
import { ResourceFactory } from "./ResourceFactory";
import { Game } from "./Game";

/**
 * SurfaceAtlasの空き領域管理クラス。
 *
 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
 */
export class SurfaceAtlasSlot {
	x: number;
	y: number;
	width: number;
	height: number;
	prev: SurfaceAtlasSlot;
	next: SurfaceAtlasSlot;

	constructor(x: number, y: number, width: number, height: number) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.prev = null;
		this.next = null;
	}
}

function getSurfaceAtlasSlot(slot: SurfaceAtlasSlot, width: number, height: number): SurfaceAtlasSlot {
	while (slot) {
		if (slot.width >= width && slot.height >= height) {
			return slot;
		}
		slot = slot.next;
	}

	return null;
}

function calcAtlasSize(hint: SurfaceAtlasSetHint): CommonSize {
	var width = Math.ceil(Math.min(hint.initialAtlasWidth, hint.maxAtlasWidth));
	var height = Math.ceil(Math.min(hint.initialAtlasHeight, hint.maxAtlasHeight));
	return { width: width, height: height };
}

/**
 * サーフェスアトラス。
 *
 * 与えられたサーフェスの指定された領域をコピーし一枚のサーフェスにまとめる。
 *
 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
 */
export class SurfaceAtlas implements Destroyable {
	/**
	 * @private
	 */
	_surface: Surface;

	/**
	 * @private
	 */
	_emptySurfaceAtlasSlotHead: SurfaceAtlasSlot;

	/**
	 * @private
	 */
	_accessScore: number;

	/**
	 * @private
	 */
	_usedRectangleAreaSize: CommonSize;

	constructor(surface: Surface) {
		this._surface = surface;
		this._emptySurfaceAtlasSlotHead = new SurfaceAtlasSlot(0, 0, this._surface.width, this._surface.height);
		this._accessScore = 0;
		this._usedRectangleAreaSize = { width: 0, height: 0 };
	}

	/**
	 * @private
	 */
	_acquireSurfaceAtlasSlot(width: number, height: number): SurfaceAtlasSlot {
		// Renderer#drawImage()でサーフェス上の一部を描画するとき、
		// 指定した部分に隣接する画素がにじみ出る現象が確認されている。
		// ここれではそれを避けるため1pixelの余白を与えている。
		width += 1;
		height += 1;

		var slot = getSurfaceAtlasSlot(this._emptySurfaceAtlasSlotHead, width, height);

		if (!slot) {
			return null;
		}

		var remainWidth = slot.width - width;
		var remainHeight = slot.height - height;
		var left: SurfaceAtlasSlot;
		var right: SurfaceAtlasSlot;
		if (remainWidth <= remainHeight) {
			left = new SurfaceAtlasSlot(slot.x + width, slot.y, remainWidth, height);
			right = new SurfaceAtlasSlot(slot.x, slot.y + height, slot.width, remainHeight);
		} else {
			left = new SurfaceAtlasSlot(slot.x, slot.y + height, width, remainHeight);
			right = new SurfaceAtlasSlot(slot.x + width, slot.y, remainWidth, slot.height);
		}

		left.prev = slot.prev;
		left.next = right;
		if (left.prev === null) {
			// left is head
			this._emptySurfaceAtlasSlotHead = left;
		} else {
			left.prev.next = left;
		}

		right.prev = left;
		right.next = slot.next;
		if (right.next) {
			right.next.prev = right;
		}

		const acquiredSlot = new SurfaceAtlasSlot(slot.x, slot.y, width, height);

		this._updateUsedRectangleAreaSize(acquiredSlot);

		return acquiredSlot;
	}

	/**
	 * @private
	 */
	_updateUsedRectangleAreaSize(slot: SurfaceAtlasSlot): void {
		const slotRight = slot.x + slot.width;
		const slotBottom = slot.y + slot.height;
		if (slotRight > this._usedRectangleAreaSize.width) {
			this._usedRectangleAreaSize.width = slotRight;
		}
		if (slotBottom > this._usedRectangleAreaSize.height) {
			this._usedRectangleAreaSize.height = slotBottom;
		}
	}

	/**
	 * サーフェスの追加。
	 *
	 * @param glyph グリフのサーフェスが持つ情報をSurfaceAtlasへ配置
	 */
	addSurface(glyph: Glyph): SurfaceAtlasSlot {
		var slot = this._acquireSurfaceAtlasSlot(glyph.width, glyph.height);
		if (!slot) {
			return null;
		}

		var renderer = this._surface.renderer();
		renderer.begin();
		renderer.drawImage(glyph.surface, glyph.x, glyph.y, glyph.width, glyph.height, slot.x, slot.y);
		renderer.end();

		return slot;
	}

	/**
	 * このSurfaceAtlasの破棄を行う。
	 * 以後、このSurfaceを利用することは出来なくなる。
	 */
	destroy(): void {
		this._surface.destroy();
	}

	/**
	 * このSurfaceAtlasが破棄済であるかどうかを判定する。
	 */
	destroyed(): boolean {
		return this._surface.destroyed();
	}

	/**
	 * _surfaceを複製する。
	 *
	 * 複製されたSurfaceは文字を格納するのに必要な最低限のサイズになる。
	 */
	duplicateSurface(resourceFactory: ResourceFactory): Surface {
		const src = this._surface;
		const dst = resourceFactory.createSurface(this._usedRectangleAreaSize.width, this._usedRectangleAreaSize.height);

		const renderer = dst.renderer();
		renderer.begin();
		renderer.drawImage(src, 0, 0, this._usedRectangleAreaSize.width, this._usedRectangleAreaSize.height, 0, 0);
		renderer.end();

		return dst;
	}
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
	game: Game;

	/**
	 * ヒント。
	 *
	 * 詳細は `SurfaceAtlasSetHint` を参照。
	 */
	hint?: SurfaceAtlasSetHint;
}

/**
 * 削除対象のデータ
 */
export interface RemoveAtlasData {
	/**
	 * 削除対象のSurfaceAtlas
	 */
	surfaceAtlases: SurfaceAtlas[];

	/**
	 * 削除対象のグリフ
	 */
	glyphs: Glyph[][];
}

/**
 * DynamicFontで使用される、SurfaceAtlasを管理する。
 */
export class SurfaceAtlasSet implements Destroyable {
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
		this._resourceFactory = params.game.resourceFactory;
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
	_moveGlyphSurface(glyph: Glyph): SurfaceAtlas {
		for (let i = 0; i < this._surfaceAtlases.length; ++i) {
			const index = (this._currentAtlasIndex + i) % this._surfaceAtlases.length;
			const atlas = this._surfaceAtlases[index];
			const slot = atlas.addSurface(glyph);

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
				glyph.surface = null;
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
	getAtlas(index: number): SurfaceAtlas {
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
	getAtlasSize(): CommonSize {
		return this._atlasSize;
	}

	/**
	 * サーフェスアトラスにグリフを追加する。
	 *
	 * このメソッドは、このSurfaceAtlasSetに紐づいている `DynamnicFont` の `glyphForCharacter()` から暗黙に呼び出される。
	 * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
	 * @param glyph グリフ
	 */
	addGlyph(glyph: Glyph): SurfaceAtlas {
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
		this._surfaceAtlases = undefined;
		this._resourceFactory = undefined;
		this._atlasGlyphsTable = undefined;
	}

	/**
	 * このインスタンスが破棄済みであるかどうかを返す。
	 */
	destroyed(): boolean {
		return this._surfaceAtlases === undefined;
	}
}
