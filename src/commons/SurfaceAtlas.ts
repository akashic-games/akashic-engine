import { GlyphLike } from "../interfaces/GlyphLike";
import { ResourceFactoryLike } from "../interfaces/ResourceFactoryLike";
import { SurfaceAtlasLike } from "../interfaces/SurfaceAtlasLike";
import { SurfaceAtlasSlotLike } from "../interfaces/SurfaceAtlasSlotLike";
import { SurfaceLike } from "../interfaces/SurfaceLike";
import { CommonSize } from "../types/commons";
import { SurfaceAtlasSlot } from "./SurfaceAtrasSlot";

function getSurfaceAtlasSlot(slot: SurfaceAtlasSlotLike, width: number, height: number): SurfaceAtlasSlotLike {
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
export class SurfaceAtlas implements SurfaceAtlasLike {
	/**
	 * @private
	 */
	_surface: SurfaceLike;

	/**
	 * @private
	 */
	_emptySurfaceAtlasSlotHead: SurfaceAtlasSlotLike;

	/**
	 * @private
	 */
	_accessScore: number;

	/**
	 * @private
	 */
	_usedRectangleAreaSize: CommonSize;

	constructor(surface: SurfaceLike) {
		this._surface = surface;
		this._emptySurfaceAtlasSlotHead = new SurfaceAtlasSlot(0, 0, this._surface.width, this._surface.height);
		this._accessScore = 0;
		this._usedRectangleAreaSize = { width: 0, height: 0 };
	}

	/**
	 * @private
	 */
	_acquireSurfaceAtlasSlot(width: number, height: number): SurfaceAtlasSlotLike {
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
		var left: SurfaceAtlasSlotLike;
		var right: SurfaceAtlasSlotLike;
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
	_updateUsedRectangleAreaSize(slot: SurfaceAtlasSlotLike): void {
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
	 * @param glyph グリフのサーフェスが持つ情報をSurfaceAtlasへ配置
	 */
	addSurface(glyph: GlyphLike): SurfaceAtlasSlotLike {
		var slot = this._acquireSurfaceAtlasSlot(glyph.width, glyph.height);
		if (!slot) {
			return null;
		}

		var renderer = this._surface.renderer();
		renderer.begin();
		renderer.drawImage(glyph.surface, glyph.x, glyph.y, glyph.width, glyph.height, slot.x, slot.y);
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
	duplicateSurface(resourceFactory: ResourceFactoryLike): SurfaceLike {
		const src = this._surface;
		const dst = resourceFactory.createSurface(this._usedRectangleAreaSize.width, this._usedRectangleAreaSize.height);

		const renderer = dst.renderer();
		renderer.begin();
		renderer.drawImage(src, 0, 0, this._usedRectangleAreaSize.width, this._usedRectangleAreaSize.height, 0, 0);
		renderer.end();

		return dst;
	}

	getAccessScore(): number {
		return this._accessScore;
	}
}
