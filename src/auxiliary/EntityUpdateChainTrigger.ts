import type { ChainTriggerFilterFunction, HandlerFilterFunction, HandlerFunction, TriggerHandler, TriggerLike } from "@akashic/trigger";
import { ChainTrigger } from "@akashic/trigger";
import type { Game } from "../Game";

/**
 * @private
 */
interface EntityUpdateTriggerHandler<T> extends TriggerHandler<T> {
	createdLocalAge: number;
	originalFilter: HandlerFilterFunction<T> | undefined;
}

/**
 * E#onUpdate 用のチェイントリガ。
 *
 * `this.waitsNextTick` が真の間に登録されたハンドラの発火を次のティック (`Game#tick()`) の呼び出しまで遅延する。
 */
export class EntityUpdateChainTrigger<T> extends ChainTrigger<T> {
	/**
	 * ハンドラの発火を次のティックまで遅延するかどうか。
	 */
	waitsNextTick: boolean;

	/**
	 * @ignore
	 */
	game: Game;

	/**
	 * @private
	 * @ignore
	 */
	_localAgeWeakMap: WeakMap<HandlerFunction<T>, number>;

	/**
	 * @private
	 * @ignore
	 */
	_originalFilterWeakMap: WeakMap<HandlerFunction<T>, HandlerFilterFunction<T>>;

	constructor(game: Game, chain: TriggerLike<T>, filter?: ChainTriggerFilterFunction<T>, filterOwner?: unknown) {
		super(chain, filter, filterOwner);
		this.game = game;
		this.waitsNextTick = false;
		this._localAgeWeakMap = new WeakMap();
		this._originalFilterWeakMap = new WeakMap();
	}

	override _addHandler(params: EntityUpdateTriggerHandler<T>, index?: number | undefined): void {
		if (this.waitsNextTick) {
			this._localAgeWeakMap.set(params.func, this.game.localAge);
			this._originalFilterWeakMap.set(params.func, params.filter as HandlerFilterFunction<T>);
			params.filter = this._filter.bind(this) as HandlerFilterFunction<T>;
		}
		super._addHandler(params, index);
	}

	private _filter(handler: EntityUpdateTriggerHandler<T>): boolean {
		const createdLocalAge = this._localAgeWeakMap.get(handler.func) ?? 0;
		if (this.game.localAge <= createdLocalAge) {
			return false;
		}

		const filter = this._originalFilterWeakMap.get(handler.func);
		handler.filter = filter;
		return filter ? filter(handler) : true;
	}
}
