var g = require("../lib/main.node.js");
var mock = require("./helpers/mock");
describe("test Pane", function () {
	var runtime;
	var mock = require("./helpers/mock");
	var skeletonRuntime = require("./helpers/skeleton");

	beforeEach(function () {
		jasmine.addMatchers(require("./helpers/customMatchers"));
		runtime = skeletonRuntime();
	});
	afterEach(function () {
	});

	it("初期化", function () {
		// deprecatedなコンストラクタの動作確認を行う
		runtime.game.suppressedLogLevel = g.LogLevel.Debug;
		var pane = new g.Pane(runtime.scene, 10, 20, undefined, 3);
		expect(pane.width).toBe(10);
		expect(pane.height).toBe(20);
		expect(pane._oldWidth).toBe(10);
		expect(pane._oldHeight).toBe(20);
		expect(pane).toHaveUndefinedValue("backgroundImage", "backgroundEffector");
		expect(pane._padding).toBe(3);
		expect(pane._childrenSurface instanceof g.Surface).toBe(true);
		expect(pane._childrenRenderer instanceof g.Renderer).toBe(true);
		expect(pane._paddingChanged).toBe(false);
		expect(pane).toHaveUndefinedValue("_bgSurface", "_bgRenderer");
		runtime.game.suppressedLogLevel = undefined;
	});

	it("初期化 - ParameterObject", function () {
		var pane = new g.Pane({
			scene: runtime.scene,
			width: 10,
			height: 20,
			padding: { top: 3, left: 1, right: 4, bottom: 2 }
		});
		expect(pane.width).toBe(10);
		expect(pane.height).toBe(20);
		expect(pane._oldWidth).toBe(10);
		expect(pane._oldHeight).toBe(20);
		expect(pane).toHaveUndefinedValue("backgroundImage", "backgroundEffector");
		expect(pane._padding.top).toBe(3);
		expect(pane._padding.bottom).toBe(2);
		expect(pane._padding.left).toBe(1);
		expect(pane._padding.right).toBe(4);
		expect(pane._childrenSurface instanceof g.Surface).toBe(true);
		expect(pane._childrenRenderer instanceof g.Renderer).toBe(true);
		expect(pane._paddingChanged).toBe(false);
		expect(pane).toHaveUndefinedValue("_bgSurface", "_bgRenderer");
	});

	it("padding", function () {
		var game = runtime.game;
		var scene = runtime.scene;
		var surface = game.resourceFactory.createSurface(320, 320);
		game.renderers.push(surface.renderer());

		var pane = new g.Pane({
			scene: scene,
			width: 10,
			height:20,
			padding: 3
		});
		scene.append(pane);
		expect(pane.padding).toBe(3);
		pane.padding = 5;
		pane.modified();
		expect(pane.padding).toBe(5);
	});

	it("convert ImageAsset to Surface", function () {
		var imageAsset = runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", 480, 480);
		var pane = new g.Pane({
			scene: runtime.scene,
			width: 10,
			height: 20,
			padding: { top: 3, left: 1, right: 4, bottom: 2 },
			backgroundImage: imageAsset
		});
		expect(pane.backgroundImage).toEqual(g.Util.asSurface(imageAsset));
	});

	it("modified", function () {
		var game = runtime.game;
		var scene = runtime.scene;
		var surface = game.resourceFactory.createSurface(320, 320);
		game.renderers.push(surface.renderer());

		var pane = new g.Pane({
			scene: scene,
			width: 10,
			height: 20,
			padding: 3
		});
		var child = new g.E({scene: scene});
		var grandChild = new g.E({scene: scene});
		scene.append(pane);
		pane.append(child);
		child.append(grandChild);
		expect(pane.state & mock.EntityStateFlags.Cached).toBe(0);

		// リセット
		game.render();
		expect(pane.state & mock.EntityStateFlags.Cached).toBe(mock.EntityStateFlags.Cached);
		// Pane#modified() を直接呼ぶと Cached は落ちない
		pane.modified();
		expect(pane.state & mock.EntityStateFlags.Cached).toBe(mock.EntityStateFlags.Cached);

		// リセット
		game.render();
		expect(pane.state & mock.EntityStateFlags.Cached).toBe(mock.EntityStateFlags.Cached);
		// 子の E#modified() から間接的に呼ぶと Cached は落ちる
		child.modified();
		expect(pane.state & mock.EntityStateFlags.Cached).toBe(0);

		// リセット
		game.render();
		expect(pane.state & mock.EntityStateFlags.Cached).toBe(mock.EntityStateFlags.Cached);
		// 孫から呼んでも立つ
		grandChild.modified();
		expect(pane.state & mock.EntityStateFlags.Cached).toBe(0);
	});

	it("shouldFindChildrenByPoint", function () {
		var pane = new g.Pane({
			scene: runtime.scene,
			width: 10,
			height: 20,
			padding: { top: 3, left: 1, right: 4, bottom: 2 }
		});
		var result = pane.shouldFindChildrenByPoint({x: 1, y: 3});
		expect(result).toBe(false);
		result = pane.shouldFindChildrenByPoint({x: 2, y: 3});
		expect(result).toBe(false);
		result = pane.shouldFindChildrenByPoint({x: 2, y: 4});
		expect(result).toBe(true);
		result = pane.shouldFindChildrenByPoint({x: 2, y: 17});
		expect(result).toBe(true);
		result = pane.shouldFindChildrenByPoint({x: 2, y: 18});
		expect(result).toBe(false);
		result = pane.shouldFindChildrenByPoint({x: 5, y: 4});
		expect(result).toBe(true);
		result = pane.shouldFindChildrenByPoint({x: 6, y: 4});
		expect(result).toBe(false);
	});

	it("render", function() {
		// no backgroundImage
		var pane = new g.Pane({
			scene: runtime.scene,
			width: 10,
			height: 20,
			padding: { top: 3, left: 1, right: 4, bottom: 2 }
		});
		var r = new mock.Renderer();
		pane.invalidate();
		pane.render(r);
		expect(
			pane._renderer.methodCallParamsHistory("drawImage").length
		).toBe(1);
		pane._renderer.clearMethodCallHistory();

		var imageAsset = runtime.game.resourceFactory.createImageAsset(null, null, 200, 200);

		// given backgroundImage
		pane = new g.Pane({
			scene: runtime.scene,
			width: 10,
			height: 20,
			padding: { top: 3, left: 1, right: 4, bottom: 2 },
			backgroundImage: imageAsset
		});
		pane.invalidate();
		pane.render(r);
		expect(
			pane._renderer.methodCallParamsHistory("drawImage").length
		).toBe(2); // + draw background imageAsset
		pane._renderer.clearMethodCallHistory();

		pane.width = 0;
		pane.height = 0;
		pane.invalidate();
		pane.render(r);
		expect(
			pane._renderer.methodCallParamsHistory("drawImage").length
		).toBe(0);
		pane._renderer.clearMethodCallHistory();
	});

	it("render - validation", function() {
		var pane = new g.Pane({
			scene: runtime.scene,
			width: 10,
			height: 20,
			padding: { top: 10, left: 5, right: 5, bottom:10 }
		});
		var r = new mock.Renderer();
		pane.invalidate();
		pane.render(r);
		expect(
			pane._renderer.methodCallParamsHistory("drawImage").length
		).toBe(0);
		pane._renderer.clearMethodCallHistory();
	});
    
	it("calculateBoundingRect", function() {
		var pane = new g.Pane({
			scene: runtime.scene,
			width: 50,
			height: 50
		});
		var imageAsset = runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", 32, 32);
		var child = new g.Sprite({
			scene: runtime.scene,
			width: 32,
			height: 32,
			src: imageAsset
		});
		child.x = 100;
		pane.append(child);
		expect(
			pane.calculateBoundingRect()
		).toEqual({
			left: 0,
			right: 50,
			top: 0,
			bottom: 50
		});
	});
});
