import { ShaderUniform } from "../types/ShaderUniform";

export interface ShaderProgramLike {
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
}
