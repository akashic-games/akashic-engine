// Copyright (c) 2014 Andreas Madsen & Emil Bay
// From https://github.com/AndreasMadsen/xorshift
// https://github.com/AndreasMadsen/xorshift/blob/master/LICENSE.md
// Arranged by DWANGO Co., Ltd.

export class Xorshift {
	private _state0U: number;
	private _state0L: number;
	private _state1U: number;
	private _state1L: number;

	static deserialize(ser: XorshiftSerialization): Xorshift {
		const ret = new Xorshift([ser._state0U, ser._state0L, ser._state1U, ser._state1L]);
		return ret;
	}

	constructor(seed: number | [number, number, number, number]) {
		const seeds = Array.isArray(seed) ? seed : this.generateSeeds(seed);

		this._state0U = seeds[0] | 0;
		this._state0L = seeds[1] | 0;
		this._state1U = seeds[2] | 0;
		this._state1L = seeds[3] | 0;
	}

	initState(seed: number): void {
		const seeds = this.generateSeeds(seed);
		this._state0L = seeds[0] | 0;
		this._state0U = seeds[1] | 0;
		this._state1L = seeds[2] | 0;
		this._state1U = seeds[3] | 0;
	}

	randomInt(): [number, number] {
		let s1U = this._state0U;
		let s1L = this._state0L;
		const s0U = this._state1U;
		const s0L = this._state1L;

		const sumL = (s0L >>> 0) + (s1L >>> 0);
		const resU = (s0U + s1U + ((sumL / 2) >>> 31)) >>> 0;
		const resL = sumL >>> 0;

		this._state0U = s0U;
		this._state0L = s0L;

		let t1U = 0;
		let t1L = 0;
		let t2U = 0;
		let t2L = 0;

		const a1 = 23;
		const m1 = 0xffffffff << (32 - a1);
		t1U = (s1U << a1) | ((s1L & m1) >>> (32 - a1));
		t1L = s1L << a1;
		s1U = s1U ^ t1U;
		s1L = s1L ^ t1L;

		t1U = s1U ^ s0U;
		t1L = s1L ^ s0L;

		const a2 = 18;
		const m2 = 0xffffffff >>> (32 - a2);
		t2U = s1U >>> a2;
		t2L = (s1L >>> a2) | ((s1U & m2) << (32 - a2));
		t1U = t1U ^ t2U;
		t1L = t1L ^ t2L;

		const a3 = 5;
		const m3 = 0xffffffff >>> (32 - a3);
		t2U = s0U >>> a3;
		t2L = (s0L >>> a3) | ((s0U & m3) << (32 - a3));
		t1U = t1U ^ t2U;
		t1L = t1L ^ t2L;

		this._state1U = t1U;
		this._state1L = t1L;

		return [resU, resL];
	}

	random(): number {
		const t2 = this.randomInt();
		// Math.pow(2, -32) = 2.3283064365386963e-10
		// Math.pow(2, -52) = 2.220446049250313e-16
		return t2[0] * 2.3283064365386963e-10 + (t2[1] >>> 12) * 2.220446049250313e-16;
	}

	nextInt(min: number, sup: number): number {
		return Math.floor(min + this.random() * (sup - min));
	}

	serialize(): XorshiftSerialization {
		return {
			_state0U: this._state0U,
			_state0L: this._state0L,
			_state1U: this._state1U,
			_state1L: this._state1L
		};
	}

	// シード値が1つの場合にどのようにして初期状態を定義するかは特に定まっていない
	// このコードはロジック的な裏付けは無いが採用例が多いために採用した
	// 以下採用例
	// http://meme.biology.tohoku.ac.jp/klabo-wiki/index.php?cmd=read&page=%B7%D7%BB%BB%B5%A1%2FC%2B%2B#y919a7e1
	// http://hexadrive.sblo.jp/article/63660775.html
	// http://meme.biology.tohoku.ac.jp/students/iwasaki/cxx/random.html#xorshift
	private generateSeeds(seed: number): [number, number, number, number] {
		const factor = 1812433253;
		seed = factor * (seed ^ (seed >> 30)) + 1;
		const seed1 = seed;
		seed = factor * (seed ^ (seed >> 30)) + 2;
		const seed2 = seed;
		seed = factor * (seed ^ (seed >> 30)) + 3;
		const seed3 = seed;
		seed = factor * (seed ^ (seed >> 30)) + 4;
		const seed4 = seed;
		return [seed1, seed2, seed3, seed4];
	}
}

/**
 * serialize/deserialize用のインターフェース
 */
export interface XorshiftSerialization {
	/**
	 * @ignore
	 */
	_state0U: number;

	/**
	 * @ignore
	 */
	_state0L: number;

	/**
	 * @ignore
	 */
	_state1U: number;

	/**
	 * @ignore
	 */
	_state1L: number;
}
