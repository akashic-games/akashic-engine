namespace g {
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

		get(min: number, max: number): number {
			return this._xorshift.nextInt(min, max + 1);
		}

		generate(): number {
			return this.generate();
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
}
