describe("test Util", function() {
	var g = require('../lib/main.node.js');
	var mock = require("./helpers/mock");
	var skeletonRuntime = require("./helpers/skeleton");

	beforeEach(function() {
	});

	afterEach(function() {
	});

	it("distance = 0", function() {
		expect(g.Util.distance(0, 0, 0, 0).toFixed(2)).toEqual('0.00');
		expect(g.Util.distance(100, 100, 100, 100).toFixed(2)).toEqual('0.00');
		expect(g.Util.distance(-100, -100, -100, -100).toFixed(2)).toEqual('0.00');
		expect(g.Util.distanceBetweenOffsets({x: -100, y: -100}, {x: -100, y: -100}).toFixed(2)).toEqual('0.00');
		expect(g.Util.distanceBetweenOffsets({x: 100, y: 100}, {x: 100, y: 100}).toFixed(2)).toEqual('0.00');
		expect(g.Util.distanceBetweenOffsets({x: -100, y: -100}, {x: -100, y: -100}).toFixed(2)).toEqual('0.00');
	});

	it("distance = 1", function() {
		expect(g.Util.distance(-1, -1, 0, -1).toFixed(2)).toEqual('1.00');
		expect(g.Util.distance(-1, -1, -1, 0).toFixed(2)).toEqual('1.00');
		expect(g.Util.distance(0, 0, 0, -1).toFixed(2)).toEqual('1.00');
		expect(g.Util.distance(0, 0, -1, 0).toFixed(2)).toEqual('1.00');
		expect(g.Util.distanceBetweenOffsets({x: -1, y: -1}, {x: 0, y: -1}).toFixed(2)).toEqual('1.00');
		expect(g.Util.distanceBetweenOffsets({x: -1, y: -1}, {x: -1, y: 0}).toFixed(2)).toEqual('1.00');
		expect(g.Util.distanceBetweenOffsets({x: 0, y: 0}, {x: 0, y: -1}).toFixed(2)).toEqual('1.00');
		expect(g.Util.distanceBetweenOffsets({x: 0, y: 0}, {x: -1, y: 0}).toFixed(2)).toEqual('1.00');
	});

	it("distance = sqrt(2)", function() {
		expect(g.Util.distance(2, 2, 1, 1).toFixed(2)).toEqual('1.41');
		expect(g.Util.distance(-1, -1, -2, -2).toFixed(2)).toEqual('1.41');
		expect(g.Util.distance(1, 1, 2, 2).toFixed(2)).toEqual('1.41');
		expect(g.Util.distance(-2, -2, -1, -1).toFixed(2)).toEqual('1.41');
		expect(g.Util.distanceBetweenOffsets({x: 2, y: 2}, {x: 1, y: 1}).toFixed(2)).toEqual('1.41');
		expect(g.Util.distanceBetweenOffsets({x: -1, y: -1}, {x: -2, y: -2}).toFixed(2)).toEqual('1.41');
		expect(g.Util.distanceBetweenOffsets({x: 1, y: 1}, {x: 2, y: 2}).toFixed(2)).toEqual('1.41');
		expect(g.Util.distanceBetweenOffsets({x: -2, y: -2}, {x: -1, y: -1}).toFixed(2)).toEqual('1.41');
	});

	it("distance = 0.5", function() {
		expect(g.Util.distance(0.5, 0.5, 1.0, 0.5).toFixed(2)).toEqual('0.50');
		expect(g.Util.distance(0.25, 0.25, 0.75, 0.25).toFixed(2)).toEqual('0.50');
		expect(g.Util.distance(-0.5, 0.5, -1.0, 0.5).toFixed(2)).toEqual('0.50');
		expect(g.Util.distance(0.25, 0.25, 0.25, -0.25).toFixed(2)).toEqual('0.50');
		expect(g.Util.distanceBetweenOffsets({x: 0.5, y: 0.5}, {x: 1.0, y: 0.5}).toFixed(2)).toEqual('0.50');
		expect(g.Util.distanceBetweenOffsets({x: 0.25, y: 0.25}, {x: 0.75, y: 0.25}).toFixed(2)).toEqual('0.50');
		expect(g.Util.distanceBetweenOffsets({x: -0.5, y: 0.5}, {x: -1.0, y: 0.5}).toFixed(2)).toEqual('0.50');
		expect(g.Util.distanceBetweenOffsets({x: 0.25, y: 0.25}, {x: 0.25, y: -0.25}).toFixed(2)).toEqual('0.50');
	});

	it("distanceBetweenAreas", function() {
		var area1 = {x: 2, y: 2, width: 2, height: 2}; // center: (3, 3)
		var area2 = {x: 3, y: 5, width: 2, height: 4}; // center: (4, 7)
		var area3 = {x: -4, y: 3, width: 7, height: -4}; // center: (-0.5, 1)
		expect(g.Util.distanceBetweenAreas(area1, area2).toFixed(2)).toEqual(Math.sqrt(Math.pow(4 - 3, 2) + Math.pow(7 - 3, 2)).toFixed(2));
		expect(g.Util.distanceBetweenAreas(area1, area3).toFixed(2)).toEqual(Math.sqrt(Math.pow(-0.5 - 3, 2) + Math.pow(1 - 3, 2)).toFixed(2));
	});

	it("findAssetByPathAsFile", function () {
		var game = new mock.Game({ width: 320, height: 320 });
		var liveAssetPathTable = {
			"foo/bar.js": game.resourceFactory.createScriptAsset("bar", "/foo/bar.js"),
			"zoo.js": game.resourceFactory.createScriptAsset("zoo", "/zoo.js"),
		};
		expect(g.Util.findAssetByPathAsFile("foo/bar.js", liveAssetPathTable)).toBe(liveAssetPathTable["foo/bar.js"]);
		expect(g.Util.findAssetByPathAsFile("foo/bar", liveAssetPathTable)).toBe(liveAssetPathTable["foo/bar.js"]);
		expect(g.Util.findAssetByPathAsFile("zoo", liveAssetPathTable)).toBe(liveAssetPathTable["zoo.js"]);
		expect(g.Util.findAssetByPathAsFile("zoo/roo.js", liveAssetPathTable)).toBe(undefined);
	});

	it("findAssetByPathDirectory", function (done) {
		var game = new mock.Game({ width: 320, height: 320 });
		var pkgJsonAsset = game.resourceFactory.createTextAsset("foopackagejson", "foo/package.json");
		var liveAssetPathTable = {
			"foo/root.js": game.resourceFactory.createScriptAsset("root", "/foo/root.js"),
			"foo/package.json": pkgJsonAsset,
			"foo/index.js": game.resourceFactory.createScriptAsset("fooindex", "/foo/index.js"),
			"bar/index.js": game.resourceFactory.createScriptAsset("barindex", "/bar/index.js"),
			"zoo/roo/notMain.js": game.resourceFactory.createScriptAsset("zooRooNotMain", "/zoo/roo/notMain.js"),
		};
		game.resourceFactory.scriptContents = {
			"foo/package.json": '{ "main": "root.js" }',
		};
		pkgJsonAsset._load({
			_onAssetError: function (e) { throw e; },
			_onAssetLoad: function (a) {
				try {
					expect(g.Util.findAssetByPathAsDirectory("foo", liveAssetPathTable)).toBe(liveAssetPathTable["foo/root.js"]);
					expect(g.Util.findAssetByPathAsDirectory("bar", liveAssetPathTable)).toBe(liveAssetPathTable["bar/index.js"]);
					expect(g.Util.findAssetByPathAsDirectory("zoo/roo", liveAssetPathTable)).toBe(undefined);
					expect(g.Util.findAssetByPathAsDirectory("tee", liveAssetPathTable)).toBe(undefined);
				} finally {
					done();
				}
			}
		});
	});

	it("createSpriteFromE", function () {
		var runtime = skeletonRuntime();
		var scene = runtime.scene;
		var e = new g.E({scene: scene});
		e.width = 100;
		e.height = 50;
		e.opacity = 0.5;
		scene.append(e);

		var sp = g.Util.createSpriteFromE(scene, e);
		expect(sp instanceof g.Sprite).toBe(true);
		expect(sp.width).toBe(100);
		expect(sp.height).toBe(50);
	});

	it("createSpriteFromE with children", function () {
		var runtime = skeletonRuntime();
		var scene = runtime.scene;
		var e = new g.E({scene: scene});

		var oldModified = e.modified;
		var modifiedCounter = 0;
		e.modified = function() {
			++modifiedCounter;
			oldModified.call(e);
		}

		e.width = 100;
		e.height = 50;
		e.opacity = 0.5;
		scene.append(e);

		var e2 = new g.E({scene: scene});
		e2.width = 200;
		e2.height = 100;
		e2.opacity = 0.1;
		e2.scale(2);
		scene.append(e2);

		e.append(e2);

		var modCount = modifiedCounter;
		var sp = g.Util.createSpriteFromE(scene, e);
		expect(sp instanceof g.Sprite).toBe(true);
		expect(sp.width).toBe(400);
		expect(sp.height).toBe(200);
		expect(modifiedCounter).toBe(modCount);  // createSpriteFromE() は modified() しない
	});

	it("createSpriteFromE with hide", function () {
		var runtime = skeletonRuntime();
		var scene = runtime.scene;
		var e = new g.E({scene: scene});
		e.width = 100;
		e.height = 50;
		scene.append(e);

		var e2 = new g.E({scene: scene});
		e2.width = 200;
		e2.height = 100;
		e2.hide();
		scene.append(e2);

		e.append(e2);

		var sp = g.Util.createSpriteFromE(scene, e);
		expect(sp instanceof g.Sprite).toBe(true);
		expect(sp.width).toBe(100);
		expect(sp.height).toBe(50);

		e2.show();
		var sp2 = g.Util.createSpriteFromE(scene, e);
		expect(sp2 instanceof g.Sprite).toBe(true);
		expect(sp2.width).toBe(200);
		expect(sp2.height).toBe(100);
	});

	it("createSpriteFromScene", function () {
		var runtime = skeletonRuntime();
		var scene = runtime.scene;
		var sp = g.Util.createSpriteFromScene(scene, scene);
		expect(sp instanceof g.Sprite).toBe(true);
		expect(sp.width).toBe(runtime.game.width);
		expect(sp.height).toBe(runtime.game.height);

		var sceneHasChild = runtime.scene;
		sceneHasChild.append(sp);
		var spHasChild = g.Util.createSpriteFromScene(sceneHasChild, scene);
		expect(spHasChild instanceof g.Sprite).toBe(true);
		expect(spHasChild.width).toBe(runtime.game.width);
		expect(spHasChild.height).toBe(runtime.game.height);
	});

	it("asSurface", function(done) {
		var runtime = skeletonRuntime();
		var scene = runtime.scene;
		var surface = new mock.Surface(1, 1);
		expect(g.Util.asSurface(surface)).toBe(surface);

		var undefinedScene = false;
		expect(g.Util.asSurface(undefinedScene)).toBe(false);

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
					height: 1,
				}
			}
		});

		game._loaded.add(function () {
			expect(g.Util.asSurface(game.assets.foo)).toEqual(game.assets.foo.asSurface());
			done();
		});
		game._startLoadingGlobalAssets();

		jasmine.addMatchers(require("./helpers/customMatchers"));
		expect(function () { g.Util.asSurface(scene); }).toThrowError("TypeMismatchError");
	});
});
