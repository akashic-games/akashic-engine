/**
 * 登録と抹消が行えることを表すインターフェース。
 */
export interface Registrable<T> {
	/**
	 * 登録。
	 */
	register(target: T): void;

	/**
	 * 抹消。
	 */
	unregister(target: T): void;
}
