namespace g {
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

		var basedir = currentModule ? currentModule._dirname : game.assetBase;
		var targetScriptAsset: Asset;
		var resolvedPath: string;
		var resolvedVirtualPath: string;
		var liveAssetVirtualPathTable = game._assetManager._liveAssetVirtualPathTable;
		var moduleMainScripts = game._assetManager._moduleMainScripts;

		// 0. アセットIDらしい場合はまず当該アセットを探す
		if (path.indexOf("/") === -1) {
			if (game._assetManager._assets.hasOwnProperty(path))
				targetScriptAsset = game._assetManager._assets[path];
		}

		// 1. If X is a core module,
		// (何もしない。コアモジュールには対応していない。ゲーム開発者は自分でコアモジュールへの依存を解決する必要がある)

		if (/^\.\/|^\.\.\/|^\//.test(path)) {
			// 2. If X begins with './' or '/' or '../'
			resolvedPath = PathUtil.resolvePath(basedir, path);

			if (game._scriptCaches.hasOwnProperty(resolvedPath)) {
				return game._scriptCaches[resolvedPath]._cachedValue();
			} else if (game._scriptCaches.hasOwnProperty(resolvedPath + ".js")) {
				return game._scriptCaches[resolvedPath + ".js"]._cachedValue();
			}

			if (currentModule) {
				if (currentModule._virtualDirname) {
					resolvedVirtualPath = PathUtil.resolvePath(currentModule._virtualDirname, path);
				} else {
					throw ExceptionFactory.createAssertionError("g._require: require from DynamicAsset is not supported");
				}
			} else {
				if (path.substring(0, 2) === "./") {
					// モジュールが空の場合、相対パスの先頭の `"./"` を取り除くと仮想パスになる。
					resolvedVirtualPath = path.substring(2);
				} else {
					throw ExceptionFactory.createAssertionError("g._require: entry point must start with './'");
				}
			}

			// 2.a. LOAD_AS_FILE(Y + X)
			if (!targetScriptAsset)
				targetScriptAsset = Util.findAssetByPathAsFile(resolvedVirtualPath, liveAssetVirtualPathTable);
			// 2.b. LOAD_AS_DIRECTORY(Y + X)
			if (!targetScriptAsset)
				targetScriptAsset = Util.findAssetByPathAsDirectory(resolvedVirtualPath, liveAssetVirtualPathTable);

		} else {
			// 3. LOAD_NODE_MODULES(X, dirname(Y))
			// `path` は node module の名前であると仮定して探す

			// akashic-engine独自拡張: 対象の `path` が `moduleMainScripts` に指定されていたらそちらを参照する
			if (moduleMainScripts[path]) {
				targetScriptAsset = game._assetManager._liveAssetVirtualPathTable[moduleMainScripts[path]];
			}

			if (! targetScriptAsset) {
				var dirs = currentModule ? currentModule.paths : [];
				dirs.push("node_modules");
				for (var i = 0; i < dirs.length; ++i) {
					var dir = dirs[i];
					resolvedVirtualPath = PathUtil.resolvePath(dir, path);
					targetScriptAsset = Util.findAssetByPathAsFile(resolvedVirtualPath, liveAssetVirtualPathTable);
					if (targetScriptAsset)
						break;
					targetScriptAsset = Util.findAssetByPathAsDirectory(resolvedVirtualPath, liveAssetVirtualPathTable);
					if (targetScriptAsset)
						break;
				}
			}
		}

		if (targetScriptAsset) {
			if (game._scriptCaches.hasOwnProperty(targetScriptAsset.path))
				return game._scriptCaches[targetScriptAsset.path]._cachedValue();

			if (targetScriptAsset instanceof ScriptAsset) {
				var context = new ScriptAssetContext(game, targetScriptAsset);
				game._scriptCaches[targetScriptAsset.path] = context;
				return context._executeScript(currentModule);

			} else if (targetScriptAsset instanceof TextAsset) {
				// JSONの場合の特殊挙動をトレースするためのコード。node.jsの仕様に準ずる
				if (targetScriptAsset && PathUtil.resolveExtname(path) === ".json") {
					// Note: node.jsではここでBOMの排除をしているが、いったんakashicでは排除しないで実装
					var cache = game._scriptCaches[targetScriptAsset.path] = new RequireCachedValue(JSON.parse(targetScriptAsset.data));
					return cache._cachedValue();
				}
			}
		}
		throw ExceptionFactory.createAssertionError("g._require: can not find module: " + path);
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
				return (path === "g") ? _g : g._require(game, path, this);
			};
		}
	}
}
