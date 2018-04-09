namespace g {

	export class Shader {
		/**
		 * vertex shader の文字列。
		 * 一旦サポートはしないつもりだが、定義だけしておく。
		 */
		VERTEX_SHADER: string;

		/**
		 * fragment shader の文字列。
		 */
		FRAGMENT_SHADER: string;

		/**
		 * fragment shader に指定可能な uniform 値。
		 */
		uniforms: {[name: string]: g.ShaderUniform};

		constructor(vertexShader: string, fragmentShader: string, uniforms?: {[name: string]: g.ShaderUniform}) {
			this.VERTEX_SHADER = vertexShader;
			this.FRAGMENT_SHADER = fragmentShader;
			this.uniforms = uniforms;
		}
	}

	export class ShaderUniform {
		/**
		 * uniform の種別。
		 *
		 * "[要素数][型]" の文字列を指定する。
		 * [要素数]: 1～4
		 * [型]: f: float, i: int
		 * "1f", "2f", "3f", "4f"
		 * "1i", "2i", "3i", "4i"
		 *
		 * 要素数が 2 以上の場合は vector 形式でシェーダ側に渡される。
		 * 例1: "1f" -> "uniform float .."
		 * 例2: "4i" -> "uniform bvec4 ..."
		 */
		type: string;

		/**
		 * uniform 値
		 */
		value: number | Int32Array | Float32Array | Array<boolean>;
	}
}
