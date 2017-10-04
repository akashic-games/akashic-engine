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

		/**
		 * このインスタンス (`this`) と同じ値。
		 * この値は過去に `g.Game#random` が配列だった当時との互換性のために提供されている。
		 * @deprecated 非推奨である。ゲーム開発者はこの値ではなく単にこのインスタンス自身を利用すべきである。
		 */
		0?: RandomGenerator;

		constructor(seed: number) {
			this.seed = seed;
			this[0] = this;
		}

		abstract get(min: number, max: number): number;

		abstract serialize(): any;
	}
}
