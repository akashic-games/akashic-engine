import * as pdi from "@akashic/pdi-types";

/**
 * SurfaceAtlasの空き領域管理クラス。
 *
 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
 */
export class SurfaceAtlasSlot implements pdi.SurfaceAtlasSlot {
	x: number;
	y: number;
	width: number;
	height: number;
	prev: pdi.SurfaceAtlasSlot | null;
	next: pdi.SurfaceAtlasSlot | null;

	constructor(x: number, y: number, width: number, height: number) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.prev = null;
		this.next = null;
	}
}
