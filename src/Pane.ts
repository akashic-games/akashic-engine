namespace g {
	/**
	 * `Pane` のコンストラクタに渡すことができるパラメータ。
	 * 各メンバの詳細は `Pane` の同名メンバの説明を参照すること。
	 */
	export interface PaneParameterObject extends CacheableEParameterObject {
		/**
		 * このオブジェクトの横幅。実際の表示領域としてはscaleX, scaleY, angleの値も考慮する必要がある。
		 */
		width: number;

		/**
		 * このオブジェクトの縦幅。実際の表示領域としてはscaleX, scaleY, angleの値も考慮する必要がある。
		 */
		height: number;

		/**
		 * 背景画像として使う `ImageAsset` または `Surface` 。
		 * 省略された場合、背景には何も描かれない。
		 * @default undefined
		 */
		backgroundImage?: ImageAsset | Surface;

		/**
		 * 子孫エンティティの描画位置・クリッピングサイズを決めるパディング。
		 * @default 0
		 */
		padding?: CommonRect|number;

		/**
		 * 背景画像の描画方法を指定する `SurfaceEffector` 。
		 * `undefined` の場合、描画方法をカスタマイズしない。
		 * @default undefined
		 */
		backgroundEffector?: SurfaceEffector;

		/**
		 * この`Pane`をスケール変更に対応させるか指定する
		 * falseもしくはundefinedの場合、スケール変更に対応させない
		 * @default undefined
		 */
		hasVariableResolution?: boolean;
	}
	/**
	 * 枠を表すエンティティ。
	 * クリッピングやパディング、バックグラウンドイメージの演出等の機能を持つため、
	 * メニューやメッセージ、ステータスのウィンドウ等に利用されることが期待される。
	 * このエンティティの子要素は、このエンティティの持つ `Surface` に描画される。
	 */
	export class Pane extends CacheableE {
		/**
		 * 背景画像の `Surface` 。
		 * この値を変更した場合、 `this.invalidate()` を呼び出す必要がある。
		 */
		backgroundImage: Surface; // TODO: (GAMEDEV-2034) Surface|ImageAsset 型になる予定

		/**
		 * 背景画像の拡大・縮小に用いられる `SurfaceEffector` 。
		 * (ex. 背景に「枠」の部分を持つ画像を使い、枠部分の拡大率を固定したいような場合は、 `NinePatchSurfaceEffector` を指定すればよい)
		 * この値を変更した場合、 `this.invalidate()` を呼び出す必要がある。
		 */
		backgroundEffector: SurfaceEffector;

		/**
		 * @private
		 */
		_padding: CommonRect|number;

		/**
		 * @private
		 */
		_paddingChanged: boolean;

		/**
		 * @private
		 */
		_normalizedPadding: CommonRect;

		/**
		 * @private
		 */
		// Effect済み背景画像の描画サーフェス
		_bgSurface: Surface;

		/**
		 * @private
		 */
		_bgRenderer: Renderer;

		/**
		 * @private
		 */
		_oldWidth: number;

		/**
		 * @private
		 */
		_oldHeight: number;


		/**
		 * @private
		 */
		_childrenArea: CommonArea;

		/**
		 * @private
		 */
		_childrenSurface: Surface;

		/**
		 * @private
		 */
		_childrenRenderer: Renderer;

		/**
		 * @private
		 */
		_hasVariableResolution: boolean;

		/**
		 * 各種パラメータを指定して `Pane` のインスタンスを生成する。
		 * @param param このエンティティに指定するパラメータ
		 */
		constructor(param: PaneParameterObject) {
			super(param);
			this._oldWidth = param.width;
			this._oldHeight = param.height;
			this.backgroundImage = g.Util.asSurface(param.backgroundImage);
			this.backgroundEffector = param.backgroundEffector;
			this._shouldRenderChildren = false;
			this._padding = param.padding;
			this._hasVariableResolution = param.hasVariableResolution !== undefined ? param.hasVariableResolution : false;
			this._initialize();
			this._paddingChanged = false;
			this._bgSurface = undefined;
			this._bgRenderer = undefined;
		}

		/**
		 * パディング。
		 * このエンティティの子孫は、パディングに指定された分だけ右・下にずれた場所に描画され、またパディングの矩形サイズでクリッピングされる。
		 */
		// NOTE: paddingの変更は頻繁に行われるものでは無いと思われるので、フラグを立てるためにアクセサを使う
		set padding(padding: CommonRect|number) {
			this._padding = padding;
			this._paddingChanged = true;
		}

		get padding(): CommonRect|number {
			return this._padding;
		}

		/**
		 * このエンティティに対する変更をエンジンに通知する。
		 * このメソッドの呼び出し後、 `this` に対する変更が各 `Renderer` の描画に反映される。
		 * このメソッドは描画キャッシュの無効化を保証しない。描画キャッシュの無効化も必要な場合、 `invalidate()`を呼び出さなければならない。
		 * 詳細は `E#modified()` のドキュメントを参照。
		 */
		modified(isBubbling?: boolean): void {
			if (isBubbling)
				this.state &= ~EntityStateFlags.Cached;
			super.modified();
		}

		shouldFindChildrenByPoint(point: CommonOffset): boolean {
			var p = this._normalizedPadding;
			if (p.left < point.x && this.width - p.right > point.x && p.top < point.y && this.height - p.bottom > point.y) {
				return true;
			}
			return false;
		}

		renderCache(renderer: Renderer, camera?: Camera): void {
			if (this.width <= 0 || this.height <= 0) {
				return;
			}
			this._renderBackground();
			this._renderChildren(camera);

			if (this._bgSurface) {
				renderer.drawImage(this._bgSurface, 0, 0, this.width, this.height, 0, 0);
			} else if (this.backgroundImage) {
				renderer.drawImage(this.backgroundImage, 0, 0, this.width, this.height, 0, 0);
			}
			if (this._childrenArea.width <= 0 || this._childrenArea.height <= 0) {
				return;
			}
			renderer.save();
			if (this._childrenArea.x !== 0 || this._childrenArea.y !== 0) {
				renderer.translate(this._childrenArea.x, this._childrenArea.y);
			}
			renderer.drawImage(this._childrenSurface, 0, 0, this._childrenArea.width, this._childrenArea.height, 0, 0);
			renderer.restore();
		}

		/**
		 * このエンティティを破棄する。また、バックバッファで利用している `Surface` も合わせて破棄される。
		 * ただし、 `backgroundImage` に利用している `Surface` の破棄は行わない。
		 * @param destroySurface trueを指定した場合、 `backgroundImage` に利用している `Surface` も合わせて破棄する。
		 */
		 destroy(destroySurface?: boolean): void {
			if (destroySurface && this.backgroundImage && !this.backgroundImage.destroyed()) {
				this.backgroundImage.destroy();
			}
			if (this._bgSurface && !this._bgSurface.destroyed()) {
				this._bgSurface.destroy();
			}
			if (this._childrenSurface && !this._childrenSurface.destroyed()) {
				this._childrenSurface.destroy();
			}
			this.backgroundImage = undefined;
			this._bgSurface = undefined;
			this._childrenSurface = undefined;
			super.destroy();
		 }

		/**
		 * @private
		 */
		_renderBackground(): void {
			if (this._bgSurface && !this._bgSurface.destroyed()) {
				this._bgSurface.destroy();
			}
			if (this.backgroundImage && this.backgroundEffector) {
				this._bgSurface = this.backgroundEffector.render(this.backgroundImage, this.width, this.height);
			} else {
				this._bgSurface = undefined;
			}
		}

		/**
		 * @private
		 */
		_renderChildren(camera?: Camera): void {
			var isNew = this._oldWidth !== this.width || this._oldHeight !== this.height || this._paddingChanged;
			if (isNew) {
				this._initialize();
				this._paddingChanged = false;
				this._oldWidth = this.width;
				this._oldHeight = this.height;
			}
			this._childrenRenderer.begin();
			if (! isNew) {
				this._childrenRenderer.clear();
			}

			if (this.children) {
				// Note: concatしていないのでunsafeだが、render中に配列の中身が変わる事はない前提とする
				var children = this.children;
				for (var i = 0; i < children.length; ++i) {
					children[i].render(this._childrenRenderer, camera);
				}
			}
			this._childrenRenderer.end();
		}

		/**
		 * @private
		 */
		_initialize(): void {
			var p = this._padding === undefined ? 0 : this._padding;
			var r: CommonRect;
			if (typeof p === "number") {
				r = {top: p, bottom: p, left: p, right: p};
			} else {
				r = <CommonRect>this._padding;
			}
			this._childrenArea = {
				x: r.left,
				y: r.top,
				width: this.width - r.left - r.right,
				height: this.height - r.top - r.bottom
			};
			var resourceFactory = this.scene.game.resourceFactory;
			if (this._childrenSurface && !this._childrenSurface.destroyed()) {
				this._childrenSurface.destroy();
			}
			const surfaceStateFlag = this._hasVariableResolution ? g.SurfaceStateFlags.hasVariableResolution : g.SurfaceStateFlags.None;
			this._childrenSurface = resourceFactory.createSurface(
				Math.ceil(this._childrenArea.width),
				Math.ceil(this._childrenArea.height),
				surfaceStateFlag
			);
			this._childrenRenderer = this._childrenSurface.renderer();
			this._normalizedPadding = r;
		}

		/**
		 * このPaneの包含矩形を計算する。
		 * Eを継承する他のクラスと異なり、Paneは子要素の位置を包括矩形に含まない。
		 * @private
		 */
		_calculateBoundingRect(m?: Matrix, c?: Camera): CommonRect {
			var matrix = this.getMatrix();
			if (m) {
				matrix = m.multiplyNew(matrix);
			}

			if (!this.visible() || (c && (!this._targetCameras || this._targetCameras.indexOf(c) === -1))) {
				return undefined;
			}

			var thisBoundingRect: CommonRect = {left: 0, right: this.width, top: 0, bottom: this.height};

			var targetCoordinates: CommonOffset[] = [
				{x: thisBoundingRect.left, y: thisBoundingRect.top},
				{x: thisBoundingRect.left, y: thisBoundingRect.bottom},
				{x: thisBoundingRect.right, y: thisBoundingRect.top},
				{x: thisBoundingRect.right, y: thisBoundingRect.bottom}
			];

			var convertedPoint = matrix.multiplyPoint(targetCoordinates[0]);
			var result: CommonRect  = {left: convertedPoint.x, right: convertedPoint.x, top: convertedPoint.y, bottom: convertedPoint.y};
			for (var i = 1; i < targetCoordinates.length; ++i) {
				convertedPoint = matrix.multiplyPoint(targetCoordinates[i]);
				if (result.left > convertedPoint.x)
					result.left = convertedPoint.x;
				if (result.right < convertedPoint.x)
					result.right = convertedPoint.x;
				if (result.top > convertedPoint.y)
					result.top = convertedPoint.y;
				if (result.bottom < convertedPoint.y)
					result.bottom = convertedPoint.y;
			}
			return result;
		}

		_createCache(width: number, height: number): Surface {
			return this._createSurface(width, height, this._hasVariableResolution);
		}
	}
}
