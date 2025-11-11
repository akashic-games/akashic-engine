import { ExceptionFactory } from "./ExceptionFactory";

/**
 * Math を初期化するオプション。
 */
export interface MathInitializeOption {
	tableSize?: number;
	wholePeriod?: boolean;
	iterationNum?: number;
}

/**
 * ルックアップテーブルを使った三角関数計算を提供する。
 */
export module Math {
	const PI = globalThis.Math.PI;
	const PI2 = PI * 2;

	const arrayType = typeof Float32Array !== "undefined" ? Float32Array : Array;

	/**
	 * Math を初期化する関数。
	 * 指定したテーブルサイズおよび近似計算の反復回数に基づき、正弦値のルックアップテーブルを生成する。
	 * 本関数は `Math.sin()` や `Math.cos()` を使用する前に呼ぶ必要がある。
	 */
	export function initialize(option?: MathInitializeOption): void {
		const tableSize = option?.tableSize ?? 8192 * 2;
		const wholePeriod = option?.wholePeriod ?? true;
		const iterationNum = option?.iterationNum ?? 5;

		const angleRange = wholePeriod ? PI * 2 : PI / 2;
		const factor = (tableSize - 1) / angleRange;
		const sinTable: Float32Array | number[] = setupSinTable(new arrayType(tableSize), angleRange, iterationNum);

		sin = (th: number): number => {
			th %= PI2;
			if (th < 0) th += PI2;
			if (wholePeriod) {
				return sinTable[(th * factor) | 0];
			} else {
				let sign = 1;
				if (th > PI) {
					th -= PI;
					sign = -1;
				}
				let idx = (th * factor) | 0;
				if (idx > sinTable.length - 1) {
					idx = (sinTable.length - 1) * 2 - idx;
				}
				return sign * sinTable[idx];
			}
		};

		cos = (th: number): number => {
			return sin(th + PI / 2);
		};
	}

	/**
	 * 高速な正弦関数。
	 *
	 * @param th ラジアン角
	 * @returns 結果
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	export let sin = (th: number): number => {
		throw ExceptionFactory.createAssertionError(
			"Math.sin: module not initialized. Call g.Math.initialize() before calling this function."
		);
	};

	/**
	 * 高速な余弦関数。
	 *
	 * @param th ラジアン角
	 * @returns 結果
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	export let cos = (th: number): number => {
		throw ExceptionFactory.createAssertionError(
			"Math.cos: module not initialized. Call g.Math.initialize() before calling this function."
		);
	};

	function setupSinTable(arr: Float32Array | number[], angleRange: number, iterNum: number): Float32Array | number[] {
		const reso = arr.length;
		function sin(x: number): number {
			const minusXSquared = -x * x;
			let s = 1;
			let n = 0;
			let term = 1;
			for (let i = 1; i <= 2 * iterNum; i++) {
				n = n + 2;
				term = (term * minusXSquared) / (n * (n + 1));
				s = s + term;
			}
			s = x * s;
			return s;
		}
		const factor = angleRange / (reso - 1);
		for (let i = 0; i < reso; i++) {
			arr[i] = sin(factor * i);
		}
		return arr;
	}
}
