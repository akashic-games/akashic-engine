import { Collision } from "..";

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
