namespace g {
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
	export class Glyph {
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
		surface: Surface;

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

		_atlas: SurfaceAtlas;

		/**
		 * `Glyph` のインスタンスを生成する。
		 */
		constructor(code: number, x: number, y: number, width: number, height: number,
		            offsetX: number = 0, offsetY: number = 0, advanceWidth: number = width,
		            surface?: Surface, isSurfaceValid: boolean = !!surface) {
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
			return fontSize / this.height * this.width;
		}
	}

	/**
	 * ラスタ画像によるフォント。
	 */
	export class BitmapFont implements Font {
		surface: Surface;
		defaultGlyphWidth: number;
		defaultGlyphHeight: number;
		map: {[key: string]: GlyphArea};
		missingGlyph: GlyphArea;
		size: number;

		/**
		 * `BitmapFont` のインスタンスを生成する。
		 * @param src 文字データとして利用する画像を表す `Surface` または `Asset`。文字を敷き詰めたもの
		 * @param map 各文字から画像上の位置・サイズなどを特定する情報。コードポイントから `GlyphArea` への写像
		 * @param defaultGlyphWidth `map` で指定を省略した文字に使われる、デフォルトの文字の幅
		 * @param defaultGlyphHeight `map` で指定を省略した文字に使われる、デフォルトの文字の高さ
		 * @param missingGlyph `map` に存在しないコードポイントの代わりに表示するべき文字の `GlyphArea`
		 */
		// mapは{ codepoint: { x: x, y: y, width: w, height: h, ... }のフォーマットでwidthとheightを省略可能。
		// 省略した場合はdefaulyGlyph{Width, Height}で指定した値が使用される。
		constructor(src: Surface|Asset, map: {[key: string]: GlyphArea}, defaultGlyphWidth: number,
					defaultGlyphHeight: number, missingGlyph?: GlyphArea) {
			this.surface = Util.asSurface(src);
			this.map = map;
			this.defaultGlyphWidth = defaultGlyphWidth;
			this.defaultGlyphHeight = defaultGlyphHeight;
			this.missingGlyph = missingGlyph;
			this.size = defaultGlyphHeight;
		}

		/**
		 * コードポイントに対応するグリフを返す。
		 * @param code コードポイント
		 */
		glyphForCharacter(code: number): Glyph {
			var g = this.map[code] || this.missingGlyph;

			if (! g) {
				return null;
			}

			var w = g.width === undefined ? this.defaultGlyphWidth : g.width;
			var h = g.height === undefined ? this.defaultGlyphHeight : g.height;
			var offsetX = g.offsetX || 0;
			var offsetY = g.offsetY || 0;
			var advanceWidth = g.advanceWidth === undefined ? w : g.advanceWidth;
			var surface = (w === 0 || h === 0) ? undefined : this.surface;

			return new Glyph(code, g.x, g.y, w, h, offsetX, offsetY, advanceWidth, surface, true);
		}

		/**
		 * 利用している `Surface` を破棄した上で、このフォントを破棄する。
		 */
		destroy(): void {
			if (this.surface && !this.surface.destroyed()) {
				this.surface.destroy();
			}
			this.map = undefined;
		}

		/**
		 * 破棄されたオブジェクトかどうかを判定する。
		 */
		destroyed(): boolean {
			// mapをfalsy値で作成された場合最初から破棄扱いになるが、仕様とする
			return !this.map;
		}
	}
}
