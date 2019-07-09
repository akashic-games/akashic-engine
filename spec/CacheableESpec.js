var g = require("../lib");
var mock = require("./helpers/mock");
describe("test CacheableE", function () {
	var runtime;
	var skeletonRuntime = require("./helpers/skeleton");

	beforeEach(function () {
		jasmine.addMatchers(require("./helpers/customMatchers"));
		runtime = skeletonRuntime();
	});
	afterEach(function () {
	});
	it("初期化", function () {
		var ce = new g.CacheableE({ scene: runtime.scene });
		expect(ce._shouldRenderChildren).toBe(true);
		expect(ce._targetCameras).toBeUndefined();
		expect(ce._cache).toBeUndefined();
		expect(ce._renderer).toBeUndefined();
		expect(ce._renderedCamera).toBeUndefined();
	});

	it("invalidate", function () {
		var ce = new g.CacheableE({ scene: runtime.scene });
		var renderer = new mock.Renderer();
		ce.renderCache = function () {};  // CacheableE は抽象クラスなのでテストできるようにダミーの実装を代入しておく

		expect(ce.state & mock.EntityStateFlags.Cached).toBe(0);
		ce.renderSelf(renderer);
		expect(ce.state & mock.EntityStateFlags.Cached).not.toBe(0);
		ce.invalidate();
		expect(ce.state & mock.EntityStateFlags.Cached).toBe(0);
		ce.renderSelf(renderer);
		expect(ce.state & mock.EntityStateFlags.Cached).not.toBe(0);
	});

	it("renderSelf", function () {
		var ce = new g.CacheableE({ scene: runtime.scene });
		var renderer = new mock.Renderer();
		ce.renderCache = function () {};  // CacheableE は抽象クラスなのでテストできるようにダミーの実装を代入しておく

		// 戻り値
		expect(ce.renderSelf(renderer)).toBe(true);
		ce._shouldRenderChildren = false;
		expect(ce.renderSelf(renderer)).toBe(false);
		ce._shouldRenderChildren = true;
		expect(ce.renderSelf(renderer)).toBe(true);
	});

	it("renderSelf calls renderCache", function () {
		var ce = new g.CacheableE({ scene: runtime.scene });
		var renderer = new mock.Renderer();
		var cam1 = new g.Camera2D({game: runtime.game});
		var cam2 = new g.Camera2D({game: runtime.game});

		var called = false;
		ce.renderCache = function(r, c) {
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

	it("renderSelf creates new cache", function () {
		var ce = new g.CacheableE({ scene: runtime.scene });
		var renderer = new mock.Renderer();

		ce.width = 100;
		ce.height = 200;
		ce.renderCache = function(r, c) {
		};

		// 最初の呼び出し時にキャッシュを生成する
		var before = ce._cache;
		ce.invalidate();
		ce.renderSelf(renderer);
		var after = ce._cache;
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

	it("renderSelf size validation", function () {
		var ce = new g.CacheableE({ scene: runtime.scene });
		var r = new mock.Renderer();

		ce.width = 100;
		ce.height = 200;
		ce.renderCache = function(r, c) {
		};
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
		var count = r.methodCallParamsHistory("drawImage").length;
		expect(count).toBe(2);
	});
});
