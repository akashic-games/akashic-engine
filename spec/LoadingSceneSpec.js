describe("test LoadingScene", function() {
	var g = require('../lib/main.node.js');
	var mock = require("./helpers/mock");

	beforeEach(function() {
	});

	afterEach(function() {
	});

	it("初期化", function() {
		// deprecatedなコンストラクタの動作確認を行う
		var game = new mock.Game({ width: 320, height: 320 });
		game.suppressedLogLevel = g.LogLevel.Debug;
		var loadingScene = new g.LoadingScene(game);
		expect(loadingScene.mascot).toBeUndefined();
		expect(loadingScene.game).toBe(game);
		game.suppressedLogLevel = undefined;
	});
	it("初期化 - ParameterObject", function() {
		var game = new mock.Game({ width: 320, height: 320 });
		var loadingScene = new g.LoadingScene({game: game});
		expect(loadingScene.mascot).toBeUndefined();
		expect(loadingScene.game).toBe(game);
	});
});
