import { Camera2D } from "..";
import { CacheableE, Renderer, EntityStateFlags, customMatchers, skeletonRuntime } from "./helpers";

describe("test CacheableE", () => {
	let runtime: any;

	beforeEach(() => {
		expect.extend(customMatchers);
		runtime = skeletonRuntime();
	});

	it("初期化", () => {
		const ce = new CacheableE({ scene: runtime.scene });
		expect(ce._shouldRenderChildren).toBe(true);
		expect(ce._targetCameras).toBeUndefined();
		expect(ce._cache).toBeUndefined();
		expect(ce._renderer).toBeUndefined();
		expect(ce._renderedCamera).toBeUndefined();
	});

	it("invalidate", () => {
		const ce = new CacheableE({ scene: runtime.scene });
		const renderer = new Renderer();

		expect(ce.state & EntityStateFlags.Cached).toBe(0);
		ce.renderSelf(renderer);
		expect(ce.state & EntityStateFlags.Cached).not.toBe(0);
		ce.invalidate();
		expect(ce.state & EntityStateFlags.Cached).toBe(0);
		ce.renderSelf(renderer);
		expect(ce.state & EntityStateFlags.Cached).not.toBe(0);
	});

	it("renderSelf", () => {
		const ce = new CacheableE({ scene: runtime.scene });
		const renderer = new Renderer();

		// 戻り値
		expect(ce.renderSelf(renderer)).toBe(true);
		ce._shouldRenderChildren = false;
		expect(ce.renderSelf(renderer)).toBe(false);
		ce._shouldRenderChildren = true;
		expect(ce.renderSelf(renderer)).toBe(true);
	});

	it("renderSelf calls renderCache", () => {
		const ce = new CacheableE({ scene: runtime.scene });
		const renderer = new Renderer();
		const cam1 = new Camera2D({ game: runtime.game });
		const cam2 = new Camera2D({ game: runtime.game });

		let called = false;
		ce.renderCache = (r, c) => {
			called = true;
		};

		// 呼ばれる (初期状態ではキャッシュされていない)
		called = false;
		ce.renderSelf(renderer);
		expect(called).toBe(true);

		// invalidate()すると呼ばれる
		called = false;
		ce.invalidate();
		ce.renderSelf(renderer);
		expect(called).toBe(true);

		// invalidate()しなくてもcameraが変わると呼ばれる(undefined -> cam1)
		called = false;
		ce.renderSelf(renderer, cam1);
		expect(called).toBe(true);

		// invalidate()しなくてもcameraが変わると呼ばれる(cam1 -> cam2)
		called = false;
		ce.renderSelf(renderer, cam2);
		expect(called).toBe(true);
	});

	it("renderSelf creates new cache", () => {
		const ce = new CacheableE({ scene: runtime.scene });
		const renderer = new Renderer();

		ce.width = 100;
		ce.height = 200;

		// 最初の呼び出し時にキャッシュを生成する
		let before = ce._cache;
		ce.invalidate();
		ce.renderSelf(renderer);

		let after = ce._cache;
		expect(before === after).toBe(false);

		// キャッシュを再生成しない
		ce.invalidate();
		ce.renderSelf(renderer);
		before = ce._cache;
		ce.invalidate();
		ce.renderSelf(renderer);
		after = ce._cache;
		expect(before === after).toBe(true);

		// サイズが変わるとキャッシュを再生成する
		ce.invalidate();
		ce.renderSelf(renderer);
		before = ce._cache;
		ce.width = 200;
		ce.height = 300;
		ce.invalidate();
		ce.renderSelf(renderer);
		after = ce._cache;
		expect(before === after).toBe(false);
	});

	it("renderSelf size validation", () => {
		const ce = new CacheableE({ scene: runtime.scene });
		const r = new Renderer();

		ce.width = 100;
		ce.height = 200;
		ce.invalidate();
		ce.renderSelf(r);
		ce.width = 0;
		ce.height = 0;
		ce.invalidate();
		ce.renderSelf(r);
		ce.width = 200;
		ce.height = 300;
		ce.invalidate();
		ce.renderSelf(r);
		const count = r.methodCallParamsHistory("drawImage").length;
		expect(count).toBe(2);
	});
});
