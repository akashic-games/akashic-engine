import { PathUtil } from "@akashic/game-configuration/lib/utils/PathUtil";
import type { Asset, ScriptAssetRuntimeValueBase } from "@akashic/pdi-types";
import type { AssetManager, OneOfAsset } from "./AssetManager";
import { ExceptionFactory } from "./ExceptionFactory";
import { Module } from "./Module";
import type { RequireCacheable } from "./RequireCacheable";
import { RequireCachedValue } from "./RequireCachedValue";
import { ScriptAssetContext } from "./ScriptAssetContext";

/**
 * `Module` を管理するクラス。
 * このクラスのインスタンスは `Game` に一つ存在し、スクリプトアセットの require() の解決に利用される。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
 */
export class ModuleManager {
	/**
	 * アセットの管理者。
	 * @private
	 */
	_assetManager: AssetManager;

	/**
	 * ScriptAssetの実行結果キャッシュ。
	 * g.require経由の場合ここに格納される。
	 * @private
	 */
	_scriptCaches: { [key: string]: RequireCacheable };

	/**
	 * @private
	 */
	_runtimeValueBase: ScriptAssetRuntimeValueBase;

	constructor(runtimeBase: ScriptAssetRuntimeValueBase, assetManager: AssetManager) {
		this._assetManager = assetManager;
		this._runtimeValueBase = runtimeBase;
		this._scriptCaches = {};
	}

	/**
	 * エンジン内部で利用する _require() を wrap した関数
	 *
	 * 引数の仕様については `_require()` の仕様を参照のこと。
	 * _require() の戻り値で __esModule が真の場合に戻り値の .default を返す。
	 * 現状 Akashic Engine では ESM を扱えていない。そのため、対象の __esModule を参照し .default を返すことで、
	 * TypeScript/Babel 向けの簡易対応とし exports.default を扱えるようにしている。
	 * 通常、ゲーム開発者がこのメソッドを利用する必要はない。
	 *
	 * @ignore
	 */
	_internalRequire(path: string, currentModule?: Module): any {
		const module = this._require(path, currentModule);
		return module.__esModule ? module.default : module;
	}

	/**
	 * node.js の require() ライクな読み込み処理を行い、その結果を返す。
	 *
	 * node.jsのrequireに限りなく近いモデルでrequireする。
	 * ただしアセットIDで該当すればそちらを優先する。また node.js のコアモジュールには対応していない。
	 * 通常、ゲーム開発者が利用するのは `Module#require()` であり、このメソッドはその内部実装を提供する。
	 *
	 * @ignore
	 * @param path requireのパス。相対パスと、Asset識別名を利用することが出来る。
	 *              なお、./xxx.json のようにjsonを指定する場合、そのAssetはTextAssetである必要がある。
	 *              その他の形式である場合、そのAssetはScriptAssetである必要がある。
	 * @param currentModule このrequireを実行した Module
	 * @returns {any} スクリプト実行結果。通常はScriptAsset#executeの結果。
	 *                 例外的に、jsonであればTextAsset#dataをJSON.parseした結果が返る
	 */
	_require(path: string, currentModule?: Module): any {
		// Node.js の require の挙動については http://nodejs.jp/nodejs.org_ja/api/modules.html も参照。

		let targetScriptAsset: OneOfAsset | undefined;
		let resolvedPath: string | undefined;
		const liveAssetVirtualPathTable = this._assetManager._liveAssetVirtualPathTable;
		const moduleMainScripts = this._assetManager._moduleMainScripts;

		// 0. アセットIDらしい場合はまず当該アセットを探す
		if (path.indexOf("/") === -1) {
			if (this._assetManager._assets.hasOwnProperty(path)) {
				targetScriptAsset = this._assetManager._assets[path];
				resolvedPath = this._assetManager._liveAssetPathTable[targetScriptAsset.path];
			}
		}

		if (!resolvedPath) {
			resolvedPath = this._resolvePath(path, currentModule);
			// 戻り値は先頭に "/" が付くので削除している。( moduleMainScripts を参照して返される値には先頭に "/" は付かない)
			if (/^\//.test(resolvedPath)) resolvedPath = resolvedPath.slice(1);
		}

		if (this._scriptCaches.hasOwnProperty(resolvedPath)) {
			return this._scriptCaches[resolvedPath]._cachedValue();
		}

		// akashic-engine独自仕様: 対象の `path` が `moduleMainScripts` に指定されていたらそちらを参照する
		// moduleMainScripts は将来的に非推奨となるが、後方互換性のため moduleMainScripts が存在すれば moduleMainScripts を優先する
		if (moduleMainScripts[path]) {
			targetScriptAsset = liveAssetVirtualPathTable[resolvedPath];
		} else {
			targetScriptAsset = this._findAssetByPathAsFile(resolvedPath, liveAssetVirtualPathTable);
		}

		if (targetScriptAsset) {
			// @ts-ignore
			if (this._scriptCaches.hasOwnProperty(resolvedPath)) return this._scriptCaches[resolvedPath]._cachedValue();

			if (targetScriptAsset.type === "script") {
				const module = new Module({
					runtimeValueBase: this._runtimeValueBase,
					id: targetScriptAsset.id,
					path: targetScriptAsset.path,
					virtualPath: this._assetManager._liveAssetPathTable[targetScriptAsset.path],
					requireFunc: (path: string, mod?: Module) => this._require(path, mod),
					resolveFunc: (path: string, mod?: Module) => this._resolvePath(path, mod)
				});
				const script = new ScriptAssetContext(targetScriptAsset, module);
				// @ts-ignore
				this._scriptCaches[resolvedPath] = script;
				return script._executeScript(currentModule);
			} else if (targetScriptAsset.type === "text") {
				// JSONの場合の特殊挙動をトレースするためのコード。node.jsの仕様に準ずる
				if (targetScriptAsset && PathUtil.resolveExtname(path) === ".json") {
					// Note: node.jsではここでBOMの排除をしているが、いったんakashicでは排除しないで実装
					// @ts-ignore
					const cache = (this._scriptCaches[resolvedPath] = new RequireCachedValue(JSON.parse(targetScriptAsset.data)));
					return cache._cachedValue();
				}
			}
		}
		throw ExceptionFactory.createAssertionError("g._require: can not find module: " + path);
	}

	/**
	 * 対象のモジュールからの相対パスを、 game.json のディレクトリをルート (`/`) とする `/` 区切りの絶対パス形式として解決する。
	 * `this._require()` と違い `path` にアセットIDが指定されても解決しない点に注意。
	 * 通常、ゲーム開発者が利用するのは `require.resolve()` であり、このメソッドはその内部実装を提供する。
	 *
	 * @ignore
	 * @param path resolve する対象のパス。相対パスを利用することができる。
	 * @param currentModule この require を実行した Module 。
	 * @returns {string} 絶対パス
	 */
	_resolvePath(path: string, currentModule?: Module): string {
		let resolvedPath: string | null = null;
		const liveAssetVirtualPathTable = this._assetManager._liveAssetVirtualPathTable;
		const moduleMainScripts = this._assetManager._moduleMainScripts;

		// require(X) from module at path Y
		// 1. If X is a core module,
		// (何もしない。コアモジュールには対応していない。ゲーム開発者は自分でコアモジュールへの依存を解決する必要がある)

		if (/^\.\/|^\.\.\/|^\//.test(path)) {
			// 2. If X begins with './' or '/' or '../'

			if (currentModule) {
				if (!currentModule._virtualDirname) {
					throw ExceptionFactory.createAssertionError("g._require.resolve: couldn't resolve the module path without virtualPath");
				}
				resolvedPath = PathUtil.resolvePath(currentModule._virtualDirname, path);
			} else {
				if (/^\.\//.test(path)) {
					resolvedPath = path.substring(2);
				} else if (/^\//.test(path)) {
					resolvedPath = path.substring(1);
				} else {
					throw ExceptionFactory.createAssertionError("g._require.resolve: entry point path must start with './'");
				}
			}

			// 2.a. LOAD_AS_FILE(Y + X)
			let targetPath = this._resolveAbsolutePathAsFile(resolvedPath, liveAssetVirtualPathTable);
			if (targetPath) {
				return targetPath;
			}

			// 2.b. LOAD_AS_DIRECTORY(Y + X)
			targetPath = this._resolveAbsolutePathAsDirectory(resolvedPath, liveAssetVirtualPathTable);
			if (targetPath) {
				return targetPath;
			}
		} else {
			// 3. LOAD_NODE_MODULES(X, dirname(Y))

			// akashic-engine独自仕様: 対象の `path` が `moduleMainScripts` に指定されていたらそちらを返す
			// moduleMainScripts は将来的に非推奨となるが、後方互換性のため moduleMainScripts が存在すれば moduleMainScripts を優先する
			if (moduleMainScripts[path]) {
				return moduleMainScripts[path];
			}

			// 3.a LOAD_NODE_MODULES(X, START)
			const dirs = currentModule ? currentModule.paths.concat() : [];
			dirs.push("node_modules");
			for (let i = 0; i < dirs.length; ++i) {
				const dir = dirs[i];
				const targetPath = PathUtil.resolvePath(dir, path);

				resolvedPath = this._resolveAbsolutePathAsFile(targetPath, liveAssetVirtualPathTable);
				if (resolvedPath) {
					return resolvedPath;
				}

				resolvedPath = this._resolveAbsolutePathAsDirectory(targetPath, liveAssetVirtualPathTable);
				if (resolvedPath) {
					return resolvedPath;
				}
			}
		}

		throw ExceptionFactory.createAssertionError("g._require.resolve: couldn't resolve the path: " + path);
	}

	/**
	 * 与えられたパス文字列がファイルパスであると仮定して、対応するアセットを探す。
	 * 見つかった場合そのアセットを、そうでない場合 `undefined` を返す。
	 * 通常、ゲーム開発者がファイルパスを扱うことはなく、このメソッドを呼び出す必要はない。
	 *
	 * @ignore
	 * @param resolvedPath パス文字列
	 * @param liveAssetPathTable パス文字列のプロパティに対応するアセットを格納したオブジェクト
	 */
	_findAssetByPathAsFile(resolvedPath: string, liveAssetPathTable: { [key: string]: OneOfAsset }): OneOfAsset | undefined {
		if (liveAssetPathTable.hasOwnProperty(resolvedPath)) return liveAssetPathTable[resolvedPath];
		if (liveAssetPathTable.hasOwnProperty(resolvedPath + ".js")) return liveAssetPathTable[resolvedPath + ".js"];
		return undefined;
	}

	/**
	 * 与えられたパス文字列がファイルパスであると仮定して、対応するアセットの絶対パスを解決する。
	 * アセットが存在した場合はそのパスを、そうでない場合 `null` を返す。
	 * 通常、ゲーム開発者がファイルパスを扱うことはなく、このメソッドを呼び出す必要はない。
	 *
	 * @ignore
	 * @param resolvedPath パス文字列
	 * @param liveAssetPathTable パス文字列のプロパティに対応するアセットを格納したオブジェクト
	 */
	_resolveAbsolutePathAsFile(resolvedPath: string, liveAssetPathTable: { [key: string]: Asset }): string | null {
		if (liveAssetPathTable.hasOwnProperty(resolvedPath)) return "/" + resolvedPath;
		if (liveAssetPathTable.hasOwnProperty(resolvedPath + ".js")) return "/" + resolvedPath + ".js";
		return null;
	}

	/**
	 * 与えられたパス文字列がディレクトリパスであると仮定して、対応するアセットの絶対パスを解決する。
	 * アセットが存在した場合はそのパスを、そうでない場合 `null` を返す。
	 * 通常、ゲーム開発者がファイルパスを扱うことはなく、このメソッドを呼び出す必要はない。
	 * ディレクトリ内に package.json が存在する場合、package.json 自体もアセットとして
	 * `liveAssetPathTable` から参照可能でなければならないことに注意。
	 *
	 * @ignore
	 * @param resolvedPath パス文字列
	 * @param liveAssetPathTable パス文字列のプロパティに対応するアセットを格納したオブジェクト
	 */
	_resolveAbsolutePathAsDirectory(resolvedPath: string, liveAssetPathTable: { [key: string]: OneOfAsset }): string | null {
		let path = resolvedPath + "/package.json";
		const asset = liveAssetPathTable[path];
		const moduleMainPaths = this._assetManager._moduleMainPaths;
		if (moduleMainPaths && moduleMainPaths[path]) {
			return moduleMainPaths[path];
		}
		// liveAssetPathTable[path] != null だけではpathと同名のprototypeプロパティがある場合trueになってしまうので hasOwnProperty() を利用
		if (liveAssetPathTable.hasOwnProperty(path) && asset.type === "text") {
			const pkg = JSON.parse(asset.data);
			if (pkg && typeof pkg.main === "string") {
				const targetPath = this._resolveAbsolutePathAsFile(PathUtil.resolvePath(resolvedPath, pkg.main), liveAssetPathTable);
				if (targetPath) {
					return targetPath;
				}
			}
		}
		path = resolvedPath + "/index.js";
		if (liveAssetPathTable.hasOwnProperty(path)) {
			return "/" + path;
		}
		return null;
	}
}
