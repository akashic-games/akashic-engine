/**
 * ルックアップテーブルを使った三角関数計算を提供する。
 */
export module Math {
	const TABLE_SIZE = 8192 * 2;
	const WHOLE_PERIOD = true;
	const PI = globalThis.Math.PI;

	function setupSinTable(arr: Float32Array | number[], angleRange: number): Float32Array | number[] {
		const reso = arr.length;
		function sin(x: number): number {
			const iterNum = 5;
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

	const arrayType = typeof Float32Array !== "undefined" ? Float32Array : Array;

	const angleRange = WHOLE_PERIOD ? PI * 2 : PI / 2;
	const PI2 = PI * 2;
	const factor = (TABLE_SIZE - 1) / angleRange;
	const sinTable: Float32Array | number[] = setupSinTable(new arrayType(TABLE_SIZE), angleRange);

	/**
	 * 高速な正弦関数。
	 *
	 * @param th ラジアン角
	 * @returns 結果
	 */
	export function sin(th: number): number {
		th %= PI2;
		if (th < 0) th += PI2;
		if (WHOLE_PERIOD) {
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
	}

	/**
	 * 高速な余弦関数。
	 *
	 * @param th ラジアン角
	 * @returns 結果
	 */
	export function cos(th: number): number {
		return sin(th + PI / 2);
	}
}
