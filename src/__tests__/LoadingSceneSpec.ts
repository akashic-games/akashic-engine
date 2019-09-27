import { LoadingScene } from "..";
import { Game } from "./helpers";

describe("test LoadingScene", () => {
	it("初期化", () => {
		const game = new Game({ width: 320, height: 320 });
		const loadingScene = new LoadingScene({ game: game });
		expect(loadingScene).not.toHaveProperty("mascot");
		expect(loadingScene.game).toBe(game);
	});
});
