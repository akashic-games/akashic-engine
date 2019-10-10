import { Renderer } from "./Renderer";
import { Camera } from "./Camera";
import { EParameterObject, E } from "./E";
import { TextAlign } from "./TextAlign";
import { FontFamily } from "./FontFamily";
import { TextBaseline } from "./TextBaseline";

/**
 * `SystemLabel` のコンストラクタに渡すことができるパラメータ。
 * 各メンバの詳細は `SystemLabel` の同名メンバの説明を参照すること。
 */
export interface SystemLabelParameterObject extends EParameterObject {
	/**
	 * 描画する文字列。
	 */
	text: string;

	/**
	 * フォントサイズ。
	 * 0 以上の数値でなければならない。そうでない場合、動作は不定である。
	 */
	fontSize: number;

	/**
	 * 文字列の描画位置。
	 * `TextAlign.Left` 以外にする場合、 `widthAutoAdjust` を `false` にすべきである。(`widthAutoAdjust` の項を参照)
	 * @default TextAlign.Left
	 */
	textAlign?: TextAlign;

	/**
	 * 文字列のベースライン。
	 * @default TextBaseline.Alphabetic
	 */
	textBaseline?: TextBaseline;

	/**
	 * 描画時に考慮すべき最大幅。
	 * 数値である場合、エンジンはこの幅を超える長さの文字列について、この幅に収まるように描画するよう要求する。その方法は環境に依存する。
	 * @default undefined
	 */
	maxWidth?: number;

	/**
	 * 文字色。CSS Colorで指定する。
	 * @default "black"
	 */
	textColor?: string;

	/**
	 * フォントファミリ。
	 * 現バージョンのakashic-engineの `SystemLabel` において、この値の指定は参考値に過ぎない。
	 * そのため、実行環境によっては無視される事がありうる。
	 * @default FontFamily.SansSerif
	 */
	fontFamily?: FontFamily;

	/**
	 * 輪郭幅。
	 * 0 以上の数値でなければならない。 0 を指定した場合、輪郭は描画されない。
	 * @default 0
	 */
	strokeWidth?: number;

	/**
	 * 輪郭色。CSS Colorで指定する。
	 * @default "black"
	 */
	strokeColor?: string;

	/**
	 * 文字の描画スタイルを切り替える。
	 * `true` を指定した場合、文字全体は描画されず、輪郭のみ描画される。
	 * `false` を指定した場合、文字全体と輪郭が描画される。
	 * @default false
	 */
	strokeOnly?: boolean;
}

/**
 * システムフォントで文字列を描画するエンティティ。
 *
 * ここでいうシステムフォントとは、akashic-engine実行環境でのデフォルトフォントである。
 * システムフォントは実行環境によって異なる場合がある。したがって `SystemLabel` による描画結果が各実行環境で同一となることは保証されない。
 * その代わりに `SystemLabel` は、Assetの読み込みなしで文字列を描画する機能を提供する。
 *
 * 絵文字などを含むユニコード文字列をすべて `BitmapFont` で提供する事は難しいことから、
 * このクラスは、事実上akashic-engineにおいてユーザ入力文字列を取り扱う唯一の手段である。
 *
 * `SystemLabel` はユーザインタラクションの対象に含めるべきではない。
 * 上述のとおり、各実行環境で描画内容の同一性が保証されないためである。
 * ユーザ入力文字列を含め、 `SystemLabel` によって提示される情報は、参考程度に表示されるなどに留めるべきである。
 * 具体的には `SystemLabel` を `touchable` にする、 `SpriteFactory.createSpriteFromE()` の対象に含めるなどを行うべきではない。
 * ボタンのようなエンティティのキャプション部分も出来る限り `Label` を用いるべきで、 `SystemLabel` を利用するべきではない。
 *
 * また、akashic-engineは `SystemLabel` の描画順を保証しない。
 * 実行環境によって、次のどちらかが成立する:
 * * `SystemLabel` は、他エンティティ同様に `Scene#children` のツリー構造のpre-order順で描かれる。
 * * `SystemLabel` は、他の全エンティティが描画された後に(画面最前面に)描画される。
 *
 * 実行環境に依存しないゲームを作成するためには、`SystemLabel` はこのいずれでも正しく動作するように利用される必要がある。
 */
export class SystemLabel extends E {
	/**
	 * 描画する文字列。
	 * この値を変更した場合、 `this.modified()` を呼び出す必要がある。
	 */
	text: string;

	/**
	 * 文字列の描画位置。
	 * 初期値は `TextAlign.Left` である。
	 * この値を変更した場合、 `this.modified()` を呼び出す必要がある。
	 */
	textAlign: TextAlign;

	/**
	 * 文字列のベースライン。
	 * 初期値は `TextBaseline.Alphabetic` である。
	 * この値を変更した場合、 `this.modified()` を呼び出す必要がある。
	 */
	textBaseline: TextBaseline;

	/**
	 * フォントサイズ。
	 * 0以上の数値でなければならない。そうでない場合、動作は不定である。
	 * この値を変更した場合、 `this.modified()` を呼び出す必要がある。
	 */
	fontSize: number;

	/**
	 * 描画時に考慮すべき最大幅。
	 * 初期値は `undefined` である。
	 * 数値である場合、エンジンはこの幅を超える長さの文字列について、この幅に収まるように描画するよう要求する。その方法は環境に依存する。
	 * この値を変更した場合、 `this.modified()` を呼び出す必要がある。
	 */
	maxWidth: number;

	/**
	 * 文字色。CSS Colorで指定する。
	 * 初期値は "black" である。
	 * この値を変更した場合、 `this.modified()` を呼び出す必要がある。
	 */
	textColor: string;

	/**
	 * フォントファミリ。
	 * 初期値は `FontFamily.SansSerif` である。
	 * 現バージョンのakashic-engineの `SystemLabel` において、この値の指定は参考値に過ぎない。
	 * そのため、実行環境によっては無視される事がありうる。
	 * この値を変更した場合、 `this.modified()` を呼び出す必要がある。
	 */
	fontFamily: FontFamily;

	/**
	 * 輪郭幅。初期値は `0` である。
	 * 0以上の数値でなければならない。0を指定した場合、輪郭は描画されない。
	 * この値を変更した場合、 `this.modified()` を呼び出す必要がある。
	 */
	strokeWidth: number;

	/**
	 * 輪郭色。CSS Colorで指定する。
	 * 初期値は "black" である。
	 * この値を変更した場合、 `this.modified()` を呼び出す必要がある。
	 */
	strokeColor: string;

	/**
	 * 文字の描画スタイルを切り替える。初期値は `false` である。
	 * `true` を指定した場合、文字全体は描画されず、輪郭のみ描画される。
	 * `false` を指定した場合、文字全体と輪郭が描画される。
	 * この値を変更した場合、 `this.modified()` を呼び出す必要がある。
	 */
	strokeOnly: boolean;

	/**
	 * 各種パラメータを指定して `SystemLabel` のインスタンスを生成する。
	 * @param param このエンティティに指定するパラメータ
	 */
	constructor(param: SystemLabelParameterObject) {
		super(param);
		this.text = param.text;
		this.fontSize = param.fontSize;
		this.textAlign = "textAlign" in param ? param.textAlign : TextAlign.Left;
		this.textBaseline = "textBaseline" in param ? param.textBaseline : TextBaseline.Alphabetic;
		this.maxWidth = param.maxWidth;
		this.textColor = "textColor" in param ? param.textColor : "black";
		this.fontFamily = "fontFamily" in param ? param.fontFamily : FontFamily.SansSerif;
		this.strokeWidth = "strokeWidth" in param ? param.strokeWidth : 0;
		this.strokeColor = "strokeColor" in param ? param.strokeColor : "black";
		this.strokeOnly = "strokeOnly" in param ? param.strokeOnly : false;
	}

	renderSelf(renderer: Renderer, camera?: Camera): boolean {
		if (this.text) {
			var offsetX: number;
			switch (this.textAlign) {
				case TextAlign.Right:
					offsetX = this.width;
					break;
				case TextAlign.Center:
					offsetX = this.width / 2;
					break;
				default:
					offsetX = 0;
			}
			renderer.drawSystemText(
				this.text,
				offsetX,
				0,
				this.maxWidth,
				this.fontSize,
				this.textAlign,
				this.textBaseline,
				this.textColor,
				this.fontFamily,
				this.strokeWidth,
				this.strokeColor,
				this.strokeOnly
			);
		}
		return true;
	}
}
