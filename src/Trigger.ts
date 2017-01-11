namespace g {
	/**
	 * 様々なイベントを表すクラス。
	 * Trigger#handleによってイベントをハンドリングする事が出来る。
	 */
	export class Trigger<T> implements Destroyable {
		/**
		 * チェイン先のTrigger。
		 * `undefined` でない場合、  `this.chain` がfireされた時に自分をfireする。
		 */
		chain: Trigger<T>;

		/**
		 * 登録されたハンドラの配列。
		 */
		_handlers: TriggerHandler<(e: T) => boolean|void>[];

		/**
		 * Trigger のインスタンスを生成する。
		 * @param chain チェイン先の `Trigger` 。非 `undefined` であるとき、この `Trigger` は `chain` のfire時にfireされるようになる。省略された場合、 `undefined`
		 */
		constructor(chain?: Trigger<T>) {
			this.chain = chain;
			this._handlers = [];
		}

		/**
		 * このイベントに対するハンドラを登録する。
		 *
		 * `this.fire()` が呼び出されたとき、その引数を渡して `handler` が呼び出されるようにする。
		 * 引数 `owner` が省略されなかった場合、 `handler` の呼び出し時に `this` として利用される。
		 *
		 * `handler` は `this._handlers` の末尾に加えられる。
		 * 既に登録されたハンドラがある場合、 `handler` はそれらすべての後に呼び出される。
		 * 呼び出された `handler` が真を返した場合、 `handler` の登録は解除される。
		 *
		 * @param owner `handler` の所有者。省略された場合、 `undefined`
		 * @param handler ハンドラ
		 * @param name ハンドラの識別用の名前。省略された場合、 `undefined`
		 */
		handle(owner: any, handler?: (e: T) => boolean|void, name?: string): void {
			if (!this._handlers.length)
				this._activateChain();

			if (! handler) {
				this._handlers.push({owner: undefined, handler: owner, name: name});
			} else {
				this._handlers.push({owner: owner, handler: handler, name: name});
			}
		}

		/**
		 * この `Trigger` を破棄する。
		 * 登録されたハンドラは呼び出されなくなる。
		 */
		destroy(): void {
			this._deactivateChain();
			this.chain = undefined;
			this._handlers = undefined;
		}

		/**
		 * この `Trigger` が破棄済みであるかどうかを返す。
		 */
		destroyed(): boolean {
			return this._handlers === undefined;
		}

		/**
		 * この `Trigger` に対して登録されているハンドラがあるかどうかを返す。
		 */
		hasHandler(): boolean {
			return this._handlers && this._handlers.length > 0;
		}

		/**
		 * このイベントに対するハンドラを、挿入位置を指定して登録する。
		 *
		 * 第一引数に `index` をとる点を除き、 `handle()` と同じ動作を行う。
		 * `handler` は登録済みのハンドラの配列 `this._handlers` の `index` 番目に挿入される。
		 * (ex. `index` に `0` を指定した場合、 `handler` は既に登録された他のどのハンドラより先に呼び出される)
		 *
		 * @param index ハンドラの挿入箇所
		 * @param owner `handler` の所有者。省略された場合、 `undefined`
		 * @param  name ハンドラの識別用の名前。省略された場合、 `undefined`
		 */
		handleInsert(index: number, owner: any, handler?: (e: T) => boolean|void, name?: string): void {
			if (!this._handlers.length)
				this._activateChain();

			if (! handler) {
				this._handlers.splice(index, 0, {owner: undefined, handler: owner, name: name});
			} else {
				this._handlers.splice(index, 0, {owner: owner, handler: handler, name: name});
			}
		}

		/**
		 * 対象の所有者で登録されたハンドラの登録をすべて解除する。
		 *
		 * 引数 `owner` と同じ所有者で登録されたすべてのハンドラの登録を解除する。
		 * @param owner ハンドラの所有者
		 */
		removeAll(owner: any): void {
			var handlers: TriggerHandler<(e: T) => boolean|void>[] = [];
			var tmp: TriggerHandler<(e: T) => boolean|void>;
			while (tmp = this._handlers.shift())
				if (tmp.owner !== owner)
					handlers.push(tmp);

			this._handlers = handlers;

			if (!this._handlers.length)
				this._deactivateChain();
		}

		/**
		 * 対象のハンドラの登録をすべて解除する。
		 *
		 * @param handler 解除するハンドラ
		 */
		removeAllByHandler(handler: (e: T) => boolean|void): void {
			var handlers: TriggerHandler<(e: T) => boolean|void>[] = [];
			var tmp: TriggerHandler<(e: T) => boolean|void>;
			while (tmp = this._handlers.shift())
				if (tmp.handler !== handler)
					handlers.push(tmp);

			this._handlers = handlers;

			if (!this._handlers.length)
				this._deactivateChain();
		}

		/**
		 * 対象の所有者のハンドラ登録を解除する。
		 *
		 * 引数 `owner` と同じ所有者、 `handler` と同じ関数で登録されたハンドラの登録を解除する。
		 * @param owner ハンドラの所有者。省略された場合、 `undefined`
		 * @param handler 解除するハンドラ
		 */
		remove(owner: any, handler?: (e: T) => boolean|void): void {
			var handlers: TriggerHandler<(e: T) => boolean|void>[] = [];
			if (! handler) {
				handler = owner;
				owner = undefined;
			}
			for (var i = 0; i < this._handlers.length; ++i) {
				var tmp = this._handlers[i];
				if (tmp.handler !== handler || tmp.owner !== owner)
					handlers.push(tmp);
			}

			this._handlers = handlers;

			if (!this._handlers.length)
				this._deactivateChain();
		}

		/**
		 * 対象の識別用の名前を持ったハンドラ登録を解除する。
		 *
		 * 引数 `name` と同じ識別で登録されたハンドラの登録を解除する。
		 * @param name 解除するハンドラの識別用の名前
		 */
		removeByName(name: string): void {
			var handlers: TriggerHandler<(e: T) => boolean|void>[] = [];
			for (var i = 0; i < this._handlers.length; ++i) {
				var tmp = this._handlers[i];
				if (tmp.name !== name)
					handlers.push(tmp);
			}

			this._handlers = handlers;

			if (!this._handlers.length)
				this._deactivateChain();
		}

		/**
		 * 対象のハンドラが登録されているかを返す。
		 *
		 * 引数 `owner` と同じ所有者、 `handler` と同じ関数で登録されたハンドラが存在すれば真、でなければ偽を返す。
		 * @param owner ハンドラの所有者。省略された場合、 `undefined`
		 * @param handler ハンドラ
		 */
		isHandled(owner: any, handler?: (e: T) => boolean|void): boolean {
			if (! handler) {
				handler = owner;
				owner = undefined;
			}
			for (var i = 0; i < this._handlers.length; ++i) {
				if (this._handlers[i].owner === owner && this._handlers[i].handler === handler)
					return true;
			}
			return false;
		}

		/**
		 * このイベントを発火する。
		 *
		 * 登録された各ハンドラを呼び出す。各ハンドラが真を返した場合、そのハンドラの登録を解除する。
		 * @param param 登録された各ハンドラの呼び出し時に引数として渡される値。省略された場合、 `undefined`
		 */
		fire(param?: T): void {
			if (! this._handlers || ! this._handlers.length)
				return;

			var handlers = this._handlers.concat();	// clone
			for (var i = 0; i < handlers.length; ++i) {
				var handler = handlers[i];
				if (handler.handler.call(handler.owner, param))
					this._remove(handler);
			}
		}

		_reset(): void {
			this._handlers = [];
			this._deactivateChain();
		}

		_activateChain(): void {
			if (! this.chain)
				return;

			if (this.chain.isHandled(this, this._onChainFire))
				return;

			this.chain.handle(this, this._onChainFire);
		}

		_deactivateChain(): void {
			if (! this.chain)
				return;

			if (! this.chain.isHandled(this, this._onChainFire))
				return;

			this.chain.remove(this, this._onChainFire);
		}

		_remove(handler: TriggerHandler<(e: T) => boolean|void>): void {
			var index = this._handlers.indexOf(handler);
			if (index === -1)
				return;
			this._handlers.splice(index, 1);
			if (!this._handlers.length)
				this._deactivateChain();
		}

		_onChainFire(e: T): void {
			this.fire(e);
		}
	}

	/**
	 * チェイン条件を指定出来るTrigger。
	 */
	export class ConditionalChainTrigger<T> extends Trigger<T> {
		filter: (e: T) => boolean;
		filterOwner: any;

		/**
		 * `ConditionalChainTrigger` のインスタンスを生成する。
		 *
		 * この Trigger は `chain` がfireされたとき、与えられた引数で `filterOwner` を `this` として `filter` を呼び出す。 `filter` が真を返したときのみ 自身をfireする。
		 * @param chain チェイン先のTrigger
		 * @param filterOwner `filter` 呼び出し時に `this` として使われる値。省略された場合、 `undefined`
		 * @param filter チェインの条件を表す関数
		 */
		constructor(chain: Trigger<T>, filterOwner: any, filter: (e: T) => boolean) {
			super(chain);

			this.filterOwner = filterOwner;
			this.filter = filter;
		}

		_onChainFire(e: T): void {
			if (this.filter && !this.filter.call(this.filterOwner, e))
				return;

			this.fire(e);
		}
	}
}
