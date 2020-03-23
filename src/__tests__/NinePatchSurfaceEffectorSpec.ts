import { NinePatchSurfaceEffector, Game } from "..";
import { skeletonRuntime } from "./helpers";

// NOTE: NinePatchSurfaceEffectorは非推奨でありいずれ削除される。
describe("test NinePatchSurfaceEffector", () => {
	beforeEach(() => {
		global.g = undefined;
	});
	afterAll(() => {
		global.g = undefined;
	});

	it("初期化", () => {
		const runtime = skeletonRuntime();
		const ninePatch = new NinePatchSurfaceEffector(runtime.game, 5);
		expect(ninePatch.borderWidth).toMatchObject({ top: 5, bottom: 5, left: 5, right: 5 });
	});

	it("初期化- borderWidth undefined", () => {
		const runtime = skeletonRuntime();
		const ninePatch = new NinePatchSurfaceEffector(runtime.game);
		expect(ninePatch.borderWidth).toMatchObject({ top: 4, bottom: 4, left: 4, right: 4 });
	});

	it("初期化- game省略, g.gameが存在する場合は正常にインスタンスが生成される", () => {
		const runtime = skeletonRuntime();
		global.g = { game: runtime.game };
		const ninePatch = new NinePatchSurfaceEffector(null, 5);
		expect(ninePatch.borderWidth).toMatchObject({ top: 5, bottom: 5, left: 5, right: 5 });
	});

	it("初期化- 引数全省略", () => {
		const runtime = skeletonRuntime();
		global.g = { game: runtime.game };
		const ninePatch = new NinePatchSurfaceEffector(null);
		expect(ninePatch.borderWidth).toMatchObject({ top: 4, bottom: 4, left: 4, right: 4 });
	});

	it("初期化- game省略, g.gameがない場合エラーとなる", () => {
		global.g = { game: undefined };
		try {
			new NinePatchSurfaceEffector(null, 5);
		} catch (e) {
			expect(e.message).toBe("getGameInAssetContext(): Not in ScriptAsset.");
			expect(e.name).toEqual("AssertionError");
		}

		global.g = undefined;
		expect(() => new NinePatchSurfaceEffector(null)).toThrow("getGameInAssetContext(): Not in ScriptAsset.");
	});
});
