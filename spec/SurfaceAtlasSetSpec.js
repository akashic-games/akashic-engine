describe("test SurfaceAtlasSet", function() {
	var g = require('../lib/main.node.js');
	var skeletonRuntime = require("./helpers/skeleton");
	var surfaceAtlasSet;

	beforeEach(function() {
	});
	afterEach(function() {
	});

	it("初期化", function() {
		var runtime = skeletonRuntime();
		surfaceAtlasSet = new g.SurfaceAtlasSet({ game: runtime.game});
		expect(surfaceAtlasSet._surfaceAtlases).toEqual([]);
		expect(surfaceAtlasSet.getMaxAtlasNum()).toEqual(g.SurfaceAtlasSet.INITIAL_MAX_SURFACEATLAS_NUM);
		expect(surfaceAtlasSet.getAtlasSize()).toEqual({ width: 512, height: 512 });
	});

	it("初期化 パラメータあり", function () {
		var runtime = skeletonRuntime();
		const surfaceAtlasSetParams = {
			game: runtime.game,
			hint : {
				initialAtlasWidth: 2, // このテストでは 1x1 のグリフしか入れないが、内部的に幅・高さを1pxずつ拡張して管理するので最低 2x2 は必要
				initialAtlasHeight: 2,
				maxAtlasWidth: 2,
				maxAtlasHeight: 3,
				maxAtlasNum: 111
			}
		};
		surfaceAtlasSet = new g.SurfaceAtlasSet(surfaceAtlasSetParams);
		expect(surfaceAtlasSet._surfaceAtlases).toEqual([]);
		expect(surfaceAtlasSet.getMaxAtlasNum()).toEqual(111);
		expect(surfaceAtlasSet.getAtlasSize()).toEqual({ width: 2, height: 2 });
	});

	describe("_spliceLeastFrequentlyUsedAtlas", function () {
		it("_accessScoreが低いSurfaceAtlasが保持配列から削除される", function() {
			for(var i = 0; i < 10; i++) {
				surfaceAtlasSet._reallocateAtlas();
			}

			surfaceAtlasSet._surfaceAtlases.forEach((atlas, index) => {
				atlas._accessScore = index;
			});

			var removedAtlas = surfaceAtlasSet._spliceLeastFrequentlyUsedAtlas();
			var ret = surfaceAtlasSet._surfaceAtlases.find(atlas => {
				return atlas._accessScore === 0;
			})
			expect(ret).toEqual(undefined);
			expect(removedAtlas).not.toBeNull();
			expect(removedAtlas._accessScore).toBe(0);
			expect(surfaceAtlasSet.getAtlasNum()).toEqual(9);
		});
	});

	describe("addGlyph", function () {
		it("追加対象のSurfaceに空き領域がない場合、falseが返る", function () {
			var surface = surfaceAtlasSet._resourceFactory.createSurface(10, 10);
			var glyph = new g.Glyph(300, 0, 0, 10, 10, 0, 0, 10, surface);
			var ret = surfaceAtlasSet.addGlyph(glyph);
			expect(ret).toBe(false);
		});
		it("正常にグリフが追加された場合、trueが返る", () => {
			var surface = surfaceAtlasSet._resourceFactory.createSurface(1, 1);
			var glyph = new g.Glyph(300, 0, 0, 1, 1, 0, 0, 1, surface);
			var ret = surfaceAtlasSet.addGlyph(glyph);
			expect(ret).toBe(true);
		});
	});

	describe("reallocateAtlas", function () {
		it("SurfaceAtlasの保持数が最大値未満の場合、SurfaceAtlasが追加される", function () {
			surfaceAtlasSet.changeMaxAtlasNum(surfaceAtlasSet.getAtlasNum() + 1 );
			var currentLength = surfaceAtlasSet.getAtlasNum();

			surfaceAtlasSet._reallocateAtlas();
			expect(surfaceAtlasSet.getAtlasNum()).toEqual(currentLength + 1);
		});
		it("SurfaceAtlasの保持数が最大値の場合、削除処理が呼ばれる。", function () {
			spyOn(surfaceAtlasSet, "_spliceLeastFrequentlyUsedAtlas").and.callThrough();
			surfaceAtlasSet._reallocateAtlas();
			expect(surfaceAtlasSet._spliceLeastFrequentlyUsedAtlas).toHaveBeenCalled();
		});
	});

	describe("changeMaxAtlasNum", function () {
		it("現在のSurfaceAtlasの保持数より値が大きい場合、maxAtlasNumの値が設定される", function () {
			surfaceAtlasSet.changeMaxAtlasNum(15);
			expect(surfaceAtlasSet.getMaxAtlasNum()).toEqual(15);

		});
		it("現在のSurfaceAtlasの保持数より値が小さい場合、maxAtlasNumの値が設定される", function () {
			surfaceAtlasSet.changeMaxAtlasNum(5);
			expect(surfaceAtlasSet.getAtlasNum()).toEqual(5);
		});
	});

	describe("touchGlyph", () => {
		it("touch された glyph のある atlas は「最も利用されていない」ではなくなる", () => {
			var runtime = skeletonRuntime();
			var surfaceAtlasSet = new g.SurfaceAtlasSet({
				game: runtime.game,
				hint: {
					initialAtlasWidth: 10,
					initialAtlasHeight: 10,
					maxAtlasNum: 5
				}
			});

			// 1 グリフ 1 枚のアトラスを占有する
			// (SurfaceAtlas が内部的に幅・高さを 1px ずつ拡張して管理するので、
			// 10x10 のグリフは入らないことに注意。ここでは 8x8 で一枚ずつ占有させている)
			var surface0 = surfaceAtlasSet._resourceFactory.createSurface(8, 8);
			var glyph0 = new g.Glyph(300, 0, 0, 8, 8, 0, 0, 8, surface0);
			expect(surfaceAtlasSet.addGlyph(glyph0)).toBe(true);
			var surface1 = surfaceAtlasSet._resourceFactory.createSurface(8, 8);
			var glyph1 = new g.Glyph(301, 0, 0, 8, 8, 0, 0, 8, surface1);
			expect(surfaceAtlasSet.addGlyph(glyph1)).toBe(true);
			var surface2 = surfaceAtlasSet._resourceFactory.createSurface(8, 8);
			var glyph2 = new g.Glyph(301, 0, 0, 8, 8, 0, 0, 8, surface2);
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
