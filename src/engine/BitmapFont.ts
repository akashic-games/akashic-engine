import { GlyphArea, GlyphLike } from "../pdi-types/GlyphLike";
import { ImageAssetLike } from "../pdi-types/ImageAssetLike";
import { SurfaceLike } from "../pdi-types/SurfaceLike";
import { Font } from "./Font";
import { SurfaceUtil } from "./SurfaceUtil";

/**
 * BitmapFont の初期化に必要なパラメータのセット
 */
export interface BitmapFontGlyphInfo {
	map: { [key: string]: GlyphArea };
	width: number;
	height: number;
	missingGlyph: GlyphArea;
}

/**
 * `BitmapFont` のコンストラクタに渡すことができるパラメータ。
 * 各メンバの詳細は `BitmapFont` の同名メンバの説明を参照すること。
 */
export interface BitmapFontParameterObject {
	/**
	 * 文字データとして利用する画像を表す `Surface` または `ImageAsset`。文字を敷き詰めたもの。
	 */
	src: SurfaceLike | ImageAssetLike;

	/**
	 * BitmapFont の生成に必要なデータセット。
	 * glyphInfo が与えられる場合、 BitmapFontParameterObject の map, defaultGlyphWidth, defaultGlyphHeight, missingGlyph は参照されない。
	 */
	glyphInfo?: BitmapFontGlyphInfo;

	/**
	 * 各文字から画像上の位置・サイズなどを特定する情報。コードポイントから `GlyphArea` への写像。
	 */
	map?: { [key: string]: GlyphArea };

	/**
	 * `map` で指定を省略した文字に使われる、デフォルトの文字の幅。
	 */
	defaultGlyphWidth?: number;

	/**
	 * `map` で指定を省略した文字に使われる、デフォルトの文字の高さ
	 */
	defaultGlyphHeight?: number;

	/**
	 * `map` に存在しないコードポイントの代わりに表示するべき文字の `GlyphArea` 。
	 * @default undefined
	 */
	missingGlyph?: GlyphArea;
}

/**
 * ラスタ画像によるフォント。
 */
export class BitmapFont extends Font {
	surface: SurfaceLike;
	defaultGlyphWidth: number;
	defaultGlyphHeight: number;
	map: { [key: string]: GlyphArea };
	missingGlyph: GlyphArea;
	size: number;

	/**
	 * 各種パラメータを指定して `BitmapFont` のインスタンスを生成する。
	 * @param param `BitmapFont` に設定するパラメータ
	 */
	constructor(param: BitmapFontParameterObject) {
		super();
		this.surface = SurfaceUtil.asSurface(param.src);

		if (param.glyphInfo) {
			this.map = param.glyphInfo.map;
			this.defaultGlyphWidth = param.glyphInfo.width;
			this.defaultGlyphHeight = param.glyphInfo.height;
			this.missingGlyph = param.glyphInfo.missingGlyph;
			this.size = param.glyphInfo.height;
		} else {
			this.map = param.map;
			this.defaultGlyphWidth = param.defaultGlyphWidth;
			this.defaultGlyphHeight = param.defaultGlyphHeight;
			this.missingGlyph = param.missingGlyph;
			this.size = param.defaultGlyphHeight;
		}
	}

	/**
	 * コードポイントに対応するグリフを返す。
	 * @param code コードポイント
	 */
	glyphForCharacter(code: number): GlyphLike | null {
		var g = this.map[code] || this.missingGlyph;

		if (!g) {
			return null;
		}

		var w = g.width === undefined ? this.defaultGlyphWidth : g.width;
		var h = g.height === undefined ? this.defaultGlyphHeight : g.height;
		var offsetX = g.offsetX || 0;
		var offsetY = g.offsetY || 0;
		var advanceWidth = g.advanceWidth === undefined ? w : g.advanceWidth;
		var surface = w === 0 || h === 0 ? undefined : this.surface;

		return {
			code,
			x: g.x,
			y: g.y,
			width: w,
			height: h,
			surface,
			offsetX,
			offsetY,
			advanceWidth,
			isSurfaceValid: true,
			_atlas: null
		};
	}

	/**
	 * 利用している `Surface` を破棄した上で、このフォントを破棄する。
	 */
	destroy(): void {
		if (this.surface && !this.surface.destroyed()) {
			this.surface.destroy();
		}
		this.map = undefined!;
	}

	/**
	 * 破棄されたオブジェクトかどうかを判定する。
	 */
	destroyed(): boolean {
		// mapをfalsy値で作成された場合最初から破棄扱いになるが、仕様とする
		return !this.map;
	}
}
