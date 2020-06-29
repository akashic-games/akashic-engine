import { ExceptionFactory } from "./ExceptionFactory";
import { RandomGenerator } from "./RandomGenerator";
import { Xorshift, XorshiftSerialization } from "./Xorshift";

/**
 * Xorshiftを用いた乱数生成期。
 */
export class XorshiftRandomGenerator extends RandomGenerator {
	private _xorshift: Xorshift;

	static deserialize(ser: XorshiftRandomGeneratorSerialization): XorshiftRandomGenerator {
		return new XorshiftRandomGenerator(ser._seed, ser._xorshift);
	}

	constructor(seed: number, xorshift?: XorshiftSerialization) {
		if (seed === undefined) {
			throw ExceptionFactory.createAssertionError("XorshiftRandomGenerator#constructor: seed is undefined");
		} else {
			super(seed);
			if (!!xorshift) {
				this._xorshift = Xorshift.deserialize(xorshift);
			} else {
				this._xorshift = new Xorshift(seed);
			}
		}
	}

	/**
	 * 乱数を生成する。
	 * `min` 以上 `max` 以下の数値を返す。
	 *
	 * @deprecated 非推奨である。将来的に削除される。代わりに `XorshiftRandomGenerator#generate()` を利用すること。
	 */
	get(min: number, max: number): number {
		return this._xorshift.nextInt(min, max + 1);
	}

	/**
	 * 乱数を生成する。
	 * 0 以上 1 未満の数値を返す。
	 *
	 * ローカルイベントの処理中を除き、原則 `Math.random()` ではなくこのメソッドを利用すること。
	 */
	generate(): number {
		return this._xorshift.random();
	}

	serialize(): XorshiftRandomGeneratorSerialization {
		return {
			_seed: this.seed,
			_xorshift: this._xorshift.serialize()
		};
	}
}

/**
 * serialize/deserialize用のインターフェース
 */

export interface XorshiftRandomGeneratorSerialization {
	/**
	 * @private
	 */
	_seed: number;

	/**
	 * @private
	 */
	_xorshift: XorshiftSerialization;
}
