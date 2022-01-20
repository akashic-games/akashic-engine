import {
	Asset,
	AssetLoadError,
	AssetLoadHandler,
	CommonArea,
	ImageAsset,
	ImageAssetHint,
	ResourceFactory,
	Surface
} from "@akashic/pdi-types";
import { Trigger } from "@akashic/trigger";
import { ExceptionFactory } from "../ExceptionFactory";

/**
 * 部分画像アセット。
 *
 * `resourceFacotory.createImageAsset()` で生成したアセットをラップし、`slice` で指定される領域の画像アセットとして振る舞う。
 * 通常、ゲーム開発者がこのクラスを生成する必要はない。
 */
export class PartialImageAsset implements ImageAsset {
	id: string;
	path: string;
	originalPath: string;
	type: "image" = "image";
	width: number;
	height: number;
	hint: ImageAssetHint | undefined = undefined;

	onDestroyed: Trigger<Asset> = new Trigger();

	_src: ImageAsset;
	_slice: CommonArea;
	_resourceFactory: ResourceFactory;
	_surface: Surface | null = null;
	_loadHandler: AssetLoadHandler | null = null;

	/**
	 * 部分画像アセットを生成する。
	 *
	 * `createImageAsset()` と異なり、 `slice` で指定された領域の画像アセットとして振る舞うため、
	 * `this.width`, `this.height` が引数の `width`, height` ではなく `slice` の値で初期化される点に注意。
	 * (`width`, `height` は元になる画像アセットの生成に使われる)
	 */
	constructor(resourceFactory: ResourceFactory, id: string, uri: string, width: number, height: number, slice: CommonArea) {
		this.id = id;
		this.path = uri;
		this.originalPath = uri;
		this.width = slice.width;
		this.height = slice.height;
		this._slice = slice;
		this._resourceFactory = resourceFactory;

		const internalId = `${id}/<internal>`; // AssetManager が管理しないので値は何でもよいが、わかりやすさのため `id` を元にしておく
		this._src = resourceFactory.createImageAsset(internalId, uri, width, height);
	}

	initialize(hint: ImageAssetHint | undefined): void {
		this.hint = hint; // 自分では使わないが、外部観測的に `ImageAsset` と合うように代入しておく
		this._src.initialize(hint);
	}

	inUse(): boolean {
		return false;
	}

	destroy(): void {
		if (this.destroyed()) {
			return;
		}
		this.onDestroyed.fire(this);
		this._src.destroy();
		this._slice = null!;
		this._resourceFactory = null!;
		this._surface = null;
		this._loadHandler = null;
		this.onDestroyed.destroy();
		this.onDestroyed = undefined!;
	}

	destroyed(): boolean {
		return this._src.destroyed();
	}

	asSurface(): Surface {
		if (this._surface) return this._surface;
		if (this._src.destroyed()) throw ExceptionFactory.createAssertionError("PartialImageAsset#asSurface(): src lost");
		const { x, y, width, height } = this._slice;
		const surface = this._resourceFactory.createSurface(width, height);
		const r = surface.renderer();
		r.begin();
		r.drawImage(this._src.asSurface(), x, y, width, height, 0, 0);
		r.end();
		this._surface = surface;
		return surface;
	}

	/**
	 * @private
	 */
	_load(loader: AssetLoadHandler): void {
		this._loadHandler = loader;
		this._src._load(this as AssetLoadHandler);
	}

	/**
	 * this._src 用のロードハンドラ。
	 * @private
	 */
	_onAssetLoad(_asset: Asset): void {
		this._loadHandler!._onAssetLoad(this);
	}

	/**
	 * this._src 用のロードエラーハンドラ。
	 * @private
	 */
	_onAssetError(_asset: Asset, error: AssetLoadError): void {
		this._loadHandler!._onAssetError(this, error);
	}

	/**
	 * @private
	 */
	_assetPathFilter(path: string): string {
		return path;
	}
}
