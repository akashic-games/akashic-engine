import { Glyph, SurfaceAtlasSet, SurfaceAtlasSetParameterObject } from "..";
import { skeletonRuntime, Surface } from "./helpers";

describe("test SurfaceAtlasSet", () => {
	let surfaceAtlasSet: SurfaceAtlasSet;
	const createGlyph = (code: number, x: number, y: number, width: number, height: number, surface?: Surface): Glyph => {
		return {
			code,
			x,
			y,
			width,
			height,
			surface,
			offsetX: 0,
			offsetY: 0,
			advanceWidth: width,
			isSurfaceValid: !!surface,
			_atlas: null
		};
	};

	it("初期化", () => {
		const runtime = skeletonRuntime();
		surfaceAtlasSet = new SurfaceAtlasSet({ resourceFactory: runtime.game.resourceFactory });
		expect(surfaceAtlasSet._surfaceAtlases).toEqual([]);
		expect(surfaceAtlasSet.getMaxAtlasNum()).toEqual(SurfaceAtlasSet.INITIAL_MAX_SURFACEATLAS_NUM);
		expect(surfaceAtlasSet.getAtlasUsedSize()).toEqual({ width: 512, height: 512 });
	});

	it("初期化 パラメータあり", () => {
		const runtime = skeletonRuntime();
		const surfaceAtlasSetParams: SurfaceAtlasSetParameterObject = {
			resourceFactory: runtime.game.resourceFactory,
			hint: {
				initialAtlasWidth: 2, // このテストでは 1x1 のグリフしか入れないが、内部的に幅・高さを1pxずつ拡張して管理するので最低 2x2 は必要
				initialAtlasHeight: 2,
				maxAtlasWidth: 2,
				maxAtlasHeight: 3,
				maxAtlasNum: 111
			}
		};
		surfaceAtlasSet = new SurfaceAtlasSet(surfaceAtlasSetParams);
		expect(surfaceAtlasSet._surfaceAtlases).toEqual([]);
		expect(surfaceAtlasSet.getMaxAtlasNum()).toEqual(111);
		expect(surfaceAtlasSet.getAtlasUsedSize()).toEqual({ width: 2, height: 2 });
	});

	describe("_spliceLeastFrequentlyUsedAtlas", () => {
		it("_accessScoreが低いSurfaceAtlasが保持配列から削除される", () => {
			for (let i = 0; i < 10; i++) {
				surfaceAtlasSet._reallocateAtlas();
			}

			surfaceAtlasSet._surfaceAtlases.forEach((atlas, index) => {
				atlas._accessScore = index;
			});

			const removedAtlas = surfaceAtlasSet._spliceLeastFrequentlyUsedAtlas();
			const ret = surfaceAtlasSet._surfaceAtlases.find(atlas => atlas._accessScore === 0);
			expect(ret).toBeUndefined();
			expect(removedAtlas).not.toBeNull();
			expect(removedAtlas!._accessScore).toBe(0);
			expect(surfaceAtlasSet.getAtlasNum()).toBe(9);
		});
	});

	describe("addGlyph", () => {
		it("追加対象のSurfaceに空き領域がない場合、falseが返る", () => {
			const glyph = createGlyph(300, 0, 0, 10, 10);
			const ret = surfaceAtlasSet.addGlyph(glyph);
			expect(ret).toBe(false);
		});
		it("正常にグリフが追加された場合、trueが返る", () => {
			const glyph = createGlyph(300, 0, 0, 1, 1, new Surface(1, 1));
			const ret = surfaceAtlasSet.addGlyph(glyph);
			expect(ret).toBe(true);
		});
	});

	describe("reallocateAtlas", () => {
		it("SurfaceAtlasの保持数が最大値未満の場合、SurfaceAtlasが追加される", () => {
			surfaceAtlasSet.changeMaxAtlasNum(surfaceAtlasSet.getAtlasNum() + 1);
			const currentLength = surfaceAtlasSet.getAtlasNum();

			surfaceAtlasSet._reallocateAtlas();
			expect(surfaceAtlasSet.getAtlasNum()).toEqual(currentLength + 1);
		});
		it("SurfaceAtlasの保持数が最大値の場合、削除処理が呼ばれる。", () => {
			const method = jest.spyOn(surfaceAtlasSet, "_spliceLeastFrequentlyUsedAtlas");
			surfaceAtlasSet._reallocateAtlas();
			expect(method).toHaveBeenCalled();
		});
	});

	describe("changeMaxAtlasNum", () => {
		it("現在のSurfaceAtlasの保持数より値が大きい場合、maxAtlasNumの値が設定される", () => {
			surfaceAtlasSet.changeMaxAtlasNum(15);
			expect(surfaceAtlasSet.getMaxAtlasNum()).toEqual(15);
		});
		it("現在のSurfaceAtlasの保持数より値が小さい場合、maxAtlasNumの値が設定される", () => {
			surfaceAtlasSet.changeMaxAtlasNum(5);
			expect(surfaceAtlasSet.getAtlasNum()).toEqual(5);
		});
	});

	describe("touchGlyph", () => {
		it("touch された glyph のある atlas は「最も利用されていない」ではなくなる", () => {
			const runtime = skeletonRuntime();
			const surfaceAtlasSet = new SurfaceAtlasSet({
				resourceFactory: runtime.game.resourceFactory,
				hint: {
					initialAtlasWidth: 10,
					initialAtlasHeight: 10,
					maxAtlasNum: 5
				}
			});

			// 1 グリフ 1 枚のアトラスを占有する
			// (SurfaceAtlas が内部的に幅・高さを 1px ずつ拡張して管理するので、
			// 10x10 のグリフは入らないことに注意。ここでは 8x8 で一枚ずつ占有させている)
			const glyph0 = createGlyph(300, 0, 0, 8, 8, new Surface(8, 8));
			expect(surfaceAtlasSet.addGlyph(glyph0)).toBe(true);
			const glyph1 = createGlyph(301, 0, 0, 8, 8, new Surface(8, 8));
			expect(surfaceAtlasSet.addGlyph(glyph1)).toBe(true);
			const glyph2 = createGlyph(301, 0, 0, 8, 8, new Surface(8, 8));
			expect(surfaceAtlasSet.addGlyph(glyph2)).toBe(true);

			expect(glyph0._atlas).toBe(surfaceAtlasSet._surfaceAtlases[0]);
			expect(glyph1._atlas).toBe(surfaceAtlasSet._surfaceAtlases[1]);
			expect(glyph2._atlas).toBe(surfaceAtlasSet._surfaceAtlases[2]);

			surfaceAtlasSet.touchGlyph(glyph0);
			surfaceAtlasSet.touchGlyph(glyph2);
			expect(surfaceAtlasSet._findLeastFrequentlyUsedAtlasIndex()).toBe(1);
			surfaceAtlasSet.touchGlyph(glyph1);
			expect(surfaceAtlasSet._findLeastFrequentlyUsedAtlasIndex()).toBe(0);
			surfaceAtlasSet.touchGlyph(glyph0);
			expect(surfaceAtlasSet._findLeastFrequentlyUsedAtlasIndex()).toBe(2);
		});
	});
});
