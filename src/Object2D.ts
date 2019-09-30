import { CompositeOperation } from "./CompositeOperation";
import { CommonArea, CommonOffset, CommonSize } from "./commons";
import { Matrix, PlainMatrix } from "./Matrix";
import { ExceptionFactory } from "./errors";

/**
 * `Object2D` のコンストラクタに渡すことができるパラメータ。
 * 各メンバの詳細は `Object2D` の同名メンバの説明を参照すること。
 */
export interface Object2DParameterObject {

	/**
	 * このオブジェクトの横位置。実際の座標位置はscaleX, scaleY, angleの値も考慮する必要がある。
	 * @default 0
	 */
	x?: number;

	/**
	 * このオブジェクトの縦位置。実際の座標位置はscaleX, scaleY, angleの値も考慮する必要がある。
	 * @default 0
	 */
	y?: number;

	/**
	 * このオブジェクトの横幅。実際の表示領域としてはscaleX, scaleY, angleの値も考慮する必要がある。
	 * @default 0
	 */
	width?: number;

	/**
	 * このオブジェクトの縦幅。実際の表示領域としてはscaleX, scaleY, angleの値も考慮する必要がある。
	 * @default 0
	 */
	height?: number;

	/**
	 * 0～1でオブジェクトの不透明度を表す。
	 * この値が0の場合、Rendererは描画処理を省略する。
	 * @default 1
	 */
	opacity?: number;

	/**
	 * オブジェクトの横方向の倍率。
	 * @default 1
	 */
	scaleX?: number;

	/**
	 * オブジェクトの縦方向の倍率。
	 * @default 1
	 */
	scaleY?: number;

	/**
	 * オブジェクトの回転。度数で指定する。
	 * @default 0
	 */
	angle?: number;

	/**
	 * 描画時の合成方法を指定する。
	 * 省略された場合、合成方法を指定しない（親の合成方法を利用する）。
	 * @default undefined
	 */
	compositeOperation?: CompositeOperation;

	/**
	 * オブジェクトのアンカーの横位置。アンカーについては以下の通り。
	 * * アンカーとして設定した箇所がこのオブジェクトの基点 (位置、拡縮・回転の基点) となる。
	 * * 単位は相対値 (左上端が (0, 0) 中央が (0.5, 0,5) 右下端が (1,1) ) である。
	 * anchorXとanchorYの両方が省略された場合、このオブジェクトの位置 (x, y) は左上端を基準に決定され、拡縮・回転の基点は中央座標となる。
	 * これは前バージョンとの互換性のための挙動である。
	 * anchorX, anchorYのどちらかのみを指定した場合の動作は不定である。
	 * @default undefined
	 */
	anchorX?: number;

	/**
	 * オブジェクトのアンカーの縦位置。アンカーについては以下の通り。
	 * * アンカーとして設定した箇所がこのオブジェクトの基点 (位置、拡縮・回転の基点) となる。
	 * * 単位は相対値 (左上端が (0, 0) 中央が (0.5, 0,5) 右下端が (1,1) ) である。
	 * anchorXとanchorYの両方が省略された場合、このオブジェクトの位置 (x, y) は左上端を基準に決定され、拡縮・回転の基点は中央座標となる。
	 * これは前バージョンとの互換性のための挙動である。
	 * anchorX, anchorYのどちらかのみを指定した場合の動作は不定である。
	 * @default undefined
	 */
	anchorY?: number;
}

/**
 * 二次元の幾何的オブジェクト。位置とサイズ (に加えて傾きや透明度も) を持つ。
 * ゲーム開発者は `E` を使えばよく、通常このクラスを意識する必要はない。
 */
export class Object2D implements CommonArea {
	/**
	 * このオブジェクトの横位置。
	 * 初期値は `0` である。実際の座標位置はscaleX, scaleY, angleの値も考慮する必要がある。
	 * `E` や `Camera2D` においてこの値を変更した場合、 `modified()` を呼び出す必要がある。
	 */
	x: number;

	/**
	 * このオブジェクトの縦位置。
	 * 初期値は `0` である。実際の座標位置はscaleX, scaleY, angleの値も考慮する必要がある。
	 * `E` や `Camera2D` においてこの値を変更した場合、 `modified()` を呼び出す必要がある。
	 */
	y: number;

	/**
	 * このオブジェクトの横幅。
	 * 初期値は `0` である。実際の表示領域としてはscaleX, scaleY, angleの値も考慮する必要がある。
	 * `E` や `Camera2D` においてこの値を変更した場合、 `modified()` を呼び出す必要がある。
	 */
	width: number;

	/**
	 * このオブジェクトの縦幅。
	 * 初期値は `0` である。実際の表示領域としてはscaleX, scaleY, angleの値も考慮する必要がある。
	 * `E` や `Camera2D` においてこの値を変更した場合、 `modified()` を呼び出す必要がある。
	 */
	height: number;

	/**
	 * 0～1でオブジェクトの不透明度を表す。
	 * 初期値は `1` である。本値が0の場合、Rendererは描画処理を省略する。
	 * `E` においてこの値を変更した場合、 `modified()` を呼び出す必要がある。
	 */
	opacity: number;

	/**
	 * オブジェクトの横方向の倍率。
	 * 初期値は `1` である。
	 * `E` や `Camera2D` においてこの値を変更した場合、 `modified()` を呼び出す必要がある。
	 */
	scaleX: number;

	/**
	 * オブジェクトの縦方向の倍率。
	 * 初期値は `1` である。
	 * `E` や `Camera2D` においてこの値を変更した場合、 `modified()` を呼び出す必要がある。
	 */
	scaleY: number;

	/**
	 * オブジェクトの回転。度数で指定する。
	 * 初期値は `0` である。
	 * `E` や `Camera2D` においてこの値を変更した場合、 `modified()` を呼び出す必要がある。
	 */
	angle: number;

	/**
	 * 描画時の合成方法を指定する。
	 * 初期値は `undefined` となり、合成方法を指定しないことを意味する。
	 * `E` においてこの値を変更した場合、 `modified()` を呼び出す必要がある。
	 */
	compositeOperation: CompositeOperation;

	/**
	 * オブジェクトのアンカーの横位置。アンカーについては以下の通り。
	 * * アンカーとして設定した箇所がこのオブジェクトの基点 (位置、拡縮・回転の基点) となる。
	 * * 単位は相対値 (左上端が (0, 0) 中央が (0.5, 0,5) 右下端が (1,1) ) である。
	 * anchorXとanchorYの両方が省略された場合、このオブジェクトの位置 (x, y) は左上端を基準に決定され、拡縮・回転の基点は中央座標となる。
	 * これは前バージョンとの互換性のための挙動である。
	 * anchorX, anchorYのどちらかのみを指定した場合の動作は不定である。
	 * 初期値は `undefined` である。
	 * `E` や `Camera2D` においてこの値を変更した場合、 `modified()` を呼び出す必要がある。
	 */
	anchorX: number | undefined;

	/**
	 * オブジェクトのアンカーの縦位置。アンカーについては以下の通り。
	 * * アンカーとして設定した箇所がこのオブジェクトの基点 (位置、拡縮・回転の基点) となる。
	 * * 単位は相対値 (左上端が (0, 0) 中央が (0.5, 0,5) 右下端が (1,1) ) である。
	 * anchorXとanchorYの両方が省略された場合、このオブジェクトの位置 (x, y) は左上端を基準に決定され、拡縮・回転の基点は中央座標となる。
	 * これは前バージョンとの互換性のための挙動である。
	 * anchorX, anchorYのどちらかのみを指定した場合の動作は不定である。
	 * 初期値は `undefined` である。
	 * `E` や `Camera2D` においてこの値を変更した場合、 `modified()` を呼び出す必要がある。
	 */
	anchorY: number | undefined;

	/**
	 * 変換行列のキャッシュ。 `Object2D` は状態に変更があった時、本値の_modifiedをtrueにする必要がある。
	 * 初期値は `undefined` であり、 `getMatrix()` によって必要な時に生成されるため、
	 * `if (this._matrix) this._matrix._modified = true` という式で記述する必要がある。
	 *
	 * エンジンに組み込まれているSprite等のエンティティ群は、
	 * すでに本処理を組み込んでいるため通常ゲーム開発者はこの値を意識する必要はない。
	 * `Object2D` を継承したクラスを新たに作る場合には、本フィールドを適切に操作しなければならない。
	 * @private
	 */
	_matrix: Matrix;

	/**
	 * デフォルト値で `Object2D` のインスタンスを生成する。
	 */
	constructor();
	/**
	 * 指定されたパラメータで `Object2D` のインスタンスを生成する。
	 * @param param 初期化に用いるパラメータのオブジェクト
	 */
	constructor(param: Object2DParameterObject);

	constructor(param?: Object2DParameterObject) {
		if (!param) {
			this.x = 0;
			this.y = 0;
			this.width = 0;
			this.height = 0;
			this.opacity = 1;
			this.scaleX = 1;
			this.scaleY = 1;
			this.angle = 0;
			this.compositeOperation = undefined;
			this.anchorX = undefined;
			this.anchorY = undefined;
			this._matrix = undefined;
		} else {
			this.x = param.x || 0;
			this.y = param.y || 0;
			this.width = param.width || 0;
			this.height = param.height || 0;
			this.opacity = "opacity" in param ? param.opacity : 1;
			this.scaleX = "scaleX" in param ? param.scaleX : 1;
			this.scaleY = "scaleY" in param ? param.scaleY : 1;
			this.angle = param.angle || 0;
			this.compositeOperation = param.compositeOperation;
			this.anchorX = param.anchorX;
			this.anchorY = param.anchorY;
			this._matrix = undefined;
		}
	}

	/**
	 * オブジェクトを移動する。
	 * このメソッドは `x` と `y` を同時に設定するためのユーティリティメソッドである。
	 * `E` や `Camera2D` においてこのメソッドを呼び出した場合、 `modified()` を呼び出す必要がある。
	 * @param x X座標
	 * @param y Y座標
	 */
	moveTo(x: number, y: number): void;
	/**
	 * オブジェクトを移動する。
	 * このメソッドは `x` と `y` を同時に設定するためのユーティリティメソッドである。
	 * `E` や `Camera2D` においてこのメソッドを呼び出した場合、 `modified()` を呼び出す必要がある。
	 * @param obj X,Y座標
	 */
	moveTo(obj: CommonOffset): void;
	moveTo(posOrX: number|CommonOffset, y?: number): void {
		if (typeof posOrX === "number" && typeof y !== "number") {
			throw ExceptionFactory.createAssertionError("Object2D#moveTo: arguments must be CommonOffset or pair of x and y as a number.");
		}
		if (typeof posOrX === "number") {
			this.x = posOrX;
			this.y = y;
		} else {
			this.x = posOrX.x;
			this.y = posOrX.y;
		}
	}

	/**
	 * オブジェクトを相対的に移動する。
	 * このメソッドは `x` と `y` を同時に加算するためのユーティリティメソッドである。
	 * `E` や `Camera2D` においてこのメソッドを呼び出した場合、 `modified()` を呼び出す必要がある。
	 * @param x X座標に加算する値
	 * @param y Y座標に加算する値
	 */
	moveBy(x: number, y: number): void {
		this.x += x;
		this.y += y;
	}

	/**
	 * オブジェクトのサイズを設定する。
	 * このメソッドは `width` と `height` を同時に設定するためのユーティリティメソッドである。
	 * `E` や `Camera2D` においてこのメソッドを呼び出した場合、 `modified()` を呼び出す必要がある。
	 * @param width 幅
	 * @param height 高さ
	 */
	resizeTo(width: number, height: number): void;

	/**
	 * オブジェクトのサイズを設定する。
	 * このメソッドは `width` と `height` を同時に設定するためのユーティリティメソッドである。
	 * `E` や `Camera2D` においてこのメソッドを呼び出した場合、 `modified()` を呼び出す必要がある。
	 * @param size 幅と高さ
	 */
	resizeTo(size: CommonSize): void;
	resizeTo(sizeOrWidth: number|CommonSize, height?: number): void {
		if (typeof sizeOrWidth === "number" && typeof height !== "number") {
			throw ExceptionFactory.createAssertionError("Object2D#resizeTo: arguments must be CommonSize or pair of width and height as a number.");
		}
		if (typeof sizeOrWidth === "number") {
			this.width = sizeOrWidth;
			this.height = height;
		} else {
			this.width = sizeOrWidth.width;
			this.height = sizeOrWidth.height;
		}
	}

	/**
	 * オブジェクトのサイズを相対的に変更する。
	 * このメソッドは `width` と `height` を同時に加算するためのユーティリティメソッドである。
	 * `E` や `Camera2D` においてこのメソッドを呼び出した場合、 `modified()` を呼び出す必要がある。
	 * @param width 加算する幅
	 * @param height 加算する高さ
	 */
	resizeBy(width: number, height: number): void {
		this.width += width;
		this.height += height;
	}

	/**
	 * オブジェクトの拡大率を設定する。
	 * このメソッドは `scaleX` と `scaleY` に同じ値を同時に設定するためのユーティリティメソッドである。
	 * `E` や `Camera2D` においてこのメソッドを呼び出した場合、 `modified()` を呼び出す必要がある。
	 * @param scale 拡大率
	 */
	scale(scale: number): void {
		this.scaleX = scale;
		this.scaleY = scale;
	}

	/**
	 * オブジェクトのアンカーの位置を設定する。
	 * このメソッドは `anchorX` と `anchorY` を同時に設定するためのユーティリティメソッドである。
	 * `E` や `Camera2D` においてこのメソッドを呼び出した場合、 `modified()` を呼び出す必要がある。
	 */
	anchor(x: number, y: number): void {
		this.anchorX = x;
		this.anchorY = y;
	}

	/**
	 * このオブジェクトの変換行列を得る。
	 */
	getMatrix(): Matrix {
		if (! this._matrix) {
			this._matrix = new PlainMatrix();
		} else if (! this._matrix._modified) {
			return this._matrix;
		}
		this._updateMatrix();
		this._matrix._modified = false;
		return this._matrix;
	}

	/**
	 * 公開のプロパティから内部の変換行列キャッシュを更新する。
	 * @private
	 */
	_updateMatrix(): void {
		if (this.anchorX != null && this.anchorY != null) {
			this._matrix.updateWithAnchor(
				this.width,
				this.height,
				this.scaleX,
				this.scaleY,
				this.angle,
				this.x,
				this.y,
				this.anchorX,
				this.anchorY
			);
		} else if (this.angle || this.scaleX !== 1 || this.scaleY !== 1) {
			this._matrix.update(this.width, this.height, this.scaleX, this.scaleY, this.angle, this.x, this.y);
		} else {
			this._matrix.reset(this.x, this.y);
		}
	}
}
