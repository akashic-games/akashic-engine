import { ExceptionFactory } from "../commons/ExceptionFactory";
import { VideoSystem } from "../commons/VideoSystem";
import { Game } from "../Game";
import { AssetLike, AssetLoadHandler } from "../interfaces/AssetLike";
import { AudioAssetLike } from "../interfaces/AudioAssetLike";
import { ImageAssetLike } from "../interfaces/ImageAssetLike";
import { ScriptAssetLike } from "../interfaces/ScriptAssetLike";
import { TextAssetLike } from "../interfaces/TextAssetLike";
import { VideoAssetLike } from "../interfaces/VideoAssetLike";
import {
	AssetConfiguration,
	AssetConfigurationMap,
	AudioAssetHint,
	AudioSystemConfigurationMap,
	ImageAssetHint,
	ModuleMainScriptsMap
} from "../types/AssetConfiguration";
import { AssetLoadErrorType } from "../types/AssetLoadErrorType";
import { DynamicAssetConfiguration } from "../types/DynamicAssetConfiguration";
import { AssetLoadError } from "../types/errors";
import { AssetManagerLoadHandler } from "./AssetManagerLoadHandler";

class AssetLoadingInfo {
	asset: AudioAssetLike | ImageAssetLike | ScriptAssetLike | TextAssetLike | VideoAssetLike;
	handlers: AssetManagerLoadHandler[];
	errorCount: number;
	loading: boolean;

	constructor(
		asset: AudioAssetLike | ImageAssetLike | ScriptAssetLike | TextAssetLike | VideoAssetLike,
		handler: AssetManagerLoadHandler
	) {
		this.asset = asset;
		this.handlers = [handler];
		this.errorCount = 0;
		this.loading = false;
	}
}

function normalizeAudioSystemConfMap(confMap: AudioSystemConfigurationMap): AudioSystemConfigurationMap {
	confMap = confMap || {};

	const systemDefaults: AudioSystemConfigurationMap = {
		music: {
			loop: true,
			hint: { streaming: true }
		},
		sound: {
			loop: false,
			hint: { streaming: false }
		}
	};

	for (let key in systemDefaults) {
		if (!(key in confMap)) {
			confMap[key] = systemDefaults[key];
		}
	}

	return confMap;
}

/**
 * `Asset` を管理するクラス。
 *
 * このクラスのインスタンスは `Game` に一つデフォルトで存在する(デフォルトアセットマネージャ)。
 * デフォルトアセットマネージャは、game.json に記述された通常のアセットを読み込むために利用される。
 *
 * ゲーム開発者は、game.json に記述のないリソースを取得するために、このクラスのインスタンスを独自に生成してよい。
 */
export class AssetManager implements AssetLoadHandler {
	static MAX_ERROR_COUNT: number = 3;

	/**
	 * このインスタンスが属するゲーム。
	 */
	game: Game;

	/**
	 * コンストラクタに渡されたアセットの設定。(assets.json が入っていることが期待される)
	 */
	configuration: { [key: string]: any };

	/**
	 * 読み込み済みのアセット。
	 * requestAssets() で読み込みをリクエストしたゲーム開発者はコールバックでアセットを受け取るので、この変数を参照する必要は通常ない
	 * @private
	 */
	_assets: {
		[key: string]: AudioAssetLike | ImageAssetLike | ScriptAssetLike | TextAssetLike | VideoAssetLike;
	};

	/**
	 * 読み込み済みのrequire解決用の仮想パスからアセットを引くためのテーブル。
	 * アセットIDと異なり、ファイルパスは重複しうる (同じ画像を複数の名前で参照することはできる) ので、要素数は `_assets` 以下である。
	 * この情報は逆引き用の補助的な値にすぎない。このクラスの読み込み済みアセットの管理はすべて `_assets` 経由で行う。
	 * @private
	 */
	_liveAssetVirtualPathTable: {
		[key: string]: AudioAssetLike | ImageAssetLike | ScriptAssetLike | TextAssetLike | VideoAssetLike;
	};

	/**
	 * 読み込み済みのアセットの絶対パスからrequire解決用の仮想パスを引くためのテーブル。
	 * @private
	 */
	_liveAbsolutePathTable: { [path: string]: string };

	/**
	 * requireの第一引数から対応する仮想パスを引くためのテーブル。
	 * @private
	 */
	_moduleMainScripts: ModuleMainScriptsMap;

	/**
	 * 各アセットに対する参照の数。
	 * 参照は requestAssets() で増え、unrefAssets() で減る。
	 * なおロード中であっても参照に数える。つまり (this._refCounts[id] > 1) であるなら !!(this._assets[id] || this._loadings[id])
	 * @private
	 */
	_refCounts: { [key: string]: number };

	/**
	 * 読み込み中のアセットの情報。
	 */
	private _loadings: { [key: string]: AssetLoadingInfo };

	/**
	 * `AssetManager` のインスタンスを生成する。
	 *
	 * @param game このインスタンスが属するゲーム
	 * @param conf このアセットマネージャに与えるアセット定義。game.json の `"assets"` に相当。
	 */
	constructor(
		game: Game,
		conf?: AssetConfigurationMap,
		audioSystemConfMap?: AudioSystemConfigurationMap,
		moduleMainScripts?: ModuleMainScriptsMap
	) {
		this.game = game;
		this.configuration = this._normalize(conf || {}, normalizeAudioSystemConfMap(audioSystemConfMap));
		this._assets = {};
		this._liveAssetVirtualPathTable = {};
		this._liveAbsolutePathTable = {};
		this._moduleMainScripts = moduleMainScripts ? moduleMainScripts : {};
		this._refCounts = {};
		this._loadings = {};
	}

	/**
	 * このインスタンスを破棄する。
	 */
	destroy(): void {
		var assetIds = Object.keys(this._refCounts);
		for (var i = 0; i < assetIds.length; ++i) {
			this._releaseAsset(assetIds[i]);
		}
		this.game = undefined;
		this.configuration = undefined;
		this._assets = undefined;
		this._liveAssetVirtualPathTable = undefined;
		this._liveAbsolutePathTable = undefined;
		this._refCounts = undefined;
		this._loadings = undefined;
	}

	/**
	 * このインスタンスが破棄済みであるかどうかを返す。
	 */
	destroyed(): boolean {
		return this.game === undefined;
	}

	/**
	 * `Asset` の読み込みを再試行する。
	 *
	 * 引数 `asset` は読み込みの失敗が (`Scene#assetLoadFail` で) 通知されたアセットでなければならない。
	 * @param asset 読み込みを再試行するアセット
	 */
	retryLoad(asset: AssetLike): void {
		if (!this._loadings.hasOwnProperty(asset.id))
			throw ExceptionFactory.createAssertionError("AssetManager#retryLoad: invalid argument.");

		var loadingInfo = this._loadings[asset.id];
		if (loadingInfo.errorCount > AssetManager.MAX_ERROR_COUNT) {
			// DynamicAsset はエラーが規定回数超えた場合は例外にせず諦める。
			if (!this.configuration[asset.id]) return;
			throw ExceptionFactory.createAssertionError("AssetManager#retryLoad: too many retrying.");
		}

		if (!loadingInfo.loading) {
			loadingInfo.loading = true;
			asset._load(this);
		}
	}

	/**
	 * このインスタンスに与えられた `AssetConfigurationMap` のうち、グローバルアセットのIDをすべて返す。
	 */
	globalAssetIds(): string[] {
		var ret: string[] = [];
		var conf = this.configuration;
		for (var p in conf) {
			if (!conf.hasOwnProperty(p)) continue;
			if (conf[p].global) ret.push(p);
		}
		return ret;
	}

	/**
	 * アセットの取得を要求する。
	 *
	 * 要求したアセットが読み込み済みでない場合、読み込みが行われる。
	 * 取得した結果は `handler` を通して通知される。
	 * ゲーム開発者はこのメソッドを呼び出してアセットを取得した場合、
	 * 同じアセットID(または取得したアセット)で `unrefAsset()` を呼び出さなければならない。
	 *
	 * @param assetIdOrConf 要求するアセットのIDまたは設定
	 * @param handler 要求結果を受け取るハンドラ
	 */
	requestAsset(assetIdOrConf: string | DynamicAssetConfiguration, handler: AssetManagerLoadHandler): boolean {
		var assetId = typeof assetIdOrConf === "string" ? assetIdOrConf : (<DynamicAssetConfiguration>assetIdOrConf).id;
		var waiting = false;
		var loadingInfo: AssetLoadingInfo;
		if (this._assets.hasOwnProperty(assetId)) {
			++this._refCounts[assetId];
			handler._onAssetLoad(this._assets[assetId]);
		} else if (this._loadings.hasOwnProperty(assetId)) {
			loadingInfo = this._loadings[assetId];
			loadingInfo.handlers.push(handler);
			++this._refCounts[assetId];
			waiting = true;
		} else {
			var a = this._createAssetFor(assetIdOrConf);
			loadingInfo = new AssetLoadingInfo(a, handler);
			this._loadings[assetId] = loadingInfo;
			this._refCounts[assetId] = 1;
			waiting = true;
			loadingInfo.loading = true;
			a._load(this);
		}
		return waiting;
	}

	/**
	 * アセットの参照カウントを減らす。
	 * 引数の各要素で `unrefAsset()` を呼び出す。
	 *
	 * @param assetOrId 参照カウントを減らすアセットまたはアセットID
	 */
	unrefAsset(assetOrId: string | AssetLike): void {
		var assetId = typeof assetOrId === "string" ? assetOrId : assetOrId.id;
		if (--this._refCounts[assetId] > 0) return;
		this._releaseAsset(assetId);
	}

	/**
	 * 複数のアセットの取得を要求する。
	 * 引数の各要素で `requestAsset()` を呼び出す。
	 *
	 * @param assetIdOrConfs 取得するアセットのIDまたはアセット定義
	 * @param handler 取得の結果を受け取るハンドラ
	 */
	requestAssets(assetIdOrConfs: (string | DynamicAssetConfiguration)[], handler: AssetManagerLoadHandler): number {
		var waitingCount = 0;
		for (var i = 0, len = assetIdOrConfs.length; i < len; ++i) {
			if (this.requestAsset(assetIdOrConfs[i], handler)) {
				++waitingCount;
			}
		}
		return waitingCount;
	}

	/**
	 * 複数のアセットを解放する。
	 * 引数の各要素で `unrefAsset()` を呼び出す。
	 *
	 * @param assetOrIds 参照カウントを減らすアセットまたはアセットID
	 * @private
	 */
	unrefAssets(assetOrIds: (string | AssetLike)[]): void {
		for (var i = 0, len = assetOrIds.length; i < len; ++i) {
			this.unrefAsset(assetOrIds[i]);
		}
	}

	_normalize(configuration: any, audioSystemConfMap: AudioSystemConfigurationMap): any {
		var ret: { [key: string]: AssetConfiguration } = {};
		if (!(configuration instanceof Object)) throw ExceptionFactory.createAssertionError("AssetManager#_normalize: invalid arguments.");
		for (var p in configuration) {
			if (!configuration.hasOwnProperty(p)) continue;
			var conf = <AssetConfiguration>Object.create(configuration[p]);
			if (!conf.path) {
				throw ExceptionFactory.createAssertionError("AssetManager#_normalize: No path given for: " + p);
			}
			if (!conf.virtualPath) {
				throw ExceptionFactory.createAssertionError("AssetManager#_normalize: No virtualPath given for: " + p);
			}
			if (!conf.type) {
				throw ExceptionFactory.createAssertionError("AssetManager#_normalize: No type given for: " + p);
			}
			if (conf.type === "image") {
				if (typeof conf.width !== "number")
					throw ExceptionFactory.createAssertionError("AssetManager#_normalize: wrong width given for the image asset: " + p);
				if (typeof conf.height !== "number")
					throw ExceptionFactory.createAssertionError("AssetManager#_normalize: wrong height given for the image asset: " + p);
			}
			if (conf.type === "audio") {
				// durationというメンバは後から追加したため、古いgame.jsonではundefinedになる場合がある
				if (conf.duration === undefined) conf.duration = 0;
				const audioSystemConf = audioSystemConfMap[conf.systemId];
				if (conf.loop === undefined) {
					conf.loop = !!audioSystemConf && !!audioSystemConf.loop;
				}
				if (conf.hint === undefined) {
					conf.hint = audioSystemConf ? audioSystemConf.hint : {};
				}
			}
			if (conf.type === "video") {
				if (!conf.useRealSize) {
					if (typeof conf.width !== "number")
						throw ExceptionFactory.createAssertionError("AssetManager#_normalize: wrong width given for the video asset: " + p);
					if (typeof conf.height !== "number")
						throw ExceptionFactory.createAssertionError(
							"AssetManager#_normalize: wrong height given for the video asset: " + p
						);
					conf.useRealSize = false;
				}
			}
			if (!conf.global) conf.global = false;
			ret[p] = conf;
		}
		return ret;
	}

	/**
	 * @private
	 */
	_createAssetFor(
		idOrConf: string | DynamicAssetConfiguration
	): AudioAssetLike | ImageAssetLike | ScriptAssetLike | TextAssetLike | VideoAssetLike {
		var id: string;
		var uri: string;
		var conf: AssetConfiguration | DynamicAssetConfiguration;
		if (typeof idOrConf === "string") {
			id = idOrConf;
			conf = this.configuration[id];
			uri = this.configuration[id].path;
		} else {
			var dynConf = idOrConf;
			id = dynConf.id;
			conf = dynConf;
			uri = dynConf.uri;
		}
		var resourceFactory = this.game.resourceFactory;
		if (!conf) throw ExceptionFactory.createAssertionError("AssetManager#_createAssetFor: unknown asset ID: " + id);
		switch (conf.type) {
			case "image":
				var asset = resourceFactory.createImageAsset(id, uri, conf.width, conf.height);
				asset.initialize(<ImageAssetHint>conf.hint);
				return asset;
			case "audio":
				var system = conf.systemId ? this.game.audio[conf.systemId] : this.game.audio[this.game.defaultAudioSystemId];
				return resourceFactory.createAudioAsset(id, uri, conf.duration, system, conf.loop, <AudioAssetHint>conf.hint);
			case "text":
				return resourceFactory.createTextAsset(id, uri);
			case "script":
				return resourceFactory.createScriptAsset(id, uri);
			case "video":
				// VideoSystemはまだ中身が定義されていなが、将来のためにVideoAssetにVideoSystemを渡すという体裁だけが整えられている。
				// 以上を踏まえ、ここでは簡単のために都度新たなVideoSystemインスタンスを生成している。
				return resourceFactory.createVideoAsset(id, uri, conf.width, conf.height, new VideoSystem(), conf.loop, conf.useRealSize);
			default:
				throw ExceptionFactory.createAssertionError(
					"AssertionError#_createAssetFor: unknown asset type " + (conf as AssetLike).type + " for asset ID: " + id
				);
		}
	}

	_releaseAsset(assetId: string): void {
		var asset = this._assets[assetId] || (this._loadings[assetId] && this._loadings[assetId].asset);
		var path: string;
		if (asset) {
			path = asset.path;
			if (asset.inUse()) {
				if (asset.type === "audio") {
					asset._system.requestDestroy(asset);
				} else if (asset.type === "video") {
					// NOTE: 一旦再生完了を待たずに破棄することにする
					// TODO: 再生中の動画を破棄するタイミングをどのように扱うか検討し実装
					asset.destroy();
				} else {
					throw ExceptionFactory.createAssertionError("AssetManager#unrefAssets: Unsupported in-use " + asset.id);
				}
			} else {
				asset.destroy();
			}
		}
		delete this._refCounts[assetId];
		delete this._loadings[assetId];
		delete this._assets[assetId];
		if (this.configuration[assetId]) {
			const virtualPath = this.configuration[assetId].virtualPath;
			if (virtualPath && this._liveAssetVirtualPathTable.hasOwnProperty(virtualPath))
				delete this._liveAssetVirtualPathTable[virtualPath];
			if (path && this._liveAbsolutePathTable.hasOwnProperty(path)) delete this._liveAbsolutePathTable[path];
		}
	}

	/**
	 * 現在ロード中のアセットの数。(デバッグ用; 直接の用途はない)
	 * @private
	 */
	_countLoadingAsset(): number {
		return Object.keys(this._loadings).length;
	}

	/**
	 * @private
	 */
	_onAssetError(asset: AssetLike, error: AssetLoadError): void {
		// ロード中に Scene が破棄されていた場合などで、asset が破棄済みになることがある
		if (this.destroyed() || asset.destroyed()) return;

		var loadingInfo = this._loadings[asset.id];
		var hs = loadingInfo.handlers;
		loadingInfo.loading = false;
		++loadingInfo.errorCount;

		if (loadingInfo.errorCount > AssetManager.MAX_ERROR_COUNT && error.retriable) {
			error = ExceptionFactory.createAssetLoadError("Retry limit exceeded", false, AssetLoadErrorType.RetryLimitExceeded, error);
		}
		if (!error.retriable) delete this._loadings[asset.id];
		for (var i = 0; i < hs.length; ++i) hs[i]._onAssetError(asset, error, (a: AssetLike) => this.retryLoad(a));
	}

	/**
	 * @private
	 */
	_onAssetLoad(asset: AudioAssetLike | ImageAssetLike | ScriptAssetLike | TextAssetLike | VideoAssetLike): void {
		// ロード中に Scene が破棄されていた場合などで、asset が破棄済みになることがある
		if (this.destroyed() || asset.destroyed()) return;

		var loadingInfo = this._loadings[asset.id];
		loadingInfo.loading = false;

		delete this._loadings[asset.id];
		this._assets[asset.id] = asset;

		// DynamicAsset の場合は configuration に書かれていないので以下の判定が偽になる
		if (this.configuration[asset.id]) {
			const virtualPath = this.configuration[asset.id].virtualPath;
			if (!this._liveAssetVirtualPathTable.hasOwnProperty(virtualPath)) {
				this._liveAssetVirtualPathTable[virtualPath] = asset;
			} else {
				if (this._liveAssetVirtualPathTable[virtualPath].path !== asset.path)
					throw ExceptionFactory.createAssertionError("AssetManager#_onAssetLoad(): duplicated asset path");
			}
			if (!this._liveAbsolutePathTable.hasOwnProperty(asset.path)) this._liveAbsolutePathTable[asset.path] = virtualPath;
		}

		var hs = loadingInfo.handlers;
		for (var i = 0; i < hs.length; ++i) hs[i]._onAssetLoad(asset);
	}
}
