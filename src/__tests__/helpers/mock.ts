import * as pci from "@akashic/pdi-common-impl";
import {
	AssetLoadHandler,
	AssetLoadError,
	AudioAssetHint,
	CompositeOperationString,
	FontWeightString,
	ImageData,
	OperationPluginViewInfo,
	ScriptAssetRuntimeValue,
	AudioSystem as PdiAudioSystem,
	Asset as PdiAsset,
	Glyph as PdiGlyph,
	GlyphFactory as PdiGlyphFactory,
	Surface as PdiSurface,
	Renderer as PdiRenderer,
	VideoPlayer as PdiVideoPlayer,
	VideoSystem as PdiVideoSystem
} from "@akashic/pdi-types";
import * as pl from "@akashic/playlog";
import * as g from "../..";

declare global {
	namespace NodeJS {
		interface Global {
			g: any;
		}
	}
}

global.g = g;

export class Renderer extends pci.Renderer {
	methodCallHistoryWithParams: {
		methodName: string;
		params?: {};
	}[];

	constructor() {
		super();
		this.methodCallHistoryWithParams = [];
	}

	clearMethodCallHistory(): void {
		this.methodCallHistoryWithParams = [];
	}

	clear(): void {
		this.methodCallHistoryWithParams.push({
			methodName: "clear"
		});
	}

	get methodCallHistory(): string[] {
		const ret: string[] = [];
		for (let i = 0; i < this.methodCallHistoryWithParams.length; ++i) ret.push(this.methodCallHistoryWithParams[i].methodName);
		return ret;
	}

	/**
	 * 指定したメソッド名のパラメータを配列にして返す
	 */
	methodCallParamsHistory(name: string): any[] {
		const params: any[] = [];
		for (let i = 0; i < this.methodCallHistoryWithParams.length; ++i) {
			if (this.methodCallHistoryWithParams[i].methodName === name) params.push(this.methodCallHistoryWithParams[i].params);
		}
		return params;
	}

	drawImage(
		surface: Surface,
		offsetX: number,
		offsetY: number,
		width: number,
		height: number,
		canvasOffsetX: number,
		canvasOffsetY: number
	): void {
		this.methodCallHistoryWithParams.push({
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

	setCompositeOperation(operation: CompositeOperationString): void {
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

	drawSprites(
		surface: PdiSurface,
		offsetX: number[],
		offsetY: number[],
		width: number[],
		height: number[],
		canvasOffsetX: number[],
		canvasOffsetY: number[],
		count: number
	): void {
		this.methodCallHistoryWithParams.push({
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

	setTransform(_matrix: number[]): void {
		throw new Error("not implemented");
	}

	setOpacity(_opacity: number): void {
		throw new Error("not implemented");
	}

	setShaderProgram(_shaderProgram: g.ShaderProgram): void {
		// do nothing
	}

	isSupportedShaderProgram(): boolean {
		return false;
	}

	_getImageData(): ImageData {
		throw new Error("not implemented");
	}

	_putImageData(_imageData: ImageData): void {
		// do noting.
	}
}

export class Surface extends pci.Surface {
	createdRenderer: PdiRenderer | undefined;

	constructor(width: number, height: number, drawable?: any) {
		super(width, height, drawable);
	}

	renderer(): PdiRenderer {
		if (this.createdRenderer == null) {
			this.createdRenderer = new Renderer();
		}
		return this.createdRenderer;
	}

	isPlaying(): boolean {
		// mock.Surfaceに与えるdrawableの再生状態はdrawable.isPlayingプロパティで与える
		return !!(this._drawable && this._drawable.isPlaying);
	}
}

class LoadFailureController {
	necessaryRetryCount: number;
	failureCount: number;

	constructor(necessaryRetryCount: number) {
		this.necessaryRetryCount = necessaryRetryCount;
		this.failureCount = 0;
	}

	tryLoad(asset: PdiAsset, loader: AssetLoadHandler): boolean {
		if (this.necessaryRetryCount < 0) {
			setTimeout(() => {
				if (!asset.destroyed())
					loader._onAssetError(asset, g.ExceptionFactory.createAssetLoadError("FatalErrorForAssetLoad", false));
			}, 0);
			return false;
		}
		if (this.failureCount++ < this.necessaryRetryCount) {
			setTimeout(() => {
				if (!asset.destroyed()) loader._onAssetError(asset, g.ExceptionFactory.createAssetLoadError("RetriableErrorForAssetLoad"));
			}, 0);
			return false;
		}
		return true;
	}
}

export class ImageAsset extends pci.ImageAsset {
	_failureController: LoadFailureController;
	_surface: Surface | undefined;

	constructor(necessaryRetryCount: number, id: string, assetPath: string, width: number, height: number) {
		super(id, assetPath, width, height);
		this._failureController = new LoadFailureController(necessaryRetryCount);
	}

	_load(loader: AssetLoadHandler): void {
		if (this._failureController.tryLoad(this, loader)) {
			setTimeout(() => {
				if (!this.destroyed()) loader._onAssetLoad(this);
			}, 0);
		}
	}

	asSurface(): PdiSurface {
		if (this._surface == null) {
			this._surface = new Surface(this.width, this.height);
		}
		return this._surface;
	}
}

export interface DelayedAsset {
	undelay(): void;
}

export class DelayedImageAsset extends ImageAsset implements DelayedAsset {
	_delaying: boolean;
	_lastGivenLoader: AssetLoadHandler;
	_isError: boolean;
	_loadingResult: any;

	constructor(necessaryRetryCount: number, id: string, assetPath: string, width: number, height: number) {
		super(necessaryRetryCount, id, assetPath, width, height);
		this._delaying = true;
		this._lastGivenLoader = undefined!;
		this._isError = false;
		this._loadingResult = undefined;
	}

	undelay(): void {
		this._delaying = false;
		this._flushDelayed();
	}

	_load(loader: AssetLoadHandler): void {
		if (this._delaying) {
			// 遅延が要求されている状態で _load() が呼ばれた: loaderを自分に差し替えて _onAssetLoad, _onAssetError の通知を遅延する
			this._lastGivenLoader = loader;
			super._load(this);
		} else {
			// 遅延が解除された状態で _load() が呼ばれた: 普通のAsset同様に _load() を実行
			super._load(loader);
		}
	}

	_onAssetError(_asset: PdiAsset, _error: AssetLoadError): void {
		this._isError = true;
		this._loadingResult = arguments;
		this._flushDelayed();
	}
	_onAssetLoad(_asset: PdiAsset): void {
		this._isError = false;
		this._loadingResult = arguments;
		this._flushDelayed();
	}

	_flushDelayed(): void {
		if (this._delaying || !this._loadingResult) return;
		if (this.destroyed()) return;
		const loader = this._lastGivenLoader;
		if (this._isError) {
			loader._onAssetError.apply(loader, this._loadingResult);
		} else {
			loader._onAssetLoad.apply(loader, this._loadingResult);
		}
	}
}

export class AudioAsset extends pci.AudioAsset {
	_failureController: LoadFailureController;

	constructor(
		necessaryRetryCount: number,
		id: string,
		assetPath: string,
		duration: number,
		system: PdiAudioSystem,
		loop: boolean,
		hint: AudioAssetHint
	) {
		super(id, assetPath, duration, system, loop, hint);
		this._failureController = new LoadFailureController(necessaryRetryCount);
	}

	_load(loader: AssetLoadHandler): void {
		if (this._failureController.tryLoad(this, loader)) {
			setTimeout(() => {
				if (!this.destroyed()) loader._onAssetLoad(this);
			}, 0);
		}
	}
}

export class TextAsset extends pci.TextAsset {
	game: g.Game;
	_failureController: LoadFailureController;

	constructor(game: g.Game, necessaryRetryCount: number, id: string, assetPath: string) {
		super(id, assetPath);
		this.game = game;
		this._failureController = new LoadFailureController(necessaryRetryCount);
	}

	_load(loader: AssetLoadHandler): void {
		if (this._failureController.tryLoad(this, loader)) {
			setTimeout(() => {
				if ((this.game.resourceFactory as ResourceFactory).scriptContents.hasOwnProperty(this.path)) {
					this.data = (this.game.resourceFactory as ResourceFactory).scriptContents[this.path];
				} else {
					this.data = "";
				}
				if (!this.destroyed()) loader._onAssetLoad(this);
			}, 0);
		}
	}
}

export class ScriptAsset extends pci.ScriptAsset {
	game: g.Game;
	_failureController: LoadFailureController;

	constructor(game: g.Game, necessaryRetryCount: number, id: string, assetPath: string) {
		super(id, assetPath);
		this.game = game;
		this._failureController = new LoadFailureController(necessaryRetryCount);
	}

	_load(loader: AssetLoadHandler): void {
		if (this._failureController.tryLoad(this, loader)) {
			setTimeout(() => {
				if (!this.destroyed()) loader._onAssetLoad(this);
			}, 0);
		}
	}

	execute(env: ScriptAssetRuntimeValue): any {
		if (!(this.game.resourceFactory as ResourceFactory).scriptContents.hasOwnProperty(env.module.filename)) {
			// 特にスクリプトの内容指定がないケース:
			// ScriptAssetは任意の値を返してよいが、シーンを記述したスクリプトは
			// シーンを返す関数を返すことを期待するのでここでは関数を返しておく
			return (env.module.exports = function(): g.Scene {
				return new g.Scene({ game: env.game });
			});
		} else {
			const prefix = "(function(exports, require, module, __filename, __dirname) {";
			const suffix = "})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);";
			const content = (this.game.resourceFactory as ResourceFactory).scriptContents[env.module.filename];
			const f = new Function("g", prefix + content + suffix);
			f(env);
			return env.module.exports;
		}
	}
}

export class VideoAsset extends pci.VideoAsset {
	constructor(id: string, assetPath: string, width: number, height: number, system: g.VideoSystem, loop: boolean, useRealSize: boolean) {
		super(id, assetPath, width, height, system, loop, useRealSize);
	}

	_load(_loader: AssetLoadHandler): void {
		throw new Error("not implemented");
	}

	asSurface(): Surface {
		throw new Error("not implemented");
	}

	getPlayer(): PdiVideoPlayer {
		throw new Error("not implemented");
	}
}

export class VectorImageAsset extends pci.VectorImageAsset {

	createSurface(
		_width: number,
		_height: number,
		_sx?: number,
		_sy?: number,
		_sWidth?: number,
		_sHeight?: number
	): Surface | null {
		return null;
	}

	_load(loader: AssetLoadHandler): void {
		loader._onAssetLoad(this);
	}
}

export class AudioPlayer extends pci.AudioPlayer {
	canHandleStoppedValue: boolean;

	constructor(system: PdiAudioSystem) {
		super(system);
		this.canHandleStoppedValue = true;
	}

	canHandleStopped(): boolean {
		return this.canHandleStoppedValue;
	}
}

export class GlyphFactory extends pci.GlyphFactory {
	constructor(
		fontFamily: string | string[],
		fontSize: number,
		baselineHeight?: number,
		fontColor?: string,
		strokeWidth?: number,
		strokeColor?: string,
		strokeOnly?: boolean,
		fontWeight?: FontWeightString
	) {
		super(fontFamily, fontSize, baselineHeight, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight);
	}
	create(_code: number): PdiGlyph {
		throw new Error("not implemented");
	}
}

export class ResourceFactory extends pci.ResourceFactory {
	_game: g.Game;
	scriptContents: { [key: string]: string };

	// 真である限り createXXAsset() が DelayedAsset を生成する(現在は createImageAsset() のみ)。
	// DelayedAsset は、flushDelayedAssets() 呼び出しまで読み込み完了(またはエラー)通知を遅延するアセットである。
	// コード重複を避けるため、現在は createImageAsset() のみこのフラグに対応している。
	createsDelayedAsset: boolean;

	_necessaryRetryCount: number;
	_delayedAssets: DelayedAsset[];

	constructor() {
		super();
		this.scriptContents = {};
		this._game = undefined!;
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
		const originalValue = this._necessaryRetryCount;
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

	createImageAsset(id: string, assetPath: string, width: number, height: number): ImageAsset {
		if (this.createsDelayedAsset) {
			const ret = new DelayedImageAsset(this._necessaryRetryCount, id, assetPath, width, height);
			this._delayedAssets.push(ret);
			return ret;
		} else {
			return new ImageAsset(this._necessaryRetryCount, id, assetPath, width, height);
		}
	}

	createVectorImageAsset(id: string, assetPath: string, width: number, height: number): VectorImageAsset {
		return new VectorImageAsset(id, assetPath, width, height);
	}

	createAudioAsset(
		id: string,
		assetPath: string,
		duration: number,
		system: PdiAudioSystem,
		loop: boolean,
		hint: AudioAssetHint
	): AudioAsset {
		return new AudioAsset(this._necessaryRetryCount, id, assetPath, duration, system, loop, hint);
	}

	createTextAsset(id: string, assetPath: string): TextAsset {
		return new TextAsset(this._game, this._necessaryRetryCount, id, assetPath);
	}

	createScriptAsset(id: string, assetPath: string): ScriptAsset {
		return new ScriptAsset(this._game, this._necessaryRetryCount, id, assetPath);
	}

	createSurface(width: number, height: number): pci.Surface {
		return new Surface(width, height);
	}

	createAudioPlayer(system: PdiAudioSystem): AudioPlayer {
		return new AudioPlayer(system);
	}

	createGlyphFactory(
		fontFamily: string | string[],
		fontSize: number,
		baselineHeight?: number,
		fontColor?: string,
		strokeWidth?: number,
		strokeColor?: string,
		strokeOnly?: boolean,
		fontWeight?: FontWeightString
	): PdiGlyphFactory {
		return new GlyphFactory(fontFamily, fontSize, baselineHeight, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight);
	}
	createVideoAsset(
		_id: string,
		_assetPath: string,
		_width: number,
		_height: number,
		_system: PdiVideoSystem,
		_loop: boolean,
		_useRealSize: boolean
	): VideoAsset {
		throw new Error("not implemented");
	}
}

export class GameHandlerSet implements g.GameHandlerSet {
	raisedEvents: pl.Event[] = [];
	raisedTicks: pl.Event[][] = [];
	eventFilters: g.EventFilter[] = [];
	modeHistry: g.SceneMode[] = [];

	raiseTick(events?: pl.Event[]): void {
		if (events) this.raisedTicks.push(events);
	}
	raiseEvent(event: pl.Event): void {
		this.raisedEvents.push(event);
	}
	addEventFilter(func: g.EventFilter, _handleEmpty?: boolean): void {
		this.eventFilters.push(func);
	}
	removeEventFilter(func: g.EventFilter): void {
		this.eventFilters = this.eventFilters.filter(f => f !== func);
	}
	removeAllEventFilters(): void {
		this.eventFilters = [];
	}
	changeSceneMode(mode: g.SceneMode): void {
		this.modeHistry.push(mode);
	}
	shouldSaveSnapshot(): boolean {
		return false;
	}
	saveSnapshot(_frame: number, _snapshot: any, _randGenSer: any, _timestamp?: number): void {
		// do nothing
	}
	getInstanceType(): "active" | "passive" {
		return "passive";
	}
	getCurrentTime(): number {
		return 0;
	}
}

export class Game extends g.Game {
	terminatedGame: boolean;
	autoTickForInternalEvents: boolean;
	resourceFactory!: ResourceFactory; // NOTE: 継承元クラスで代入
	handlerSet!: GameHandlerSet; // NOTE: 継承元クラスで代入

	constructor(
		configuration: g.GameConfiguration,
		assetBase?: string,
		selfId?: string,
		operationPluginViewInfo?: OperationPluginViewInfo,
		mainFunc?: g.GameMainFunction
	) {
		const resourceFactory = new ResourceFactory();
		const handlerSet = new GameHandlerSet();
		super({ engineModule: g, configuration, resourceFactory, handlerSet, assetBase, selfId, operationPluginViewInfo, mainFunc });
		resourceFactory.init(this);
		this.terminatedGame = false;
		this.autoTickForInternalEvents = true;
	}

	// 引数がなかった当時の tick の挙動を再現するメソッド。
	classicTick(): boolean {
		const scene = this.scene();
		const advance = scene && scene.local !== "full-local";
		return this.tick(!!advance);
	}

	_pushPostTickTask<T>(fun: () => void, owner: any): void {
		super._pushPostTickTask(fun, owner);
		if (this.autoTickForInternalEvents) {
			setTimeout(() => {
				this.classicTick();
			}, 0);
		}
	}

	_terminateGame(): void {
		this.terminatedGame = true;
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

export class CacheableE extends g.CacheableE {
	renderCache(_renderer: Renderer, _camera: g.Camera2D): void {
		// do nothing
	}
}

export interface AudioSystem extends PdiAudioSystem {
	_destroyRequestedAssets: { [key: string]: g.AudioAsset };
}
