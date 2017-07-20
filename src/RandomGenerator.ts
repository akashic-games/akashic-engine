namespace g {
	/**
	 * 乱数生成器。
	 * `RandomGenerator#get()` によって、新しい乱数を生成することができる。
	 */
	export abstract class RandomGenerator {
		/**
		 * 本乱数生成器の種を表す。ゲーム開発者は本値を直接書き換えてはならない。
		 */
		seed: number;

		constructor(seed: number) {
			this.seed = seed;
		}

		abstract get(min: number, max: number): number;

		abstract serialize(): any;
	}
}
