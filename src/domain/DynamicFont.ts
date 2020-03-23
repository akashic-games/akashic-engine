import { SurfaceAtlasSet } from "../commons/SurfaceAtlasSet";
import { Game } from "../Game";
import { GlyphFactoryLike } from "../interfaces/GlyphFactoryLike";
import { GlyphArea, GlyphLike } from "../interfaces/GlyphLike";
import { ResourceFactoryLike } from "../interfaces/ResourceFactoryLike";
import { SurfaceAtlasSetHint, SurfaceAtlasSetLike } from "../interfaces/SurfaceAtlasSetLike";
import { FontFamily } from "../types/FontFamily";
import { FontWeight } from "../types/FontWeight";
import { BitmapFont } from "./BitmapFont";
import { Font } from "./Font";
import { getGameInAssetContext } from "./getGameInAssetContext";
import { Util } from "./Util";

/**
 * `DynamicFont` のコンストラクタに渡すことができるパラメータ。
 * 各メンバの詳細は `DynamicFont` の同名メンバの説明を参照すること。
 * パラメータのsurfaceAtlasSetが存在する場合は、パラメータのsurfaceAtlasSetを使用する。
 * surfaceAtlasSetが存在せず、DynamicFontHintが存在する場合、DynamicFontが管理するSurfaceAtlasSetを使用する。
 * surfaceAtlasSetが存在せず、DynamicFontHintが存在しない場合、gameが持つ共通のSurfaceAtlasSetを使用する。
 */
export interface DynamicFontParameterObject {
	/**
	 * ゲームインスタンス。
	 * ゲーム開発者が指定する必要はない。
	 * @default g.game
	 */
	game?: Game;

	/**
	 * フォントファミリ。
	 *
	 * g.FontFamilyの定義する定数、フォント名、またはそれらの配列で指定する。
	 */
	fontFamily: FontFamily | string | (FontFamily | string)[];

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

	/**
	 * サーフェスアトラスセット
	 * @default undefined
	 */
	surfaceAtlasSet?: SurfaceAtlasSetLike;
}

/**
 * DynamicFontが効率よく動作するためのヒント。
 *
 * ゲーム開発者はDynamicFontが効率よく動作するための各種初期値・最大値などを
 * 提示できる。DynamicFontはこれを参考にするが、そのまま採用するとは限らない。
 */
export interface DynamicFontHint extends SurfaceAtlasSetHint {
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
export class DynamicFont extends Font {
	/**
	 * フォントファミリ。
	 *
	 * このプロパティは読み出し専用である。
	 */
	fontFamily: FontFamily | string | (FontFamily | string)[];

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
	_resourceFactory: ResourceFactoryLike;

	/**
	 * @private
	 */
	_glyphs: { [key: number]: GlyphLike };

	/**
	 * @private
	 */
	_glyphFactory: GlyphFactoryLike;

	/**
	 * @private
	 */
	_destroyed: boolean;

	/**
	 * @private
	 */
	_isSurfaceAtlasSetOwner: boolean;

	/**
	 * @private
	 */
	_atlasSet: SurfaceAtlasSetLike;

	/**
	 * 各種パラメータを指定して `DynamicFont` のインスタンスを生成する。
	 * @param param `DynamicFont` に設定するパラメータ
	 */
	constructor(param: DynamicFontParameterObject) {
		super();
		this.fontFamily = param.fontFamily;
		this.size = param.size;
		this.hint = param.hint != null ? param.hint : {};
		this.fontColor = param.fontColor != null ? param.fontColor : "black";
		this.fontWeight = param.fontWeight != null ? param.fontWeight : FontWeight.Normal;
		this.strokeWidth = param.strokeWidth != null ? param.strokeWidth : 0;
		this.strokeColor = param.strokeColor != null ? param.strokeColor : "black";
		this.strokeOnly = param.strokeOnly != null ? param.strokeOnly : false;
		const game = param.game || getGameInAssetContext();
		this._resourceFactory = game.resourceFactory;
		this._glyphFactory = this._resourceFactory.createGlyphFactory(
			this.fontFamily,
			this.size,
			this.hint.baselineHeight,
			this.fontColor,
			this.strokeWidth,
			this.strokeColor,
			this.strokeOnly,
			this.fontWeight
		);
		this._glyphs = {};
		this._destroyed = false;
		this._isSurfaceAtlasSetOwner = false;

		// NOTE: hint の特定プロパティ(baselineHeight)を分岐の条件にした場合、後でプロパティを追加した時に
		// ここで追従漏れの懸念があるため、引数の hint が省略されているかで分岐させている。
		if (param.surfaceAtlasSet) {
			this._atlasSet = param.surfaceAtlasSet;
		} else if (!!param.hint) {
			this._isSurfaceAtlasSetOwner = true;
			this._atlasSet = new SurfaceAtlasSet({
				resourceFactory: game.resourceFactory,
				hint: this.hint
			});
		} else {
			this._atlasSet = game.surfaceAtlasSet;
		}

		this._atlasSet.addAtlas();

		if (this.hint.presetChars) {
			for (let i = 0, len = this.hint.presetChars.length; i < len; i++) {
				let code = Util.charCodeAt(this.hint.presetChars, i);
				if (!code) {
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
	glyphForCharacter(code: number): GlyphLike {
		var glyph = this._glyphs[code];

		if (!(glyph && glyph.isSurfaceValid)) {
			glyph = this._glyphFactory.create(code);

			if (glyph.surface) {
				// 空白文字でなければアトラス化する
				const atlas = this._atlasSet.addGlyph(glyph);
				if (!atlas) {
					return null;
				}
				glyph._atlas = atlas;
				glyph._atlas._accessScore += 1;
			}

			this._glyphs[code] = glyph;
		}

		// スコア更新
		// NOTE: LRUを捨てる方式なら単純なタイムスタンプのほうがわかりやすいかもしれない
		// NOTE: 正確な時刻は必要ないはずで、インクリメンタルなカウンタで代用すればDate()生成コストは省略できる
		for (var i = 0; i < this._atlasSet.getAtlasNum(); i++) {
			var atlas = this._atlasSet.getAtlas(i);
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
		if (this._atlasSet.getAtlasNum() !== 1) {
			return null;
		}

		let missingGlyphCharCodePoint: number;
		if (missingGlyphChar) {
			missingGlyphCharCodePoint = Util.charCodeAt(missingGlyphChar, 0);
			this.glyphForCharacter(missingGlyphCharCodePoint);
		}

		const glyphAreaMap: { [key: string]: GlyphArea } = {};
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
		const missingGlyph = glyphAreaMap[missingGlyphCharCodePoint];
		const atlas = this._atlasSet.getAtlas(0);
		const size = atlas.getAtlasUsedSize();
		const surface = this._resourceFactory.createSurface(size.width, size.height);
		const renderer = surface.renderer();
		renderer.begin();
		renderer.drawImage(atlas._surface, 0, 0, size.width, size.height, 0, 0);
		renderer.end();

		const bitmapFont = new BitmapFont({
			src: surface,
			map: glyphAreaMap,
			defaultGlyphWidth: 0,
			defaultGlyphHeight: this.size,
			missingGlyph
		});
		return bitmapFont;
	}

	destroy(): void {
		if (this._isSurfaceAtlasSetOwner) {
			this._atlasSet.destroy();
		}
		this._glyphs = null;
		this._glyphFactory = null;
		this._destroyed = true;
	}

	destroyed(): boolean {
		return this._destroyed;
	}
}
