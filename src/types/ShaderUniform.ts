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
	 * この値の型は `ShaderProgram` の生成時にのみ指定可能であり、変更してはならない。
	 *
	 * 例えば `type` に `"float"` を指定して `value` に `[0.0, 1.0]` のような配列型を指定した場合、
	 * それ以降 `value` に `0.0` のような数値を代入することはできない。
	 */
	value: number | Int32Array | Float32Array;
}
