import { CompositeOperationString } from "../pdi-types/CompositeOperationString";
import { ImageData } from "../pdi-types/ImageData";
import { RendererLike } from "../pdi-types/RendererLike";
import { ShaderProgramLike } from "../pdi-types/ShaderProgramLike";
import { SurfaceLike } from "../pdi-types/SurfaceLike";

/**
 * ゲームの描画を行うクラス。
 *
 * 描画は各エンティティによって行われる。通常、ゲーム開発者が本クラスを利用する必要はない。
 */
export abstract class Renderer implements RendererLike {
	begin(): void {
		// nothing to do
	}

	abstract clear(): void;

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
	abstract drawImage(
		surface: SurfaceLike,
		offsetX: number,
		offsetY: number,
		width: number,
		height: number,
		destOffsetX: number,
		destOffsetY: number
	): void;

	abstract drawSprites(
		surface: SurfaceLike,
		offsetX: number[],
		offsetY: number[],
		width: number[],
		height: number[],
		canvasOffsetX: number[],
		canvasOffsetY: number[],
		count: number
	): void;

	abstract translate(x: number, y: number): void;

	// TODO: (GAMEDEV-844) tupleに変更
	// transform(matrix: [number, number, number, number, number, number]): void {
	abstract transform(matrix: number[]): void;

	abstract opacity(opacity: number): void;

	abstract save(): void;

	abstract restore(): void;

	abstract fillRect(x: number, y: number, width: number, height: number, cssColor: string): void;

	abstract setCompositeOperation(operation: CompositeOperationString): void;

	abstract setTransform(matrix: number[]): void;

	abstract setOpacity(opacity: number): void;

	/**
	 * 本Rendererがシェーダ機能をサポートしているかを返す。
	 */
	abstract isSupportedShaderProgram(): boolean;

	/**
	 * 本Rendererにシェーダを設定する。
	 * 引数に `null` が指定された場合、本Rendererに設定されているシェーダの設定を解除する。
	 */
	abstract setShaderProgram(shaderProgram: ShaderProgramLike | null): void;

	/**
	 * 本Rendererの描画内容を表すImageDataを取得する。
	 * 引数は CanvasRenderingContext2D#getImageData() と同様である。
	 * 本メソッドの呼び出しは `Renderer#end()` から `Renderer#begin()` の間でなければならない。
	 * NOTE: 実行環境によっては戻り値が `null` または `undefined` となりえることに注意。
	 * @ignore
	 */
	abstract _getImageData(sx: number, sy: number, sw: number, sh: number): ImageData;

	/**
	 * 本Rendererの描画内容を上書きする。
	 * 引数は CanvasRenderingContext2D#putImageData() と同様である。
	 * 本メソッドの呼び出しは `Renderer#end()` から `Renderer#begin()` の間でなければならない。
	 * @ignore
	 */
	abstract _putImageData(
		imageData: ImageData,
		dx: number,
		dy: number,
		dirtyX?: number,
		dirtyY?: number,
		dirtyWidth?: number,
		dirtyHeight?: number
	): void;

	end(): void {
		// nothing to do
	}
}
