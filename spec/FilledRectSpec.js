describe("test ColorBox", function() {
	var g = require('../lib/main.node.js');
	var skeletonRuntime = require("./helpers/skeleton");

	beforeEach(function() {
		jasmine.addMatchers(require("./helpers/customMatchers"));
	});

	afterEach(function() {
	});

	it("初期化", function() {
		// deprecatedなコンストラクタの動作確認を行う
		var runtime = skeletonRuntime();
		runtime.game.suppressedLogLevel = g.LogLevel.Debug;
		var box = new g.FilledRect(runtime.scene, "red", 48, 32);
		expect(box.width).toBe(48);
		expect(box.height).toBe(32);
		expect(box.cssColor).toBe("red");
		runtime.game.suppressedLogLevel = undefined;
	});

	it("初期化 - ParameterObject", function() {
		var runtime = skeletonRuntime();
		var box = new g.FilledRect({
			scene: runtime.scene,
			cssColor: "red",
			x: 10, y: 20,
			width: 48, height: 32,
			opacity: 0.4,
		});
		expect(box.width).toBe(48);
		expect(box.height).toBe(32);
		expect(box.cssColor).toBe("red");
		expect(box.x).toBe(10);
		expect(box.y).toBe(20);
		expect(box.opacity).toBe(0.4);
	});

	it("初期化 - Mismatch cssColor", function() {
		var runtime = skeletonRuntime();
		runtime.game.suppressedLogLevel = g.LogLevel.Debug;
		expect(function() {
			new g.FilledRect(runtime.scene, 0, 48, 32);
		}).toThrowError("TypeMismatchError");

		expect(function() {
			new g.FilledRect({
				scene: runtime.scene,
				cssColor: 0,
				x: 10, y: 20,
				width: 48, height: 32,
				opacity: 0.4,
			});
		}).toThrowError("TypeMismatchError");
		runtime.game.suppressedLogLevel = undefined;
	});
});
