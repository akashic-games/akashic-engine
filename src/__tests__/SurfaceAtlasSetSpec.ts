import { Glyph, SurfaceAtlasSet, SurfaceAtlasSetParameterObject } from "..";
import { skeletonRuntime, Surface } from "./helpers";

describe("test SurfaceAtlasSet", () => {
	let surfaceAtlasSet: SurfaceAtlasSet;
	const createGlyph = (code: number, x: number, y: number, width: number, height: number): Glyph => {
		return {
			code,
			x,
			y,
			width,
			height,
			surface: undefined,
			offsetX: 0,
			offsetY: 0,
			advanceWidth: width,
			isSurfaceValid: false,
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
				initialAtlasWidth: 1,
				initialAtlasHeight: 1,
				maxAtlasWidth: 2,
				maxAtlasHeight: 3,
				maxAtlasNum: 111
			}
		};
		surfaceAtlasSet = new SurfaceAtlasSet(surfaceAtlasSetParams);
		expect(surfaceAtlasSet._surfaceAtlases).toEqual([]);
		expect(surfaceAtlasSet.getMaxAtlasNum()).toEqual(111);
		expect(surfaceAtlasSet.getAtlasUsedSize()).toEqual({ width: 1, height: 1 });
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
			const glyph = createGlyph(300, 0, 0, 1, 1);
			glyph.surface = new Surface(1, 1);
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
			spyOn(surfaceAtlasSet, "_spliceLeastFrequentlyUsedAtlas").and.callThrough();
			surfaceAtlasSet._reallocateAtlas();
			expect(surfaceAtlasSet._spliceLeastFrequentlyUsedAtlas).toHaveBeenCalled();
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
});
