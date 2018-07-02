namespace g {
	/**
	 * ゲームの描画を行うクラス。
	 *
	 * 描画は各エンティティによって行われる。通常、ゲーム開発者が本クラスを利用する必要はない。
	 */
	export class Renderer {
		draw(game: Game, camera?: Camera): void {
			var scene = game.scene();
			if (!scene) return;

			this.begin();
			this.save();
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

			this.restore();
			this.end();
		}

		begin(): void {
			// nothing to do
		}

		clear(): void {
			throw ExceptionFactory.createPureVirtualError("Renderer#clear");
		}

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
		drawImage(surface: Surface, offsetX: number, offsetY: number, width: number, height: number,
		          destOffsetX: number, destOffsetY: number): void {
			throw ExceptionFactory.createPureVirtualError("Renderer#drawImage");
		}

		drawSprites(
		    surface: g.Surface,
		    offsetX: number[], offsetY: number[],
		    width: number[], height: number[],
		    canvasOffsetX: number[], canvasOffsetY: number[],
		    count: number): void {

			throw ExceptionFactory.createPureVirtualError("Renderer#drawSprites");
		}

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
		drawSystemText(text: string, x: number, y: number, maxWidth: number, fontSize: number,
		               textAlign: TextAlign, textBaseline: TextBaseline, textColor: string, fontFamily: FontFamily,
		               strokeWidth: number, strokeColor: string, strokeOnly: boolean): void {
			throw ExceptionFactory.createPureVirtualError("Renderer#drawSystemText");
		}

		translate(x: number, y: number): void {
			throw ExceptionFactory.createPureVirtualError("Renderer#translate");
		}

		// TODO: (GAMEDEV-844) tupleに変更
		// transform(matrix: [number, number, number, number, number, number]): void {
		transform(matrix: number[]): void {
			throw ExceptionFactory.createPureVirtualError("Renderer#transform");
		}

		opacity(opacity: number): void {
			throw ExceptionFactory.createPureVirtualError("Renderer#opacity");
		}

		save(): void {
			throw ExceptionFactory.createPureVirtualError("Renderer#save");
		}

		restore(): void {
			throw ExceptionFactory.createPureVirtualError("Renderer#restore");
		}

		fillRect(x: number, y: number, width: number, height: number, cssColor: string): void {
			throw ExceptionFactory.createPureVirtualError("Renderer#fillRect");
		}

		setCompositeOperation(operation: CompositeOperation): void {
			throw ExceptionFactory.createPureVirtualError("Renderer#setCompositeOperation");
		}

		setTransform(matrix: number[]): void {
			throw ExceptionFactory.createPureVirtualError("Renderer#setTransform");
		}

		setOpacity(opacity: number): void {
			throw ExceptionFactory.createPureVirtualError("Renderer#setOpacity");
		}

		end(): void {
			// nothing to do
		}
	}
}
