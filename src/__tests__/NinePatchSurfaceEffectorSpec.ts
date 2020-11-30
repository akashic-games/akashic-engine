import { NinePatchSurfaceEffector } from "..";
import { skeletonRuntime } from "./helpers";

// NOTE: NinePatchSurfaceEffectorは非推奨でありいずれ削除される。
describe("test NinePatchSurfaceEffector", () => {
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
});
