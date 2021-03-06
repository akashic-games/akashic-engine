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

	/**
	 * 乱数を生成する。
	 * `min` 以上 `max` 以下の数値を返す。
	 *
	 * @deprecated 非推奨である。将来的に削除される。代わりに `RandomGenerator#generate()` を利用すること。
	 */
	abstract get(min: number, max: number): number;

	/**
	 * 乱数を生成する。
	 * 0 以上 1 未満の数値を返す。
	 *
	 * ローカルイベントの処理中を除き、原則 `Math.random()` ではなくこのメソッドを利用すること。
	 */
	abstract generate(): number;

	abstract serialize(): any;
}
