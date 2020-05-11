import { ExceptionFactory } from "../pdi-common-impls/ExceptionFactory";
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
	 * @deprecated 非推奨である。将来的に削除される。代わりに `XorshiftRandomGenerator#generate()` を利用すること。
	 */
	get(min: number, max: number): number {
		return this._xorshift.nextInt(min, max + 1);
	}

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
