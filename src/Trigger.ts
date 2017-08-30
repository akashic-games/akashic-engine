namespace g {
	/**
	 * ハンドラの関数の型。
	 */
	export type HandlerFunction<T> = (args: T) => void;

	/**
	 * Triggerのハンドラ。
	 */
	export interface TriggerHandler<T> {
		/**
		 * ハンドラの関数。
		 */
		func: HandlerFunction<T>;
		/**
		 * ハンドラのオーナー。
		 * `func` 呼び出しの際に `this` として利用される値。
		 */
		owner: any;
		/**
		 * 呼び出し後、 `remove()` されるべきである時またその時のみ、真。
		 */
		once: boolean;
		/**
		 * ハンドラの名前。
		 */
		name: string | null | undefined;
	}

	/**
	 * Triggerを追加する際に指定するパラメータ。
	 */
	export interface TriggerAddParameters<T> {
		/**
		 * ハンドラの関数。
		 */
		func: HandlerFunction<T>;
		/**
		 * ハンドラのオーナー。
		 * `func` 呼び出しの際に `this` として利用される値。
		 */
		owner?: any;
		/**
		 * ハンドラの名前。
		 */
		name?: string;
		/**
		 * ハンドラのリストの挿入先インデックス。
		 * 通常、指定する必要はない。省略した場合、ハンドラは末尾に追加される。
		 */
		index?: number;
	}

	/**
	 * Triggerを削除する際に指定するパラメータ。
	 */
	export interface TriggerRemoveConditions<T> {
		/**
		 * ハンドラの関数。
		 *
		 * 登録時 `func` に指定された値がこの値と同値でないハンドラは削除されない。
		 * 省略された場合、 `remove()` では `undefined` とみなされる。
		 * 省略された場合、 `removeAll()` ではこの値に関係なく他の条件にマッチする限り削除される。
		 */
		func?: HandlerFunction<T>;
		/**
		 * ハンドラのオーナー。
		 *
		 * 登録時 `owner` に指定された値がこの値と同値でないハンドラは削除されない。
		 * 省略された場合、 `remove()` では `undefined` とみなされる。
		 * 省略された場合、 `removeAll()` ではこの値に関係なく他の条件にマッチする限り削除される。
		 */
		owner?: any;
		/**
		 * ハンドラの名前。
		 *
		 * 登録時 `name` に指定された値がこの値と同値でないハンドラは削除されない。
		 * 省略された場合、 `remove()` では `undefined` とみなされる。
		 * 省略された場合、 `removeAll()` ではこの値に関係なく他の条件にマッチする限り削除される。
		 */
		name?: string;
	}

	/**
	 * Triggerの検索条件を指定するパラメータ。
	 */
	export interface TriggerSearchConditions<T> {
		func?: HandlerFunction<T>;
		owner?: any;
		name?: string;
	}

	/**
	 * イベント通知機構クラス。
	 */
	export class Trigger<T> {
		/**
		 * 登録されているイベントハンドラの数。
		 */
		length: number;

		_handlers: TriggerHandler<T>[];

		constructor() {
			this._handlers = [];
			this.length = 0;
		}

		/**
		 * このTriggerにハンドラを追加する。
		 * @param func ハンドラの関数
		 * @param owner ハンドラのオーナー。 `func` を呼び出す時に `this` として用いられる値
		 */
		add(func: HandlerFunction<T>, owner?: any): void;
		/**
		 * このTriggerにハンドラを追加する。
		 * @param params 登録するハンドラの情報
		 */
		add(params: TriggerAddParameters<T>): void;
		add(paramsOrFunc: any, owner?: any): void {
			if (typeof paramsOrFunc === "function") {
				this._handlers.push({
					func: paramsOrFunc as HandlerFunction<T>,
					owner,
					once: false,
					name: undefined
				});
			} else {
				const params = paramsOrFunc as TriggerAddParameters<T>;
				if (typeof params.index === "number") {
					this._handlers.splice(params.index, 0, {
						func: params.func,
						owner: params.owner,
						once: false,
						name: params.name
					});
				} else {
					this._handlers.push({
						func: params.func,
						owner: params.owner,
						once: false,
						name: params.name
					});
				}
			}

			this.length = this._handlers.length;
		}

		/**
		 * このTriggerにハンドラを追加する。
		 * 本メソッドにより追加されたハンドラは実行後に破棄される。
		 * @param func ハンドラの関数
		 * @param owner ハンドラのオーナー。 `func` を呼び出す時に `this` として用いられる値
		 */
		addOnce(func: HandlerFunction<T>, owner?: any): void;
		/**
		 * このTriggerにハンドラを追加する。
		 * 本メソッドにより追加されたハンドラは実行後に破棄される。
		 * @param params 登録するハンドラの情報
		 */
		addOnce(params: TriggerAddParameters<T>): void;
		addOnce(paramsOrFunc: any, owner?: any): void {
			if (typeof paramsOrFunc === "function") {
				this._handlers.push({
					func: paramsOrFunc as HandlerFunction<T>,
					owner,
					once: true,
					name: undefined
				});
			} else {
				const params = paramsOrFunc as TriggerAddParameters<T>;
				if (typeof params.index === "number") {
					this._handlers.splice(params.index, 0, {
						func: params.func,
						owner: params.owner,
						once: true,
						name: params.name
					});
				} else {
					this._handlers.push({
						func: params.func,
						owner: params.owner,
						once: true,
						name: params.name
					});
				}
			}

			this.length = this._handlers.length;
		}

		/**
		 * このTriggerにハンドラを追加する。
		 * @deprecated 互換性のために残されている。代わりに `add()` を利用すべきである。実装の変化のため、 `func` が `boolean` を返した時の動作はサポートされていない。
		 */
		handle(owner: any, func?: (e: T) => void, name?: string): void {
			this.add(func ? { owner, func, name } : { func: owner });
		}

		/**
		 * このTriggerを発火する。
		 *
		 * @param イベントハンドラに与えられる引数
		 */
		fire(args?: T): void {
			if (! this._handlers.length)
				return;

			const handlers = this._handlers.concat();
			for (let i = 0; i < handlers.length; i++) {
				const handler = handlers[i];
				handler.func.call(handler.owner, args);
				if (handler.once) {
					const index = this._handlers.indexOf(handler);
					if (index !== -1)
						this._handlers.splice(index, 1);
				}
			}

			if (this._handlers)
				this.length = this._handlers.length;
		}

		/**
		 * 指定した条件に一致したハンドラが登録されているかを返す。
		 * 指定されなかった条件は、条件として無視される(登録時の値に関わらず一致するとみなされる)。
		 *
		 * @param func 条件として用いるハンドラの関数
		 * @param owner 条件として用いるハンドラのオーナー
		 */
		contains(func: HandlerFunction<T> | null, owner?: any): boolean;
		/**
		 * 指定した条件に一致したハンドラが登録されているかを返す。
		 * 指定されなかった条件は、条件として無視される(登録時の値に関わらず一致するとみなされる)。
		 *
		 * @param params 検索の条件
		 */
		contains(params: TriggerSearchConditions<T>): boolean;
		contains(paramsOrFunc: any, owner?: any): boolean {
			const compareObject: TriggerSearchConditions<T> = typeof paramsOrFunc === "function" ? {} : paramsOrFunc;

			if (typeof paramsOrFunc === "function") {
				compareObject.func = paramsOrFunc as HandlerFunction<T>;
				compareObject.owner = owner;
			}

			for (let i = 0; i < this._handlers.length; i++) {
				if (this._comparePartial(compareObject, this._handlers[i])) {
					return true;
				}
			}

			return false;
		}

		/**
		 * 指定した条件に一致するハンドラを削除する。
		 *
		 * 関数が `func` であり、かつオーナーが `owner` であるハンドラを削除する。
		 *
		 * @param func 削除条件として用いるハンドラの関数
		 * @param owner 削除条件として用いるハンドラのオーナー。省略した場合、 `undefined`
		 */
		remove(func: HandlerFunction<T>, owner?: any): void;
		/**
		 * 指定した条件に一致するハンドラを削除する。
		 *
		 * 本メソッドは引数に与えた条件と完全に一致したハンドラのみを削除する。
		 * 引数の条件を一部省略した場合、登録時に同様の条件を省略したハンドラのみが削除される。
		 * 省略した条件について、その値の内容に関わらずハンドラを削除したい場合は `this.removeAll()` を用いる。
		 *
		 * @param params 削除するハンドラの条件
		 */
		remove(params: TriggerRemoveConditions<T>): void;
		remove(paramsOrFunc: any, owner?: any): void {
			const compareObject: TriggerSearchConditions<T> = typeof paramsOrFunc === "function" ? {} : paramsOrFunc;

			if (typeof paramsOrFunc === "function") {
				compareObject.func = paramsOrFunc as HandlerFunction<T>;
				compareObject.owner = owner;
			}

			const handlers: TriggerHandler<T>[] = [];

			for (let i = 0; i < this._handlers.length; i++) {
				const handler = this._handlers[i];
				if (compareObject.func !== handler.func || compareObject.owner !== handler.owner || compareObject.name !== handler.name) {
					handlers.push(handler);
				}
			}

			this._handlers = handlers;
			this.length = this._handlers.length;
		}

		/**
		 * 指定した条件に部分一致するイベントハンドラを削除する。
		 *
		 * 本メソッドは引数に与えた条件に一致したイベントハンドラを全て削除する。
		 * 引数の条件を一部省略した場合、その値の内容が登録時と異なっていても対象のイベントハンドラは削除される。
		 * 引数に与えた条件と完全に一致したイベントハンドラのみを削除したい場合は `this.remove()` を用いる。
		 * 引数を省略した場合は全てのイベントハンドラを削除する。
		 *
		 * @param params 削除するイベントハンドラの条件
		 */
		removeAll(params?: TriggerRemoveConditions<T>): void {
			const handlers: TriggerHandler<T>[] = [];

			if (params) {
				for (let i = 0; i < this._handlers.length; i++) {
					const handler = this._handlers[i];
					if (! this._comparePartial(params, handler)) {
						handlers.push(handler);
					}
				}
			}

			this._handlers = handlers;
			this.length = this._handlers.length;
		}

		/**
		 * このTriggerを破棄する。
		 */
		destroy(): void {
			this._handlers = undefined;
			this.length = 0;
		}

		/**
		 * このTriggerが破棄されているかを返す。
		 */
		destroyed(): boolean {
			return this._handlers === undefined;
		}

		_comparePartial(target: TriggerSearchConditions<T>, compare: TriggerSearchConditions<T>): boolean {
			if (target.func !== undefined && target.func !== compare.func)
				return false;
			if (target.owner !== undefined && target.owner !== compare.owner)
				return false;
			if (target.name !== undefined && target.name !== compare.name)
				return false;

			return true;
		}
	}

	/**
	 * 他のTriggerに反応して発火するイベント通知機構。
	 */
	export class ChainTrigger<T> extends Trigger<T>  {
		/**
		 * fireするきっかけとなる `Trigger` 。
		 * この値は参照のためにのみ公開されている。外部から変更してはならない。
		 */
		chain: Trigger<T>;

		/**
		 * フィルタ。
		 * `chain` がfireされたときに実行される。この関数が真を返した時のみ、このインスタンスはfireされる。
		 */
		filter: (args?: T) => boolean | undefined;

		/**
		 * フィルタのオーナー。
		 * `filter` の呼び出し時、 `this` として与えられる。
		 */
		filterOwner: any;

		/**
		 * `chain`に実際に`add`されているか否か。
		 * @private
		 */
		_isActivated: boolean;

		/**
		 * `ChainTrigger` のインスタンスを生成する。
		 *
		 * このインスタンスは、 `chain` がfireされたときに `filter` を実行し、真を返した場合に自身をfireする。
		 * @param chain このインスタンスがfireするきっかけとなる Trigger
		 * @param filter `chain` がfireされたときに実行される関数。本関数の戻り値が真の場合、このインスタンスをfireする。
		 * @param filterOwner `filter` 呼び出し時に使われる `this` の値。
		 */
		constructor(chain: Trigger<T>, filter?: (args?: T) => boolean, filterOwner?: any) {
			super();

			this.chain = chain;
			this.filter = filter;
			this.filterOwner = filterOwner;
			this._isActivated = false;
		}

		add(paramsOrHandler: any, owner?: any): void {
			super.add(paramsOrHandler, owner);

			if (! this._isActivated) {
				this.chain.add(this._onChainTriggerFired, this);
				this._isActivated = true;
			}
		}

		addOnce(paramsOrHandler: any, owner?: any): void {
			super.addOnce(paramsOrHandler, owner);

			if (! this._isActivated) {
				this.chain.add(this._onChainTriggerFired, this);
				this._isActivated = true;
			}
		}

		remove(func: HandlerFunction<T>, owner?: any): void;
		remove(params: TriggerRemoveConditions<T>): void;
		remove(paramsOrFunc: any, owner?: any): void {
			super.remove(paramsOrFunc, owner);

			if (this.length === 0 && this._isActivated) {
				this.chain.remove(this._onChainTriggerFired, this);
				this._isActivated = false;
			}
		}

		removeAll(params?: TriggerRemoveConditions<T>): void {
			super.removeAll(params);

			if (this.length === 0 && this._isActivated) {
				this.chain.remove(this._onChainTriggerFired, this);
				this._isActivated = false;
			}
		}

		destroy(): void {
			super.destroy();
			this.chain.remove(this._onChainTriggerFired, this);
			this.filter = null;
			this.filterOwner = null;
			this._isActivated = false;
		}

		/**
		 * @private
		 */
		_onChainTriggerFired(args: T): void {
			if (!this.filter || this.filter.call(this.filterOwner, args)) {
				this.fire(args);
			}
		}
	}
}
