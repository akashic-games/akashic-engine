/**
 * Node.js が提供する module の互換インターフェース。
 */
export interface ModuleLike {
	/**
	 * モジュールのID。
	 * アセットIDとは異なることに注意。
	 */
	id: string;

	/**
	 * このモジュールのファイル名。
	 * フルパスで与えられる。
	 */
	filename: string;

	/**
	 * このモジュールが公開する値。
	 */
	exports: any;

	/**
	 * このモジュールの親。一番最初にこのモジュール (のファイル) を require() したモジュール。
	 * 該当するモジュールがなければ `null` である。
	 */
	parent: ModuleLike | null;

	/**
	 * このモジュールの読み込みが完了しているか。
	 */
	loaded: boolean;

	/**
	 * このモジュールが `require()` したモジュール。
	 */
	children: ModuleLike[];

	/**
	 * このモジュール内で `require()` した時の検索先ディレクトリ。
	 */
	paths: string[];

	/**
	 * このモジュールの評価時に与えられる `require()` 関数。
	 */
	require: (path: string) => any;
}
