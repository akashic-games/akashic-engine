import { NinePatchSurfaceEffector } from "..";
import { Game, Renderer, Surface } from "./helpers";

describe("test NinePatchSurfaceEffector", () => {
	let game: Game;

	beforeEach(() => {
		game = new Game({ width: 320, height: 320, main: "" });
	});

	it("constructor - default borderWidth = 4", () => {
		const ninePatch = new NinePatchSurfaceEffector(game);

		expect(ninePatch.borderWidth.top).toBe(4);
		expect(ninePatch.borderWidth.bottom).toBe(4);
		expect(ninePatch.borderWidth.left).toBe(4);
		expect(ninePatch.borderWidth.right).toBe(4);
	});

	it("constructor - given borderWidth", () => {
		const borderWidth = {
			top: 1,
			bottom: 2,
			left: 3,
			right: 4
		};
		const ninePatch = new NinePatchSurfaceEffector(game, borderWidth);

		expect(ninePatch.borderWidth.top).toBe(1);
		expect(ninePatch.borderWidth.bottom).toBe(2);
		expect(ninePatch.borderWidth.left).toBe(3);
		expect(ninePatch.borderWidth.right).toBe(4);
	});

	it("render - drawImage", () => {
		const borderWidth = {
			top: 1,
			bottom: 2,
			left: 3,
			right: 4
		};
		const ninePatch = new NinePatchSurfaceEffector(game, borderWidth);
		const surface = new Surface(100, 100);
		const ninePatchSurface = ninePatch.render(surface, 100, 100) as Surface;
		const drawImage = (ninePatchSurface.createdRenderer as Renderer).methodCallParamsHistory("drawImage");
		expect(drawImage.length).toBe(9);

		// corners
		expect(drawImage[0].width).toBe(3);
		expect(drawImage[0].height).toBe(1);
		expect(drawImage[1].width).toBe(4);
		expect(drawImage[1].height).toBe(1);
		expect(drawImage[2].width).toBe(3);
		expect(drawImage[2].height).toBe(2);
		expect(drawImage[3].width).toBe(4);
		expect(drawImage[3].height).toBe(2);

		// borders
		expect(drawImage[4].width).toBe(93);
		expect(drawImage[4].height).toBe(1);
		expect(drawImage[5].width).toBe(3);
		expect(drawImage[5].height).toBe(97);
		expect(drawImage[6].width).toBe(4);
		expect(drawImage[6].height).toBe(97);
		expect(drawImage[7].width).toBe(93);
		expect(drawImage[7].height).toBe(2);

		// center
		expect(drawImage[8].width).toBe(93);
		expect(drawImage[8].height).toBe(97);
	});
});
