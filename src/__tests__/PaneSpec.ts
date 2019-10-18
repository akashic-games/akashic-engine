import { CommonRect, E, Pane, Sprite, SurfaceUtil } from "..";
import { customMatchers, EntityStateFlags, Renderer, Runtime, skeletonRuntime, Surface } from "./helpers";

expect.extend(customMatchers);

describe("test Pane", () => {
	let runtime: Runtime;

	beforeEach(() => {
		runtime = skeletonRuntime();
	});

	it("初期化 - ParameterObject", () => {
		const pane = new Pane({
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
		expect((pane._padding as CommonRect).top).toBe(3);
		expect((pane._padding as CommonRect).bottom).toBe(2);
		expect((pane._padding as CommonRect).left).toBe(1);
		expect((pane._padding as CommonRect).right).toBe(4);
		expect(pane._childrenSurface instanceof Surface).toBe(true);
		expect(pane._childrenRenderer instanceof Renderer).toBe(true);
		expect(pane._paddingChanged).toBe(false);
		expect(pane).toHaveUndefinedValue("_bgSurface", "_bgRenderer");
	});

	it("padding", () => {
		const game = runtime.game;
		const scene = runtime.scene;
		const surface = game.resourceFactory.createSurface(320, 320);
		game.renderers.push(surface.renderer());

		const pane = new Pane({
			scene: scene,
			width: 10,
			height: 20,
			padding: 3
		});
		scene.append(pane);
		expect(pane.padding).toBe(3);
		pane.padding = 5;
		pane.modified();
		expect(pane.padding).toBe(5);
	});

	it("convert ImageAsset to Surface", () => {
		const imageAsset = runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", 480, 480);
		const pane = new Pane({
			scene: runtime.scene,
			width: 10,
			height: 20,
			padding: { top: 3, left: 1, right: 4, bottom: 2 },
			backgroundImage: imageAsset
		});
		expect(pane.backgroundImage).toEqual(SurfaceUtil.asSurface(imageAsset));
	});

	it("modified", () => {
		const game = runtime.game;
		const scene = runtime.scene;
		const surface = game.resourceFactory.createSurface(320, 320);
		game.renderers.push(surface.renderer());

		const pane = new Pane({
			scene: scene,
			width: 10,
			height: 20,
			padding: 3
		});
		const child = new E({ scene: scene });
		const grandChild = new E({ scene: scene });
		scene.append(pane);
		pane.append(child);
		child.append(grandChild);
		expect(pane.state & EntityStateFlags.Cached).toBe(0);

		// リセット
		game.render();
		expect(pane.state & EntityStateFlags.Cached).toBe(EntityStateFlags.Cached);
		// Pane#modified() を直接呼ぶと Cached は落ちない
		pane.modified();
		expect(pane.state & EntityStateFlags.Cached).toBe(EntityStateFlags.Cached);

		// リセット
		game.render();
		expect(pane.state & EntityStateFlags.Cached).toBe(EntityStateFlags.Cached);
		// 子の E#modified() から間接的に呼ぶと Cached は落ちる
		child.modified();
		expect(pane.state & EntityStateFlags.Cached).toBe(0);

		// リセット
		game.render();
		expect(pane.state & EntityStateFlags.Cached).toBe(EntityStateFlags.Cached);
		// 孫から呼んでも立つ
		grandChild.modified();
		expect(pane.state & EntityStateFlags.Cached).toBe(0);
	});

	it("shouldFindChildrenByPoint", () => {
		const pane = new Pane({
			scene: runtime.scene,
			width: 10,
			height: 20,
			padding: { top: 3, left: 1, right: 4, bottom: 2 }
		});
		let result = pane.shouldFindChildrenByPoint({ x: 1, y: 3 });
		expect(result).toBe(false);
		result = pane.shouldFindChildrenByPoint({ x: 2, y: 3 });
		expect(result).toBe(false);
		result = pane.shouldFindChildrenByPoint({ x: 2, y: 4 });
		expect(result).toBe(true);
		result = pane.shouldFindChildrenByPoint({ x: 2, y: 17 });
		expect(result).toBe(true);
		result = pane.shouldFindChildrenByPoint({ x: 2, y: 18 });
		expect(result).toBe(false);
		result = pane.shouldFindChildrenByPoint({ x: 5, y: 4 });
		expect(result).toBe(true);
		result = pane.shouldFindChildrenByPoint({ x: 6, y: 4 });
		expect(result).toBe(false);
	});

	it("render", () => {
		// no backgroundImage
		let pane = new Pane({
			scene: runtime.scene,
			width: 10,
			height: 20,
			padding: { top: 3, left: 1, right: 4, bottom: 2 }
		});
		const r = new Renderer();
		pane.invalidate();
		pane.render(r);
		let renderer = pane._renderer as Renderer;
		expect(renderer.methodCallParamsHistory("drawImage").length).toBe(1);
		renderer.clearMethodCallHistory();

		const imageAsset = runtime.game.resourceFactory.createImageAsset(null, null, 200, 200);

		// given backgroundImage
		pane = new Pane({
			scene: runtime.scene,
			width: 10,
			height: 20,
			padding: { top: 3, left: 1, right: 4, bottom: 2 },
			backgroundImage: imageAsset
		});
		pane.invalidate();
		pane.render(r);
		renderer = pane._renderer as Renderer;
		expect(renderer.methodCallParamsHistory("drawImage").length).toBe(2); // + draw background imageAsset
		renderer.clearMethodCallHistory();

		pane.width = 0;
		pane.height = 0;
		pane.invalidate();
		pane.render(r);
		expect(renderer.methodCallParamsHistory("drawImage").length).toBe(0);
		renderer.clearMethodCallHistory();
	});

	it("render - validation", () => {
		const pane = new Pane({
			scene: runtime.scene,
			width: 10,
			height: 20,
			padding: { top: 10, left: 5, right: 5, bottom: 10 }
		});
		const r = new Renderer();
		pane.invalidate();
		pane.render(r);
		const renderer = pane._renderer as Renderer;
		expect(renderer.methodCallParamsHistory("drawImage").length).toBe(0);
		renderer.clearMethodCallHistory();
	});

	it("calculateBoundingRect", () => {
		const pane = new Pane({
			scene: runtime.scene,
			width: 50,
			height: 50
		});
		const imageAsset = runtime.game.resourceFactory.createImageAsset("testId", "testAssetPath", 32, 32);
		const child = new Sprite({
			scene: runtime.scene,
			width: 32,
			height: 32,
			src: imageAsset
		});
		child.x = 100;
		pane.append(child);
		expect(pane.calculateBoundingRect()).toEqual({
			left: 0,
			right: 50,
			top: 0,
			bottom: 50
		});
	});
});
