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
			initialAtlasWidth: 1,
			initialAtlasHeight: 1,
			maxAtlasWidth: 2,
			maxAtlasHeight: 3,
			maxSurfaceAtlasNum: 111
		};
		surfaceAtlasSet = new g.SurfaceAtlasSet(surfaceAtlasSetParams);
		expect(surfaceAtlasSet._surfaceAtlases).toEqual([]);
		expect(surfaceAtlasSet.getMaxAtlasNum()).toEqual(111);
		expect(surfaceAtlasSet.getAtlasSize()).toEqual({width: 1, height: 1});
	});



	describe("removeLeastFrequentlyUsedAtlas", function () {
		it("_accessScoreが低いSurfaceAtlasが保持配列から削除される", function() {
			for(var i = 0; i < 10; i++) {
				surfaceAtlasSet.addAtlas();
			}

			surfaceAtlasSet._surfaceAtlases.forEach((atlas, index) => {
				atlas._accessScore = index;
			});

			var removedAtlas = surfaceAtlasSet._removeLeastFrequentlyUsedAtlas(1);
			var ret = surfaceAtlasSet._surfaceAtlases.find(atlas => {
				return atlas._accessScore === 0;
			})
			expect(ret).toEqual(undefined);
			expect(removedAtlas[0]._accessScore).toEqual(0);
			expect(surfaceAtlasSet.getAtlasNum()).toEqual(9);
		});
	});

	describe("addGlyph", function () {
		it("追加対象のSurfaceに空き領域がない場合、nullが返る", function () {
			var glyph = new g.Glyph(300, 0, 0, 10, 10);
			var ret = surfaceAtlasSet.addGlyph(glyph);
			expect(ret).toBeNull();
		});
		it("正常にグリフが追加された場合、追加したSurfaceAtlasが返る", function () {
			var glyph = new g.Glyph(300, 0, 0, 1, 1);
			glyph.surface = new g.Surface(1, 1);

			var atlas = new g.SurfaceAtlas(new g.Surface(100, 100));
			spyOn(atlas, "addSurface").and.callFake(() => { return { x: 1, y: 1 } });
			surfaceAtlasSet._surfaceAtlases.push(atlas);

			var ret = surfaceAtlasSet.addGlyph(glyph);
			expect(ret instanceof g.SurfaceAtlas).toBeTruthy();
		});
	});

	describe("reallocateAtlas", function () {
		it("SurfaceAtlasの保持数が最大値未満の場合、SurfaceAtlasが追加される", function () {
			surfaceAtlasSet.changeMaxAtlasNum(surfaceAtlasSet.getAtlasNum() + 1 );
			var currentLength = surfaceAtlasSet.getAtlasNum();

			surfaceAtlasSet._resourceFactory = {
				createSurfaceAtlas: function (width, height) {
					return new g.SurfaceAtlas(new g.Surface(10, 10))}
			}
			surfaceAtlasSet.reallocateAtlas({}, {width: 10, height: 10});
			expect(surfaceAtlasSet.getAtlasNum()).toEqual(currentLength + 1);
		});
		it("SurfaceAtlasの保持数が最大値の場合、SurfaceAtlasを1つ削除後に追加される", function () {
			spyOn(surfaceAtlasSet, "_removeLeastFrequentlyUsedAtlas").and.callThrough();
			surfaceAtlasSet.reallocateAtlas({}, { width: 10, height: 10 });

			expect(surfaceAtlasSet._removeLeastFrequentlyUsedAtlas).toHaveBeenCalled();
			expect(surfaceAtlasSet.getAtlasNum()).toEqual(surfaceAtlasSet.getMaxAtlasNum());
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

	describe("addAtlas", function () {
		it("maxAtlasNumより現在のSurfaceAtlasの保持数が小さい場合、追加される", function () {
			surfaceAtlasSet.changeMaxAtlasNum(6);
			const len = surfaceAtlasSet.getAtlasNum();
			var atlas = new g.SurfaceAtlas(new g.Surface(1, 1));
			surfaceAtlasSet.addAtlas(atlas);
			expect(surfaceAtlasSet.getAtlasNum()).toEqual(len + 1);
		});

		it("maxAtlasNumと現在のSurfaceAtlasの保持数が同数以上の場合、一つ削除され追加される", function () {
			spyOn(surfaceAtlasSet, "_removeAtlas").and.callThrough();
			const len = surfaceAtlasSet.getAtlasNum();
			var atlas = new g.SurfaceAtlas(new g.Surface(1, 1));
			surfaceAtlasSet.addAtlas(atlas);
			expect(surfaceAtlasSet.getAtlasNum()).toEqual(surfaceAtlasSet.getMaxAtlasNum());
			expect(surfaceAtlasSet._removeAtlas).toHaveBeenCalled();
		});
	});
});
