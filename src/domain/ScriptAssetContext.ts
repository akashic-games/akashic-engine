import { ExceptionFactory } from "../commons/ExceptionFactory";
import { ScriptAssetLike } from "../interfaces/ScriptAssetLike";
import { Module } from "./Module";
import { RequireCacheable } from "./RequireCacheable";

/**
 * `ScriptAsset` の実行コンテキスト。
 * 通常スクリプトアセットを実行するためにはこのクラスを経由する。
 *
 * ゲーム開発者がこのクラスを利用する必要はない。
 * スクリプトアセットを実行する場合は、暗黙にこのクラスを利用する `require()` を用いること。
 */
export class ScriptAssetContext implements RequireCacheable {
	/**
	 * @private
	 */
	_asset: ScriptAssetLike;

	/**
	 * @private
	 */
	_module: Module;

	/**
	 * @private
	 */
	_started: boolean;

	constructor(asset: ScriptAssetLike, module: Module) {
		this._asset = asset;
		this._module = module;
		this._started = false;
	}

	/**
	 * @private
	 */
	_cachedValue(): any {
		if (!this._started) throw ExceptionFactory.createAssertionError("ScriptAssetContext#_cachedValue: not executed yet.");
		return this._module.exports;
	}

	/**
	 * @private
	 */
	_executeScript(currentModule?: Module): any {
		if (this._started) return this._module.exports;

		if (currentModule) {
			// Node.js 互換挙動: Module#parent は一番最初に require() した module になる
			this._module.parent = currentModule;
			// Node.js 互換挙動: 親 module の children には自身が実行中の段階で既に追加されている
			currentModule.children.push(this._module);
		}

		this._started = true;
		this._asset.execute(this._module._runtimeValue);
		this._module.loaded = true;
		return this._module.exports;
	}
}
