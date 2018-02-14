import g = require("../../lib/main.node");
export class Renderer extends g.Renderer {
	constructor() {
		super();
		this.methodCallHistoryWithParams = [];
	}

	methodCallHistoryWithParams: {
		methodName: string;
		params?: {}
	}[];

	clearMethodCallHistory(): void {
		this.methodCallHistoryWithParams = [];
	}

	clear(): void {
		this.methodCallHistoryWithParams.push({
			methodName: "clear"
		});
	}

	get methodCallHistory(): string[] {
		var ret: string[] = [];
		for (var i = 0; i < this.methodCallHistoryWithParams.length; ++i)
			ret.push(this.methodCallHistoryWithParams[i].methodName);
		return ret;
	}

	// 指定したメソッド名のパラメータを配列にして返す
	methodCallParamsHistory(name: string): any[] {
		var params: any[] = [];
		for (var i = 0; i < this.methodCallHistoryWithParams.length; ++i) {
			if (this.methodCallHistoryWithParams[i].methodName === name) params.push(this.methodCallHistoryWithParams[i].params);
		}
		return params;
	}

	drawImage(surface: Surface, offsetX: number, offsetY: number, width: number, height: number,
	          canvasOffsetX: number, canvasOffsetY: number): void {this.methodCallHistoryWithParams.push({
			methodName: "drawImage",
			params: {
				surface: surface,
				offsetX: offsetX,
				offsetY: offsetY,
				width: width,
				height: height,
				canvasOffsetX: canvasOffsetX,
				canvasOffsetY: canvasOffsetY
			}
		});
	}

	translate(x: number, y: number): void {
		this.methodCallHistoryWithParams.push({
			methodName: "translate",
			params: {
				x: x,
				y: y
			}
		});
	}

	transform(matrix: number[]): void {
		this.methodCallHistoryWithParams.push({
			methodName: "transform",
			params: {
				matrix: matrix
			}
		});
	}

	opacity(opacity: number): void {
		this.methodCallHistoryWithParams.push({
			methodName: "opacity",
			params: {
				opacity: opacity
			}
		});
	}

	setCompositeOperation(operation: g.CompositeOperation): void {
		this.methodCallHistoryWithParams.push({
			methodName: "setCompositeOperation",
			params: {
				operation: operation
			}
		});
	}

	fillRect(x: number, y: number, width: number, height: number, cssColor: string): void {
		this.methodCallHistoryWithParams.push({
			methodName: "fillRect",
			params: {
				x: x,
				y: y,
				width: width,
				height: height,
				cssColor: cssColor
			}
		});
	}

	save(): void {
		this.methodCallHistoryWithParams.push({
			methodName: "save"
		});
	}

	restore(): void {
		this.methodCallHistoryWithParams.push({
			methodName: "restore"
		});
	}

	drawSprites(surface: g.Surface,
	            offsetX: number[], offsetY: number[],
	            width: number[], height: number[],
	            canvasOffsetX: number[], canvasOffsetY: number[],
	            count: number): void {this.methodCallHistoryWithParams.push({
			methodName: "drawSprites",
			params: {
				surface: surface,
				offsetX: offsetX,
				offsetY: offsetY,
				width: width,
				height: height,
				canvasOffsetX: canvasOffsetX,
				canvasOffsetY: canvasOffsetY,
				count: count
			}
		});
	}

	drawSystemText(text: string, x: number, y: number, maxWidth: number, fontSize: number,
	               textAlign: g.TextAlign, textBaseline: g.TextBaseline, textColor: string, fontFamily: g.FontFamily,
	               strokeWidth: number, strokeColor: string, strokeOnly: boolean): void {
		this.methodCallHistoryWithParams.push({
  			methodName: "drawSystemText",
  			params: {text: text,
				x: x,
				y: y,
				maxWidth: maxWidth,
				fontSize: fontSize,
				textAlign: textAlign,
				textBaseline: textBaseline,
				textColor: textColor,
				fontFamily: fontFamily,
				strokeWidth: strokeWidth,
				strokeColor: strokeColor,
				strokeOnly: strokeOnly
			}
		});
	}
	setTransform(matrix: number[]): void {
		throw new Error("not implemented");
	};

	setOpacity(opacity: number): void {
		throw new Error("not implemented");
	};

	getImageData(): ImageData {
		return null;
	}

	putImageData(imageData: ImageData): void {
		// do noting.
	}
}

export class Surface extends g.Surface {
	constructor(width: number, height: number, drawable?: any, isDynamic: boolean = false) {
		super(width, height, drawable, isDynamic);
	}
	createdRenderer: g.Renderer;

	renderer(): g.Renderer {
		var r = new Renderer();
		this.createdRenderer = r;
		return r;
	}

	isPlaying(): boolean {
		// mock.Surfaceに与えるdrawableの再生状態はdrawable.isPlayingプロパティで与える
		return !!(this.isDynamic && this._drawable && this._drawable.isPlaying);
	}
}

class LoadFailureController {
	necessaryRetryCount: number;
	failureCount: number;

	constructor(necessaryRetryCount: number) {
		this.necessaryRetryCount = necessaryRetryCount;
		this.failureCount = 0;
	}

	tryLoad(asset: g.Asset, loader: g.AssetLoadHandler): boolean {
		if (this.necessaryRetryCount < 0) {
			setTimeout(() => {
				if (!asset.destroyed())
					loader._onAssetError(asset, g.ExceptionFactory.createAssetLoadError("FatalErrorForAssetLoad", false));
			}, 0);
			return false;
		}
		if (this.failureCount++ < this.necessaryRetryCount) {
			setTimeout(() => {
				if (!asset.destroyed())
					loader._onAssetError(asset, g.ExceptionFactory.createAssetLoadError("RetriableErrorForAssetLoad"));
			}, 0);
			return false;
		}
		return true;
	}
}

export class ImageAsset extends g.ImageAsset {
	_failureController: LoadFailureController;

	constructor(necessaryRetryCount: number, id: string, assetPath: string, width: number, height: number) {
		super(id, assetPath, width, height);
		this._failureController = new LoadFailureController(necessaryRetryCount);
	}

	_load(loader: g.AssetLoadHandler): void {
		if (this._failureController.tryLoad(this, loader)) {
			setTimeout(() => {
				if (!this.destroyed())
					loader._onAssetLoad(this);
			}, 0);
		}
	}

	asSurface(): g.Surface {
		return new Surface(0, 0);
	}
}

export interface DelayedAsset {
	undelay(): void;
}

export class DelayedImageAsset extends ImageAsset implements DelayedAsset {
	_delaying: boolean;
	_lastGivenLoader: g.AssetLoadHandler;
	_isError: boolean;
	_loadingResult: any;

	constructor(necessaryRetryCount: number, id: string, assetPath: string, width: number, height: number) {
		super(necessaryRetryCount, id, assetPath, width, height);
		this._delaying = true;
		this._lastGivenLoader = undefined;
		this._isError = undefined;
		this._loadingResult = undefined;
	}

	undelay(): void {
		this._delaying = false;
		this._flushDelayed();
	}

	_load(loader: g.AssetLoadHandler): void {
		if (this._delaying) {
			// 遅延が要求されている状態で _load() が呼ばれた: loaderを自分に差し替えて _onAssetLoad, _onAssetError の通知を遅延する
			this._lastGivenLoader = loader;
			super._load(this);
		} else {
			// 遅延が解除された状態で _load() が呼ばれた: 普通のAsset同様に _load() を実行
			super._load(loader);
		}
	}

	_onAssetError(asset: g.Asset, error: g.AssetLoadError): void {
		this._isError = true;
		this._loadingResult = arguments;
		this._flushDelayed();
	}
	_onAssetLoad(asset: g.Asset): void {
		this._isError = false;
		this._loadingResult = arguments;
		this._flushDelayed();
	}

	_flushDelayed(): void {
		if (this._delaying || !this._loadingResult)
			return;
		if (this.destroyed())
			return;
		var loader = this._lastGivenLoader;
		if (this._isError) {
			loader._onAssetError.apply(loader, this._loadingResult);
		} else {
			loader._onAssetLoad.apply(loader, this._loadingResult);
		}
	}
}

class AudioAsset extends g.AudioAsset {
	_failureController: LoadFailureController;

	constructor(necessaryRetryCount: number, id: string, assetPath: string,
	            duration: number, system: g.AudioSystem,
	            loop: boolean, hint: g.AudioAssetHint) {
		super(id, assetPath, duration, system, loop, hint);
		this._failureController = new LoadFailureController(necessaryRetryCount);
	}

	_load(loader: g.AssetLoadHandler): void {
		if (this._failureController.tryLoad(this, loader)) {
			setTimeout(() => {
				if (!this.destroyed())
					loader._onAssetLoad(this);
			}, 0);
		}
	}
}

class TextAsset extends g.TextAsset {
	game: g.Game;
	_failureController: LoadFailureController;

	constructor(game: g.Game, necessaryRetryCount: number, id: string, assetPath: string) {
		super(id, assetPath);
		this.game = game;
		this._failureController = new LoadFailureController(necessaryRetryCount);
	}

	_load(loader: g.AssetLoadHandler): void {
		if (this._failureController.tryLoad(this, loader)) {
			setTimeout(() => {
				if ((<ResourceFactory>this.game.resourceFactory).scriptContents.hasOwnProperty(this.path)) {
					this.data = (<ResourceFactory>this.game.resourceFactory).scriptContents[this.path];
				} else {
					this.data = "";
				}
				if (!this.destroyed())
					loader._onAssetLoad(this);
			}, 0);
		}
	}
}

class ScriptAsset extends g.ScriptAsset {
	game: g.Game;
	_failureController: LoadFailureController;

	constructor(game: g.Game, necessaryRetryCount: number, id: string, assetPath: string) {
		super(id, assetPath);
		this.game = game;
		this._failureController = new LoadFailureController(necessaryRetryCount);
	}

	_load(loader: g.AssetLoadHandler): void {
		if (this._failureController.tryLoad(this, loader)) {
			setTimeout(() => {
				if (!this.destroyed())
					loader._onAssetLoad(this);
			}, 0);
		}
	}

	execute(env: g.ScriptAssetExecuteEnvironment): any {
		if (!(<ResourceFactory>this.game.resourceFactory).scriptContents.hasOwnProperty(env.module.filename)) {
			// 特にスクリプトの内容指定がないケース:
			// ScriptAssetは任意の値を返してよいが、シーンを記述したスクリプトは
			// シーンを返す関数を返すことを期待するのでここでは関数を返しておく
			return env.module.exports = function (): g.Scene { return new g.Scene({game: env.game}); };

		} else {
			var prefix = "(function(exports, require, module, __filename, __dirname) {";
			var suffix = "})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);";
			var content = (<ResourceFactory>this.game.resourceFactory).scriptContents[env.module.filename];
			var f = new Function("g", prefix + content + suffix);
			f(env);
			return env.module.exports;
		}
	}
}

export class AudioPlayer extends g.AudioPlayer {
	supportsPlaybackRateValue: boolean;
	canHandleStoppedValue: boolean;

	constructor(system: g.AudioSystem) {
		super(system);
		this.supportsPlaybackRateValue = true;
		this.canHandleStoppedValue = true;
	}

	canHandleStopped(): boolean {
		return this.canHandleStoppedValue;
	}

	_supportsPlaybackRate(): boolean {
		return this.supportsPlaybackRateValue;
	}
}

export class GlyphFactory extends g.GlyphFactory {
	constructor(fontFamily: g.FontFamily|string|string[], fontSize: number, baselineHeight?: number,
	            fontColor?: string, strokeWidth?: number, strokeColor?: string, strokeOnly?: boolean, fontWeight?: g.FontWeight) {
		super(fontFamily, fontSize, baselineHeight, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight);
	}
	create(code: number): g.Glyph { return <g.Glyph>undefined; };
}

export class ResourceFactory extends g.ResourceFactory {
	_game: g.Game;
	scriptContents: {[key: string]: string};

	// 真である限り createXXAsset() が DelayedAsset を生成する(現在は createImageAsset() のみ)。
	// DelayedAsset は、flushDelayedAssets() 呼び出しまで読み込み完了(またはエラー)通知を遅延するアセットである。
	// コード重複を避けるため、現在は createImageAsset() のみこのフラグに対応している。
	createsDelayedAsset: boolean;

	_necessaryRetryCount: number;
	_delayedAssets: DelayedAsset[];

	constructor() {
		super();
		this.scriptContents = {};
		this.createsDelayedAsset = false;
		this._necessaryRetryCount = 0;
		this._delayedAssets = [];
	}

	init(game: g.Game): void {
		this._game = game;
	}

	// func が呼び出されている間だけ this._necessaryRetryCount を変更する。
	// func() とその呼び出し先で生成されたアセットは、指定回数だけロードに失敗したのち成功する。
	// -1を指定した場合、ロードは retriable が偽に設定された AssetLoadFatalError で失敗する。
	withNecessaryRetryCount(necessaryRetryCount: number, func: () => void): void {
		var originalValue = this._necessaryRetryCount;
		try {
			this._necessaryRetryCount = necessaryRetryCount;
			func();
		} finally {
			this._necessaryRetryCount = originalValue;
		}
	}

	// createsDelayedAsset が真である間に生成されたアセット(ただし現時点はImageAssetのみ) の、
	// 遅延された読み込み完了通知を実行する。このメソッドの呼び出し後、実際の AssetLoader#_onAssetLoad()
	// などの呼び出しは setTimeout() 経由で行われることがある点に注意。
	// (このメソッドの呼び出し側は、後続の処理を setTimeout() 経由で行う必要がある。mock.ts のアセット実装を参照のこと)
	flushDelayedAssets(): void {
		this._delayedAssets.forEach((a: DelayedAsset) => a.undelay());
		this._delayedAssets = [];
	}

	createImageAsset(id: string, assetPath: string, width: number, height: number): g.ImageAsset {
		if (this.createsDelayedAsset) {
			var ret = new DelayedImageAsset(this._necessaryRetryCount, id, assetPath, width, height);
			this._delayedAssets.push(ret);
			return ret;
		} else {
			return new ImageAsset(this._necessaryRetryCount, id, assetPath, width, height);
		}
	}

	createAudioAsset(id: string, assetPath: string, duration: number,
	                 system: g.AudioSystem, loop: boolean, hint: g.AudioAssetHint): g.AudioAsset {
		return new AudioAsset(this._necessaryRetryCount, id, assetPath, duration, system, loop, hint);
	}

	createTextAsset(id: string, assetPath: string): g.TextAsset {
		return new TextAsset(this._game, this._necessaryRetryCount, id, assetPath);
	}

	createScriptAsset(id: string, assetPath: string): g.ScriptAsset {
		return new ScriptAsset(this._game, this._necessaryRetryCount, id, assetPath);
	}

	createSurface(width: number, height: number): g.Surface {
		return new Surface(width, height);
	}

	createAudioPlayer(system: g.AudioSystem): g.AudioPlayer {
		return new AudioPlayer(system);
	}

	createGlyphFactory(fontFamily: g.FontFamily, fontSize: number, baselineHeight?: number,
	                   fontColor?: string, strokeWidth?: number, strokeColor?: string, strokeOnly?: boolean,
	                   fontWeight?: g.FontWeight): g.GlyphFactory {
		return new GlyphFactory(fontFamily, fontSize, baselineHeight, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight);
	}
	createVideoAsset(id: string, assetPath: string, width: number, height: number, system: g.VideoSystem,
	                 loop: boolean, useRealSize: boolean): g.VideoAsset {
		return <g.VideoAsset>undefined;
	}
}

export class Game extends g.Game {
	leftGame: boolean;
	terminatedGame: boolean;
	raisedEvents: g.Event[];
	raisedTicks: g.Event[][];
	suppressedLogLevel: g.LogLevel;

	autoTickForInternalEvents: boolean;

	constructor(gameConfiguration: g.GameConfiguration, assetBase?: string,
	            selfId?: string, operationPluginViewInfo?: g.OperationPluginViewInfo) {
		const resourceFactory = new ResourceFactory();
		super(gameConfiguration, resourceFactory, assetBase, selfId, operationPluginViewInfo);
		resourceFactory.init(this);
		this.leftGame = false;
		this.terminatedGame = false;
		this.raisedEvents = [];
		this.raisedTicks = [];
		this.suppressedLogLevel = undefined;
		this.autoTickForInternalEvents = true;
	}

	_fireSceneReady(scene: g.Scene): void {
		super._fireSceneReady(scene);
		if (this.autoTickForInternalEvents) {
			setTimeout(() => {
				if (scene.destroyed()) return;  // 同期的にsceneを破棄してしまうテストのためにチェック
				this.tick();
			}, 0);
		}
	}

	_fireSceneLoaded(scene: g.Scene): void {
		super._fireSceneLoaded(scene);
		if (this.autoTickForInternalEvents) {
			setTimeout(() => {
				if (scene.destroyed()) return;  // 同期的にsceneを破棄してしまうテストのためにチェック
				this.tick();
			}, 0);
		}
	}

	_leaveGame(): void {
		this.leftGame = true;
	}

	_terminateGame(): void {
		this.terminatedGame = true;
	}

	raiseEvent(e: g.Event): void {
		this.raisedEvents.push(e);
	}

	raiseTick(es?: g.Event[]): void {
		this.raisedTicks.push(es);
	}

	shouldSaveSnapshot(): boolean {
		return false;
	}

	saveSnapshot(snapshot: any, timestamp?: number): void {
		throw new Error("not implemented");
	}
	addEventFilter(filter: g.EventFilter): void {
		throw new Error("not implemented");
	}
	removeEventFilter(filter: g.EventFilter): void {
		throw new Error("not implemented");
	}
}

// g.Entitystateflags の定義はconst enumで書かれているので、javaScriptのテストコードからは直接参照できない。
// よって、g.Entitystateflagsのコードをコピーして利用する
export enum EntityStateFlags {
	/**
	 * 特にフラグが立っていない状態
	 */
	None = 0,
	/**
	 * 非表示フラグ
	 */
	Hidden = 1 << 0,
	/**
	 * 描画結果がキャッシュ済みであることを示すフラグ
	 */
	Cached = 1 << 1,
	/**
	 * modifiedされ、描画待ちであることを示すフラグ。
	 */
	Modified = 1 << 2,
	/**
	 * 軽量な描画処理を利用できることを示すフラグ。
	 */
	ContextLess = 1 << 3
}
