import { LoadingScene } from "..";
import { Game } from "./helpers";

declare let g: { game: Game };

describe("test LoadingScene", () => {
	it("初期化", () => {
		const game = new Game({ width: 320, height: 320, main: "" });
		const loadingScene = new LoadingScene({ game: game });
		expect(loadingScene).not.toHaveProperty("mascot");
		expect(loadingScene.game).toBe(game);
	});

	it("初期化- game省略, g.gameが存在する場合は正常にインスタンスが生成される", () => {
		g.game = new Game({ width: 320, height: 320, main: "" });
		const loadingScene = new LoadingScene();
		expect(loadingScene.local).toBeTruthy();
		expect(loadingScene.game).toBe(g.game);
	});

	it("初期化- game省略, g もしくは g.game がない場合エラーとなる", () => {
		delete g.game;
		try {
			new LoadingScene();
		} catch (e) {
			expect(e.message).toBe("GameInAssetContexts#getGameInAssetContext: Not in ScriptAsset.");
			expect(e.name).toEqual("AssertionError");
		}

		g = undefined;
		expect(() => new LoadingScene()).toThrow("GameInAssetContexts#getGameInAssetContext: Not in ScriptAsset.");
	});
});
