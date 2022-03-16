import type * as pdi from "@akashic/pdi-types";
import { SurfaceAtlasSlot } from "./SurfaceAtlasSlot";

function getSurfaceAtlasSlot(slot: SurfaceAtlasSlot, width: number, height: number): SurfaceAtlasSlot | null {
	while (slot) {
		if (slot.width >= width && slot.height >= height) {
			return slot;
		}
		// @ts-ignore
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
export class SurfaceAtlas {
	/**
	 * @private
	 */
	_surface: pdi.Surface;

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
	_usedRectangleAreaSize: pdi.CommonSize;

	constructor(surface: pdi.Surface) {
		this._surface = surface;
		this._emptySurfaceAtlasSlotHead = new SurfaceAtlasSlot(0, 0, this._surface.width, this._surface.height);
		this._accessScore = 0;
		this._usedRectangleAreaSize = { width: 0, height: 0 };
	}

	reset(): void {
		const renderer = this._surface.renderer();
		renderer.begin();
		renderer.clear();
		renderer.end();
		this._emptySurfaceAtlasSlotHead = new SurfaceAtlasSlot(0, 0, this._surface.width, this._surface.height);
		this._accessScore = 0;
		this._usedRectangleAreaSize.width = 0;
		this._usedRectangleAreaSize.height = 0;
	}

	/**
	 * @private
	 */
	_acquireSurfaceAtlasSlot(width: number, height: number): SurfaceAtlasSlot | null {
		// Renderer#drawImage()でサーフェス上の一部を描画するとき、
		// 指定した部分に隣接する画素がにじみ出る現象が確認されている。
		// ここれではそれを避けるため1pixelの余白を与えている。
		width += 1;
		height += 1;

		const slot = getSurfaceAtlasSlot(this._emptySurfaceAtlasSlotHead, width, height);

		if (!slot) {
			return null;
		}

		const remainWidth = slot.width - width;
		const remainHeight = slot.height - height;
		let left: SurfaceAtlasSlot;
		let right: SurfaceAtlasSlot;
		if (remainWidth <= remainHeight) {
			left = new SurfaceAtlasSlot(slot.x + width, slot.y, remainWidth, height);
			right = new SurfaceAtlasSlot(slot.x, slot.y + height, slot.width, remainHeight);
		} else {
			left = new SurfaceAtlasSlot(slot.x, slot.y + height, width, remainHeight);
			right = new SurfaceAtlasSlot(slot.x + width, slot.y, remainWidth, slot.height);
		}

		left.prev = slot.prev;
		left.next = right;
		if (left.prev === null) {
			// left is head
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
	 * サーフェスを追加する。
	 *
	 * @param surface 追加するサーフェス
	 * @param offsetX サーフェス内におけるX方向のオフセット位置。0以上の数値でなければならない
	 * @param offsetY サーフェス内におけるY方向のオフセット位置。0以上の数値でなければならない
	 * @param width サーフェス内における矩形の幅。0より大きい数値でなければならない
	 * @param height サーフェス内における矩形の高さ。0より大きい数値でなければならない
	 */
	addSurface(surface: pdi.Surface, offsetX: number, offsetY: number, width: number, height: number): SurfaceAtlasSlot | null {
		const slot = this._acquireSurfaceAtlasSlot(width, height);
		if (!slot) {
			return null;
		}

		const renderer = this._surface.renderer();
		renderer.begin();
		renderer.drawImage(surface, offsetX, offsetY, width, height, slot.x, slot.y);
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
	 * このSurfaceAtlasの大きさを取得する。
	 */
	getAtlasUsedSize(): pdi.CommonSize {
		return this._usedRectangleAreaSize;
	}

	getAccessScore(): number {
		return this._accessScore;
	}
}
