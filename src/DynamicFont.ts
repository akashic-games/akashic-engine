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
		 *
		 * g.FontFamilyの定義する定数、フォント名、またはそれらの配列で指定する。
		 */
		fontFamily: FontFamily|string|(g.FontFamily|string)[];

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
		fontFamily: FontFamily|string|(g.FontFamily|string)[];

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

		/**
		 * @private
		 */
		_resourceFactory: ResourceFactory;

		/**
		 * @private
		 */
		_glyphs: {[key: number]: Glyph};

		/**
		 * @private
		 */
		_glyphFactory: GlyphFactory;

		/**
		 * @private
		 */
		_destroyed: boolean;

		/**
		 * @private
		 */
		_atlasSize: CommonSize;

		/**
		 * @private
		 */
		_atlasSet: SurfaceAtlasSet;

		/**
		 * @private
		 */
		_isGameOfAtrasSet: boolean;

		/**
		 * 各種パラメータを指定して `DynamicFont` のインスタンスを生成する。
		 * @param param `DynamicFont` に設定するパラメータ
		 */
		constructor(param: DynamicFontParameterObject) {
			this.fontFamily = param.fontFamily;
			this.size = param.size;
			this.hint = ("hint" in param) ? param.hint : {};
			this.fontColor = ("fontColor" in param) ? param.fontColor : "black";
			this.fontWeight = ("fontWeight" in param) ? param.fontWeight : FontWeight.Normal;
			this.strokeWidth = ("strokeWidth" in param) ? param.strokeWidth : 0;
			this.strokeColor = ("strokeColor" in param) ? param.strokeColor : "black";
			this.strokeOnly = ("strokeOnly" in param) ? param.strokeOnly : false;
			this._resourceFactory = param.game.resourceFactory;
			this._glyphFactory =
				this._resourceFactory.createGlyphFactory(this.fontFamily, this.size, this.hint.baselineHeight,
					this.fontColor, this.strokeWidth, this.strokeColor, this.strokeOnly, this.fontWeight);
			this._glyphs = {};
			this._destroyed = false;

			// prams.hintのプロパティが存在する場合、DynamicFontが管理するSurfaceAtlasSetを使用し、hintが存在しなければgameが持つ共通のSurfaceAtlasSetを使用する
			this._isGameOfAtrasSet = Object.keys(this.hint).length === 0;
			this._atlasSet = this._isGameOfAtrasSet ? param.game.surfaceAtlasSet : new SurfaceAtlasSet(param.game);
			// 指定がないとき、やや古いモバイルデバイスでも確保できると言われる
			// 縦横512pxのテクスチャ一枚のアトラスにまとめる形にする
			this.hint.initialAtlasWidth = this.hint.initialAtlasWidth ? this.hint.initialAtlasWidth : 512;
			this.hint.initialAtlasHeight = this.hint.initialAtlasHeight ? this.hint.initialAtlasHeight : 512;
			this.hint.maxAtlasWidth = this.hint.maxAtlasWidth ? this.hint.maxAtlasWidth : 512;
			this.hint.maxAtlasHeight = this.hint.maxAtlasHeight ? this.hint.maxAtlasHeight : 512;
			if (this.hint.maxAtlasNum) {
				this._atlasSet.maxAtlasSize = this.hint.maxAtlasNum;
			}

			this._atlasSize = this._calcAtlasSize(this.hint);
			if (this._atlasSet.atlasLength === 0 ) {
				this._atlasSet.addAtlas(this._resourceFactory.createSurfaceAtlas(this._atlasSize.width, this._atlasSize.height));
			}

			if (this.hint.presetChars) {
				for (let i = 0, len = this.hint.presetChars.length; i < len; i++) {
					let code = g.Util.charCodeAt(this.hint.presetChars, i);
					if (! code) {
						continue;
					}
					this.glyphForCharacter(code);
				}
			}
		}

		/**
		 * @private
		 */
		_calcAtlasSize(hint: DynamicFontHint): CommonSize {
			var width = Math.ceil(Math.min(hint.initialAtlasWidth, hint.maxAtlasWidth));
			var height = Math.ceil(Math.min(hint.initialAtlasHeight, hint.maxAtlasHeight));
			return { width: width, height: height };
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

					let atlas = this._atlasSet.addToAtlas(glyph);
					if (! atlas) {
						this._atlasSet.reallocateAtlas(this._glyphs, this._atlasSize);

						// retry
						atlas = this._atlasSet.addToAtlas(glyph);
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
			for (var i = 0; i < this._atlasSet.atlasLength; i++) {
				var atlas = this._atlasSet.getAtlasFromIndex(i);
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
			if (this._atlasSet.atlasLength !== 1) {
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
			const surface = this._atlasSet.getAtlasFromIndex(0).duplicateSurface(this._resourceFactory);

			const bitmapFont = new BitmapFont({
				src: surface,
				map: glyphAreaMap,
				defaultGlyphWidth: 0,
				defaultGlyphHeight: this.size,
				missingGlyph: missingGlyph
			});
			return bitmapFont;
		}

		destroy(): void {
			for (var i = 0; i < this._atlasSet.atlasLength; i++) {
				this._atlasSet.getAtlasFromIndex(i).destroy();
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
