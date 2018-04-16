namespace g {
	export enum MeshDrawMode {
		/**
		 * gl.TRIANGLES に対応
		 */
		Triangles,
		/**
		 * gl.TRIANGLE_STRIP に対応
		 */
		TriangleStrip,
		/**
		 * gl.TRIANGLES_FAN に対応
		 */
		TriangleFan
	}

	export interface MeshParameterObject extends PaneParameterObject {
	/**
	 * Mesh の頂点座標の配列。
	 * `this.textureVertices.length`, `this.indices` と同値でなければならない。
	 */
	vertices: CommonOffset[];
	/**
	 * Mesh の描画元 surface の座標の配列。
	 * `this.vertices.length`, `this.indices` と同値でなければならない。
	 */
	surfaceVertices: CommonOffset[];
	/**
	 * 頂点座標の配列の順序。
	 */
	indices: number[];
	/**
	 * Mesh の描画モード。
	 */
	drawMode: MeshDrawMode;
	}

	// NOTE: 便宜上 Pane の派生クラスとして定義
	export class Mesh extends Pane {
		vertices: g.CommonOffset[];
		surfaceVertices: g.CommonOffset[];
		indices: number[];
		drawMode: MeshDrawMode;

		constructor(params: MeshParameterObject) {
			super(params);
			this.vertices = params.vertices;
			this.surfaceVertices = params.surfaceVertices;
			this.indices = params.indices;
			this.drawMode = params.drawMode;
		}

		renderCache(renderer: g.Renderer, camera: g.Camera): void {
			if (this.width <= 0 || this.height <= 0) {
				return;
			}
			this._renderBackground();
			this._renderChildren(camera);

			if (this._childrenArea.width <= 0 || this._childrenArea.height <= 0) {
				return;
			}
			renderer.save();
			if (this._childrenArea.x !== 0 || this._childrenArea.y !== 0) {
				renderer.translate(this._childrenArea.x, this._childrenArea.y);
			}
			// NOTE: ここだけ修正
			// renderer.drawImage(this._childrenSurface, 0, 0, this._childrenArea.width, this._childrenArea.height, 0, 0);
			renderer.drawMesh(this._childrenSurface, this.drawMode, this.vertices, this.surfaceVertices, this.indices);
			renderer.restore();
		}
	}
}
