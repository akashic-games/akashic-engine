namespace g {
	/**
	 * 文字列描画のフォントウェイト。
	 */
	export enum FontWeight {
		/**
		 * 通常のフォントウェイト。
		 */
		Normal,
		/**
		 * 太字のフォントウェイト。
		 */
		Bold
	}

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

	function calcAtlasSize(hint: DynamicFontHint): CommonSize {
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
		_surface: Surface;
		_emptySurfaceAtlasSlotHead: SurfaceAtlasSlot;
		_accessScore: number;
		_usedRectangleAreaSize: CommonSize;

		constructor(surface: Surface) {
			this._surface = surface;
			this._emptySurfaceAtlasSlotHead = new SurfaceAtlasSlot(0, 0, this._surface.width, this._surface.height);
			this._accessScore = 0;
			this._usedRectangleAreaSize = { width: 0, height: 0 };
		}

		_acquireSurfaceAtlasSlot(width: number, height: number): SurfaceAtlasSlot {
			// Renderer#drawImage()でサーフェス上の一部を描画するとき、
			// 指定した部分に隣接する画素がにじみ出る現象が確認されている。
			// ここれではそれを避けるため1pixelの余白を与えている。
			width += 1;
			height += 1;

			var slot = getSurfaceAtlasSlot(this._emptySurfaceAtlasSlotHead, width, height);

			if (! slot) {
				return null;
			}

			var remainWidth = slot.width - width;
			var remainHeight = slot.height - height;
			var left: SurfaceAtlasSlot;
			var right: SurfaceAtlasSlot;
			if (remainWidth <= remainHeight) {
				left  = new SurfaceAtlasSlot(slot.x + width, slot.y,          remainWidth, height);
				right = new SurfaceAtlasSlot(slot.x,         slot.y + height, slot.width,  remainHeight);
			} else {
				left  = new SurfaceAtlasSlot(slot.x,         slot.y + height, width,       remainHeight);
				right = new SurfaceAtlasSlot(slot.x + width, slot.y,          remainWidth, slot.height);
			}

			left.prev = slot.prev;
			left.next = right;
			if (left.prev === null) { // left is head
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
		 * @param surface サーフェスアトラス上に配置される画像のサーフェス。
		 * @param rect サーフェス上の領域を表す矩形。この領域内の画像がサーフェスアトラス上に複製・配置される。
		 */
		addSurface(surface: Surface, rect: CommonArea): SurfaceAtlasSlot {
			var slot = this._acquireSurfaceAtlasSlot(rect.width, rect.height);
			if (! slot) {
				return null;
			}

			var renderer = this._surface.renderer();
			renderer.begin();
			renderer.drawImage(surface, rect.x, rect.y, rect.width, rect.height, slot.x, slot.y);
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
	 * `DynamicFont` のコンストラクタに渡すことができるパラメータ。
	 * 各メンバの詳細は `DynamicFont` の同名メンバの説明を参照すること。
	 */
	export interface DynamicFontParameterObject {
		/**
		 * ゲームインスタンス。
		 */
		game: Game;

		/**
		 * フォントファミリ。
		 */
		fontFamily: FontFamily;

		/**
		 * フォントサイズ。
		 */
		size: number;

		/**
		 * ヒント。
		 * 
		 * 詳細は `DynamicFontHint` を参照。
		 */
		hint?: DynamicFontHint;

		/**
		 * フォント色。CSS Colorで指定する。
		 * @default "black"
		 */
		fontColor?: string;

		/**
		 * フォントウェイト。
		 * @default FontWeight.Normal
		 */
		fontWeight?: FontWeight;

		/**
		 * 輪郭幅。
		 * @default 0
		 */
		strokeWidth?: number;

		/**
		 * 輪郭色。
		 * @default 0
		 */
		strokeColor?: string;

		/**
		 * 文字の輪郭のみを描画するか否か。
		 * @default false
		 */
		strokeOnly?: boolean;
	}

	/**
	 * DynamicFontが効率よく動作するためのヒント。
	 *
	 * ゲーム開発者はDynamicFontが効率よく動作するための各種初期値・最大値などを
	 * 提示できる。DynamicFontはこれを参考にするが、そのまま採用するとは限らない。
	 */
	export interface DynamicFontHint {
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
		 * 最大アトラス数。
		 */
		maxAtlasNum?: number;

		/**
		 * あらかじめグリフを生成する文字のセット。
		 */
		presetChars?: string;

		/**
		 * ベースライン。
		 */
		baselineHeight?: number;
	}

	/**
	 * ビットマップフォントを逐次生成するフォント。
	 */
	export class DynamicFont implements Font {
		/**
		 * フォントファミリ。
		 *
		 * このプロパティは読み出し専用である。
		 */
		fontFamily: FontFamily;

		/**
		 * フォントサイズ。
		 */
		size: number;

		/**
		 * ヒント。
		 */
		hint: DynamicFontHint;

		/**
		 * フォント色。CSS Colorで指定する。
		 * @default "black"
		 */
		fontColor: string;

		/**
		 * フォントウェイト。
		 * @default FontWeight.Normal
		 */
		fontWeight: FontWeight;

		/**
		 * 輪郭幅。
		 * 0 以上の数値でなければならない。 0 を指定した場合、輪郭は描画されない。
		 * @default 0
		 */
		strokeWidth: number;

		/**
		 * 輪郭色。CSS Colorで指定する。
		 * @default "black"
		 */
		strokeColor: string;

		/**
		 * 文字の輪郭のみを描画するか切り替える。
		 * `true` を指定した場合、輪郭のみ描画される。
		 * `false` を指定した場合、文字と輪郭が描画される。
		 * @default false
		 */
		strokeOnly: boolean;

		_resourceFactory: ResourceFactory;
		_glyphs: {[key: number]: Glyph};
		_glyphFactory: GlyphFactory;
		_atlases: SurfaceAtlas[];
		_currentAtlasIndex: number;
		_destroyed: boolean;
		_hint: DynamicFontHint;
		_atlasSize: CommonSize;

		/**
		 * `DynamicFont` のインスタンスを生成する。
		 * @deprecated このコンストラクタは非推奨機能である。代わりに `DynamicFontParameterObject` を使うコンストラクタを用いるべきである。
		 * @param fontFamily フォントファミリ
		 * @param size フォントサイズ
		 * @param game ゲームインスタンス
		 * @param hint ヒント
		 * @param fontColor フォント色
		 * @param strokeWidth 輪郭幅
		 * @param strokeColor 輪郭色
		 * @param strokeOnly 文字の輪郭のみを描画するか否か
		 */
		constructor(fontFamily: FontFamily, size: number, game: Game, hint?: DynamicFontHint,
		            fontColor?: string, strokeWidth?: number, strokeColor?: string, strokeOnly?: boolean);
		/**
		 * 各種パラメータを指定して `DynamicFont` のインスタンスを生成する。
		 * @param param `DynamicFont` に設定するパラメータ
		 */
		constructor(param: DynamicFontParameterObject);

		constructor(fontFamilyOrParam: FontFamily|DynamicFontParameterObject, size?: number, game?: Game, hint: DynamicFontHint = {},
		            fontColor: string = "black", strokeWidth: number = 0, strokeColor: string = "black", strokeOnly: boolean = false) {
			if (typeof fontFamilyOrParam === "number") {
				this.fontFamily = fontFamilyOrParam;
				this.size = size;
				this.hint = hint;
				this.fontColor = fontColor;
				this.strokeWidth = strokeWidth;
				this.strokeColor = strokeColor;
				this.strokeOnly = strokeOnly;
				this._resourceFactory = game.resourceFactory;
				this._glyphs = {};
				this._glyphFactory =
					this._resourceFactory.createGlyphFactory(fontFamilyOrParam, size, hint.baselineHeight, fontColor,
						strokeWidth, strokeColor, strokeOnly);
				this._atlases = [];
				this._currentAtlasIndex = 0;
				this._destroyed = false;
				game.logger.debug(
					"[deprecated] DynamicFont: This constructor is deprecated. "
						+ "Refer to the API documentation and use constructor(param: DynamicFontParameterObject) instead."
				);
			} else {
				var param = fontFamilyOrParam;
				this.fontFamily = param.fontFamily;
				this.size = param.size;
				this.hint = ("hint" in param) ? param.hint : {};
				this.fontColor = ("fontColor" in param) ? param.fontColor : "black";
				this.fontWeight = ("fontWeight" in param) ? param.fontWeight : FontWeight.Normal;
				this.strokeWidth = ("strokeWidth" in param) ? param.strokeWidth : 0;
				this.strokeColor = ("strokeColor" in param) ? param.strokeColor : "black";
				this.strokeOnly = ("strokeOnly" in param) ? param.strokeOnly : false;
				this._resourceFactory = param.game.resourceFactory;
				this._glyphs = {};
				this._glyphFactory =
					this._resourceFactory.createGlyphFactory(this.fontFamily, this.size, this.hint.baselineHeight,
						this.fontColor, this.strokeWidth, this.strokeColor, this.strokeOnly, this.fontWeight);
				this._atlases = [];
				this._currentAtlasIndex = 0;
				this._destroyed = false;
			}

			// 指定がないとき、やや古いモバイルデバイスでも確保できると言われる
			// 縦横2048pxのテクスチャ一枚のアトラスにまとめる形にする
			hint.initialAtlasWidth = hint.initialAtlasWidth ? hint.initialAtlasWidth : 2048;
			hint.initialAtlasHeight = hint.initialAtlasHeight ? hint.initialAtlasHeight : 2048;
			hint.maxAtlasWidth = hint.maxAtlasWidth ? hint.maxAtlasWidth : 2048;
			hint.maxAtlasHeight = hint.maxAtlasHeight ? hint.maxAtlasHeight : 2048;
			hint.maxAtlasNum = hint.maxAtlasNum ? hint.maxAtlasNum : 1;
			this._hint = hint;

			this._atlasSize = calcAtlasSize(this._hint);
			this._atlases.push(this._resourceFactory.createSurfaceAtlas(this._atlasSize.width, this._atlasSize.height));

			if (hint.presetChars) {
				for (let i = 0, len = hint.presetChars.length; i < len; i++) {
					let code = g.Util.charCodeAt(hint.presetChars, i);
					if (! code) {
						continue;
					}
					this.glyphForCharacter(code);
				}
			}
		}

		/**
		 * グリフの取得。
		 *
		 * 取得に失敗するとnullが返る。
		 *
		 * 取得に失敗した時、次のようにすることで成功するかもしれない。
		 * - DynamicFont生成時に指定する文字サイズを小さくする
		 * - アトラスの初期サイズ・最大サイズを大きくする
		 *
		 * @param code 文字コード
		 */
		glyphForCharacter(code: number): Glyph {
			var glyph = this._glyphs[code];

			if (! (glyph && glyph.isSurfaceValid)) {
				glyph = this._glyphFactory.create(code);

				if (glyph.surface) { // 空白文字でなければアトラス化する

					// グリフがアトラスより大きいとき、`_addToAtlas()`は失敗する。
					// `_reallocateAtlas()`でアトラス増やしてもこれは解決できない。
					// 無駄な空き領域探索とアトラスの再確保を避けるためにここでリターンする。
					if (glyph.width > this._atlasSize.width || glyph.height > this._atlasSize.height) {
						return null;
					}

					let atlas = this._addToAtlas(glyph);
					if (! atlas) {
						this._reallocateAtlas();

						// retry
						atlas = this._addToAtlas(glyph);
						if (! atlas) {
							return null;
						}
					}
					glyph._atlas = atlas;
				}

				this._glyphs[code] = glyph;
			}

			// スコア更新
			// NOTE: LRUを捨てる方式なら単純なタイムスタンプのほうがわかりやすいかもしれない
			// NOTE: 正確な時刻は必要ないはずで、インクリメンタルなカウンタで代用すればDate()生成コストは省略できる
			for (var i = 0; i < this._atlases.length; i++) {
				var atlas = this._atlases[i];
				if (atlas === glyph._atlas) {
					atlas._accessScore += 1;
				}
				atlas._accessScore /= 2;
			}

			return glyph;
		}

		/**
		 * BtimapFontの生成。
		 *
		 * 実装上の制限から、このメソッドを呼び出す場合、maxAtlasNum が 1 または undefined/null(1として扱われる) である必要がある。
		 * そうでない場合、失敗する可能性がある。
		 *
		 * @param missingGlyph `BitmapFont#map` に存在しないコードポイントの代わりに表示するべき文字。最初の一文字が用いられる。
		 */
		asBitmapFont(missingGlyphChar?: string): BitmapFont {
			if (this._atlases.length !== 1) {
				return null;
			}

			let missingGlyphCharCodePoint: number;
			if (missingGlyphChar) {
				missingGlyphCharCodePoint = Util.charCodeAt(missingGlyphChar, 0);
				this.glyphForCharacter(missingGlyphCharCodePoint);
			}

			const glyphAreaMap: {[key: string]: GlyphArea} = {};
			Object.keys(this._glyphs).forEach((_key: string) => {
				const key = Number(_key);
				const glyph = this._glyphs[key];
				const glyphArea = {
					x: glyph.x,
					y: glyph.y,
					width: glyph.width,
					height: glyph.height,
					offsetX: glyph.offsetX,
					offsetY: glyph.offsetY,
					advanceWidth: glyph.advanceWidth
				};
				glyphAreaMap[key] = glyphArea;
			});

			// NOTE: (defaultGlyphWidth, defaultGlyphHeight)= (0, this.size) とする
			//
			// それぞれの役割は第一に `GlyphArea#width`, `GlyphArea#height` が与えられないときの
			// デフォルト値である。ここでは必ず与えているのでデフォルト値としては利用されない。
			// しかし defaultGlyphHeight は BitmapFont#size にも用いられる。
			// そのために this.size をコンストラクタの第４引数に与えることにする。
			let missingGlyph = glyphAreaMap[missingGlyphCharCodePoint];
			const surface = this._atlases[0].duplicateSurface(this._resourceFactory);
			const bitmapFont = new BitmapFont(surface, glyphAreaMap, 0, this.size, missingGlyph);

			return bitmapFont;
		}

		_removeLowUseAtlas(): SurfaceAtlas {
			var minScore = Number.MAX_VALUE;
			var lowScoreAtlasIndex = -1;
			for (var i = 0; i < this._atlases.length; i++) {
				if (this._atlases[i]._accessScore <= minScore) {
					minScore = this._atlases[i]._accessScore;
					lowScoreAtlasIndex = i;
				}
			}

			let removedAtlas = this._atlases.splice(lowScoreAtlasIndex, 1)[0];

			return removedAtlas;
		}

		_reallocateAtlas(): void {
			if (this._atlases.length >= this.hint.maxAtlasNum) {
				let atlas = this._removeLowUseAtlas();
				let glyphs = this._glyphs;

				for (let key in glyphs) {
					if (glyphs.hasOwnProperty(key)) {
						var glyph = glyphs[key];
						if (glyph.surface === atlas._surface) {
							glyph.surface = null;
							glyph.isSurfaceValid = false;
							glyph._atlas = null;
						}
					}
				}
				atlas.destroy();
			}

			this._atlases.push(this._resourceFactory.createSurfaceAtlas(this._atlasSize.width, this._atlasSize.height));
			this._currentAtlasIndex = this._atlases.length - 1;
		}

		_addToAtlas(glyph: Glyph): SurfaceAtlas {
			let atlas: SurfaceAtlas = null;
			let slot: SurfaceAtlasSlot = null;
			let area = {
				x: glyph.x,
				y: glyph.y,
				width: glyph.width,
				height: glyph.height
			};
			for (let i = 0; i < this._atlases.length; i++) {
				let index = (this._currentAtlasIndex + i) % this._atlases.length;
				atlas = this._atlases[index];
				slot = atlas.addSurface(glyph.surface, area);
				if (slot) {
					this._currentAtlasIndex = index;
					break;
				}
			}

			if (! slot) {
				return null;
			}

			glyph.surface.destroy();
			glyph.surface = atlas._surface;
			glyph.x = slot.x;
			glyph.y = slot.y;

			return atlas;
		}

		destroy(): void {
			for (var i = 0; i < this._atlases.length; i++) {
				this._atlases[i].destroy();
			}
			this._glyphs = null;
			this._glyphFactory = null;
			this._destroyed = true;
		}

		destroyed(): boolean {
			return this._destroyed;
		}
	}
}
