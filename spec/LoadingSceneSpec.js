describe("test LoadingScene", function() {
	var g = require('../lib/');
	var mock = require("./helpers/mock");

	beforeEach(function() {
	});

	afterEach(function() {
	});
	it("初期化", function() {
		var game = new mock.Game({ width: 320, height: 320 });
		var loadingScene = new g.LoadingScene({game: game});
		expect(loadingScene.mascot).toBeUndefined();
		expect(loadingScene.game).toBe(game);
	});
});
