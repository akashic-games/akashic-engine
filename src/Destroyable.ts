/**
 * 破棄可能なオブジェクトかを表すインターフェース。
 */
export interface Destroyable {
	// Note: 本インターフェースの名前は英語としては少々奇妙だが、Java等にもあるのでOKとする
	// https://docs.oracle.com/javase/jp/6/api/javax/security/auth/Destroyable.html

	/**
	 * オブジェクトを破棄する。
	 */
	destroy(): void;

	/**
	 * 破棄されたオブジェクトかどうかを判定する。
	 */
	destroyed(): boolean;
}
