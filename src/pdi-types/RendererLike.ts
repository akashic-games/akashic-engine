import { CompositeOperationString } from "./CompositeOperationString";
import { ImageData } from "./ImageData";
import { ShaderProgramLike } from "./ShaderProgramLike";
import { SurfaceLike } from "./SurfaceLike";

/**
 * ゲームの描画を行うクラス。
 *
 * 描画は各エンティティによって行われる。通常、ゲーム開発者が本クラスを利用する必要はない。
 */
export interface RendererLike {
	begin(): void;

	clear(): void;

	/**
	 * 指定されたSurfaceの描画を行う。
	 *
	 * @param surface 描画するSurface
	 * @param offsetX 描画元のX座標。0以上の数値でなければならない
	 * @param offsetY 描画元のY座標。0以上の数値でなければならない
	 * @param width 描画する矩形の幅。0より大きい数値でなければならない
	 * @param height 描画する矩形の高さ。0より大きい数値でなければならない
	 * @param destOffsetX 描画先のX座標。0以上の数値でなければならない
	 * @param destOffsetY 描画先のY座標。0以上の数値でなければならない
	 */
	drawImage(
		surface: SurfaceLike,
		offsetX: number,
		offsetY: number,
		width: number,
		height: number,
		destOffsetX: number,
		destOffsetY: number
	): void;

	drawSprites(
		surface: SurfaceLike,
		offsetX: number[],
		offsetY: number[],
		width: number[],
		height: number[],
		canvasOffsetX: number[],
		canvasOffsetY: number[],
		count: number
	): void;

	translate(x: number, y: number): void;

	// TODO: (GAMEDEV-844) tupleに変更
	// transform(matrix: [number, number, number, number, number, number]): void {
	transform(matrix: number[]): void;

	opacity(opacity: number): void;

	save(): void;

	restore(): void;

	fillRect(x: number, y: number, width: number, height: number, cssColor: string): void;

	setCompositeOperation(operation: CompositeOperationString): void;

	setTransform(matrix: number[]): void;

	setOpacity(opacity: number): void;

	/**
	 * 本Rendererがシェーダ機能をサポートしているかを返す。
	 */
	isSupportedShaderProgram(): boolean;

	/**
	 * 本Rendererにシェーダを設定する。
	 * 引数に `null` が指定された場合、本Rendererに設定されているシェーダの設定を解除する。
	 */
	setShaderProgram(shaderProgram: ShaderProgramLike | null): void;

	/**
	 * 本Rendererの描画内容を表すImageDataを取得する。
	 * 引数は CanvasRenderingContext2D#getImageData() と同様である。
	 * 本メソッドの呼び出しは `Renderer#end()` から `Renderer#begin()` の間でなければならない。
	 * NOTE: 実行環境によっては戻り値が `null` または `undefined` となりえることに注意。
	 */
	_getImageData(sx: number, sy: number, sw: number, sh: number): ImageData;

	/**
	 * 本Rendererの描画内容を上書きする。
	 * 引数は CanvasRenderingContext2D#putImageData() と同様である。
	 * 本メソッドの呼び出しは `Renderer#end()` から `Renderer#begin()` の間でなければならない。
	 */
	_putImageData(
		imageData: ImageData,
		dx: number,
		dy: number,
		dirtyX?: number,
		dirtyY?: number,
		dirtyWidth?: number,
		dirtyHeight?: number
	): void;

	end(): void;
}
