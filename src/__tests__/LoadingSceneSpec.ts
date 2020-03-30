import { LoadingScene } from "..";
import { Game } from "./helpers";

describe("test LoadingScene", () => {
	beforeEach(() => {
		global.g = undefined;
	});
	afterAll(() => {
		global.g = undefined;
	});

	it("初期化", () => {
		const game = new Game({ width: 320, height: 320, main: "" });
		const loadingScene = new LoadingScene({ game: game });
		expect(loadingScene).not.toHaveProperty("mascot");
		expect(loadingScene.game).toBe(game);
	});

	it("初期化- game省略, g.gameが存在する場合は正常にインスタンスが生成される", () => {
		global.g = { game: new Game({ width: 320, height: 320, main: "" }) };
		const loadingScene = new LoadingScene();
		expect(loadingScene.local).toBeTruthy();
		expect(loadingScene.game).toBe(global.g.game);
	});

	it("初期化- game省略, g もしくは g.game がない場合エラーとなる", () => {
		global.g = { game: undefined };
		try {
			new LoadingScene();
		} catch (e) {
			expect(e.message).toBe("getGameInAssetContext(): Not in ScriptAsset.");
			expect(e.name).toEqual("AssertionError");
		}

		global.g = undefined;
		expect(() => new LoadingScene()).toThrow("getGameInAssetContext(): Not in ScriptAsset.");
	});
});
