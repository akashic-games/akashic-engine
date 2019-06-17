import { CommonOffset } from "./commons";

/**
 * 変換行列を表すインターフェース。
 * 通常ゲーム開発者が本インターフェースを直接利用する事はない。
 */
export interface Matrix {
	/**
	 * 変更フラグ。
	 * 本フラグが立っていても特に何も処理はされない。
	 * 本フラグの操作、本フラグを参照して値を再計算することは、いずれも利用する側で適切に処理をする必要がある。
	 * @private
	 */
	_modified: boolean;

	/**
	 * 変換本体。
	 * CanvasRenderingContext2D#transformの値と等しい。
	 * ```
	 *   a c e
	 * [ b d f ]
	 *   0 0 1
	 * ```
	 * 配列の添え字では、 a(m11): 0, b(m12): 1, c(m21): 2, d(m22): 3, e(dx): 4, f(dy): 5 となる。
	 * 参考: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/transform
	 * @private
	 */
	// TODO: (GAMEDEV-844) Matrix#_matrix と二重名称になっているのでRendererと合わせて再検討
	_matrix: [number, number, number, number, number, number];

	/**
	 * この変換行列に別の変換行列を掛け合わせる。
	 * @param matrix 掛け合わせる変換行列
	 */
	multiply(matrix: Matrix): void;

	/**
	 * この変換行列に別の変換行列を掛け合わせた新しい変換行列を返す。
	 * @param matrix 掛け合わせる変換行列
	 */
	multiplyNew(matrix: Matrix): Matrix;

	/**
	 * 2D object利用の一般的な値を基に変換行列の値を再計算する。
	 * @param width 対象の横幅
	 * @param heigth 対象の縦幅
	 * @param scaleX 対象の横方向への拡大率
	 * @param scaleY 対象の縦方向への拡大率
	 * @param angle 角度。単位は `degree` であり `radian` ではない
	 * @param x x座標
	 * @param y y座標
	 */
	update(width: number, height: number, scaleX: number, scaleY: number, angle: number, x: number, y: number): void;

	/**
	 * `update()` によって得られる行列の逆変換になるよう変換行列の値を再計算する。
	 * @param width 対象の横幅
	 * @param heigth 対象の縦幅
	 * @param scaleX 対象の横方向への拡大率
	 * @param scaleY 対象の縦方向への拡大率
	 * @param angle 角度。単位は `degree` であり `radian` ではない
	 * @param x x座標
	 * @param y y座標
	 */
	updateByInverse(width: number, height: number, scaleX: number, scaleY: number, angle: number, x: number, y: number): void;

	/**
	 * 値を単位行列にリセットする。x/yの座標情報を初期値に反映させることも出来る。
	 * @param x x座標。省略時は0として処理される
	 * @param y y座標。省略時は0として処理される
	 */
	reset(x?: number, y?: number): void;

	/**
	 * この変換行列と同じ値を持つ変換行列を新しく作って返す。
	 */
	clone(): Matrix;

	/**
	 * 拡縮を変換行列に反映させる。
	 * @param x X方向の拡縮律
	 * @param y y方向の拡縮律
	 */
	scale(x: number, y: number): void;

	/**
	 * この変換行列を逆行列に変換した結果を引数の座標系に適用した座標値を返す。
	 * この変換行列の値自体や、引数の値は変更されない。
	 * @param point 逆行列を適用する座標
	 */
	multiplyInverseForPoint(point: CommonOffset): CommonOffset;

	/**
	 * この変換行列と引数の座標系が表す行列の積を返す。
	 * @param point この変換行列との積を求める座標
	 */
	multiplyPoint(point: CommonOffset): CommonOffset;

}

/**
 * 変換行列を一般的なJavaScriptのみで表したクラス。
 * 通常ゲーム開発者が本クラスを直接利用する事はない。
 * 各フィールド、メソッドの詳細は `Matrix` インターフェースの説明を参照。
 */
export class PlainMatrix {
	/**
	 * @private
	 */
	_modified: boolean;

	/**
	 * @private
	 */
	_matrix: [number, number, number, number, number, number];

	/**
	 * 無変換の変換行列を表す `PlainMatrix` のインスタンスを作成する。
	 */
	constructor();

	/**
	 * 2Dオブジェクト利用の一般的な値を元に変換行列を表す `PlainMatrix` のインスタンスを生成する。
	 * @param width 対象の横幅
	 * @param height 対象の縦幅
	 * @param scaleX 対象の横方向への拡大率
	 * @param scaleY 対象の縦方向への拡大率
	 * @param angle 角度。単位は `degree` であり `radian` ではない
	 */
	constructor(width: number, height: number, scaleX: number, scaleY: number, angle: number);
	/**
	 * 指定の `Matrix` と同じ変換行列を表す `PlainMatrix` のインスタンスを生成する。
	 */
	constructor(src: Matrix);

	constructor(widthOrSrc?: number|Matrix, height?: number, scaleX?: number, scaleY?: number, angle?: number) {
		// TODO: (GAMEDEV-845) Float32Arrayの方が速いらしいので、polyfillして使うかどうか検討
		if (widthOrSrc === undefined) {
			this._modified = false;
			this._matrix = [1, 0, 0, 1, 0, 0];
		} else if (typeof widthOrSrc === "number") {
			this._modified = false;
			this._matrix = <[number, number, number, number, number, number]>new Array<number>(6);
			this.update(widthOrSrc, height, scaleX, scaleY, angle, 0, 0);
		} else {
			this._modified = widthOrSrc._modified;
			this._matrix = [
				widthOrSrc._matrix[0],
				widthOrSrc._matrix[1],
				widthOrSrc._matrix[2],
				widthOrSrc._matrix[3],
				widthOrSrc._matrix[4],
				widthOrSrc._matrix[5]
			];
		}
	}

	update(width: number, height: number, scaleX: number, scaleY: number, angle: number, x: number, y: number): void {
		// ここで求める変換行列Mは、引数で指定された変形を、拡大・回転・平行移動の順に適用するものである。
		// 変形の原点は引数で指定された矩形の中心、すなわち (width/2, height/2) の位置である。従って
		//    M = A^-1 T R S A
		// である。ただしここでA, S, R, Tは、それぞれ以下を表す変換行列である:
		//    A: 矩形の中心を原点に移す(平行移動する)変換
		//    S: X軸方向にscaleX倍、Y軸方向にscaleY倍する変換
		//    R: angle度だけ回転する変換
		//    T: x, yの値だけ平行移動する変換
		// それらは次のように表せる:
		//           1    0   -w           sx    0    0            c   -s    0            1    0    x
		//    A = [  0    1   -h]    S = [  0   sy    0]    R = [  s    c    0]    T = [  0    1    y]
		//           0    0    1            0    0    1            0    0    1            0    0    1
		// ここで sx, sy は scaleX, scaleY であり、c, s は cos(theta), sin(theta)
		// (ただし theta = angle * PI / 180)、w = (width / 2), h = (height / 2) である。
		// 以下の実装は、M の各要素をそれぞれ計算して直接求めている。
		var r = angle * Math.PI / 180;
		var _cos = Math.cos(r);
		var _sin = Math.sin(r);
		var a = _cos * scaleX;
		var b = _sin * scaleX;
		var c = _sin * scaleY;
		var d = _cos * scaleY;
		var w = width / 2;
		var h = height / 2;
		this._matrix[0] = a;
		this._matrix[1] = b;
		this._matrix[2] = -c;
		this._matrix[3] = d;
		this._matrix[4] = -a * w + c * h + w + x;
		this._matrix[5] = -b * w - d * h + h + y;
	}

	updateByInverse(width: number, height: number, scaleX: number, scaleY: number, angle: number, x: number, y: number): void {
		// ここで求める変換行列は、update() の求める行列Mの逆行列、M^-1である。update() のコメントに記述のとおり、
		//    M = A^-1 T R S A
		// であるから、
		//    M^-1 = A^-1 S^-1 R^-1 T^-1 A
		// それぞれは次のように表せる:
		//              1    0    w             1/sx     0    0               c    s    0               1    0   -x
		//    A^-1 = [  0    1    h]    S^-1 = [   0  1/sy    0]    R^-1 = [ -s    c    0]    T^-1 = [  0    1   -y]
		//              0    0    1                0     0    1               0    0    1               0    0    1
		// ここで各変数は update() のコメントのものと同様である。
		// 以下の実装は、M^-1 の各要素をそれぞれ計算して直接求めている。
		var r = angle * Math.PI / 180;
		var _cos = Math.cos(r);
		var _sin = Math.sin(r);
		var a = _cos / scaleX;
		var b = _sin / scaleY;
		var c = _sin / scaleX;
		var d = _cos / scaleY;
		var w = width / 2;
		var h = height / 2;
		this._matrix[0] = a;
		this._matrix[1] = -b;
		this._matrix[2] = c;
		this._matrix[3] = d;
		this._matrix[4] = -a * (w + x) - c * (h + y) + w;
		this._matrix[5] =  b * (w + x) - d * (h + y) + h;
	}

	multiply(matrix: Matrix): void {
		var m1 = this._matrix;
		var m2 = matrix._matrix;

		var m10 = m1[0];
		var m11 = m1[1];
		var m12 = m1[2];
		var m13 = m1[3];
		m1[0] = m10 * m2[0] + m12 * m2[1];
		m1[1] = m11 * m2[0] + m13 * m2[1];
		m1[2] = m10 * m2[2] + m12 * m2[3];
		m1[3] = m11 * m2[2] + m13 * m2[3];
		m1[4] = m10 * m2[4] + m12 * m2[5] + m1[4];
		m1[5] = m11 * m2[4] + m13 * m2[5] + m1[5];
	}

	multiplyNew(matrix: Matrix): Matrix {
		var ret = this.clone();
		ret.multiply(matrix);
		return ret;
	}

	reset(x?: number, y?: number): void {
		this._matrix[0] = 1;
		this._matrix[1] = 0;
		this._matrix[2] = 0;
		this._matrix[3] = 1;
		this._matrix[4] = x || 0;
		this._matrix[5] = y || 0;
	}

	clone(): Matrix {
		return new PlainMatrix(this);
	}

	multiplyInverseForPoint(point: CommonOffset): CommonOffset {
		var m = this._matrix;
		// id = inverse of the determinant
		var _id = 1 / (m[0] * m[3] + m[2] * -m[1]);
		return {
			x: m[3] * _id * point.x + -m[2] * _id * point.y + (m[5] * m[2] - m[4] * m[3]) * _id,
			y: m[0] * _id * point.y + -m[1] * _id * point.x + (-m[5] * m[0] + m[4] * m[1]) * _id
		};
	}

	scale(x: number, y: number): void {
		var m = this._matrix;
		m[0] *= x;
		m[1] *= y;
		m[2] *= x;
		m[3] *= y;
		m[4] *= x;
		m[5] *= y;
	}

	multiplyPoint(point: CommonOffset): CommonOffset {
		var m = this._matrix;
		var x = m[0] * point.x + m[2] * point.y + m[4];
		var y = m[1] * point.x + m[3] * point.y + m[5];
		return {x: x, y: y};
	}

}

