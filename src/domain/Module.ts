import { ModuleLike } from "../pdi-types/ModuleLike";
import { ScriptAssetRuntimeValue, ScriptAssetRuntimeValueBase } from "../pdi-types/ScriptAssetRuntimeValue";
import { PathUtil } from "./PathUtil";

export interface ModuleParameterObject {
	runtimeValueBase: ScriptAssetRuntimeValueBase;
	id: string;
	path: string;
	virtualPath?: string;
	require: (path: string, currentModule?: Module) => any;
}

/**
 * Node.js が提供する module の互換クラス。
 */
export class Module implements ModuleLike {
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
	parent: ModuleLike;

	/**
	 * このモジュールの読み込みが完了しているか。
	 */
	loaded: boolean;

	/**
	 * このモジュールが `require()` したモジュール。
	 */
	children: ModuleLike[];

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
	_runtimeValue: ScriptAssetRuntimeValue;

	constructor(param: ModuleParameterObject) {
		const path = param.path;
		const dirname = PathUtil.resolveDirname(path);
		// `virtualPath` と `virtualDirname` は　`DynamicAsset` の場合は `undefined` になる。
		const virtualPath = param.virtualPath;
		const virtualDirname = virtualPath ? PathUtil.resolveDirname(virtualPath) : undefined;
		const require = param.require;

		this._runtimeValue = Object.create(param.runtimeValueBase, {
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

		this.id = param.id;
		this.filename = param.path;
		this.exports = {};
		this.parent = null; // Node.js と互換
		this.loaded = false;
		this.children = [];
		this.paths = virtualDirname ? PathUtil.makeNodeModulePaths(virtualDirname) : [];
		this._dirname = dirname;
		this._virtualDirname = virtualDirname;

		// メソッドとしてではなく単体で呼ばれるのでメソッドにせずここで実体を代入する
		this.require = (path: string) => {
			return require(path, this);
		};
	}
}
