describe("test SurfaceUtil", function() {
	var g = require('../lib/');
	var mock = require('./helpers/mock');

	beforeEach(function() {
	});

	afterEach(function() {
	});

	it("asSurface", function(done) {
		var runtime = skeletonRuntime();
		var scene = runtime.scene;
		var surface = new mock.Surface(1, 1);
		expect(g.SurfaceUtil.asSurface(surface)).toBe(surface);

		var undefinedScene = false;
		expect(g.SurfaceUtil.asSurface(undefinedScene)).toBe(false);

		var game = new mock.Game({
			width: 320,
			height: 270,
			assets: {
				foo: {
					type: "image",
					path: "/dummypath.png",
					virtualPath: "dummypath.png",
					global: true,
					width: 1,
					height: 1
				}
			}
		});

		game._loaded.add(function () {
			expect(g.SurfaceUtil.asSurface(game.assets.foo)).toEqual(game.assets.foo.asSurface());
			done();
		});
		game._startLoadingGlobalAssets();

		jasmine.addMatchers(require("./helpers/customMatchers"));
		expect(function () { g.SurfaceUtil.asSurface(scene); }).toThrowError("TypeMismatchError");
	});
});
