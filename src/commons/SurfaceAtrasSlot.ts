import { SurfaceAtlasSlotLike } from "../interfaces/SurfaceAtlasSlotLike";

/**
 * SurfaceAtlasの空き領域管理クラス。
 *
 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
 */
export class SurfaceAtlasSlot implements SurfaceAtlasSlotLike {
	x: number;
	y: number;
	width: number;
	height: number;
	prev: SurfaceAtlasSlotLike;
	next: SurfaceAtlasSlotLike;

	constructor(x: number, y: number, width: number, height: number) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.prev = null;
		this.next = null;
	}
}
