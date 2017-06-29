namespace g {
	/**
	 * `Tile` のコンストラクタに渡すことができるパラメータ。
	 * 各メンバの詳細は `Tile` の同名メンバの説明を参照すること。
	 */
	export interface TileParameterObject extends CacheableEParameterObject {
		/**
		 * マップチップ画像として使う `Surface` または `ImageAsset` 。
		 */
		src: Surface|Asset;

		/**
		 * マップチップ一つの幅。
		 */
		tileWidth: number;

		/**
		 * マップチップ一つの高さ。
		 */
		tileHeight: number;

		/**
		 * タイルのデータ。
		 */
		tileData: number[][];
	}

	/**
	 * RPGのマップ等で利用される、チップとデータによるパターン描画を提供するE。
	 * キャッシュと部分転送機能を持っているため、高速に描画することが出来る。
	 */
	export class Tile extends CacheableE {
		/**
		 * マップチップ画像。
		 * この値を変更した場合、 `this.invalidate()` が呼び出される必要がある。
		 */
		tileChips: Surface;

		/**
		 * マップチップ一つの幅。
		 * この値を変更した場合、 `this.invalidate()` が呼び出される必要がある。
		 */
		tileWidth: number;

		/**
		 * マップチップ一つの高さ。
		 * この値を変更した場合、 `this.invalidate()` が呼び出される必要がある。
		 */
		tileHeight: number;

		/**
		 * タイルのデータ。
		 * この値を変更した場合、 `this.invalidate()` が呼び出される必要がある。また `width`、 `height` もこれに従って変更されるべきである。
		 */
		tileData: number[][];

		_tilesInRow: number;

		_beforeTileChips: Surface;

		/**
		 * 各種パラメータを指定して `Tile` のインスタンスを生成する。
		 *
		 * @param param このエンティティに指定するパラメータ
		 */
		constructor(param: TileParameterObject) {
			super(param);
			this.tileWidth = param.tileWidth;
			this.tileHeight = param.tileHeight;
			this.tileData = param.tileData;
			this.tileChips = Util.asSurface(param.src);

			this.height = this.tileHeight * this.tileData.length;
			this.width = this.tileWidth * this.tileData[0].length;

			this._beforeTileChips = this.tileChips;
			Util.setupAnimatingHandler(this, this.tileChips);
			this._invalidateSelf();
		}

		_onUpdate(): void {
			this.invalidate();
		}

		_onAnimatingStarted(): void {
			if (!this.update.isHandled(this, this._onUpdate)) {
				this.update.handle(this, this._onUpdate);
			}
		}

		_onAnimatingStopped(): void {
			if (! this.destroyed()) {
				this.update.remove(this, this._onUpdate);
			}
		}

		renderCache(renderer: Renderer): void {
			if (! this.tileData)
				throw ExceptionFactory.createAssertionError("Tile#_renderCache: don't have a tile data");
			if (this.tileWidth <= 0 || this.tileHeight <= 0) {
				return;
			}

			for (var y = 0; y < this.tileData.length; ++y) {
				var row = this.tileData[y];
				for (var x = 0; x < row.length; ++x) {
					var tile = row[x];
					if (tile < 0) {
						continue;
					}
					var tileX = this.tileWidth * (tile % this._tilesInRow);
					var tileY = this.tileHeight * Math.floor(tile / this._tilesInRow);

					var dx = this.tileWidth * x;
					var dy = this.tileHeight * y;

					renderer.drawImage(
						this.tileChips,
						tileX,
						tileY,
						this.tileWidth,
						this.tileHeight,
						dx,
						dy
					);
				}
			}
		}

		invalidate(): void {
			this._invalidateSelf();
			super.invalidate();
		}

		/**
		 * このエンティティを破棄する。
		 * デフォルトでは利用しているマップチップの `Surface` `Surface` の破棄は行わない点に注意。
		 * @param destroySurface trueを指定した場合、このエンティティが抱えるマップチップの `Surface` も合わせて破棄する
		 */
		destroy(destroySurface?: boolean): void {
			if (destroySurface && this.tileChips && !this.tileChips.destroyed()) {
				this.tileChips.destroy();
			}
			this.tileChips = undefined;
			super.destroy();
		}

		private _invalidateSelf(): void {
			this._tilesInRow = Math.floor(this.tileChips.width / this.tileWidth);
			if (this.tileChips !== this._beforeTileChips) {
				Util.migrateAnimatingHandler(this, this._beforeTileChips, this.tileChips);
				this._beforeTileChips = this.tileChips;
			}
		}
	}
}
