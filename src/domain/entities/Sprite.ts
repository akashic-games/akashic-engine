import { Matrix, PlainMatrix } from "../../domain/Matrix";
import { SurfaceUtil } from "../../domain/SurfaceUtil";
import { ImageAssetLike } from "../../interfaces/ImageAssetLike";
import { RendererLike } from "../../interfaces/RendererLike";
import { SurfaceLike } from "../../interfaces/SurfaceLike";
import { Camera } from "../Camera";
import { E, EParameterObject } from "./E";

/**
 * `Sprite` のコンストラクタに渡すことができるパラメータ。
 * 各メンバの詳細は `Sprite` の同名メンバの説明を参照すること。
 *
 * 値に `width` または `height` が含まれていない場合、
 * `Sprite` のコンストラクタはそれぞれ `src.width`、 `src.height` が指定されたかのように振る舞う。
 */
export interface SpriteParameterObject extends EParameterObject {
	/**
	 * 画像として使う `Surface` または `ImageAsset` 。
	 */
	src: SurfaceLike | ImageAssetLike;

	/**
	 * `surface` の描画対象部分の幅。
	 * 描画はこの値を `this.width` に拡大または縮小する形で行われる。
	 * 省略された場合、値に `width` があれば `width` 、なければ `src.width` 。
	 * @default (width !== undefined) ? width : src.width
	 */
	srcWidth?: number;

	/**
	 * `surface` の描画対象部分の高さ。
	 * 描画はこの値を `this.height` に拡大または縮小する形で行われる。
	 * 省略された場合、値に `height` があれば `height` 、なければ `src.height` 。
	 * @default height || src.height
	 */
	srcHeight?: number;

	/**
	 * `surface` の描画対象部分の左端。
	 * @default 0
	 */
	srcX?: number;

	/**
	 * `surface` の描画対象部分の上端。
	 * @default 0
	 */
	srcY?: number;
}

/**
 * 画像を描画するエンティティ。
 */
export class Sprite extends E {
	/**
	 * 描画する画像。
	 * `srcX` ・ `srcY` ・ `srcWidth` ・ `srcHeight` の作る矩形がこの画像の範囲外を示す場合、描画結果は保証されない。
	 * この値を変更した場合、 `this.invalidate()` を呼び出す必要がある。
	 */
	surface: SurfaceLike;

	/**
	 * `surface` の描画対象部分の幅。
	 * 描画はこの値を `this.width` に拡大または縮小する形で行われる。
	 * この値を変更した場合、 `this.invalidate()` を呼び出す必要がある。
	 */
	srcWidth: number;

	/**
	 * `surface` の描画対象部分の高さ。
	 * 描画はこの値を `this.height` に拡大または縮小する形で行われる。
	 * この値を変更した場合、 `this.invalidate()` を呼び出す必要がある。
	 */
	srcHeight: number;

	/**
	 * `surface` の描画対象部分の左端。
	 * この値を変更した場合、 `this.invalidate()` を呼び出す必要がある。
	 */
	srcX: number;

	/**
	 * `surface` の描画対象部分の上端。
	 * この値を変更した場合、 `this.invalidate()` を呼び出す必要がある。
	 */
	srcY: number;

	/**
	 * @private
	 */
	_stretchMatrix: Matrix;

	/**
	 * @private
	 */
	_beforeSurface: SurfaceLike;

	/**
	 * 各種パラメータを指定して `Sprite` のインスタンスを生成する。
	 * @param param `Sprite` に設定するパラメータ
	 */
	constructor(param: SpriteParameterObject) {
		super(param);
		this.surface = SurfaceUtil.asSurface(param.src);
		if (param.width == null) this.width = this.surface.width;
		if (param.height == null) this.height = this.surface.height;
		this.srcWidth = param.srcWidth != null ? param.srcWidth : this.width;
		this.srcHeight = param.srcHeight != null ? param.srcHeight : this.height;
		this.srcX = param.srcX || 0;
		this.srcY = param.srcY || 0;
		this._stretchMatrix = undefined;
		this._beforeSurface = this.surface;
		SurfaceUtil.setupAnimatingHandler(this, this.surface);
		this._invalidateSelf();
	}

	/**
	 * @private
	 */
	_onUpdate(): void {
		this.modified();
	}

	/**
	 * @private
	 */
	_onAnimatingStarted(): void {
		if (!this.update.contains(this._onUpdate, this)) {
			this.update.add(this._onUpdate, this);
		}
	}

	/**
	 * @private
	 */
	_onAnimatingStopped(): void {
		if (!this.destroyed()) {
			this.update.remove(this._onUpdate, this);
		}
	}

	/**
	 * このエンティティ自身の描画を行う。
	 * このメソッドはエンジンから暗黙に呼び出され、ゲーム開発者が呼び出す必要はない。
	 */
	renderSelf(renderer: RendererLike, camera?: Camera): boolean {
		if (this.srcWidth <= 0 || this.srcHeight <= 0) {
			return true;
		}
		if (this._stretchMatrix) {
			renderer.save();
			renderer.transform(this._stretchMatrix._matrix);
		}

		renderer.drawImage(this.surface, this.srcX, this.srcY, this.srcWidth, this.srcHeight, 0, 0);

		if (this._stretchMatrix) renderer.restore();

		return true;
	}

	/**
	 * このエンティティの描画キャッシュ無効化をエンジンに通知する。
	 * このメソッドを呼び出し後、描画キャッシュの再構築が行われ、各 `Renderer` に描画内容の変更が反映される。
	 */
	invalidate(): void {
		this._invalidateSelf();
		this.modified();
	}

	/**
	 * このエンティティを破棄する。
	 * デフォルトでは利用している `Surface` の破棄は行わない点に注意。
	 * @param destroySurface trueを指定した場合、このエンティティが抱える `Surface` も合わせて破棄する
	 */
	destroy(destroySurface?: boolean): void {
		if (this.surface && !this.surface.destroyed()) {
			if (destroySurface) {
				this.surface.destroy();
			} else if (this.surface.isDynamic) {
				this.surface.animatingStarted.remove(this._onAnimatingStarted, this);
				this.surface.animatingStopped.remove(this._onAnimatingStopped, this);
			}
		}
		this.surface = undefined;
		super.destroy();
	}

	private _invalidateSelf(): void {
		if (this.width === this.srcWidth && this.height === this.srcHeight) {
			this._stretchMatrix = undefined;
		} else {
			this._stretchMatrix = new PlainMatrix();
			this._stretchMatrix.scale(this.width / this.srcWidth, this.height / this.srcHeight);
		}
		if (this.surface !== this._beforeSurface) {
			SurfaceUtil.migrateAnimatingHandler(this, this._beforeSurface, this.surface);
			this._beforeSurface = this.surface;
		}
	}
}
