namespace g {
	/**
	 * `MultiLineLabel` のコンストラクタに渡すことができるパラメータ。
	 * 各メンバの詳細は `MultiLineLabel` の同名メンバの説明を参照すること。
	 */
	export interface MultiLineLabelParameterObject extends CacheableEParameterObject {
		/**
		 * 描画する文字列。
		 */
		text: string;

		/**
		 * 描画に利用されるフォント。
		 */
		bitmapFont: BitmapFont;

		/**
		 * フォントサイズ。
		 * 0 以上の数値でなければならない。そうでない場合、動作は不定である。
		 */
		fontSize: number;

		/**
		 * このラベルの幅。
		 */
		width: number;
		/**
		 * 自動改行を行うかどうか。
		 * @default true
		 */
		lineBreak?: boolean;
		/**
		 * 行間サイズ。
		 * -1 * fontSize 以上の数値でなければならない。
		 * @default 0
		 */
		lineGap?: number;

		/**
		 * 文字列の描画位置。
		 * @default TextAlign.Left
		 */
		textAlign?: TextAlign;

		/**
		 * 文字列の描画色をCSS Color形式で指定する。
		 * 元の描画色に重ねて表示されるため、アルファ値を指定した場合は元の描画色が透けて表示される。
		 * `undefined` の場合、フォントの色を描画に使用する。
		 * @default undefined
		 */
		textColor?: string;
	}

	/**
	 * `MultiLineLabel`の行単位の描画情報を表すインターフェース定義。
	 */
	interface LineInfo {
		text: string;
		width: number;
		surface?: Surface;
	}

	/**
	 * 複数行のテキストを描画するエンティティ。
	 * 文字列内の"\r\n"、"\n"、"\r"を区切りとして改行を行う。
	 * また、自動改行が有効な場合はエンティティの幅に合わせて改行を行う。
	 * 本クラスの利用にはBitmapFontが必要となる。
	 */
	export class MultiLineLabel extends CacheableE {
		/**
		 * 描画する文字列。
		 * この値を変更した場合、 `this.invalidate()` を呼び出す必要がある。
		 */
		text: string;

		/**
		 * 描画に利用されるフォント。
		 * この値を変更した場合、 `this.invalidate()` を呼び出す必要がある。
		 */
		bitmapFont: BitmapFont;

		/**
		 * 文字列の描画位置。
		 * 初期値は `TextAlign.Left` である。
		 * この値を変更した場合、 `this.invalidate()` を呼び出す必要がある。
		 */
		textAlign: TextAlign;

		/**
		 * フォントサイズ。
		 * 0 以上の数値でなければならない。
		 * この値を変更した場合、 `this.invalidate()` を呼び出す必要がある。
		 */
		fontSize: number;

		/**
		 * 行間サイズ。
		 * 初期値は0である。
		 * -1 * fontSize 以上の数値でなければならない。
		 * この値を変更した場合、 `this.invalidate()` を呼び出す必要がある。
		 */
		lineGap: number;

		/**
		 * 自動改行を行うかどうか。
		 * この値を変更した場合、 `this.invalidate()` を呼び出す必要がある。
		 */
		lineBreak: boolean;

		/**
		 * 文字列の描画色をCSS Color形式で指定する。
		 * 元の描画色に重ねて表示されるため、アルファ値を指定した場合は元の描画色が透けて表示される。
		 * 初期値は `undefined` となり、 描画色の変更を行わない。
		 */
		textColor: string;

		_beforeText: string;
		_beforeBitmapFont: BitmapFont;
		_beforeLineBreak: boolean;
		_beforeFontSize: number;
		_beforeTextAlign: TextAlign;
		_beforeWidth: number;

		private _lines: LineInfo[];

		/**
		 * 各種パラメータを指定して `MultiLineLabel` のインスタンスを生成する。
		 * @param param このエンティティに対するパラメータ
		 */
		constructor(param: MultiLineLabelParameterObject) {

			super(param);
			this.text = param.text;
			this.bitmapFont = param.bitmapFont;
			this.fontSize = param.fontSize;
			this.width = param.width;
			this.lineBreak = "lineBreak" in param ? param.lineBreak : true;
			this.lineGap = param.lineGap || 0;
			this.textAlign = "textAlign" in param ? param.textAlign : TextAlign.Left;
			this.textColor = param.textColor;
			this._lines = [];
			this._beforeText = undefined;
			this._beforeLineBreak = undefined;
			this._beforeBitmapFont = undefined;
			this._beforeFontSize = undefined;
			this._beforeTextAlign = undefined;
			this._beforeWidth = undefined;

			this._invalidateSelf();
		}

		/**
		 * このエンティティの描画キャッシュ無効化をエンジンに通知する。
		 * このメソッドを呼び出し後、描画キャッシュの再構築が行われ、各 `Renderer` に描画内容の変更が反映される。
		 */
		invalidate(): void {
			this._invalidateSelf();
			super.invalidate();
		}

		renderCache(renderer: Renderer): void {
			if (this.fontSize === 0) return;
			renderer.save();
			for (var i = 0; i < this._lines.length; ++i) {
				if (this._lines[i].width <= 0) continue;
				renderer.drawImage(
					this._lines[i].surface,
					0,
					0,
					this._lines[i].width,
					this.fontSize,
					this._offsetX(this._lines[i].width),
					i * (this.fontSize + this.lineGap)
				);
			}
			if (this.textColor) {
				renderer.setCompositeOperation(CompositeOperation.SourceAtop);
				renderer.fillRect(0, 0, this.width, this.height, this.textColor);
			}
			renderer.restore();
		}

		/**
		 * 利用している `Surface` を破棄した上で、このエンティティを破棄する。
		 * 利用している `BitmapFont` の破棄は行わないため、 `BitmapFont` の破棄はコンテンツ製作者が明示的に行う必要がある。
		 */
		destroy(): void {
			this._destroyLines();
			super.destroy();
		}

		_offsetX(width: number): number {
			switch (this.textAlign) {
				case TextAlign.Left:
					return 0;
				case TextAlign.Right:
					return (this.width - width);
				case TextAlign.Center:
					return ((this.width - width) / 2);
				default:
					return 0;
			}
		}

		_lineBrokenText(): string[] {
			var splited = this.text.split(/\r\n|\r|\n/);
			if (this.lineBreak) {
				var lines: string[] = [];
				for (var i = 0; i < splited.length; ++i) {
					var t = splited[i];
					var lineWidth = 0;
					var start = 0;
					for (var j = 0; j < t.length; ++j) {
						var glyph = this.bitmapFont.glyphForCharacter(t.charCodeAt(j));
						var w = glyph.renderingWidth(this.fontSize);
						if (lineWidth + w > this.width) {
							lines.push(t.substring(start, j));
							start = j;
							lineWidth = 0;
						}
						lineWidth += w;
					}
					lines.push(t.substring(start, t.length));
				}
				return lines;
			} else {
				return splited;
			}
		}

		private _invalidateSelf(): void {
			if (this.fontSize < 0)
				throw ExceptionFactory.createAssertionError("MultiLineLabel#_invalidateSelf: fontSize must not be negative.");

			if (this.lineGap < -1 * this.fontSize)
				throw ExceptionFactory.createAssertionError("MultiLineLabel#_invalidateSelf: lineGap must be greater than -1 * fontSize.");

			if (this._beforeText !== this.text
			 || this._beforeFontSize !== this.fontSize
			 || this._beforeBitmapFont !== this.bitmapFont
			 || this._beforeLineBreak !== this.lineBreak
			 || (this._beforeWidth !== this.width && this._beforeLineBreak === true)) {
				this._createLines();
			}
			this.height = this.fontSize + (this.fontSize + this.lineGap) * (this._lines.length - 1);

			this._beforeText = this.text;
			this._beforeTextAlign = this.textAlign;
			this._beforeFontSize = this.fontSize;
			this._beforeLineBreak = this.lineBreak;
			this._beforeBitmapFont = this.bitmapFont;
			this._beforeWidth = this.width;
		}

		private _createLineInfo(str: string): LineInfo {
			if (this.fontSize === 0) {
				return {
					text: str,
					width: 0
				};
			}
			var lineWidth = 0;
			var glyphs: Glyph[] = [];

			for (var i = 0; i < str.length; ++i) {
				var glyph = this.bitmapFont.glyphForCharacter(str.charCodeAt(i));
				if (!glyph.width || !glyph.height) {
					continue;
				}
				glyphs.push(glyph);
				lineWidth += glyph.renderingWidth(this.fontSize);
			}

			if (lineWidth === 0) {
				return {
					text: str,
					width: 0
				};
			}
			var textSurface  = this.scene.game.resourceFactory.createSurface(Math.ceil(lineWidth), Math.ceil(this.fontSize));
			var textRenderer = textSurface.renderer();
			textRenderer.begin();
			textRenderer.save();

			for (var i = 0; i < glyphs.length; ++i) {
				var glyph = glyphs[i];
				textRenderer.save();
				var glyphScale = this.fontSize / glyph.height;
				textRenderer.transform([glyphScale, 0, 0, glyphScale, 0, 0]);
				textRenderer.drawImage(this.bitmapFont.surface, glyph.x, glyph.y, glyph.width, glyph.height, 0, 0);
				textRenderer.restore();
				textRenderer.translate(glyph.renderingWidth(this.fontSize), 0);
			}
			textRenderer.restore();
			textRenderer.end();
			return {
				text: str,
				width: lineWidth,
				surface: textSurface
			};
		}

		private _createLines(): void {
			var lineText = this._lineBrokenText();
			var lines: LineInfo[] = [];
			for (var i = 0; i < lineText.length; ++i) {
				if (this._lines[i] !== undefined
				 && lineText[i] === this._lines[i].text
				 && this._beforeBitmapFont === this.bitmapFont
				 && this._beforeFontSize === this.fontSize) {
					lines.push(this._lines[i]);
				} else {
					if (this._lines[i] && this._lines[i].surface && !this._lines[i].surface.destroyed()) {
						// 入れ替える行のサーフェース解放
						this._lines[i].surface.destroy();
					}
					lines.push(this._createLineInfo(lineText[i]));
				}
			}
			for (var i = lines.length; i < this._lines.length; i++) {
				// 削除される行のサーフェース解放
				if (this._lines[i].surface && !this._lines[i].surface.destroyed()) {
					this._lines[i].surface.destroy();
				}
			}
			this._lines = lines;
		}

		private _destroyLines(): void {
			for (var i = 0; i < this._lines.length; i++) {
				if (this._lines[i].surface && !this._lines[i].surface.destroyed()) {
					this._lines[i].surface.destroy();
				}
			}
			this._lines = undefined;
		}
	}
}
