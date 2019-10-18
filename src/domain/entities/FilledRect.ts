import { ExceptionFactory } from "../../commons/ExceptionFactory";
import { RendererLike } from "../../interfaces/RendererLike";
import { E, EParameterObject } from "./E";

/**
 * `FilledRect` のコンストラクタに渡すことができるパラメータ。
 * 各メンバの詳細は `FilledRect` の同名メンバの説明を参照すること。
 */
export interface FilledRectParameterObject extends EParameterObject {
	/**
	 * 矩形を塗りつぶす色。
	 */
	cssColor: string;

	/**
	 * このオブジェクトの横幅。
	 */
	width: number;

	/**
	 * このオブジェクトの縦幅。
	 */
	height: number;
}

/**
 * 塗りつぶされた矩形を表すエンティティ。
 */
export class FilledRect extends E {
	/**
	 * 矩形を塗りつぶす色。
	 * この値を変更した場合、 `this.modified()` を呼び出す必要がある。
	 */
	cssColor: string;

	/**
	 * 各種パラメータを指定して `FilledRect` のインスタンスを生成する。
	 * @param param このエンティティに対するパラメータ
	 */
	constructor(param: FilledRectParameterObject) {
		super(param);
		if (typeof param.cssColor !== "string")
			throw ExceptionFactory.createTypeMismatchError("ColorBox#constructor(cssColor)", "string", param.cssColor);
		this.cssColor = param.cssColor;
	}

	/**
	 * このエンティティ自身の描画を行う。
	 * このメソッドはエンジンから暗黙に呼び出され、ゲーム開発者が呼び出す必要はない。
	 */
	renderSelf(renderer: RendererLike): boolean {
		renderer.fillRect(0, 0, this.width, this.height, this.cssColor);
		return true;
	}
}
