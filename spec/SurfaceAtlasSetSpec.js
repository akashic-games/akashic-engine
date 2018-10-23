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
		expect(surfaceAtlasSet.maxAtlasNum).toEqual(g.SurfaceAtlasSet.INITIAL_SURFACEATLAS_MAX_SIZE);
	});

	describe("removeLeastFrequentlyUsedAtlas", function () {
		it("_accessScoreが低いSurfaceAtlasが保持配列から削除される", function() {
			for(var i = 0; i < 10; i++) {
				var atlas = new g.SurfaceAtlas(new g.Surface(1,1));
				atlas._accessScore = i;
				surfaceAtlasSet.addAtlas(atlas);
			}

			var removedAtlas = surfaceAtlasSet.removeLeastFrequentlyUsedAtlas();
			var ret = surfaceAtlasSet._surfaceAtlases.find(atlas => {
				return atlas._accessScore === 0;
			})
			expect(ret).toEqual(undefined);
			expect(removedAtlas._accessScore).toEqual(0);
			expect(surfaceAtlasSet.atlasNum).toEqual(9);
		});
	});

	describe("addToAtlas", function () {
		it("追加対象のSurfaceに空き領域がない場合、nullが返る", function () {
			var glyph = new g.Glyph(300, 0, 0, 10, 10);
			var ret = surfaceAtlasSet.addToAtlas(glyph);
			expect(ret).toBeNull();
		});
		it("正常にグリフが追加された場合、追加したSurfaceAtlasが返る", function () {
			var glyph = new g.Glyph(300, 0, 0, 1, 1);
			glyph.surface = new g.Surface(1, 1);

			var atlas = new g.SurfaceAtlas(new g.Surface(100, 100));
			spyOn(atlas, "addSurface").and.callFake(() => { return { x: 1, y: 1 } });
			surfaceAtlasSet.addAtlas(atlas);

			var ret = surfaceAtlasSet.addToAtlas(glyph);
			expect(ret instanceof g.SurfaceAtlas).toBeTruthy();
		});
	});

	describe("reallocateAtlas", function () {
		it("SurfaceAtlasの保持数が最大値未満の場合、SurfaceAtlasが追加される", function () {
			surfaceAtlasSet.maxAtlasNum = surfaceAtlasSet.atlasNum + 1;
			var currentLength = surfaceAtlasSet.atlasNum;

			surfaceAtlasSet._resourceFactory = {
				createSurfaceAtlas: function (width, height) {
					return new g.SurfaceAtlas(new g.Surface(10, 10))}
			}
			surfaceAtlasSet.reallocateAtlas({}, {width: 10, height: 10});
			expect(surfaceAtlasSet.atlasNum).toEqual(currentLength + 1);
		});
		it("SurfaceAtlasの保持数が最大値の場合、SurfaceAtlasを1つ削除後に追加される", function () {
			spyOn(surfaceAtlasSet, "removeLeastFrequentlyUsedAtlas").and.callThrough();
			surfaceAtlasSet.reallocateAtlas({}, { width: 10, height: 10 });

			expect(surfaceAtlasSet.removeLeastFrequentlyUsedAtlas).toHaveBeenCalled();
			expect(surfaceAtlasSet.atlasNum).toEqual(surfaceAtlasSet.maxAtlasNum);
		});
	});
});
