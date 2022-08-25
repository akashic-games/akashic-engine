import type { ImageAsset as PdiImageAsset } from "@akashic/pdi-types";
import { SurfaceUtil } from "..";
import { Renderer } from "./helpers";
import { customMatchers, Game, skeletonRuntime, Surface } from "./helpers";

expect.extend(customMatchers);

describe("test SurfaceUtil", () => {
	it("asSurface", done => {
		const runtime = skeletonRuntime();
		const scene = runtime.scene;
		const surface = new Surface(1, 1);
		expect(SurfaceUtil.asSurface(surface)).toBe(surface);
		expect(SurfaceUtil.asSurface(undefined)).toBeUndefined();
		expect(() => {
			SurfaceUtil.asSurface(scene as any);
		}).toThrowError("TypeMismatchError");

		const game = new Game({
			width: 320,
			height: 270,
			main: "",
			assets: {
				foo: {
					type: "image",
					path: "/dummypath.png",
					virtualPath: "dummypath.png",
					global: true,
					width: 1,
					height: 1
				}
			}
		});
		game._onLoad.add(() => {
			expect(SurfaceUtil.asSurface(game.assets.foo as PdiImageAsset)).toEqual((game.assets.foo as PdiImageAsset).asSurface());
			done();
		});
		game._startLoadingGlobalAssets();
	});

	it("SurfaceUtil#drawNinePatch()", () => {
		const game = new Game({
			width: 320,
			height: 270,
			main: "",
			assets: {}
		});
		const destSurface = game.resourceFactory.createSurface(100, 100);
		const srcSurface = game.resourceFactory.createSurface(100, 100);
		const borderWidth = {
			top: 1,
			bottom: 2,
			left: 3,
			right: 4
		};
		SurfaceUtil.drawNinePatch(destSurface, srcSurface, borderWidth);
		const drawImage = (destSurface.renderer() as Renderer).methodCallParamsHistory("drawImage");
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

	it("SurfaceUtil#rendererNinePatch()", () => {
		const game = new Game({
			width: 320,
			height: 270,
			main: "",
			assets: {}
		});
		const renderer = new Renderer();
		const srcSurface = game.resourceFactory.createSurface(200, 200);
		const width = 100;
		const height = 100;
		const borderWidth = {
			top: 1,
			bottom: 2,
			left: 3,
			right: 4
		};
		SurfaceUtil.renderNinePatch(renderer, width, height, srcSurface, borderWidth);
		const drawImage = renderer.methodCallParamsHistory("drawImage");
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
		expect(drawImage[4].width).toBe(193);
		expect(drawImage[4].height).toBe(1);
		expect(drawImage[5].width).toBe(3);
		expect(drawImage[5].height).toBe(197);
		expect(drawImage[6].width).toBe(4);
		expect(drawImage[6].height).toBe(197);
		expect(drawImage[7].width).toBe(193);
		expect(drawImage[7].height).toBe(2);

		// center
		expect(drawImage[8].width).toBe(193);
		expect(drawImage[8].height).toBe(197);
	});
});
