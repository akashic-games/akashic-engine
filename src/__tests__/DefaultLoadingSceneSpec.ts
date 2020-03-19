import { DefaultLoadingScene, LocalTickMode, TickGenerationMode } from "..";
import { Game } from "./helpers";

declare let g: { game: Game };

describe("test DefaultLoadingScene", () => {
	it("初期化", () => {
		const game = new Game({ width: 320, height: 320, main: "" });
		const defaultLoadingScene = new DefaultLoadingScene({ game: game });

		expect(defaultLoadingScene.game).toBe(game);
		expect(defaultLoadingScene.onAssetLoad.length).toEqual(0);
		expect(defaultLoadingScene.onAssetLoadFailure.length).toEqual(0);
		expect(defaultLoadingScene.onAssetLoadComplete.length).toEqual(0);
		expect(defaultLoadingScene.onLoad.length).toEqual(1);
		expect(defaultLoadingScene.onTargetReset.length).toEqual(1);
		expect(defaultLoadingScene.onTargetAssetLoad.length).toEqual(1);
		expect(defaultLoadingScene.children.length).toBe(0);
		expect(defaultLoadingScene._sceneAssetHolder._assetIds).toEqual([]);
		expect(defaultLoadingScene._sceneAssetHolder.waitingAssetsCount).toBe(0);
		expect(defaultLoadingScene.local).toBe(LocalTickMode.FullLocal);
		expect(defaultLoadingScene.tickGenerationMode).toBe(TickGenerationMode.ByClock);
		expect(defaultLoadingScene.name).toEqual("akashic:default-loading-scene");
	});

	it("初期化- game省略, g.gameが存在する場合は正常にインスタンスが生成される", () => {
		g.game = new Game({ width: 320, height: 320, main: "" });
		const defaultLoadingScene = new DefaultLoadingScene();

		expect(defaultLoadingScene.game).toBe(g.game);
		expect(defaultLoadingScene.onAssetLoad.length).toEqual(0);
		expect(defaultLoadingScene.onAssetLoadFailure.length).toEqual(0);
		expect(defaultLoadingScene.onAssetLoadComplete.length).toEqual(0);
		expect(defaultLoadingScene.onLoad.length).toEqual(1);
		expect(defaultLoadingScene.onTargetReset.length).toEqual(1);
		expect(defaultLoadingScene.onTargetAssetLoad.length).toEqual(1);
		expect(defaultLoadingScene.children.length).toBe(0);
		expect(defaultLoadingScene._sceneAssetHolder._assetIds).toEqual([]);
		expect(defaultLoadingScene._sceneAssetHolder.waitingAssetsCount).toBe(0);
		expect(defaultLoadingScene.local).toBe(LocalTickMode.FullLocal);
		expect(defaultLoadingScene.tickGenerationMode).toBe(TickGenerationMode.ByClock);
		expect(defaultLoadingScene.name).toEqual("akashic:default-loading-scene");
	});

	it("初期化- game省略, g もしくは g.game がない場合エラーとなる", () => {
		delete g.game;
		try {
			new DefaultLoadingScene();
		} catch (e) {
			expect(e.message).toBe("getGameInAssetContext(): Not in ScriptAsset.");
			expect(e.name).toEqual("AssertionError");
		}

		g = undefined;
		expect(() => new DefaultLoadingScene()).toThrow("getGameInAssetContext(): Not in ScriptAsset.");
	});
});
