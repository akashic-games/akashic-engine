/**
 * 操作プラグインが生成・通知する操作の情報。
 */
export interface OperationPluginOperation {
	/**
	 * この操作の内容。
	 */
	data: (number | string)[];

	/**
	 * この操作がローカルであるか否か。
	 *
	 * 真である場合、この操作によって生成される `OperationEvent` はローカルイベントになる (`local` に真が与えられる)。
	 * 省略された場合、偽。
	 */
	local?: boolean;

	/**
	 * この操作に対する要求優先度。
	 */
	priority?: number;
}

/**
 * エンジン内部で用いる、操作プラグインが生成・通知する操作の情報。
 * 本インターフェースをゲーム開発者が利用する必要はない。
 */
export interface InternalOperationPluginOperation extends OperationPluginOperation {
	/**
	 * @private
	 */
	_code: number;
}
