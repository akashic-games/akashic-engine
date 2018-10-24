describe("test DynamicFont", function() {
	var g = require('../lib/main.node.js');
	var mock = require("./helpers/mock");
	var skeletonRuntime = require("./helpers/skeleton");
	beforeEach(function() {
	});
	afterEach(function() {
	});
	it("初期化", function() {
		var runtime = skeletonRuntime();

		var font = new g.DynamicFont({
			game: runtime.game,
			fontFamily: g.FontFamily.SansSerif,
			size: 20,
			hint: {},
			fontColor: "white",
			fontWeight: g.FontWeight.Bold,
			strokeWidth: 1,
			strokeColor: "red",
			strokeOnly: true
		});
		expect(font.fontFamily).toBe(g.FontFamily.SansSerif);
		expect(font.size).toBe(20);
		expect(font.fontColor).toBe("white");
		expect(font.fontWeight).toBe(g.FontWeight.Bold);
		expect(font.strokeWidth).toBe(1);
		expect(font.strokeColor).toBe("red");
		expect(font.strokeOnly).toBe(true);
		expect(font._atlasSet.getAtlasSize()).toEqual({
				height: 512,
				width: 512
		});

		expect(font._atlasSet.getMaxAtlasNum()).toEqual(g.SurfaceAtlasSet.INITIAL_MAX_SURFACEATLAS_NUM);
	});
	it("初期化 - Given hint", function() {
		var runtime = skeletonRuntime();

		var font = new g.DynamicFont({
			game: runtime.game,
			fontFamily: g.FontFamily.SansSerif,
			size: 20,
			hint: {
				initialAtlasWidth: 1000,
				initialAtlasHeight: 2000,
				maxAtlasWidth: 3000,
				maxAtlasHeight: 4000,
				maxAtlasNum: 5
			},
			fontColor: "white",
			fontWeight: g.FontWeight.Bold,
			strokeWidth: 1,
			strokeColor: "red",
			strokeOnly: true
		});
		expect(font.fontFamily).toBe(g.FontFamily.SansSerif);
		expect(font.size).toBe(20);
		expect(font.fontColor).toBe("white");
		expect(font.fontWeight).toBe(g.FontWeight.Bold);
		expect(font.strokeWidth).toBe(1);
		expect(font.strokeColor).toBe("red");
		expect(font.strokeOnly).toBe(true);
		expect(font.hint).toEqual({
				initialAtlasWidth: 1000,
				initialAtlasHeight: 2000,
				maxAtlasWidth: 3000,
				maxAtlasHeight: 4000,
				maxAtlasNum: 5
		});
		expect(font._atlasSet.getAtlasSize()).toEqual({
			height: 2000,
			width: 1000
		});
		expect(font._atlasSet.getMaxAtlasNum()).toEqual(5);
	});
	it("初期化 - ParameterObject, 文字列配列によるフォントファミリ指定", function() {
		const runtime = skeletonRuntime();

		const param = {
			game: runtime.game,
			fontFamily: ["no-such-font", "Mock明朝"],
			size: 20
		};
		const font = new g.DynamicFont(param);
		expect(font.fontFamily).toBe(param.fontFamily);
		expect(font.size).toBe(font.size);
	});
	it("初期化 - ParameterObject, 文字列によるフォントファミリ指定", function() {
		const runtime = skeletonRuntime();

		const param = {
			game: runtime.game,
			fontFamily: "Mock明朝",
			size: 20
		};
		const font = new g.DynamicFont(param);
		expect(font.fontFamily).toBe(param.fontFamily);
		expect(font.size).toBe(font.size);
	});
});
