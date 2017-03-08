namespace g {
	/**
	 * ゲームのエントリポイントに渡される引数。
	 */
	export interface GameMainParameterObject {
		/**
		 * スナップショット。
		 *
		 * 以前にこのゲームによって `Game#saveSnapshot()` を呼び出した時に渡した値のいずれかが与えられる。
		 * 指定された場合、ゲーム開発者は `saveSnapshot()` 呼び出し時のゲームの実行状態を再現せねばならない。
		 */
		snapshot?: any;

		/**
		 * ローカル起動時引数。
		 */
		args?: any;

		/**
		 * グローバル起動引数。
		 * `snapshot` が指定される場合は常に指定されない。
		 */
		globalArgs?: any;
	}
}
