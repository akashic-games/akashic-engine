import { Util } from "..";
import { CompositeOperation } from "../types/CompositeOperation";
import { FontFamily } from "../types/FontFamily";
import { FontWeight } from "../types/FontWeight";
import { LocalTickMode } from "../types/LocalTickMode";
import { TextAlign } from "../types/TextAlign";
import { TextBaseline } from "../types/TextBaseline";

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

	it("stringOfCompositeOperation", () => {
		expect(Util.stringOfCompositeOperation(CompositeOperation.Copy)).toBe("copy");
		expect(Util.stringOfCompositeOperation(CompositeOperation.DestinationOut)).toBe("destination-out");
		expect(Util.stringOfCompositeOperation(CompositeOperation.DestinationOver)).toBe("destination-over");
		expect(Util.stringOfCompositeOperation(CompositeOperation.ExperimentalDestinationAtop)).toBe("experimental-destination-atop");
		expect(Util.stringOfCompositeOperation(CompositeOperation.ExperimentalDestinationIn)).toBe("experimental-destination-in");
		expect(Util.stringOfCompositeOperation(CompositeOperation.ExperimentalSourceIn)).toBe("experimental-source-in");
		expect(Util.stringOfCompositeOperation(CompositeOperation.ExperimentalSourceOut)).toBe("experimental-source-out");
		expect(Util.stringOfCompositeOperation(CompositeOperation.Lighter)).toBe("lighter");
		expect(Util.stringOfCompositeOperation(CompositeOperation.SourceAtop)).toBe("source-atop");
		expect(Util.stringOfCompositeOperation(CompositeOperation.SourceOver)).toBe("source-over");
		expect(Util.stringOfCompositeOperation(CompositeOperation.Xor)).toBe("xor");
	});

	it("stringOfFontFamilyString", () => {
		expect(Util.stringOfFontFamilyString(FontFamily.Monospace)).toBe("monospace");
		expect(Util.stringOfFontFamilyString(FontFamily.SansSerif)).toBe("sans-serif");
		expect(Util.stringOfFontFamilyString(FontFamily.Serif)).toBe("serif");
	});

	it("stringOfFontWeightString", () => {
		expect(Util.stringOfFontWeightString(FontWeight.Bold)).toBe("bold");
		expect(Util.stringOfFontWeightString(FontWeight.Normal)).toBe("normal");
	});

	it("stringOfLocalTickModeString", () => {
		expect(Util.stringOfLocalTickModeString(LocalTickMode.FullLocal)).toBe("full-local");
		expect(Util.stringOfLocalTickModeString(LocalTickMode.InterpolateLocal)).toBe("interpolate-local");
		expect(Util.stringOfLocalTickModeString(LocalTickMode.NonLocal)).toBe("non-local");
	});

	it("stringOfTextAlignString", () => {
		expect(Util.stringOfTextAlignString(TextAlign.Center)).toBe("center");
		expect(Util.stringOfTextAlignString(TextAlign.Left)).toBe("left");
		expect(Util.stringOfTextAlignString(TextAlign.Right)).toBe("right");
	});

	it("stringOfTextBaselineString", () => {
		expect(Util.stringOfTextBaselineString(TextBaseline.Alphabetic)).toBe("alphabetic");
		expect(Util.stringOfTextBaselineString(TextBaseline.Bottom)).toBe("bottom");
		expect(Util.stringOfTextBaselineString(TextBaseline.Middle)).toBe("middle");
		expect(Util.stringOfTextBaselineString(TextBaseline.Top)).toBe("top");
	});
});
