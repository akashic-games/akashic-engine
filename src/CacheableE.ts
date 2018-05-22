namespace g {
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
		 * エンジンが子孫を描画すべきであれば`true`、でなければ`false`を本クラスを継承したクラスがセットする。
		 * デフォルト値は`true`となる。
		 * @private
		 */
		_shouldRenderChildren: boolean;

		/**
		 * このエンティティの内部キャッシュ。
		 * @private
		 */
		_cache: Surface;

		/**
		 * @private
		 */
		_renderer: Renderer;

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
		renderSelf(renderer: Renderer, camera?: Camera): boolean {
			if (this._renderedCamera !== camera) {
				this.state &= ~EntityStateFlags.Cached;
				this._renderedCamera = camera;
			}
			if (!(this.state & EntityStateFlags.Cached)) {
				this._cacheSize = this.calculateCacheSize();
				var isNew = !this._cache
					|| this._cache.width < Math.ceil(this._cacheSize.width)
					|| this._cache.height < Math.ceil(this._cacheSize.height);
				if (isNew) {
					if (this._cache && !this._cache.destroyed()) {
						this._cache.destroy();
					}
					this._cache = this.scene.game.resourceFactory.createSurface(Math.ceil(this._cacheSize.width), Math.ceil(this._cacheSize.height));
					this._renderer = this._cache.renderer();
				}
				this._renderer.begin();
				if (! isNew) {
					this._renderer.clear();
				}

				this.renderCache(this._renderer, camera);

				this.state |= EntityStateFlags.Cached;
				this._renderer.end();
			}
			if (this._cache && this._cacheSize.width > 0 && this._cacheSize.height > 0) {
				renderer.drawImage(this._cache, 0, 0, this._cacheSize.width, this._cacheSize.height, 0, 0);
			}
			return this._shouldRenderChildren;
		}

		/**
		 * キャッシュの描画が必要な場合にこのメソッドが呼ばれる。
		 * 本クラスを継承したエンティティはこのメソッド内で`renderer`に対してキャッシュの内容を描画しなければならない。
		 * このメソッドはエンジンから暗黙に呼び出され、ゲーム開発者が呼び出す必要はない。
		 */
		abstract renderCache(renderer: Renderer, camera?: Camera): void;

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
}
