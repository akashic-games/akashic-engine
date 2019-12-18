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

		/**
		 * 指定された範囲の整数の疑似乱数を生成する。
		 * 生成される値は両端を含む(i.e. [min, max])ことに注意。
		 *
		 * @param min 生成する疑似乱数の最小値
		 * @param max 生成する疑似乱数の最大値
		 */
		abstract get(min: number, max: number): number;

		/**
		 * 0 以上 1 未満の疑似乱数を生成する。
		 */
		abstract generate(): number;

		abstract serialize(): any;
	}
}
