namespace g {
	/**
	 * Trigger#handleしているものを表すインターフェース。
	 */
	export interface TriggerHandler<T> {
		owner: any;
		handler: T;
		name: string;
	}
}
