import { ResourceFactory, Surface } from "./helpers";

describe("ResourceFactory", () => {
	const resourceFactory = new ResourceFactory();
	describe("createTrimmedSurface", () => {
		it("can trim a surface in specified area", () => {
			const surface = new Surface(100, 100);
			const trimmedArea = {
				x: 35,
				y: 40,
				width: 30,
				height: 20
			};
			const trimmedSurface = resourceFactory.createTrimmedSurface(surface, trimmedArea);
			expect(trimmedSurface).toBeDefined();
			expect(trimmedSurface.width).toBe(30);
			expect(trimmedSurface.height).toBe(20);
		});
		it("can create clone of specified surface", () => {
			const surface = new Surface(100, 100);
			const trimmedSurface = resourceFactory.createTrimmedSurface(surface);
			expect(trimmedSurface).toBeDefined();
			expect(trimmedSurface.width).toBe(100);
			expect(trimmedSurface.height).toBe(100);
		});
	});
});
