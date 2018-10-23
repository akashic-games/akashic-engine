namespace g {
	/**
	 * SurfaceAtlasの空き領域管理クラス。
	 *
	 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
	 */
	export class SurfaceAtlasSlot {
		x: number;
		y: number;
		width: number;
		height: number;
		prev: SurfaceAtlasSlot;
		next: SurfaceAtlasSlot;

		constructor(x: number, y: number, width: number, height: number) {
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
			this.prev = null;
			this.next = null;
		}
	}

	function getSurfaceAtlasSlot(slot: SurfaceAtlasSlot, width: number, height: number): SurfaceAtlasSlot {
		while (slot) {
			if (slot.width >= width && slot.height >= height) {
				return slot;
			}
			slot = slot.next;
		}

		return null;
	}


	/**
	 * サーフェスアトラス。
	 *
	 * 与えられたサーフェスの指定された領域をコピーし一枚のサーフェスにまとめる。
	 *
	 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
	 */
	export class SurfaceAtlas implements Destroyable {
		/**
		 * @private
		 */
		_surface: Surface;

		/**
		 * @private
		 */
		_emptySurfaceAtlasSlotHead: SurfaceAtlasSlot;

		/**
		 * @private
		 */
		_accessScore: number;

		/**
		 * @private
		 */
		_usedRectangleAreaSize: CommonSize;

		constructor(surface: Surface) {
			this._surface = surface;
			this._emptySurfaceAtlasSlotHead = new SurfaceAtlasSlot(0, 0, this._surface.width, this._surface.height);
			this._accessScore = 0;
			this._usedRectangleAreaSize = { width: 0, height: 0 };
		}

		/**
		 * @private
		 */
		_acquireSurfaceAtlasSlot(width: number, height: number): SurfaceAtlasSlot {
			// Renderer#drawImage()でサーフェス上の一部を描画するとき、
			// 指定した部分に隣接する画素がにじみ出る現象が確認されている。
			// ここれではそれを避けるため1pixelの余白を与えている。
			width += 1;
			height += 1;

			var slot = getSurfaceAtlasSlot(this._emptySurfaceAtlasSlotHead, width, height);

			if (!slot) {
				return null;
			}

			var remainWidth = slot.width - width;
			var remainHeight = slot.height - height;
			var left: SurfaceAtlasSlot;
			var right: SurfaceAtlasSlot;
			if (remainWidth <= remainHeight) {
				left = new SurfaceAtlasSlot(slot.x + width, slot.y, remainWidth, height);
				right = new SurfaceAtlasSlot(slot.x, slot.y + height, slot.width, remainHeight);
			} else {
				left = new SurfaceAtlasSlot(slot.x, slot.y + height, width, remainHeight);
				right = new SurfaceAtlasSlot(slot.x + width, slot.y, remainWidth, slot.height);
			}

			left.prev = slot.prev;
			left.next = right;
			if (left.prev === null) { // left is head
				this._emptySurfaceAtlasSlotHead = left;
			} else {
				left.prev.next = left;
			}

			right.prev = left;
			right.next = slot.next;
			if (right.next) {
				right.next.prev = right;
			}

			const acquiredSlot = new SurfaceAtlasSlot(slot.x, slot.y, width, height);

			this._updateUsedRectangleAreaSize(acquiredSlot);

			return acquiredSlot;
		}

		/**
		 * @private
		 */
		_updateUsedRectangleAreaSize(slot: SurfaceAtlasSlot): void {
			const slotRight = slot.x + slot.width;
			const slotBottom = slot.y + slot.height;
			if (slotRight > this._usedRectangleAreaSize.width) {
				this._usedRectangleAreaSize.width = slotRight;
			}
			if (slotBottom > this._usedRectangleAreaSize.height) {
				this._usedRectangleAreaSize.height = slotBottom;
			}
		}

		/**
		 * サーフェスの追加。
		 *
		 * @param surface サーフェスアトラス上に配置される画像のサーフェス。
		 * @param rect サーフェス上の領域を表す矩形。この領域内の画像がサーフェスアトラス上に複製・配置される。
		 */
		addSurface(surface: Surface, rect: CommonArea): SurfaceAtlasSlot {
			var slot = this._acquireSurfaceAtlasSlot(rect.width, rect.height);
			if (!slot) {
				return null;
			}

			var renderer = this._surface.renderer();
			renderer.begin();
			renderer.drawImage(surface, rect.x, rect.y, rect.width, rect.height, slot.x, slot.y);
			renderer.end();

			return slot;
		}

		/**
			* このSurfaceAtlasの破棄を行う。
			* 以後、このSurfaceを利用することは出来なくなる。
			*/
		destroy(): void {
			this._surface.destroy();
		}

		/**
		 * このSurfaceAtlasが破棄済であるかどうかを判定する。
		 */
		destroyed(): boolean {
			return this._surface.destroyed();
		}

		/**
		 * _surfaceを複製する。
		 *
		 * 複製されたSurfaceは文字を格納するのに必要な最低限のサイズになる。
		 */
		duplicateSurface(resourceFactory: ResourceFactory): Surface {
			const src = this._surface;
			const dst = resourceFactory.createSurface(this._usedRectangleAreaSize.width, this._usedRectangleAreaSize.height);

			const renderer = dst.renderer();
			renderer.begin();
			renderer.drawImage(src, 0, 0, this._usedRectangleAreaSize.width, this._usedRectangleAreaSize.height, 0, 0);
			renderer.end();

			return dst;
		}
	}

	/**
	 * DynamicFontで使用される、SurfaceAtlasを管理する。
	 */
	export class SurfaceAtlasSet {
		/**
		 * SurfaceAtlas最大保持数初期値
		 */
		static INITIAL_SURFACEATLAS_MAX_SIZE: number = 10;

		/**
		 * @private
		 */
		_surfaceAtlases: SurfaceAtlas[];

		/**
		 * @private
		 */
		_maxAtlasNum: number;

		/**
		 * @private
		 */
		_resourceFactory: ResourceFactory;

		constructor(game: Game) {
			this._surfaceAtlases = [];
			this.maxAtlasNum = SurfaceAtlasSet.INITIAL_SURFACEATLAS_MAX_SIZE;
			this._resourceFactory = game.resourceFactory;
		}

		/**
		 * サーフェスアトラスを追加する。
		 * @param surfaceAtlas SurfaceAtlas
		 */
		addAtlas(surfaceAtlas: SurfaceAtlas): void {
			this._surfaceAtlases.push(surfaceAtlas);
		}
		/**
		 * 引数で指定されたindexのサーフェスアトラスを取得する。
		 * @param index 取得対象のインデックス
		 */
		getAtlasByIndex(index: number): SurfaceAtlas {
			return this._surfaceAtlases[index];
		}
		/**
		 * サーフェスアトラスの保持数を取得する。
		 */
		get atlasNum(): number {
			return this._surfaceAtlases.length;
		}
		/**
		 * 最大サーフェスアトラス保持数取得する。
		 */
		get maxAtlasNum(): number {
			return this._maxAtlasNum;
		}
		/**
		 * 最大アトラス保持数設定する。
		 */
		set maxAtlasNum(value: number) {
			this._maxAtlasNum = value;
		}

		/**
		 * 使用度の低いサーフェスアトラスを配列から削除する。
		 */
		removeLeastFrequentlyUsedAtlas(): SurfaceAtlas {
			var minScore = Number.MAX_VALUE;
			var lowScoreAtlasIndex = -1;
			for (var i = 0; i < this._surfaceAtlases.length; i++) {
				if (this._surfaceAtlases[i]._accessScore <= minScore) {
					minScore = this._surfaceAtlases[i]._accessScore;
					lowScoreAtlasIndex = i;
				}
			}
			let removedAtlas = this._surfaceAtlases.splice(lowScoreAtlasIndex, 1)[0];

			return removedAtlas;
		}

		/**
		 * 最新のサーフェスアトラスにグリフを追加する。
		 * @param glyph グリフ
		 */
		addToAtlas(glyph: Glyph): SurfaceAtlas {
			let atlas: SurfaceAtlas = null;
			let slot: SurfaceAtlasSlot = null;
			let area = {
				x: glyph.x,
				y: glyph.y,
				width: glyph.width,
				height: glyph.height
			};

			if (this._surfaceAtlases.length > 0) {
				atlas = this._surfaceAtlases[this._surfaceAtlases.length - 1];
				slot = atlas.addSurface(glyph.surface, area);
			}

			if (!slot) {
				return null;
			}

			glyph.surface.destroy();
			glyph.surface = atlas._surface;
			glyph.x = slot.x;
			glyph.y = slot.y;

			return atlas;
		}

		/**
		 * サーフェスアトラスの再割り当てを行う。
		 * @param _glyphs グリフ配列
		 * @param atlasSize サーフェスアトラスが保持していSurfaceのサイズ
		 */
		reallocateAtlas(_glyphs: { [key: number]: Glyph }, atlasSize: CommonSize): void {
			if (this._surfaceAtlases.length >= this.maxAtlasNum) {
				let atlas = this.removeLeastFrequentlyUsedAtlas();
				let glyphs = _glyphs;

				for (let key in glyphs) {
					if (glyphs.hasOwnProperty(key)) {
						var glyph = glyphs[key];
						if (glyph.surface === atlas._surface) {
							glyph.surface = null;
							glyph.isSurfaceValid = false;
							glyph._atlas = null;
						}
					}
				}
				atlas.destroy();
			}

			this._surfaceAtlases.push(this._resourceFactory.createSurfaceAtlas(atlasSize.width, atlasSize.height));
		}
	}
}
