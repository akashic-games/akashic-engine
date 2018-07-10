import g = require("../../lib/main.node");
import mock = require("./mock");
function skeletonRuntime(gameConfiguration?: g.GameConfiguration): any {
	if (!gameConfiguration)
		gameConfiguration = { width: 320, height: 320 };
	var game = new mock.Game(gameConfiguration);
	var scene = new g.Scene({game: game});
	game.pushScene(scene);
	game._flushSceneChangeRequests();
	return {
		game: game,
		scene: scene
	};
}

export = skeletonRuntime;
