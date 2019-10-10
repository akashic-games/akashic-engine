import { Game } from "./Game";
import { ExceptionFactory } from "./errors";
import { PathUtil } from "./PathUtil";
import { ScriptAssetContext } from "./ScriptAssetContext";
import { RequireCachedValue } from "./RequireCachedValue";
import { ScriptAssetExecuteEnvironment } from "./ScriptAssetExecuteEnvironment";
import { ScriptAsset } from "./ScriptAsset";
import { TextAsset } from "./TextAsset";
import { Asset } from "./Asset";

declare var g: any;

/**
 * node.js の require() ライクな読み込み処理を行い、その結果を返す。
 *
 * node.jsのrequireに限りなく近いモデルでrequireする。
 * ただしアセットIDで該当すればそちらを優先する。また node.js のコアモジュールには対応していない。
 * 通常、ゲーム開発者が利用するのは `Module#require()` であり、このメソッドはその内部実装を提供する。
 * @param game requireを実行するコンテキストを表すGameインスタンス
 * @param path requireのパス。相対パスと、Asset識別名を利用することが出来る。
 *              なお、./xxx.json のようにjsonを指定する場合、そのAssetはTextAssetである必要がある。
 *              その他の形式である場合、そのAssetはScriptAssetである必要がある。
 * @param currentModule このrequireを実行した Module
 * @returns {any} スクリプト実行結果。通常はScriptAsset#executeの結果。
 *                 例外的に、jsonであればTextAsset#dataをJSON.parseした結果が返る
 */
export function _require(game: Game, path: string, currentModule?: Module): any {
	// Node.js の require の挙動については http://nodejs.jp/nodejs.org_ja/api/modules.html も参照。

	var targetScriptAsset: Asset;
	var resolvedPath: string;
	var liveAssetVirtualPathTable = game._assetManager._liveAssetVirtualPathTable;
	var moduleMainScripts = game._assetManager._moduleMainScripts;

	// 0. アセットIDらしい場合はまず当該アセットを探す
	if (path.indexOf("/") === -1) {
		if (game._assetManager._assets.hasOwnProperty(path)) {
			targetScriptAsset = game._assetManager._assets[path];
			resolvedPath = game._assetManager._liveAbsolutePathTable[targetScriptAsset.path];
		}
	}

	// 1. If X is a core module,
	// (何もしない。コアモジュールには対応していない。ゲーム開発者は自分でコアモジュールへの依存を解決する必要がある)

	if (/^\.\/|^\.\.\/|^\//.test(path)) {
		// 2. If X begins with './' or '/' or '../'

		if (currentModule) {
			if (!currentModule._virtualDirname)
				throw ExceptionFactory.createAssertionError("g._require: require from DynamicAsset is not supported");
			resolvedPath = PathUtil.resolvePath(currentModule._virtualDirname, path);
		} else {
			if (!/^\.\//.test(path)) throw ExceptionFactory.createAssertionError("g._require: entry point path must start with './'");
			resolvedPath = path.substring(2);
		}

		if (game._scriptCaches.hasOwnProperty(resolvedPath)) {
			return game._scriptCaches[resolvedPath]._cachedValue();
		} else if (game._scriptCaches.hasOwnProperty(resolvedPath + ".js")) {
			return game._scriptCaches[resolvedPath + ".js"]._cachedValue();
		}

		// 2.a. LOAD_AS_FILE(Y + X)
		if (!targetScriptAsset) targetScriptAsset = _findAssetByPathAsFile(resolvedPath, liveAssetVirtualPathTable);
		// 2.b. LOAD_AS_DIRECTORY(Y + X)
		if (!targetScriptAsset) targetScriptAsset = _findAssetByPathAsDirectory(resolvedPath, liveAssetVirtualPathTable);
	} else {
		// 3. LOAD_NODE_MODULES(X, dirname(Y))
		// `path` は node module の名前であると仮定して探す

		// akashic-engine独自仕様: 対象の `path` が `moduleMainScripts` に指定されていたらそちらを参照する
		if (moduleMainScripts[path]) {
			resolvedPath = moduleMainScripts[path];
			targetScriptAsset = game._assetManager._liveAssetVirtualPathTable[resolvedPath];
		}

		if (!targetScriptAsset) {
			var dirs = currentModule ? currentModule.paths : [];
			dirs.push("node_modules");
			for (var i = 0; i < dirs.length; ++i) {
				var dir = dirs[i];
				resolvedPath = PathUtil.resolvePath(dir, path);
				targetScriptAsset = _findAssetByPathAsFile(resolvedPath, liveAssetVirtualPathTable);
				if (targetScriptAsset) break;
				targetScriptAsset = _findAssetByPathAsDirectory(resolvedPath, liveAssetVirtualPathTable);
				if (targetScriptAsset) break;
			}
		}
	}

	if (targetScriptAsset) {
		if (game._scriptCaches.hasOwnProperty(resolvedPath)) return game._scriptCaches[resolvedPath]._cachedValue();

		if (targetScriptAsset instanceof ScriptAsset) {
			var context = new ScriptAssetContext(game, targetScriptAsset);
			game._scriptCaches[resolvedPath] = context;
			return context._executeScript(currentModule);
		} else if (targetScriptAsset instanceof TextAsset) {
			// JSONの場合の特殊挙動をトレースするためのコード。node.jsの仕様に準ずる
			if (targetScriptAsset && PathUtil.resolveExtname(path) === ".json") {
				// Note: node.jsではここでBOMの排除をしているが、いったんakashicでは排除しないで実装
				var cache = (game._scriptCaches[resolvedPath] = new RequireCachedValue(JSON.parse(targetScriptAsset.data)));
				return cache._cachedValue();
			}
		}
	}
	throw ExceptionFactory.createAssertionError("g._require: can not find module: " + path);
}

/**
 * 与えられたパス文字列がファイルパスであると仮定して、対応するアセットを探す。
 * 見つかった場合そのアセットを、そうでない場合 `undefined` を返す。
 * 通常、ゲーム開発者がファイルパスを扱うことはなく、このメソッドを呼び出す必要はない。
 *
 * @param resolvedPath パス文字列
 * @param liveAssetPathTable パス文字列のプロパティに対応するアセットを格納したオブジェクト
 */
export function _findAssetByPathAsFile(resolvedPath: string, liveAssetPathTable: { [key: string]: Asset }): Asset | undefined {
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
 * @param resolvedPath パス文字列
 * @param liveAssetPathTable パス文字列のプロパティに対応するアセットを格納したオブジェクト
 */
export function _findAssetByPathAsDirectory(resolvedPath: string, liveAssetPathTable: { [key: string]: Asset }): Asset | undefined {
	var path: string;
	path = resolvedPath + "/package.json";
	if (liveAssetPathTable.hasOwnProperty(path) && liveAssetPathTable[path] instanceof TextAsset) {
		var pkg = JSON.parse((liveAssetPathTable[path] as TextAsset).data);
		if (pkg && typeof pkg.main === "string") {
			var asset = _findAssetByPathAsFile(PathUtil.resolvePath(resolvedPath, pkg.main), liveAssetPathTable);
			if (asset) return asset;
		}
	}
	path = resolvedPath + "/index.js";
	if (liveAssetPathTable.hasOwnProperty(path)) return liveAssetPathTable[path];
	return undefined;
}

/**
 * Node.js が提供する module の互換クラス。
 */
export class Module {
	/**
	 * モジュールのID。
	 * アセットIDとは異なることに注意。
	 */
	id: string;

	/**
	 * このモジュールのファイル名。
	 * フルパスで与えられる。
	 */
	filename: string;

	/**
	 * このモジュールが公開する値。
	 */
	exports: any;

	/**
	 * このモジュールの親。一番最初にこのモジュール (のファイル) を require() したモジュール。
	 * 該当するモジュールがなければ `null` である。
	 */
	parent: Module;

	/**
	 * このモジュールの読み込みが完了しているか。
	 */
	loaded: boolean;

	/**
	 * このモジュールが `require()` したモジュール。
	 */
	children: Module[];

	/**
	 * このモジュール内で `require()` した時の検索先ディレクトリ。
	 */
	paths: string[];

	/**
	 * このモジュールの評価時に与えられる `require()` 関数。
	 */
	require: (path: string) => any;

	/**
	 * @private
	 */
	_dirname: string;

	/**
	 * @private
	 */
	_virtualDirname: string;

	/**
	 * @private
	 */
	_g: ScriptAssetExecuteEnvironment;

	constructor(game: Game, id: string, path: string) {
		var dirname = PathUtil.resolveDirname(path);
		// `virtualPath` と `virtualDirname` は　`DynamicAsset` の場合は `undefined` になる。
		var virtualPath = game._assetManager._liveAbsolutePathTable[path];
		var virtualDirname = virtualPath ? PathUtil.resolveDirname(virtualPath) : undefined;

		var _g: ScriptAssetExecuteEnvironment = Object.create(g, {
			game: {
				value: game,
				enumerable: true
			},
			filename: {
				value: path,
				enumerable: true
			},
			dirname: {
				value: dirname,
				enumerable: true
			},
			module: {
				value: this,
				writable: true,
				enumerable: true,
				configurable: true
			}
		});

		this.id = id;
		this.filename = path;
		this.exports = {};
		this.parent = null; // Node.js と互換
		this.loaded = false;
		this.children = [];
		this.paths = virtualDirname ? PathUtil.makeNodeModulePaths(virtualDirname) : [];
		this._dirname = dirname;
		this._virtualDirname = virtualDirname;
		this._g = _g;

		// メソッドとしてではなく単体で呼ばれるのでメソッドにせずここで実体を代入する
		this.require = (path: string) => {
			return path === "g" ? _g : _require(game, path, this);
		};
	}
}
