namespace g {
	/**
	 * `Label` のコンストラクタに渡すことができるパラメータ。
	 * 各メンバの詳細は `Label` の同名メンバの説明を参照すること。
	 */
	export interface LabelParameterObject extends CacheableEParameterObject {
		/**
		 * 描画する文字列。
		 */
		text: string;

		/**
		 * 描画に利用されるフォント。
		 */
		font: Font;

		/**
		 * フォントサイズ。
		 * 0 以上の数値でなければならない。そうでない場合、動作は不定である。
		 *
		 * これは `LabelParameterObject#font` で
		 * 与えられたフォントを `fontSize` フォントサイズ相当で描画するよう指示する値である。
		 * 歴史的経緯によりフォントサイズと説明されているが、実際には拡大縮小率を求めるため
		 * に用いられている。
		 */
		fontSize: number;

		/**
		 * 文字列の描画位置。
		 * `TextAlign.Left` 以外にする場合、 `widthAutoAdjust` を `false` にすべきである。(`widthAutoAdjust` の項を参照)
		 * @default TextAlign.Left
		 */
		textAlign?: TextAlign;

		/**
		 * このラベルの最大幅。
		 * @default undefined
		 */
		maxWidth?: number;

		/**
		 * `width` プロパティを `this.text` の描画に必要な幅で自動的に更新するかを表す。
		 * `textAlign` を `TextAlign.Left` 以外にする場合、この値は `false` にすべきである。
		 * (`textAlign` は `width` を元に描画位置を調整するため、 `true` の場合左寄せで右寄せでも描画結果が変わらなくなる)
		 * @default true
		 */
		widthAutoAdjust?: boolean;

		/**
		 * 文字列の描画色をCSS Color形式で指定する。
		 * 元の描画色に重ねて表示されるため、アルファ値を指定した場合は元の描画色が透けて表示される。
		 * 省略された場合、この場合描画色の変更を行わない。
		 * @default undefined
		 */
		textColor?: string;
	}

	/**
	 * 単一行のテキストを描画するエンティティ。
	 * 本クラスの利用には `BitmapFont` または `DynamicFont` が必要となる。
	 */
	export class Label extends CacheableE {
		/**
		 * 描画する文字列。
		 * この値を変更した場合、 `this.invalidate()` を呼び出す必要がある。
		 */
		text: string;

		/**
		 * 描画に利用されるフォント。
		 * この値を変更した場合、 `this.invalidate()` を呼び出す必要がある。
		 */
		font: Font;

		/**
		 * 文字列の描画位置。
		 * 初期値は `TextAlign.Left` である。
		 * `TextAlign.Left` 以外にする場合、 `widthAutoAdjust` を `false` にすべきである。(`widthAutoAdjust` の項を参照)
		 * この値を変更した場合、 `this.invalidate()` を呼び出す必要がある。
		 */
		textAlign: TextAlign;

		/**
		 * キャッシュされたグリフ情報。
		 * 通常、ゲーム開発者がこのプロパティを参照する必要はない。
		 */
		glyphs: Glyph[];

		/**
		 * フォントサイズ。
		 * 0 以上の数値でなければならない。そうでない場合、動作は不定である。
		 * この値を変更した場合、 `this.invalidate()` を呼び出す必要がある。
		 */
		fontSize: number;

		/**
		 * このラベルの最大幅。
		 * この値を変更した場合、 `this.invalidate()` を呼び出す必要がある。
		 */
		maxWidth: number;

		/**
		 * `width` プロパティを `this.text` の描画に必要な幅で自動的に更新するかを表す。
		 * 初期値は `true` である。
		 * `textAlign` を `TextAlign.Left` 以外にする場合、この値は `false` にすべきである。
		 * (`textAlign` は `width` を元に描画位置を調整するため、 `true` の場合左寄せで右寄せでも描画結果が変わらなくなる)
		 *
		 * この値を変更した場合、 `this.invalidate()` を呼び出す必要がある。
		 */
		widthAutoAdjust: boolean;

		/**
		 * 文字列の描画色をCSS Color形式で指定する。
		 * 元の描画色に重ねて表示されるため、アルファ値を指定した場合は元の描画色が透けて表示される。
		 * 初期値は `undefined` となり、 描画色の変更を行わない。
		 */
		textColor: string;

		/**
		 * @private
		 */
		_textWidth: number;

		/**
		 * @private
		 */
		_game: Game;

		/**
		 * 各種パラメータを指定して `Label` のインスタンスを生成する。
		 * @param param このエンティティに指定するパラメータ
		 */
		constructor(param: LabelParameterObject) {
			super(param);
			this.text = param.text;
			this.font = param.font;
			this.textAlign = ("textAlign" in param) ? param.textAlign : TextAlign.Left;
			this.glyphs = new Array(param.text.length);
			this.fontSize = param.fontSize;
			this.maxWidth = param.maxWidth;
			this.widthAutoAdjust = ("widthAutoAdjust" in param) ? param.widthAutoAdjust : true;
			this.textColor = param.textColor;
			this._textWidth = 0;
			this._game = undefined;
			this._invalidateSelf();
		}

		/**
		 * `width` と `textAlign` を設定し、 `widthAutoAdjust` を `false` に設定する。
		 *
		 * このメソッドは `this.textAlign` を設定するためのユーティリティである。
		 * `textAlign` を `TextAlign.Left` 以外に設定する場合には、通常 `width` や `widthAutoAdjust` も設定する必要があるため、それらをまとめて行う。
		 * このメソッドの呼び出し後、 `this.invalidate()` を呼び出す必要がある。
		 * @param width 幅
		 * @param textAlign テキストの描画位置
		 */
		aligning(width: number, textAlign: TextAlign): void {
			this.width = width;
			this.widthAutoAdjust = false;
			this.textAlign = textAlign;
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
			if (!this.fontSize || this.height <= 0 || this._textWidth <= 0) {
				return;
			}

			var scale = (this.maxWidth > 0 && this.maxWidth < this._textWidth) ? this.maxWidth / this._textWidth : 1;
			var offsetX: number;
			switch (this.textAlign) {
				case TextAlign.Center:
					offsetX = this.width / 2 - this._textWidth / 2 * scale;
					break;
				case TextAlign.Right:
					offsetX = this.width - this._textWidth * scale;
					break;
				default:
					offsetX = 0;
					break;
			}
			renderer.save();
			renderer.translate(offsetX, 0);
			if (scale !== 1) {
				renderer.transform([scale, 0, 0, 1, 0, 0]);
			}

			const glyphScale = this.fontSize / this.font.size;
			for (let i = 0; i < this.glyphs.length; ++i) {
				const glyph = this.glyphs[i];
				const glyphWidth = glyph.advanceWidth * glyphScale;

				if (glyph.surface) { // 非空白文字
					renderer.transform([glyphScale, 0, 0, glyphScale, 0, 0]);
					renderer.drawImage(glyph.surface, glyph.x, glyph.y, glyph.width, glyph.height, glyph.offsetX, glyph.offsetY);
				}
				renderer.translate(glyphWidth, 0);
			}
			if (this.textColor) {
				renderer.setCompositeOperation(CompositeOperation.SourceAtop);
				renderer.fillRect(0, 0, this._textWidth, this.height, this.textColor);
			}
			renderer.restore();
		}

		/**
		 * このエンティティを破棄する。
		 * 利用している `BitmapFont` の破棄は行わないため、 `BitmapFont` の破棄はコンテンツ製作者が明示的に行う必要がある。
		 */
		destroy(): void {
			super.destroy();
		}

		_createCache(width: number, height: number): Surface {
			return this._createSurface(width, height, true);
		}

		private _invalidateSelf(): void {
			this.glyphs.length = 0;
			this._textWidth = 0;

			if (!this.fontSize) {
				this.height = 0;
				return;
			}

			var maxHeight = 0;
			var glyphScale = this.font.size > 0 ? this.fontSize / this.font.size : 0;
			for (var i = 0; i < this.text.length; ++i) {
				const code = g.Util.charCodeAt(this.text, i);
				if (! code) {
					continue;
				}

				var glyph = this.font.glyphForCharacter(code);
				if (! glyph) {
					const str = (code & 0xFFFF0000) ? String.fromCharCode((code & 0xFFFF0000) >>> 16, code & 0xFFFF) : String.fromCharCode(code);
					this.game().logger.warn(
						"Label#_invalidateSelf(): failed to get a glyph for '" + str + "' " +
						"(BitmapFont might not have the glyph or DynamicFont might create a glyph larger than its atlas)."
					);
					continue;
				}

				if (glyph.width < 0 || glyph.height < 0) {
					continue;
				}
				if (glyph.x < 0 || glyph.y < 0) {
					continue;
				}
				this.glyphs.push(glyph);
				this._textWidth += glyph.advanceWidth * glyphScale;

				var height = glyph.offsetY + glyph.height;
				if (maxHeight < height) {
					maxHeight = height;
				}
			}
			if (this.widthAutoAdjust) {
				this.width = this._textWidth;
			}

			this.height = maxHeight * glyphScale;
		}
	}
}
