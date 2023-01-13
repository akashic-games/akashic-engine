import { Util } from "..";

describe("test Util", () => {
	it("distance = 0", () => {
		expect(Util.distance(0, 0, 0, 0).toFixed(2)).toEqual("0.00");
		expect(Util.distance(100, 100, 100, 100).toFixed(2)).toEqual("0.00");
		expect(Util.distance(-100, -100, -100, -100).toFixed(2)).toEqual("0.00");
		expect(Util.distanceBetweenOffsets({ x: -100, y: -100 }, { x: -100, y: -100 }).toFixed(2)).toEqual("0.00");
		expect(Util.distanceBetweenOffsets({ x: 100, y: 100 }, { x: 100, y: 100 }).toFixed(2)).toEqual("0.00");
		expect(Util.distanceBetweenOffsets({ x: -100, y: -100 }, { x: -100, y: -100 }).toFixed(2)).toEqual("0.00");
	});

	it("distance = 1", () => {
		expect(Util.distance(-1, -1, 0, -1).toFixed(2)).toEqual("1.00");
		expect(Util.distance(-1, -1, -1, 0).toFixed(2)).toEqual("1.00");
		expect(Util.distance(0, 0, 0, -1).toFixed(2)).toEqual("1.00");
		expect(Util.distance(0, 0, -1, 0).toFixed(2)).toEqual("1.00");
		expect(Util.distanceBetweenOffsets({ x: -1, y: -1 }, { x: 0, y: -1 }).toFixed(2)).toEqual("1.00");
		expect(Util.distanceBetweenOffsets({ x: -1, y: -1 }, { x: -1, y: 0 }).toFixed(2)).toEqual("1.00");
		expect(Util.distanceBetweenOffsets({ x: 0, y: 0 }, { x: 0, y: -1 }).toFixed(2)).toEqual("1.00");
		expect(Util.distanceBetweenOffsets({ x: 0, y: 0 }, { x: -1, y: 0 }).toFixed(2)).toEqual("1.00");
	});

	it("distance = sqrt(2)", () => {
		expect(Util.distance(2, 2, 1, 1).toFixed(2)).toEqual("1.41");
		expect(Util.distance(-1, -1, -2, -2).toFixed(2)).toEqual("1.41");
		expect(Util.distance(1, 1, 2, 2).toFixed(2)).toEqual("1.41");
		expect(Util.distance(-2, -2, -1, -1).toFixed(2)).toEqual("1.41");
		expect(Util.distanceBetweenOffsets({ x: 2, y: 2 }, { x: 1, y: 1 }).toFixed(2)).toEqual("1.41");
		expect(Util.distanceBetweenOffsets({ x: -1, y: -1 }, { x: -2, y: -2 }).toFixed(2)).toEqual("1.41");
		expect(Util.distanceBetweenOffsets({ x: 1, y: 1 }, { x: 2, y: 2 }).toFixed(2)).toEqual("1.41");
		expect(Util.distanceBetweenOffsets({ x: -2, y: -2 }, { x: -1, y: -1 }).toFixed(2)).toEqual("1.41");
	});

	it("distance = 0.5", () => {
		expect(Util.distance(0.5, 0.5, 1.0, 0.5).toFixed(2)).toEqual("0.50");
		expect(Util.distance(0.25, 0.25, 0.75, 0.25).toFixed(2)).toEqual("0.50");
		expect(Util.distance(-0.5, 0.5, -1.0, 0.5).toFixed(2)).toEqual("0.50");
		expect(Util.distance(0.25, 0.25, 0.25, -0.25).toFixed(2)).toEqual("0.50");
		expect(Util.distanceBetweenOffsets({ x: 0.5, y: 0.5 }, { x: 1.0, y: 0.5 }).toFixed(2)).toEqual("0.50");
		expect(Util.distanceBetweenOffsets({ x: 0.25, y: 0.25 }, { x: 0.75, y: 0.25 }).toFixed(2)).toEqual("0.50");
		expect(Util.distanceBetweenOffsets({ x: -0.5, y: 0.5 }, { x: -1.0, y: 0.5 }).toFixed(2)).toEqual("0.50");
		expect(Util.distanceBetweenOffsets({ x: 0.25, y: 0.25 }, { x: 0.25, y: -0.25 }).toFixed(2)).toEqual("0.50");
	});

	it("distanceBetweenAreas", () => {
		const area1 = { x: 2, y: 2, width: 2, height: 2 }; // center: (3, 3)
		const area2 = { x: 3, y: 5, width: 2, height: 4 }; // center: (4, 7)
		const area3 = { x: -4, y: 3, width: 7, height: -4 }; // center: (-0.5, 1)
		expect(Util.distanceBetweenAreas(area1, area2).toFixed(2)).toEqual(Math.sqrt(Math.pow(4 - 3, 2) + Math.pow(7 - 3, 2)).toFixed(2));
		expect(Util.distanceBetweenAreas(area1, area3).toFixed(2)).toEqual(
			Math.sqrt(Math.pow(-0.5 - 3, 2) + Math.pow(1 - 3, 2)).toFixed(2)
		);
	});

	it("clamp", () => {
		expect(Util.clamp(0.4, 0, 1)).toBe(0.4);
		expect(Util.clamp(0, -100, 100)).toBe(0);
		expect(Util.clamp(-10, -5, 5)).toBe(-5);
		expect(Util.clamp(200, 10, 100)).toBe(100);
	});
});
