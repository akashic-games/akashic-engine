namespace g {

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
		 * * varying vec4 vColor
		 *   * `E#opacity` などの値を考慮した最終出力色
		 * * varying vec2 vTexCoord
		 *   * 描画元テクスチャの座標
		 * * uniform sampler2D uSampler
		 *   * 描画元テクスチャ番号
		 *
		 * @default undefined
		 */
		fragmentShader?: string;

		/**
		 * フラグメントシェーダに指定可能なuniform値のマップ。
		 * @default undefined
		 */
		uniforms?: {[key: string]: g.ShaderUniform};
	}

	/**
	 * akashic-engineにおけるシェーダ機能を提供するクラス。
	 * 現バージョンのakashic-engineではフラグメントシェーダのみをサポートする。
	 */
	export class ShaderProgram {
		/**
		 * フラグメントシェーダの文字列。
		 *
		 * フラグメントシェーダは GLSL 1.0 に準拠した記述でなければならない。
		 * またフラグメントシェーダには以下の varying, uniform 値がエンジンによって与えられる。
		 * * varying vec4 vColor
		 *   * `E#opacity` などの値を考慮した最終出力色
		 * * varying vec2 vTexCoord
		 *   * 描画元テクスチャの座標
		 * * uniform sampler2D uSampler
		 *   * 描画元テクスチャ番号
		 *
		 * この値は本クラスの生成時にのみ指定可能であり、直接書き換えてはならない。
		 */
		fragmentShader: string;

		/**
		 * 各シェーダに与えられるuniform値のマップ。
		 * この値は本クラスの生成時にのみ指定可能であり、 `ShaderUniform#value` 以外の値を直接書き換えてはならない。
		 */
		uniforms: {[name: string]: ShaderUniform};

		/**
		 * 各種パラメータを指定して `ShaderProgram` のインスタンスを生成する。
		 * @param param `ShaderProgram` に設定するパラメータ
		 */
		constructor(param: ShaderProgramParameterObject) {
			this.fragmentShader = param.fragmentShader;
			this.uniforms = param.uniforms;
		}
	}

	export type ShaderUniformType = "float" | "int" | "vec2" | "vec3" | "vec4" | "ivec2" | "ivec3" | "ivec4" | "mat2" | "mat3" | "mat4";

	/**
	 * シェーダに与えるuniform値の情報を表すインターフェース定義。
	 */
	export interface ShaderUniform {
		/**
		 * uniform値の型。
		 * この値は `ShaderProgram` の生成時にのみ指定可能であり、直接書き換えてはならない。
		 */
		type: ShaderUniformType;

		/**
		 * uniform値。
		 */
		value: number | Int32Array | Float32Array;
	}
}
