namespace g {
	/**
	 * ゲームの描画を行うクラス。
	 *
	 * 描画は各エンティティによって行われる。通常、ゲーム開発者が本クラスを利用する必要はない。
	 */
	export abstract class Renderer {
		draw(game: Game, camera?: Camera): void {
			var scene = game.scene();
			if (!scene) return;

			this.begin();
			this.clear();
			if (camera) {
				this.save();
				camera._applyTransformToRenderer(this);
			}

			var children = scene.children;
			for (var i = 0; i < children.length; ++i)
				children[i].render(this, camera);

			if (camera) {
				this.restore();
			}

			this.end();
		}

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
		abstract drawImage(surface: Surface, offsetX: number, offsetY: number, width: number, height: number,
		                   destOffsetX: number, destOffsetY: number): void;

		abstract drawSprites(
		    surface: g.Surface,
		    offsetX: number[], offsetY: number[],
		    width: number[], height: number[],
		    canvasOffsetX: number[], canvasOffsetY: number[],
		    count: number): void;

		/**
		 * 指定されたSystemLabelの描画を行う。
		 *
		 * @param text 描画するText内容
		 * @param x 描画元のX座標。0以上の数値でなければならない
		 * @param y 描画元のY座標。0以上の数値でなければならない
		 * @param maxWidth 描画する矩形の幅。0より大きい数値でなければならない
		 * @param fontSize 描画する矩形の高さ。0より大きい数値でなければならない
		 * @param textAlign 描画するテキストのアラインメント
		 * @param textBaseline 描画するテキストのベースライン
		 * @param textColor 描画する文字色。CSS Colorでなければならない
		 * @param fontFamily 描画するフォントファミリ
		 * @param strokeWidth 描画する輪郭幅。0以上の数値でなければならない
		 * @param strokeColor 描画する輪郭色。CSS Colorでなければならない
		 * @param strokeOnly 文字色の描画フラグ
		 */
		abstract drawSystemText(text: string, x: number, y: number, maxWidth: number, fontSize: number,
		                        textAlign: TextAlign, textBaseline: TextBaseline, textColor: string, fontFamily: FontFamily,
		                        strokeWidth: number, strokeColor: string, strokeOnly: boolean): void;

		abstract translate(x: number, y: number): void;

		// TODO: (GAMEDEV-844) tupleに変更
		// transform(matrix: [number, number, number, number, number, number]): void {
		abstract transform(matrix: number[]): void;

		abstract opacity(opacity: number): void;

		abstract save(): void;

		abstract restore(): void;

		abstract fillRect(x: number, y: number, width: number, height: number, cssColor: string): void;

		abstract setCompositeOperation(operation: CompositeOperation): void;

		abstract setTransform(matrix: number[]): void;

		abstract setOpacity(opacity: number): void;

		abstract setShader(shader: Shader): void;

		abstract unsetShader(): void;

		/**
		 * 本Rendererの描画内容を表すImageDataを取得する。
		 * 引数は CanvasRenderingContext2D#getImageData() と同様である。
		 * 本メソッドの呼び出しは `Renderer#end()` から `Renderer#begin()` の間でなければならない。
		 * NOTE: 実行環境によっては戻り値が `null` または `undefined` となりえることに注意。
		 */
		abstract _getImageData(sx: number, sy: number, sw: number, sh: number): ImageData;

		/**
		 * 本Rendererの描画内容を上書きする。
		 * 引数は CanvasRenderingContext2D#putImageData() と同様である。
		 * 本メソッドの呼び出しは `Renderer#end()` から `Renderer#begin()` の間でなければならない。
		 */
		abstract _putImageData(imageData: ImageData, dx: number, dy: number, dirtyX?: number, dirtyY?: number,
		                       dirtyWidth?: number, dirtyHeight?: number): void;

		end(): void {
			// nothing to do
		}
	}
}
