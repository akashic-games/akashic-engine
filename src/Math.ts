import { ExceptionFactory } from "./ExceptionFactory";

/**
 * Math を初期化するオプション。
 */
export interface MathInitializeOption {
	/**
	 * @default 16384 (8192 * 2)
	 */
	tableSize?: number;
	/**
	 * @default true
	 */
	wholePeriod?: boolean;
	/**
	 * @default 5
	 */
	iterationNum?: number;
}

/**
 * ルックアップテーブルを使った三角関数計算を提供する。
 */
export module Math {
	const PI = globalThis.Math.PI;
	const PI2 = PI * 2;
	const COS_EPSILON = 1e-7;
	const ANGLE_EPSILON = 1e-10;
	const TAN_MAX = 1e7;

	const arrayType = typeof Float32Array !== "undefined" ? Float32Array : Array;

	/**
	 * Math を初期化する関数。
	 * 指定したテーブルサイズおよび近似計算の反復回数に基づき、ルックアップテーブルを生成する。
	 * 本関数は `g.Math.sin()`, `g.Math.cos()`, `g.Math.tan()` を使用する前に呼ぶ必要がある。
	 */
	export function initialize(option?: MathInitializeOption): void {
		const tableSize = option?.tableSize ?? 8192 * 2;
		const wholePeriod = option?.wholePeriod ?? true;
		const iterationNum = option?.iterationNum ?? 5;

		const sinAngleRange = wholePeriod ? PI * 2 : PI / 2;
		const sinFactor = (tableSize - 1) / sinAngleRange;
		const sinTable = setupSinTable(new arrayType(tableSize), sinAngleRange, iterationNum);

		const tanAngleRange = wholePeriod ? PI : PI / 2;
		const tanFactor = (tableSize - 1) / tanAngleRange;
		const tanTable = setupTanTable(new arrayType(tableSize), tanAngleRange, iterationNum);

		sin = (th: number): number => {
			const factor = sinFactor;
			th %= PI2;
			if (th < 0) th += PI2;

			// 座標軸上の角度に十分近ければ固定値を返す
			const axisAngle = getAxisAngleSin(th);
			if (axisAngle != null) {
				return axisAngle;
			}

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

		tan = (th: number): number => {
			const factor = tanFactor;
			th %= PI;
			if (th < 0) th += PI;

			// 座標軸上の角度に十分近ければ固定値を返す
			const axisAngle = getAxisAngleTan(th);
			if (axisAngle != null) {
				return axisAngle;
			}

			if (wholePeriod) {
				return tanTable[(th * factor) | 0];
			} else {
				let sign = 1;
				if (th > PI / 2) {
					th = PI - th;
					sign = -1;
				}
				let idx = (th * factor) | 0;
				if (idx > tanTable.length - 1) {
					idx = (tanTable.length - 1) * 2 - idx;
				}
				return sign * tanTable[idx];
			}
		};
	}

	/**
	 * 指定したテーブルサイズおよび近似計算の反復回数に基づき、ルックアップテーブルを再設定する。
	 */
	export const reset = initialize;

	/**
	 * ルックアップテーブルを使用した高速な正弦関数。
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
	 * ルックアップテーブルを使用した高速な余弦関数。
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

	/**
	 * ルックアップテーブルを使用した高速な正接関数。
	 *
	 * @param th ラジアン角
	 * @returns 結果
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	export let tan = (th: number): number => {
		throw ExceptionFactory.createAssertionError(
			"Math.tan: module not initialized. Call g.Math.initialize() before calling this function."
		);
	};

	function setupSinTable(arr: Float32Array | number[], angleRange: number, iterNum: number): Float32Array | number[] {
		const reso = arr.length;
		const factor = angleRange / (reso - 1);
		for (let i = 0; i < reso; i++) {
			const x = factor * i;
			arr[i] = sinApprox(x, iterNum);
		}
		return arr;
	}

	function setupTanTable(arr: Float32Array | number[], angleRange: number, iterNum: number): Float32Array | number[] {
		const reso = arr.length;
		const factor = angleRange / (reso - 1);
		for (let i = 0; i < reso; i++) {
			const x = factor * i;
			const sin = sinApprox(x, iterNum);
			const cos = sinApprox(x + PI / 2, iterNum);
			arr[i] = globalThis.Math.abs(cos) < COS_EPSILON ? (cos >= 0 ? TAN_MAX : -TAN_MAX) : sin / cos;
		}
		return arr;
	}

	function sinApprox(x: number, iterNum: number): number {
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

	function getAxisAngleSin(th: number): number | null {
		// 0, 2π (x軸正方向, 0度)
		if (globalThis.Math.abs(th) < ANGLE_EPSILON || globalThis.Math.abs(th - PI2) < ANGLE_EPSILON) {
			return 0;
		}
		// π/2 (y軸正方向, 90度)
		if (globalThis.Math.abs(th - PI / 2) < ANGLE_EPSILON) {
			return 1;
		}
		// π (x軸負方向, 180度)
		if (globalThis.Math.abs(th - PI) < ANGLE_EPSILON) {
			return 0;
		}
		// 3π/2 (y軸負方向, 270度)
		if (globalThis.Math.abs(th - (3 * PI) / 2) < ANGLE_EPSILON) {
			return -1;
		}
		return null;
	}

	function getAxisAngleTan(th: number): number | null {
		// 0, π (x軸, 0度)
		if (globalThis.Math.abs(th) < ANGLE_EPSILON || globalThis.Math.abs(th - PI) < ANGLE_EPSILON) {
			return 0;
		}
		// π/2 (y軸, 90度) は発散するためここでは値を返さない
		return null;
	}
}
