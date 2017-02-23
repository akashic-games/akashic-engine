describe("test DynamicFont", function() {
	var g = require('../lib/main.node.js');
	var mock = require("./helpers/mock");
	var skeletonRuntime = require("./helpers/skeleton");
	beforeEach(function() {
	});
	afterEach(function() {
	});
	it("初期化", function() {
		// deprecatedなコンストラクタの動作確認を行う
		var runtime = skeletonRuntime();
		runtime.game.suppressedLogLevel = g.LogLevel.Debug;

		var font = new g.DynamicFont(
			g.FontFamily.SansSerif,
			20,
			runtime.game,
			{},
			"white",
			1,
			"red",
			true
		);
		expect(font.fontFamily).toBe(g.FontFamily.SansSerif);
		expect(font.size).toBe(20);
		expect(font.fontColor).toBe("white");
		expect(font.strokeWidth).toBe(1);
		expect(font.strokeColor).toBe("red");
		expect(font.strokeOnly).toBe(true);
		runtime.game.suppressedLogLevel = undefined;
	});
	it("初期化 - ParameterObject", function() {
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
	});
});
