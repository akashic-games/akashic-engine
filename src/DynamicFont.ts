import { FontFamily, FontWeight, FontWeightString, Glyph as PdiGlyph, GlyphArea, GlyphFactory, ResourceFactory } from "@akashic/pdi-types";
import { BitmapFont } from "./BitmapFont";
import { Font } from "./Font";
import { Game } from "./Game";
import { Glyph } from "./Glyph";
import { SurfaceAtlasSetHint, SurfaceAtlasSet } from "./SurfaceAtlasSet";
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
	 */
	game: Game;

	/**
	 * フォントファミリ。
	 *
	 * フォント名、またはそれらの配列で指定する。
	 * フォント名として指定できる値は環境に依存する。
	 * 少なくとも `"sans-serif"`, `"serif"`, `"monospace"` (それぞれサンセリフ体、セリフ体、等幅の字体) は有効な値である。
	 * `g.FontFamily` を指定することは非推奨である。代わりに上記文字列を利用すること。
	 *
	 * この値は参考値である。環境によっては無視される可能性がある。
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
	 * `g.FontWeight` を指定することは非推奨である。代わりに `g.FontWeightString` を利用すること。
	 * @default g.FontWeight.Normal
	 */
	fontWeight?: FontWeight | FontWeightString;

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
	surfaceAtlasSet?: SurfaceAtlasSet;
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
	 * このプロパティは参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 */
	fontFamily: FontFamily | string | (FontFamily | string)[];

	/**
	 * フォントサイズ。
	 *
	 * このプロパティは参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 */
	size: number;

	/**
	 * ヒント。
	 *
	 * このプロパティは参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 */
	hint: DynamicFontHint;

	/**
	 * フォント色。CSS Colorで指定する。
	 *
	 * このプロパティは参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 * @default "black"
	 */
	fontColor: string;

	/**
	 * フォントウェイト。
	 *
	 * このプロパティは参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 * @default g.FontWeight.Normal
	 */
	fontWeight: FontWeight | FontWeightString;

	/**
	 * 輪郭幅。
	 * 0 以上の数値でなければならない。 0 を指定した場合、輪郭は描画されない。
	 *
	 * このプロパティは参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 * @default 0
	 */
	strokeWidth: number;

	/**
	 * 輪郭色。CSS Colorで指定する。
	 *
	 * このプロパティは参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
	 * @default "black"
	 */
	strokeColor: string;

	/**
	 * 文字の輪郭のみを描画するか切り替える。
	 * `true` を指定した場合、輪郭のみ描画される。
	 * `false` を指定した場合、文字と輪郭が描画される。
	 *
	 * このプロパティは参照のためにのみ公開されている。ゲーム開発者はこの値を変更すべきではない。
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
	_glyphs: { [key: number]: PdiGlyph };

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
	_isSurfaceAtlasSetOwner: boolean;

	/**
	 * @private
	 */
	_atlasSet: SurfaceAtlasSet;

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
		const game = param.game;
		this._resourceFactory = game.resourceFactory;

		const ff = this.fontFamily;
		let realFontFamily: string | string[];
		if (typeof ff === "string") {
			realFontFamily = ff;
		} else if (Array.isArray(ff)) {
			const arr: string[] = [];
			for (let i = 0; i < ff.length; ++i) {
				const ffi = ff[i];
				arr.push(typeof ffi === "string" ? ffi : Util.enumToSnakeCase<FontFamily, string>(FontFamily, ffi));
			}
			realFontFamily = arr;
		} else {
			const arr: string[] = [];
			arr.push(typeof ff === "string" ? ff : Util.enumToSnakeCase<FontFamily, string>(FontFamily, ff));
			realFontFamily = arr;
		}
		const weight = this.fontWeight;
		const realFontWeight = typeof weight === "string" ? weight : Util.enumToSnakeCase<FontWeight, FontWeightString>(FontWeight, weight);

		this._glyphFactory = this._resourceFactory.createGlyphFactory(
			realFontFamily,
			this.size,
			this.hint.baselineHeight,
			this.fontColor,
			this.strokeWidth,
			this.strokeColor,
			this.strokeOnly,
			realFontWeight
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

		if (this._atlasSet) this._atlasSet.addAtlas();

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
	glyphForCharacter(code: number): Glyph | null {
		let glyph = this._glyphs[code] as Glyph;

		if (!(glyph && glyph.isSurfaceValid)) {
			glyph = this._glyphFactory.create(code) as Glyph;

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
	asBitmapFont(missingGlyphChar?: string): BitmapFont | null {
		if (this._atlasSet.getAtlasNum() !== 1) {
			return null;
		}

		let missingGlyphCharCodePoint: number | null = null;
		if (missingGlyphChar) {
			missingGlyphCharCodePoint = Util.charCodeAt(missingGlyphChar, 0)!;
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
		// @ts-ignore
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
		this._glyphs = undefined!;
		this._glyphFactory = undefined!;
		this._destroyed = true;
	}

	destroyed(): boolean {
		return this._destroyed;
	}
}
