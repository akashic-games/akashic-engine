import { E, Collision } from "..";
import { skeletonRuntime } from "./helpers";

describe("Collision.intersectEntities()", () => {
	const runtime = skeletonRuntime();
	const scene = runtime.scene;

	it("disconnected", () => {
		const e1 = new E({ scene, parent: scene, x: 10, y: 10, width: 20, height: 30 });
		const e2 = new E({ scene, x: 28, y: 38, width: 20, height: 30 });
		expect(Collision.intersectEntities(e1, e2)).toBe(false);
	});

	it("children of the scene, no scale, no rotation", () => {
		const e1 = new E({ scene, parent: scene, x: 10, y: 10, width: 20, height: 30 });
		const e2 = new E({ scene, parent: scene, x: 28, y: 38, width: 20, height: 30 });
		expect(Collision.intersectEntities(e1, e2)).toBe(true);
		e2.x += 10;
		e2.modified();
		expect(Collision.intersectEntities(e1, e2)).toBe(false);
	});

	it("brothers, scaled, no rotation", () => {
		const parent = new E({ scene, parent: scene, x: 100, y: 100 });
		const e1 = new E({ scene, parent: parent, x: 10, y: 10, width: 20, height: 30, scaleX: 1.5, scaleY: 1.5 });
		const e2 = new E({ scene, parent: parent, x: 35, y: 45, width: 20, height: 30 });
		expect(Collision.intersectEntities(e1, e2)).toBe(true);
		e1.scaleX = e1.scaleY = 0.9;
		e1.modified();
		expect(Collision.intersectEntities(e1, e2)).toBe(false);
	});

	it("brothers, no scale, rotated", () => {
		const parent = new E({ scene, parent: scene, x: 100, y: 100 });
		const e1 = new E({ scene, parent: parent, x: 10, y: 10, width: 20, height: 30, angle: 3 });
		const e2 = new E({ scene, parent: parent, x: 28, y: 38, width: 20, height: 30 });
		expect(Collision.intersectEntities(e1, e2)).toBe(true);
		e1.angle = 180;
		e1.modified();
		expect(Collision.intersectEntities(e1, e2)).toBe(false);
	});

	it("brothers, scaled, rotated", () => {
		const parent = new E({ scene, parent: scene, x: 100, y: 100 });
		const e1 = new E({ scene, parent: parent, x: 10, y: 10, width: 20, height: 30, scaleX: 1.5, scaleY: 1.5, angle: 90 });
		const e2 = new E({ scene, parent: parent, x: 35, y: 45, width: 20, height: 30 });
		expect(Collision.intersectEntities(e1, e2)).toBe(false);
		e1.angle = 5;
		e1.modified();
		expect(Collision.intersectEntities(e1, e2)).toBe(true);
	});

	it("cousin, scaled, rotation", () => {
		const root = new E({ scene, parent: scene, x: 100, y: 100 });

		// 原点 (200, 100), 90 度回転
		const p1 = new E({ scene, parent: root, x: 100, y: 0, width: 10, height: 10, angle: 90 });
		// 原点 (100, 230), X 軸 2 倍拡大
		const p2 = new E({ scene, parent: root, x: 0, y: 130, width: 10, height: 10, scaleX: 2 });

		// 原点 (200, 200), 左上端 (50, 100), サイズ 50x50
		const e1 = new E({ scene, parent: p1, x: 100, y: 0, width: 50, height: 50 });
		// 原点＝左上端 (120, 230), サイズ 40x50
		const e2 = new E({ scene, parent: p2, x: 10, y: 0, width: 20, height: 50 });

		expect(Collision.intersectEntities(e1, e2)).toBe(true);

		p2.scaleX = 1;
		p2.modified();
		expect(Collision.intersectEntities(e1, e2)).toBe(false);

		p2.scaleX = 2;
		p2.modified();
		p1.angle = 45;
		p1.modified();
		expect(Collision.intersectEntities(e1, e2)).toBe(false);
	});

	it("cousin, scaled, rotation, with hit rects", () => {
		const root = new E({ scene, parent: scene, x: 100, y: 100 });

		// 原点 (200, 100), 90 度回転
		const p1 = new E({ scene, parent: root, x: 100, y: 0, width: 10, height: 10, angle: 90 });
		// 原点 (100, 230), X 軸 2 倍拡大
		const p2 = new E({ scene, parent: root, x: 0, y: 130, width: 10, height: 10, scaleX: 2 });

		// 原点 (200, 200), 左上端 (50, 100), サイズ 50x50
		const e1 = new E({ scene, parent: p1, x: 100, y: 0, width: 50, height: 50 });
		// 原点＝左上端 (120, 230), サイズ 40x50
		const e2 = new E({ scene, parent: p2, x: 10, y: 0, width: 20, height: 50 });

		const e2h = e2.height;
		expect(Collision.intersectEntities(e1, e2, null, { x: 0, y: e2h / 2, width: e2.width, height: e2h })).toBe(false);
		expect(Collision.intersectEntities(e1, e2, { x: 0, y: 0, width: e1.width / 2, height: e1.height } , null)).toBe(false);
	});
});

describe("Collision.intersect()", () => {
	it("Hit", () => {
		expect(Collision.intersect(0, 0, 100, 100, 100, 100, 1, 1)).toBe(true);
		expect(Collision.intersect(-100, -100, 100, 100, 0, 0, 1, 1)).toBe(true);
	});

	it("Miss", () => {
		expect(Collision.intersect(0, 0, 99, 100, 100, 100, 100, 100)).toBe(false);
		expect(Collision.intersect(0, 0, 100, 99, 100, 100, 100, 100)).toBe(false);
		expect(Collision.intersect(0, 0, -99, -100, -100, -100, -100, -100)).toBe(false);
		expect(Collision.intersect(0, 0, -100, -99, -100, -100, -100, -100)).toBe(false);
	});
});

describe("Collision.intersectAreas()", () => {
	const area1 = { x: 2, y: 2, width: 2, height: 2 };
	const area2 = { x: 3, y: 5, width: 2, height: 4 };
	const area3 = { x: 1, y: 0, width: 2, height: 4 };

	it("Hit", () => {
		expect(Collision.intersectAreas(area1, area3)).toBe(true);
	});

	it("Miss", () => {
		expect(Collision.intersectAreas(area1, area2)).toBe(false);
		expect(Collision.intersectAreas(area2, area3)).toBe(false);
	});
});

describe("Collision.within()", () => {
	it("Hit", () => {
		expect(Collision.within(0, 0, 1, 1, 1.42)).toBe(true);
		expect(Collision.within(0, 0, 0, 0)).toBe(true);
		expect(Collision.within(0, 0, 0, 1)).toBe(true);
		expect(Collision.within(0, 0, 1, 0)).toBe(true);
		expect(Collision.within(0, 0, 0, 0)).toBe(true);
		expect(Collision.within(0, 0, -1, 0)).toBe(true);
		expect(Collision.within(0, 0, 0, -1)).toBe(true);
	});

	it("Miss", () => {
		expect(Collision.within(0, 0, 1, 1, 1.41)).toBe(false);
		expect(Collision.within(0, 0, 1, 1)).toBe(false);
		expect(Collision.within(0, 0, 1, -1)).toBe(false);
		expect(Collision.within(0, 0, -1, -1)).toBe(false);
		expect(Collision.within(0, 0, 1.01, 0)).toBe(false);
		expect(Collision.within(0, 0, 0, -1.01)).toBe(false);
	});
});

describe("Collision.withinAreas()", () => {
	const area1 = { x: 0, y: 0, width: 2, height: 2 };
	const area2 = { x: 3, y: 5, width: 2, height: 4 };
	const area3 = { x: 1, y: 0, width: 2, height: 4 };
	const distance = 2;

	it("Hit", () => {
		expect(Collision.withinAreas(area1, area3, distance)).toBe(true);
	});

	it("Miss", () => {
		expect(Collision.withinAreas(area1, area2, distance)).toBe(false);
		expect(Collision.withinAreas(area2, area3, distance)).toBe(false);
	});

	it("Miss Distance", () => {
		expect(Collision.withinAreas(area1, area1, 0)).toBe(true);
		expect(Collision.withinAreas(area2, area3)).toBe(false);
		expect(Collision.withinAreas(area2, ((area3 as any) - 1) as any)).toBe(false);
	});
});
