import { GameConfiguration, Scene } from "../../";
import { Game } from "./mock";

export interface Runtime {
	game: Game;
	scene: Scene;
}

export function skeletonRuntime(gameConfiguration?: GameConfiguration): Runtime {
	if (!gameConfiguration) gameConfiguration = { width: 320, height: 320 };
	const game = new Game(gameConfiguration);
	const scene = new Scene({ game });
	game.pushScene(scene);
	game._flushSceneChangeRequests();
	return {
		game: game,
		scene: scene
	};
}
