describe("test SystemLabel", function() {
	var g = require('../lib/main.node.js');
	var mock = require("./helpers/mock");
	var skeletonRuntime = require("./helpers/skeleton");
	beforeEach(function() {
	});
	afterEach(function() {
	});
	it("初期化", function() {
		var runtime = skeletonRuntime();
		var width = 32;
		var height = 64;
		var map = {"37564": {"x": 0, "y": 1}};
		var missingGlyph = {"x": 2, "y": 3};

		var systemLabel = new g.SystemLabel({
			scene: runtime.scene,
			text:  "The quick brown fox jumps over the lazy dog",
			fontSize: 10,
			textAlign: g.TextAlign.Center,
			textBaseline: g.TextBaseline.Alphabetic,
			maxWidth: 100,
			textColor: "red",
			fontFamily: g.FontFamily.serif,
			width: 50,
			height: 20,
		});
		
		expect(systemLabel.scene).toBe(runtime.scene);
		expect(systemLabel.text).toEqual("The quick brown fox jumps over the lazy dog");
		expect(systemLabel.fontSize).toBe(10);
		expect(systemLabel.textAlign).toBe(g.TextAlign.Center);
		expect(systemLabel.textBaseline).toBe(g.TextBaseline.Alphabetic);
		expect(systemLabel.maxWidth).toBe(100);
		expect(systemLabel.textColor).toEqual("red");
		expect(systemLabel.fontFamily).toEqual(g.FontFamily.serif);
		expect(systemLabel.strokeWidth).toBe(0);
		expect(systemLabel.strokeColor).toEqual("black");
		expect(systemLabel.strokeOnly).toBe(false);
	});
	it("初期化 - 輪郭の指定", function() {
		var runtime = skeletonRuntime();
		var width = 32;
		var height = 64;
		var map = {"37564": {"x": 0, "y": 1}};
		var missingGlyph = {"x": 2, "y": 3};

		var systemLabel = new g.SystemLabel({
			scene: runtime.scene,
			text:  "The quick brown fox jumps over the lazy dog",
			fontSize: 10,
			textAlign: g.TextAlign.Center,
			textBaseline: g.TextBaseline.Alphabetic,
			maxWidth: 100,
			textColor: "red",
			fontFamily: g.FontFamily.serif,
			width: 50,
			height: 20,
			strokeWidth: 2,
			strokeColor: "yellow",
			strokeOnly: true
		});
		
		expect(systemLabel.strokeWidth).toBe(2);
		expect(systemLabel.strokeColor).toEqual("yellow");
		expect(systemLabel.strokeOnly).toBe(true);
	});
});

