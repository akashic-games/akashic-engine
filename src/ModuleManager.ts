import type { Asset, ScriptAssetRuntimeValueBase } from "@akashic/pdi-types";
import type { AssetManager, OneOfAsset } from "./AssetManager";
import { ExceptionFactory } from "./ExceptionFactory";
import { Module } from "./Module";
import { PathUtil } from "./PathUtil";
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

		// 1. If X is a core module,
		// (何もしない。コアモジュールには対応していない。ゲーム開発者は自分でコアモジュールへの依存を解決する必要がある)

		if (/^\.\/|^\.\.\/|^\//.test(path)) {
			// 2. If X begins with './' or '/' or '../'

			if (currentModule) {
				if (!currentModule._virtualDirname)
					throw ExceptionFactory.createAssertionError("g._require: require from modules without virtualPath is not supported");
				resolvedPath = PathUtil.resolvePath(currentModule._virtualDirname, path);
			} else {
				if (!/^\.\//.test(path)) throw ExceptionFactory.createAssertionError("g._require: entry point path must start with './'");
				resolvedPath = path.substring(2);
			}

			if (this._scriptCaches.hasOwnProperty(resolvedPath)) {
				return this._scriptCaches[resolvedPath]._cachedValue();
			} else if (this._scriptCaches.hasOwnProperty(resolvedPath + ".js")) {
				return this._scriptCaches[resolvedPath + ".js"]._cachedValue();
			}

			// 2.a. LOAD_AS_FILE(Y + X)
			if (!targetScriptAsset) targetScriptAsset = this._findAssetByPathAsFile(resolvedPath, liveAssetVirtualPathTable);
			// 2.b. LOAD_AS_DIRECTORY(Y + X)
			if (!targetScriptAsset) targetScriptAsset = this._findAssetByPathAsDirectory(resolvedPath, liveAssetVirtualPathTable);
		} else {
			// 3. LOAD_NODE_MODULES(X, dirname(Y))
			// `path` は node module の名前であると仮定して探す

			// akashic-engine独自仕様: 対象の `path` が `moduleMainScripts` に指定されていたらそちらを参照する
			if (moduleMainScripts[path]) {
				resolvedPath = moduleMainScripts[path];
				targetScriptAsset = liveAssetVirtualPathTable[resolvedPath];
			}

			if (!targetScriptAsset) {
				const dirs = currentModule ? currentModule.paths : [];
				dirs.push("node_modules");
				for (let i = 0; i < dirs.length; ++i) {
					const dir = dirs[i];
					resolvedPath = PathUtil.resolvePath(dir, path);
					targetScriptAsset = this._findAssetByPathAsFile(resolvedPath, liveAssetVirtualPathTable);
					if (targetScriptAsset) break;
					targetScriptAsset = this._findAssetByPathAsDirectory(resolvedPath, liveAssetVirtualPathTable);
					if (targetScriptAsset) break;
				}
			}
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
					throw ExceptionFactory.createAssertionError("g._require.resolve: couldn't resolve the moudle path without virtualPath");
				}
				resolvedPath = PathUtil.resolvePath(currentModule._virtualDirname, path);
			} else {
				throw ExceptionFactory.createAssertionError("g._require.resolve: couldn't resolve the moudle without currentModule");
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
	 * 与えられたパス文字列がディレクトリパスであると仮定して、対応するアセットを探す。
	 * 見つかった場合そのアセットを、そうでない場合 `undefined` を返す。
	 * 通常、ゲーム開発者がファイルパスを扱うことはなく、このメソッドを呼び出す必要はない。
	 * ディレクトリ内に package.json が存在する場合、package.json 自体もアセットとして
	 * `liveAssetPathTable` から参照可能でなければならないことに注意。
	 *
	 * @ignore
	 * @param resolvedPath パス文字列
	 * @param liveAssetPathTable パス文字列のプロパティに対応するアセットを格納したオブジェクト
	 */
	_findAssetByPathAsDirectory(resolvedPath: string, liveAssetPathTable: { [key: string]: OneOfAsset }): OneOfAsset | undefined {
		let path: string;
		path = resolvedPath + "/package.json";
		const pkgJsonAsset = liveAssetPathTable[path];
		if (pkgJsonAsset?.type === "text") {
			const pkg = JSON.parse(pkgJsonAsset.data);
			if (pkg && typeof pkg.main === "string") {
				const asset = this._findAssetByPathAsFile(PathUtil.resolvePath(resolvedPath, pkg.main), liveAssetPathTable);
				if (asset) return asset;
			}
		}
		path = resolvedPath + "/index.js";
		if (liveAssetPathTable.hasOwnProperty(path)) return liveAssetPathTable[path];
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
		if (asset?.type === "text") {
			const pkg = JSON.parse(asset.data);
			if (pkg && typeof pkg.main === "string") {
				const targetPath = this._resolveAbsolutePathAsFile(PathUtil.resolvePath(resolvedPath, pkg.main), liveAssetPathTable);
				if (targetPath) {
					return "/" + targetPath;
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
