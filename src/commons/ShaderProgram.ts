import { ShaderProgramLike } from "../interfaces/ShaderProgramLike";
import { ShaderUniform } from "../interfaces/ShaderUniform";

/**
 * `ShaderProgram` のコンストラクタに渡すことができるパラメータ。
 * 各メンバの詳細は `ShaderProgram` の同名メンバの説明を参照すること。
 */
export interface ShaderProgramParameterObject {
	/**
	 * フラグメントシェーダの文字列。
	 *
	 * フラグメントシェーダは GLSL 1.0 に準拠した記述でなければならない。
	 * またフラグメントシェーダには以下の varying, uniform 値がエンジンによって与えられる。
	 * * uniform float uAlpha
	 *   * 描画時の透過度
	 * * uniform sampler2D uSampler
	 *   * 描画元テクスチャ番号
	 * * varying vec2 vTexCoord
	 *   * 描画元テクスチャの座標
	 *   * gl_FragColor = texture2D(uSampler, vTexCoord); のような形で描画元テクスチャのピクセルを参照できる
	 *
	 * @default undefined
	 */
	fragmentShader?: string;

	/**
	 * フラグメントシェーダに指定可能なuniform値のマップ。
	 * @default undefined
	 */
	uniforms?: { [key: string]: ShaderUniform };
}

/**
 * akashic-engineにおけるシェーダ機能を提供するクラス。
 * 現バージョンのakashic-engineではフラグメントシェーダのみをサポートする。
 */
export class ShaderProgram implements ShaderProgramLike {
	/**
	 * フラグメントシェーダの文字列。
	 *
	 * フラグメントシェーダは GLSL 1.0 に準拠した記述でなければならない。
	 * またフラグメントシェーダには以下の varying, uniform 値がエンジンによって与えられる。
	 * * uniform float uAlpha
	 *   * 描画時の透過度
	 * * uniform sampler2D uSampler
	 *   * 描画元テクスチャ番号
	 * * varying vec2 vTexCoord
	 *   * 描画元テクスチャの座標
	 *   * gl_FragColor = texture2D(uSampler, vTexCoord); のような形で描画元テクスチャのピクセルを参照できる
	 *
	 * この値は本クラスの生成時にのみ指定可能であり、直接書き換えてはならない。
	 */
	fragmentShader: string;

	/**
	 * 各シェーダに与えられるuniform値のマップ。
	 * この値は本クラスの生成時にのみ指定可能であり、 `ShaderUniform#value` 以外の値を直接書き換えてはならない。
	 */
	uniforms: { [name: string]: ShaderUniform };

	/**
	 * シェーダプログラムの実体。
	 * @private
	 */
	_program: any;

	/**
	 * 各種パラメータを指定して `ShaderProgram` のインスタンスを生成する。
	 * @param param `ShaderProgram` に設定するパラメータ
	 */
	constructor(param: ShaderProgramParameterObject) {
		this.fragmentShader = param.fragmentShader;
		this.uniforms = param.uniforms;
	}
}
