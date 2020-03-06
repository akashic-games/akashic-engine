import { GlyphLike, SurfaceAtlas, SurfaceAtlasSet, SurfaceAtlasSetParameterObject } from "..";
import { skeletonRuntime, Surface } from "./helpers";

describe("test SurfaceAtlasSet", () => {
	let surfaceAtlasSet: SurfaceAtlasSet;
	const createGlyphLike = (code: number, x: number, y: number, width: number, height: number): GlyphLike => {
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

	describe("removeLeastFrequentlyUsedAtlas", () => {
		it("_accessScoreが低いSurfaceAtlasが保持配列から削除される", () => {
			for (let i = 0; i < 10; i++) {
				surfaceAtlasSet.addAtlas();
			}

			surfaceAtlasSet._surfaceAtlases.forEach((atlas, index) => {
				atlas._accessScore = index;
			});

			const removedObj = surfaceAtlasSet._removeLeastFrequentlyUsedAtlas(1);
			const removedAtlas = removedObj.surfaceAtlases;
			const ret = surfaceAtlasSet._surfaceAtlases.find(atlas => atlas._accessScore === 0);
			expect(ret).toBeUndefined();
			expect(removedAtlas[0]._accessScore).toBe(0);
			expect(surfaceAtlasSet.getAtlasNum()).toBe(9);
		});
	});

	describe("addGlyph", () => {
		it("追加対象のSurfaceに空き領域がない場合、nullが返る", () => {
			const glyph = createGlyphLike(300, 0, 0, 10, 10);
			const ret = surfaceAtlasSet.addGlyph(glyph);
			expect(ret).toBeNull();
		});
		it("正常にグリフが追加された場合、追加したSurfaceAtlasが返る", () => {
			const glyph = createGlyphLike(300, 0, 0, 1, 1);
			glyph.surface = new Surface(1, 1);

			const atlas = new SurfaceAtlas(new Surface(100, 100));
			spyOn(atlas, "addSurface").and.callFake(() => {
				return { x: 1, y: 1 };
			});
			surfaceAtlasSet._surfaceAtlases.push(atlas);

			const ret = surfaceAtlasSet.addGlyph(glyph);
			expect(ret instanceof SurfaceAtlas).toBeTruthy();
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
			spyOn(surfaceAtlasSet, "_removeLeastFrequentlyUsedAtlas").and.callFake(() => {
				const glyph = createGlyphLike(300, 0, 0, 10, 10);
				const atlas = new SurfaceAtlas(new Surface(10, 10));
				return { surfaceAtlases: [atlas], glyphs: [[glyph]] };
			});

			surfaceAtlasSet._reallocateAtlas();
			expect(surfaceAtlasSet._removeLeastFrequentlyUsedAtlas).toHaveBeenCalled();
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

	describe("addAtlas", () => {
		it("maxAtlasNumより現在のSurfaceAtlasの保持数が小さい場合、追加される", () => {
			surfaceAtlasSet.changeMaxAtlasNum(6);
			const len = surfaceAtlasSet.getAtlasNum();
			surfaceAtlasSet.addAtlas();
			expect(surfaceAtlasSet.getAtlasNum()).toEqual(len + 1);
		});

		it("maxAtlasNumと現在のSurfaceAtlasの保持数が同数以上の場合、一つ削除され追加される", () => {
			spyOn(surfaceAtlasSet, "_deleteAtlas").and.callThrough();
			surfaceAtlasSet.addAtlas();
			expect(surfaceAtlasSet.getAtlasNum()).toEqual(surfaceAtlasSet.getMaxAtlasNum());
			expect(surfaceAtlasSet._deleteAtlas).toHaveBeenCalled();
		});
	});
});
