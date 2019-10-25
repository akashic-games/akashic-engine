import { RendererLike } from "../../interfaces/RendererLike";
import { SurfaceLike } from "../../interfaces/SurfaceLike";
import { CommonSize } from "../../types/commons";
import { EntityStateFlags } from "../../types/EntityStateFlags";
import { Camera } from "../Camera";
import { E, EParameterObject } from "./E";

/**
 * `CacheableE` のコンストラクタに渡すことができるパラメータ。
 */
export interface CacheableEParameterObject extends EParameterObject {
	// nothing to declare.
}

/**
 * 内部描画キャッシュを持つ `E` 。
 */
export abstract class CacheableE extends E {
	/**
	 * _cache のパディングサイズ。
	 *
	 * @private
	 */
	static PADDING: number = 1;

	/**
	 * エンジンが子孫を描画すべきであれば`true`、でなければ`false`を本クラスを継承したクラスがセットする。
	 * デフォルト値は`true`となる。
	 * @private
	 */
	_shouldRenderChildren: boolean;

	/**
	 * このエンティティの内部キャッシュ。
	 * @private
	 */
	_cache: SurfaceLike;

	/**
	 * @private
	 */
	_renderer: RendererLike;

	/**
	 * このエンティティを最後に描画した時の`Camrera`。
	 *
	 * @private
	 */
	_renderedCamera: Camera;

	/**
	 * 描画されるキャッシュサイズ。
	 * このサイズは _cache のサイズよりも小さくなる場合がある。
	 *
	 * @private
	 */
	_cacheSize: CommonSize;

	/**
	 * 各種パラメータを指定して `CacheableE` のインスタンスを生成する。
	 * @param param このエンティティに対するパラメータ
	 */
	constructor(param: CacheableEParameterObject) {
		super(param);
		this._shouldRenderChildren = true;
		this._cache = undefined;
		this._renderer = undefined;
		this._renderedCamera = undefined;
	}

	/**
	 * このエンティティの描画キャッシュ無効化をエンジンに通知する。
	 * このメソッドを呼び出し後、描画キャッシュの再構築が行われ、各 `Renderer` に描画内容の変更が反映される。
	 */
	invalidate(): void {
		this.state &= ~EntityStateFlags.Cached;
		this.modified();
	}

	/**
	 * このエンティティ自身の描画を行う。
	 * このメソッドはエンジンから暗黙に呼び出され、ゲーム開発者が呼び出す必要はない。
	 */
	renderSelf(renderer: RendererLike, camera?: Camera): boolean {
		var padding = CacheableE.PADDING;
		if (this._renderedCamera !== camera) {
			this.state &= ~EntityStateFlags.Cached;
			this._renderedCamera = camera;
		}
		if (!(this.state & EntityStateFlags.Cached)) {
			this._cacheSize = this.calculateCacheSize();
			var w = Math.ceil(this._cacheSize.width) + padding * 2;
			var h = Math.ceil(this._cacheSize.height) + padding * 2;
			var isNew = !this._cache || this._cache.width < w || this._cache.height < h;
			if (isNew) {
				if (this._cache && !this._cache.destroyed()) {
					this._cache.destroy();
				}
				this._cache = this.scene.game.resourceFactory.createSurface(w, h);
				this._renderer = this._cache.renderer();
			}

			var cacheRenderer = this._renderer;
			cacheRenderer.begin();
			if (!isNew) {
				cacheRenderer.clear();
			}

			cacheRenderer.save();
			cacheRenderer.translate(padding, padding);
			this.renderCache(cacheRenderer, camera);
			cacheRenderer.restore();

			this.state |= EntityStateFlags.Cached;
			cacheRenderer.end();
		}
		if (this._cache && this._cacheSize.width > 0 && this._cacheSize.height > 0) {
			renderer.translate(-padding, -padding);
			this.renderSelfFromCache(renderer);
			renderer.translate(padding, padding);
		}
		return this._shouldRenderChildren;
	}

	/**
	 * 内部キャッシュから自身の描画を行う。
	 * このメソッドはエンジンから暗黙に呼び出され、ゲーム開発者が呼び出す必要はない。
	 */
	renderSelfFromCache(renderer: RendererLike): void {
		renderer.drawImage(
			this._cache,
			0,
			0,
			this._cacheSize.width + CacheableE.PADDING,
			this._cacheSize.height + CacheableE.PADDING,
			0,
			0
		);
	}

	/**
	 * キャッシュの描画が必要な場合にこのメソッドが呼ばれる。
	 * 本クラスを継承したエンティティはこのメソッド内で`renderer`に対してキャッシュの内容を描画しなければならない。
	 * このメソッドはエンジンから暗黙に呼び出され、ゲーム開発者が呼び出す必要はない。
	 */
	abstract renderCache(renderer: RendererLike, camera?: Camera): void;

	/**
	 * 利用している `Surface` を破棄した上で、このエンティティを破棄する。
	 */
	destroy(): void {
		if (this._cache && !this._cache.destroyed()) {
			this._cache.destroy();
		}
		this._cache = undefined;

		super.destroy();
	}

	/**
	 * キャッシュのサイズを取得する。
	 * 本クラスを継承したクラスでエンティティのサイズと異なるサイズを利用する場合、このメソッドをオーバーライドする。
	 * このメソッドはエンジンから暗黙に呼び出され、ゲーム開発者が呼び出す必要はない。
	 * このメソッドから得られる値を変更した場合、 `this.invalidate()` を呼び出す必要がある。
	 */
	calculateCacheSize(): CommonSize {
		return {
			width: this.width,
			height: this.height
		};
	}
}
