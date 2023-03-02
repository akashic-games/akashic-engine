import type {
	AssetConfiguration,
	AssetConfigurationMap,
	AudioSystemConfigurationMap,
	ModuleMainScriptsMap,
	CommonAreaShortened,
	AssetConfigurationCommonBase,
	ImageAssetConfigurationBase,
	ScriptAssetConfigurationBase,
	TextAssetConfigurationBase,
	AudioAssetConfigurationBase,
	VideoAssetConfigurationBase,
	VectorImageAssetConfigurationBase
} from "@akashic/game-configuration";
import type {
	Asset,
	AssetLoadHandler,
	AudioAsset,
	AssetLoadError,
	CommonArea,
	ImageAsset,
	ResourceFactory,
	ScriptAsset,
	TextAsset,
	VideoAsset,
	VectorImageAsset
} from "@akashic/pdi-types";
import type { AssetGenerationConfiguration } from "./AssetGenerationConfiguration";
import type { AssetManagerLoadHandler } from "./AssetManagerLoadHandler";
import type { AudioSystem } from "./AudioSystem";
import type { AudioSystemManager } from "./AudioSystemManager";
import { EmptyGeneratedVectorImageAsset } from "./auxiliary/EmptyGeneratedVectorImageAsset";
import { EmptyVectorImageAsset } from "./auxiliary/EmptyVectorImageAsset";
import { PartialImageAsset } from "./auxiliary/PartialImageAsset";
import type { DynamicAssetConfiguration } from "./DynamicAssetConfiguration";
import { ExceptionFactory } from "./ExceptionFactory";
import { VideoSystem } from "./VideoSystem";

export type OneOfAsset = AudioAsset | ImageAsset | ScriptAsset | TextAsset | VideoAsset | VectorImageAsset;

// TODO: 以下の internal types を game-configuration に切り出す
type AssetConfigurationCore =
	| ImageAssetConfiguration
	| VectorImageAssetConfiguration
	| VideoAssetConfiguration
	| AudioAssetConfiguration
	| TextAssetConfiguration
	| ScriptAssetConfiguration;

type UnneededKeysForAsset = "path" | "virtualPath" | "global";

interface ImageAssetConfiguration
	extends Omit<AssetConfigurationCommonBase, "type">,
		Omit<ImageAssetConfigurationBase, UnneededKeysForAsset> {}
interface VectorImageAssetConfiguration
	extends Omit<AssetConfigurationCommonBase, "type">,
		Omit<VectorImageAssetConfigurationBase, UnneededKeysForAsset> {}
interface VideoAssetConfiguration
	extends Omit<AssetConfigurationCommonBase, "type">,
		Omit<VideoAssetConfigurationBase, UnneededKeysForAsset> {}
interface AudioAssetConfiguration
	extends Omit<AssetConfigurationCommonBase, "type">,
		Omit<AudioAssetConfigurationBase, UnneededKeysForAsset> {}
interface TextAssetConfiguration
	extends Omit<AssetConfigurationCommonBase, "type">,
		Omit<TextAssetConfigurationBase, UnneededKeysForAsset> {}
interface ScriptAssetConfiguration
	extends Omit<AssetConfigurationCommonBase, "type">,
		Omit<ScriptAssetConfigurationBase, UnneededKeysForAsset> {}

type AssetIdOrConf = string | DynamicAssetConfiguration | AssetGenerationConfiguration;

export interface AssetManagerParameterGameLike {
	resourceFactory: ResourceFactory;
	audio: AudioSystemManager;
	defaultAudioSystemId: "music" | "sound";
}

/**
 * @ignore
 */
class AssetLoadingInfo {
	asset: OneOfAsset;
	handlers: AssetManagerLoadHandler[];
	errorCount: number;
	loading: boolean;

	constructor(asset: OneOfAsset, handler: AssetManagerLoadHandler) {
		this.asset = asset;
		this.handlers = [handler];
		this.errorCount = 0;
		this.loading = false;
	}
}

function normalizeAudioSystemConfMap(confMap: AudioSystemConfigurationMap = {}): AudioSystemConfigurationMap {
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

	for (const key in systemDefaults) {
		if (!(key in confMap)) {
			confMap[key] = systemDefaults[key];
		}
	}

	return confMap;
}

function normalizeCommonArea(area: CommonArea | CommonAreaShortened): CommonArea {
	return Array.isArray(area) ? { x: area[0], y: area[1], width: area[2], height: area[3] } : area;
}

/**
 * パスパターンを関数に変換する。
 *
 * パスパターンは、パス文字列、または0個以上の `**`, `*`, `?` を含むパス文字列である。
 * (実装の単純化のため、いわゆる glob のうちよく使われそうなものだけをサポートしている。)
 * 詳細は `AssetAccessor#getAllImages()` の仕様を参照のこと。
 *
 * 戻り値は、文字列一つを受け取り、パターンにマッチするか否かを返す関数。
 *
 * @param pattern パターン文字列
 */
function patternToFilter(pattern: string): (path: string) => boolean {
	const parserRe = /([^\*\\\?]*)(\\\*|\\\?|\?|\*(?!\*)|\*\*\/|$)/g;
	//                [----A-----][--------------B---------------]
	// A: パターンの特殊文字でない文字の塊。そのままマッチさせる(ためにエスケープして正規表現にする)
	// B: パターンの特殊文字一つ(*, ** など)かそのエスケープ。patternSpecialsTable で対応する正規表現に変換
	const patternSpecialsTable: { [pat: string]: string } = {
		"": "", // 入力末尾で parserRe の B 部分が $ にマッチして空文字列になることに対応
		"\\*": "\\*",
		"\\?": "\\?",
		"*": "[^/]*",
		"?": "[^/]",
		"**/": "(?:^/)?(?:[^/]+/)*"
		//      [--C--][----D----]
		// C: 行頭の `/` (行頭でなければないので ? つき)
		// D: ディレクトリ一つ分(e.g. "foo/")が0回以上
	};

	const regExpSpecialsRe = /[\\^$.*+?()[\]{}|]/g;
	function escapeRegExp(s: string): string {
		return s.replace(regExpSpecialsRe, "\\$&");
	}

	let code = "";
	for (let match = parserRe.exec(pattern); match && match[0] !== ""; match = parserRe.exec(pattern)) {
		code += escapeRegExp(match[1]) + patternSpecialsTable[match[2]];
	}
	const re = new RegExp("^" + code + "$");
	return path => re.test(path);
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
	 * コンストラクタに渡されたアセットの設定。(assets.json が入っていることが期待される)
	 */
	configuration: AssetConfigurationMap;

	/**
	 * require解決用の仮想パスからアセットIDを引くためのテーブル。
	 * @private
	 */
	_virtualPathToIdTable: { [key: string]: string };

	/**
	 * 読み込み済みのアセット。
	 * requestAssets() で読み込みをリクエストしたゲーム開発者はコールバックでアセットを受け取るので、この変数を参照する必要は通常ない
	 * @private
	 */
	_assets: { [key: string]: OneOfAsset };

	/**
	 * 読み込み済みのrequire解決用の仮想パスからアセットを引くためのテーブル。
	 * アセットIDと異なり、ファイルパスは重複しうる (同じ画像を複数の名前で参照することはできる) ので、要素数は `_assets` 以下である。
	 * この情報は逆引き用の補助的な値にすぎない。このクラスの読み込み済みアセットの管理はすべて `_assets` 経由で行う。
	 * @private
	 */
	_liveAssetVirtualPathTable: { [key: string]: OneOfAsset };

	/**
	 * 読み込み済みのアセットの絶対パスからrequire解決用の仮想パスを引くためのテーブル。
	 * @private
	 */
	_liveAssetPathTable: { [path: string]: string };

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
	 * 各種リソースのファクトリ。
	 */
	private _resourceFactory: ResourceFactory;

	/**
	 * オーディオシステム群
	 */
	private _audioSystemManager: AudioSystemManager;

	/**
	 * デフォルトで利用されるオーディオシステムのID。
	 */
	private _defaultAudioSystemId: "music" | "sound";

	/**
	 * 読み込み中のアセットの情報。
	 */
	private _loadings: { [key: string]: AssetLoadingInfo };

	/**
	 * オーディオシステムの宣言。
	 */
	private _audioSystemConfMap: AudioSystemConfigurationMap;

	/**
	 * 動的生成アセットを生成した回数。
	 */
	private _generatedAssetCount: number;

	/**
	 * `AssetManager` のインスタンスを生成する。
	 *
	 * @param gameParams このインスタンスが属するゲーム。
	 * @param conf このアセットマネージャに与えるアセット定義。game.json の `"assets"` に相当。
	 * @param audioSystemConfMap このアセットマネージャに与えるオーディオシステムの宣言。
	 * @param moduleMainScripts このアセットマネージャに与える require() 解決用のエントリポイント。
	 */
	constructor(
		gameParams: AssetManagerParameterGameLike,
		conf?: AssetConfigurationMap,
		audioSystemConfMap?: AudioSystemConfigurationMap,
		moduleMainScripts?: ModuleMainScriptsMap
	) {
		this._resourceFactory = gameParams.resourceFactory;
		this._audioSystemManager = gameParams.audio;
		this._defaultAudioSystemId = gameParams.defaultAudioSystemId;
		this._audioSystemConfMap = normalizeAudioSystemConfMap(audioSystemConfMap);
		this.configuration = this._normalize(conf || {});
		this._assets = {};
		this._virtualPathToIdTable = {};
		this._liveAssetVirtualPathTable = {};
		this._liveAssetPathTable = {};
		this._moduleMainScripts = moduleMainScripts ? moduleMainScripts : {};
		this._refCounts = {};
		this._loadings = {};
		this._generatedAssetCount = 0;

		const assetIds = Object.keys(this.configuration);
		for (let i = 0; i < assetIds.length; ++i) {
			const assetId = assetIds[i];
			const conf = this.configuration[assetId];
			this._virtualPathToIdTable[conf.virtualPath!] = assetId; // virtualPath の存在は _normalize() で確認済みのため 非 null アサーションとする
		}
	}

	/**
	 * このインスタンスを破棄する。
	 */
	destroy(): void {
		const assetIds = Object.keys(this._refCounts);
		for (let i = 0; i < assetIds.length; ++i) {
			this._releaseAsset(assetIds[i]);
		}
		this.configuration = undefined!;
		this._assets = undefined!;
		this._liveAssetVirtualPathTable = undefined!;
		this._liveAssetPathTable = undefined!;
		this._refCounts = undefined!;
		this._loadings = undefined!;
	}

	/**
	 * このインスタンスが破棄済みであるかどうかを返す。
	 */
	destroyed(): boolean {
		return this._assets === undefined;
	}

	/**
	 * `Asset` の読み込みを再試行する。
	 *
	 * 引数 `asset` は読み込みの失敗が (`Scene#assetLoadFail` で) 通知されたアセットでなければならない。
	 * @param asset 読み込みを再試行するアセット
	 */
	retryLoad(asset: Asset): void {
		if (!this._loadings.hasOwnProperty(asset.id))
			throw ExceptionFactory.createAssertionError("AssetManager#retryLoad: invalid argument.");

		const loadingInfo = this._loadings[asset.id];
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
	 * グローバルアセットのIDを全て返す。
	 */
	globalAssetIds(): string[] {
		const ret: string[] = [];
		const conf = this.configuration;
		for (const p in conf) {
			if (!conf.hasOwnProperty(p)) continue;
			if (conf[p].global) ret.push(p);
		}
		return ret;
	}

	/**
	 * プリロードすべきスクリプトアセットのIDを全て返す。
	 */
	preloadScriptAssetIds(): string[] {
		return Object.entries(this.configuration)
			.filter(([, conf]) => conf.type === "script" && conf.global && conf.preload)
			.map(([assetId]) => assetId);
	}

	/**
	 * パターンまたはフィルタに合致するパスを持つアセットIDを全て返す。
	 *
	 * 戻り値は読み込み済みでないアセットのIDを含むことに注意。
	 * 読み込み済みのアセットにアクセスする場合は、 `peekAllLiveAssetsByPattern()` を利用すること。
	 *
	 * @param patternOrFilters パターンまたはフィルタ。仕様は `AssetAccessor#getAllImages()` を参照
	 */
	resolvePatternsToAssetIds(patternOrFilters: (string | ((accessorPath: string) => boolean))[]): string[] {
		if (patternOrFilters.length === 0) return [];
		const vpaths = Object.keys(this._virtualPathToIdTable);
		const ret: string[] = [];
		for (let i = 0; i < patternOrFilters.length; ++i) {
			const patternOrFilter = patternOrFilters[i];
			const filter =
				typeof patternOrFilter === "string" ? patternToFilter(this._replaceModulePathToAbsolute(patternOrFilter)) : patternOrFilter;
			for (let j = 0; j < vpaths.length; ++j) {
				const vpath = vpaths[j];
				const accessorPath = "/" + vpath; // virtualPath に "/" を足すと accessorPath という仕様
				if (filter(accessorPath)) ret.push(this._virtualPathToIdTable[vpath]);
			}
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
	requestAsset(assetIdOrConf: AssetIdOrConf, handler: AssetManagerLoadHandler): boolean {
		let assetId: string;
		if (typeof assetIdOrConf === "string") {
			assetId = assetIdOrConf;
		} else if ("uri" in assetIdOrConf) {
			assetId = assetIdOrConf.id;
			assetIdOrConf = this._normalizeAssetBaseDeclaration(assetId, Object.create(assetIdOrConf));
		} else {
			// TODO: ノーマライズ処理を _normalizeAssetBaseDeclaration() に統合すべき
			assetId = assetIdOrConf.id;
		}
		let waiting = false;
		let loadingInfo: AssetLoadingInfo;
		if (this._assets.hasOwnProperty(assetId)) {
			++this._refCounts[assetId];
			handler._onAssetLoad(this._assets[assetId]);
		} else if (this._loadings.hasOwnProperty(assetId)) {
			loadingInfo = this._loadings[assetId];
			loadingInfo.handlers.push(handler);
			++this._refCounts[assetId];
			waiting = true;
		} else {
			const system = this._getAudioSystem(assetIdOrConf);
			const audioAsset = system?.getDestroyRequestedAsset(assetId);
			if (system && audioAsset) {
				system.cancelRequestDestroy(audioAsset);
				this._addAssetToTables(audioAsset);
				this._refCounts[assetId] = 1;
				handler._onAssetLoad(audioAsset);
			} else {
				const a = this._createAssetFor(assetIdOrConf);
				loadingInfo = new AssetLoadingInfo(a, handler);
				this._loadings[assetId] = loadingInfo;
				this._refCounts[assetId] = 1;
				waiting = true;
				loadingInfo.loading = true;
				a._load(this);
			}
		}
		return waiting;
	}

	/**
	 * アセットの参照カウントを減らす。
	 * 引数の各要素で `unrefAsset()` を呼び出す。
	 *
	 * @param assetOrId 参照カウントを減らすアセットまたはアセットID
	 */
	unrefAsset(assetOrId: string | Asset): void {
		const assetId = typeof assetOrId === "string" ? assetOrId : assetOrId.id;
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
	requestAssets(assetIdOrConfs: AssetIdOrConf[], handler: AssetManagerLoadHandler): number {
		let waitingCount = 0;
		for (let i = 0, len = assetIdOrConfs.length; i < len; ++i) {
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
	unrefAssets(assetOrIds: (string | Asset)[]): void {
		for (let i = 0, len = assetOrIds.length; i < len; ++i) {
			this.unrefAsset(assetOrIds[i]);
		}
	}

	/**
	 * アクセッサパスで指定された読み込み済みのアセットを返す。
	 *
	 * ここでアクセッサパスとは、 `AssetAccessor` が使うパス
	 * (game.jsonのディレクトリをルート (`/`) とする、 `/` 区切りの絶対パス形式の仮想パス)である。
	 * これは `/` を除けばアセットの仮想パス (virtualPath) と同一である。
	 *
	 * @param accessorPath 取得するアセットのアクセッサパス
	 * @param type 取得するアセットのタイプ。対象のアセットと合致しない場合、エラー
	 */
	peekLiveAssetByAccessorPath<T extends OneOfAsset>(accessorPath: string, type: T["type"]): T {
		accessorPath = this._replaceModulePathToAbsolute(accessorPath);
		if (accessorPath[0] !== "/")
			throw ExceptionFactory.createAssertionError("AssetManager#peekLiveAssetByAccessorPath(): accessorPath must start with '/'");
		const vpath = accessorPath.slice(1); // accessorPath から "/" を削ると virtualPath という仕様
		const asset = this._liveAssetVirtualPathTable[vpath];
		if (!asset || type !== asset.type)
			throw ExceptionFactory.createAssertionError(`AssetManager#peekLiveAssetByAccessorPath(): No ${type} asset for ${accessorPath}`);
		return asset as T; // asset.typeを直前で確認しているので確実にTになるが、型推論できないのでキャストする
	}

	/**
	 * アセットIDで指定された読み込み済みのアセットを返す。
	 *
	 * @param assetId 取得するアセットのID
	 * @param type 取得するアセットのタイプ。対象のアセットと合致しない場合、エラー
	 */
	peekLiveAssetById<T extends OneOfAsset>(assetId: string, type: T["type"]): T {
		const asset = this._assets[assetId];
		if (!asset || type !== asset.type)
			throw ExceptionFactory.createAssertionError(`SceneAssetManager#_getById(): No ${type} asset for id ${assetId}`);
		return asset as T; // asset.typeを直前で確認しているので確実にTになるが、型推論できないのでキャストする
	}

	/**
	 * パターンまたはフィルタにマッチするパスを持つ、指定されたタイプの全読み込み済みアセットを返す。
	 *
	 * 戻り値の要素の順序は保証されない。
	 * パターンとフィルタについては `AssetAccessor#getAllImages()` の仕様を参照のこと。
	 *
	 * @param patternOrFilter 取得するアセットのパスパターンまたはフィルタ
	 * @param type 取得するアセットのタイプ。 null の場合、全てのタイプとして扱われる。
	 */
	peekAllLiveAssetsByPattern<T extends OneOfAsset>(
		patternOrFilter: string | ((accessorPath: string) => boolean),
		type: T["type"] | null
	): T[] {
		const vpaths = Object.keys(this._liveAssetVirtualPathTable);
		const filter =
			typeof patternOrFilter === "string" ? patternToFilter(this._replaceModulePathToAbsolute(patternOrFilter)) : patternOrFilter;
		const ret: T[] = [];
		for (let i = 0; i < vpaths.length; ++i) {
			const vpath = vpaths[i];
			const asset = this._liveAssetVirtualPathTable[vpath];
			if (type && asset.type !== type) continue;
			const accessorPath = "/" + vpath; // virtualPath に "/" を足すと accessorPath という仕様
			if (filter(accessorPath)) ret.push(asset as T); // asset.typeを直前で確認しているので確実にTになるが、型推論できないのでキャストする
		}
		return ret;
	}

	/**
	 * @ignore
	 */
	_normalize(configuration: AssetConfigurationMap): AssetConfigurationMap {
		const ret: { [key: string]: AssetConfiguration } = {};
		if (!(configuration instanceof Object)) throw ExceptionFactory.createAssertionError("AssetManager#_normalize: invalid arguments.");
		for (const p in configuration) {
			if (!configuration.hasOwnProperty(p)) continue;
			const conf = this._normalizeAssetBaseDeclaration<AssetConfiguration>(p, Object.create(configuration[p]));
			if (!conf.path) {
				throw ExceptionFactory.createAssertionError("AssetManager#_normalize: No path given for: " + p);
			}
			if (!conf.virtualPath) {
				throw ExceptionFactory.createAssertionError("AssetManager#_normalize: No virtualPath given for: " + p);
			}
			if (!conf.global) conf.global = false;
			ret[p] = conf;
		}
		return ret;
	}

	/**
	 * @private
	 */
	_normalizeAssetBaseDeclaration<T extends AssetConfigurationCore>(assetId: string, conf: T): T {
		if (!conf.type) {
			throw ExceptionFactory.createAssertionError("AssetManager#_normalize: No type given for: " + assetId);
		}
		if (conf.type === "image") {
			if (typeof conf.width !== "number")
				throw ExceptionFactory.createAssertionError("AssetManager#_normalize: wrong width given for the image asset: " + assetId);
			if (typeof conf.height !== "number")
				throw ExceptionFactory.createAssertionError("AssetManager#_normalize: wrong height given for the image asset: " + assetId);
			conf.slice = conf.slice ? normalizeCommonArea(conf.slice) : undefined;
		}
		if (conf.type === "audio") {
			// durationというメンバは後から追加したため、古いgame.jsonではundefinedになる場合がある
			if (conf.duration === undefined) conf.duration = 0;
			const audioSystemConf = this._audioSystemConfMap[conf.systemId];
			if (conf.loop === undefined) {
				conf.loop = !!audioSystemConf && !!audioSystemConf.loop;
			}
			if (conf.hint === undefined) {
				conf.hint = audioSystemConf ? audioSystemConf.hint : {};
			}
			if (conf.systemId !== "music" && conf.systemId !== "sound") {
				throw ExceptionFactory.createAssertionError(
					"AssetManager#_normalize: wrong systemId given for the audio asset: " + assetId
				);
			}
		}
		if (conf.type === "video") {
			if (!conf.useRealSize) {
				if (typeof conf.width !== "number")
					throw ExceptionFactory.createAssertionError(
						"AssetManager#_normalize: wrong width given for the video asset: " + assetId
					);
				if (typeof conf.height !== "number")
					throw ExceptionFactory.createAssertionError(
						"AssetManager#_normalize: wrong height given for the video asset: " + assetId
					);
				conf.useRealSize = false;
			}
		}
		if (conf.type === "vector-image") {
			if (typeof conf.width !== "number")
				throw ExceptionFactory.createAssertionError(
					"AssetManager#_normalize: wrong width given for the vector-image asset: " + assetId
				);
			if (typeof conf.height !== "number")
				throw ExceptionFactory.createAssertionError(
					"AssetManager#_normalize: wrong height given for the vector-image asset: " + assetId
				);
		}
		return conf;
	}

	/**
	 * @private
	 */
	_createAssetFor(idOrConf: AssetIdOrConf): OneOfAsset {
		let id: string;
		let uri: string;
		let conf: AssetConfiguration | DynamicAssetConfiguration;
		if (typeof idOrConf === "string") {
			id = idOrConf;
			conf = this.configuration[id];
			uri = this.configuration[id].path;
		} else if ("uri" in idOrConf) {
			id = idOrConf.id;
			conf = idOrConf;
			uri = idOrConf.uri;
		} else {
			return this._createGeneratedAssetFor(idOrConf);
		}
		const resourceFactory = this._resourceFactory;
		if (!conf) throw ExceptionFactory.createAssertionError("AssetManager#_createAssetFor: unknown asset ID: " + id);
		const type = conf.type;
		switch (type) {
			case "image":
				const asset = conf.slice
					? new PartialImageAsset(resourceFactory, id, uri, conf.width, conf.height, normalizeCommonArea(conf.slice))
					: resourceFactory.createImageAsset(id, uri, conf.width, conf.height);
				asset.initialize(conf.hint);
				return asset;
			case "audio":
				const system = conf.systemId
					? this._audioSystemManager[conf.systemId]
					: this._audioSystemManager[this._defaultAudioSystemId];
				return resourceFactory.createAudioAsset(id, uri, conf.duration, system, !!conf.loop, conf.hint ?? {}, conf.offset);
			case "text":
				return resourceFactory.createTextAsset(id, uri);
			case "script":
				return resourceFactory.createScriptAsset(id, uri);
			case "video":
				// VideoSystemはまだ中身が定義されていなが、将来のためにVideoAssetにVideoSystemを渡すという体裁だけが整えられている。
				// 以上を踏まえ、ここでは簡単のために都度新たなVideoSystemインスタンスを生成している。
				const videoSystem = new VideoSystem();
				return resourceFactory.createVideoAsset(id, uri, conf.width, conf.height, videoSystem, !!conf.loop, !!conf.useRealSize);
			case "vector-image":
				if (!resourceFactory.createVectorImageAsset) {
					return new EmptyVectorImageAsset(id, uri, conf.width, conf.height, conf.hint);
				}
				return resourceFactory.createVectorImageAsset(id, uri, conf.width, conf.height, conf.hint);
			default:
				throw ExceptionFactory.createAssertionError(
					"AssertionError#_createAssetFor: unknown asset type " + type + " for asset ID: " + id
				);
		}
	}

	/**
	 * @private
	 */
	_createGeneratedAssetFor(conf: AssetGenerationConfiguration): OneOfAsset {
		const resourceFactory = this._resourceFactory;
		const path = `%akashic%/generated-asset-${this._generatedAssetCount++}`;
		switch (conf.type) {
			case "vector-image":
				if (!resourceFactory.createVectorImageAssetFromString) {
					return new EmptyGeneratedVectorImageAsset(conf.id, path, conf.data);
				}
				return resourceFactory.createVectorImageAssetFromString(conf.id, path, conf.data);
			default:
				throw ExceptionFactory.createAssertionError(
					`AssertionError#_createFromAssetGenerationFor: unsupported asset type ${conf.type} for asset ID: ${conf.id}`
				);
		}
	}

	/**
	 * @ignore
	 */
	_releaseAsset(assetId: string): void {
		const asset = this._assets[assetId] || (this._loadings[assetId] && this._loadings[assetId].asset);
		let path: string | null = null;
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
			if (path && this._liveAssetPathTable.hasOwnProperty(path)) delete this._liveAssetPathTable[path];
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
	_onAssetError(asset: OneOfAsset, error: AssetLoadError): void {
		// ロード中に Scene が破棄されていた場合などで、asset が破棄済みになることがある
		if (this.destroyed() || asset.destroyed()) return;

		const loadingInfo = this._loadings[asset.id];
		const hs = loadingInfo.handlers;
		loadingInfo.loading = false;
		++loadingInfo.errorCount;

		if (loadingInfo.errorCount > AssetManager.MAX_ERROR_COUNT && error.retriable) {
			error = ExceptionFactory.createAssetLoadError("Retry limit exceeded", false, null, error);
		}
		if (!error.retriable) delete this._loadings[asset.id];
		for (let i = 0; i < hs.length; ++i) hs[i]._onAssetError(asset, error, this.retryLoad.bind(this));
	}

	/**
	 * @private
	 */
	_onAssetLoad(asset: OneOfAsset): void {
		// ロード中に Scene が破棄されていた場合などで、asset が破棄済みになることがある
		if (this.destroyed() || asset.destroyed()) return;

		const loadingInfo = this._loadings[asset.id];
		loadingInfo.loading = false;

		delete this._loadings[asset.id];
		this._addAssetToTables(asset);

		const hs = loadingInfo.handlers;
		for (let i = 0; i < hs.length; ++i) hs[i]._onAssetLoad(asset);
	}

	/**
	 * @private
	 */
	_replaceModulePathToAbsolute(accessorPath: string): string {
		if (
			accessorPath[0] === "/" ||
			accessorPath[0] === "*" // パスに `**/*` が指定された場合
		) {
			return accessorPath;
		}

		for (const moduleName in this._moduleMainScripts) {
			if (!this._moduleMainScripts.hasOwnProperty(moduleName)) continue;
			if (accessorPath.lastIndexOf(moduleName, 0) === 0) {
				return "/node_modules/" + accessorPath;
			}
		}
		return accessorPath;
	}

	/**
	 * @private
	 */
	_getAudioSystem(assetIdOrConf: AssetIdOrConf): AudioSystem | null {
		let conf: AssetConfiguration | DynamicAssetConfiguration | null = null;
		if (typeof assetIdOrConf === "string") {
			conf = this.configuration[assetIdOrConf];
		} else if ("uri" in assetIdOrConf) {
			const dynConf = assetIdOrConf;
			conf = dynConf;
		} else {
			// NOTE: AssetGeneration では一旦非サポート。
		}

		if (!conf) {
			return null;
		}
		if (conf.type !== "audio") {
			return null;
		}

		return conf.systemId ? this._audioSystemManager[conf.systemId] : this._audioSystemManager[this._defaultAudioSystemId];
	}

	/**
	 * @private
	 */
	_addAssetToTables(asset: OneOfAsset): void {
		this._assets[asset.id] = asset;

		// DynamicAsset の場合は configuration に書かれていないので以下の判定が偽になる
		if (this.configuration[asset.id]) {
			const virtualPath = this.configuration[asset.id].virtualPath!; // virtualPath の存在は _normalize() で確認済みのため 非 null アサーションとする
			if (!this._liveAssetVirtualPathTable.hasOwnProperty(virtualPath)) {
				this._liveAssetVirtualPathTable[virtualPath] = asset;
			} else {
				if (this._liveAssetVirtualPathTable[virtualPath].path !== asset.path)
					throw ExceptionFactory.createAssertionError("AssetManager#_onAssetLoad(): duplicated asset path");
			}
			if (!this._liveAssetPathTable.hasOwnProperty(asset.path)) this._liveAssetPathTable[asset.path] = virtualPath;
		}
	}
}
