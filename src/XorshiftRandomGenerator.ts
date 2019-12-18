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

		/**
		 * 指定された範囲の整数の疑似乱数を生成する。
		 * 生成される値は両端を含む(i.e. [min, max])ことに注意。
		 *
		 * @param min 生成する疑似乱数の最小値
		 * @param max 生成する疑似乱数の最大値
		 */
		get(min: number, max: number): number {
			return this._xorshift.nextInt(min, max + 1);
		}

		/**
		 * 0 以上 1 未満の疑似乱数を生成する。
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
}
