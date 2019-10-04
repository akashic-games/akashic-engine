import {
	BitmapFont,
	Scene,
	E,
	Sprite,
	FrameSprite,
	Label,
	Pane,
	FilledRect,
	SystemLabel,
	NinePatchSurfaceEffector,
	SpriteFactory
} from "..";
import { ImageAsset, Surface, Renderer, skeletonRuntime, Runtime } from "./helpers";

describe("test Destroy", () => {
	let runtime: Runtime;
	let bmpfont: BitmapFont;
	let imageAsset: ImageAsset;

	function createEntities(scene: Scene): E[] {
		const entities = [
			new E({ scene: scene, width: 16, height: 16 }),
			new Sprite({
				scene: scene,
				src: new Surface(480, 480),
				width: 32,
				height: 48,
				srcWidth: 32,
				srcHeight: 48
			}),
			new FrameSprite({
				scene: scene,
				src: new Surface(480, 480),
				width: 32,
				height: 48,
				srcWidth: 32,
				srcHeight: 48
			}),
			new Label({ scene: scene, text: " ", font: bmpfont, fontSize: 13 }),
			new Pane({
				scene: scene,
				width: 480,
				height: 48,
				backgroundImage: imageAsset,
				backgroundEffector: new NinePatchSurfaceEffector(runtime.game)
			}),
			new FilledRect({ scene: scene, cssColor: "red", width: 32, height: 32 }),
			new SystemLabel({
				scene: scene,
				fontSize: 13,
				text: " ",
				textColor: "red"
			})
		];
		entities.push(SpriteFactory.createSpriteFromScene(scene, scene));
		entities.push(SpriteFactory.createSpriteFromE(scene, entities[0]));
		return entities;
	}

	beforeEach(() => {
		runtime = skeletonRuntime();
		const map = { "32": { x: 0, y: 1 } };
		const missingGlyph = { x: 2, y: 3 };
		bmpfont = new BitmapFont({
			src: new Surface(480, 480),
			map: map,
			defaultGlyphWidth: 12,
			defaultGlyphHeight: 12,
			missingGlyph: missingGlyph
		});
		imageAsset = runtime.game.resourceFactory.createImageAsset(null, null, 200, 200) as ImageAsset;
	});

	it("auto destroy", () => {
		const scene = runtime.scene;
		const entities = createEntities(scene);
		const r = new Renderer();
		entities.forEach(e => {
			if ((e as any).invalidate) (e as any).invalidate();
			else e.modified();
			scene.append(e);
		});
		entities.forEach(e => {
			e.render(r);
		});

		// 参照保持処理
		// Sprite
		(entities[1] as any).__surface = (entities[1] as any).surface;
		// FrameSprite
		(entities[2] as any).__surface = (entities[2] as any).surface;
		// Label
		(entities[3] as any).__cache = (entities[3] as any)._cache;
		// Pane
		(entities[4] as any).__cache = (entities[4] as any)._cache;
		(entities[4] as any).__bgSurface = (entities[4] as any)._bgSurface;
		(entities[4] as any).__childrenSurface = (entities[4] as any)._childrenSurface;

		scene.destroy();
		entities.forEach(e => {
			expect(e.destroyed()).toBe(true);
		});
		// Sprite
		expect((entities[1] as any).surface).toBeUndefined();
		expect((entities[1] as any).__surface.destroyed()).toBe(false);
		(entities[1] as any).__surface.destroy();
		expect((entities[1] as any).__surface.destroyed()).toBe(true);
		// FrameSprite
		expect((entities[2] as any).surface).toBeUndefined();
		expect((entities[2] as any).__surface.destroyed()).toBe(false);
		(entities[2] as any).__surface.destroy();
		expect((entities[2] as any).__surface.destroyed()).toBe(true);
		// Label
		expect((entities[3] as any)._cache).toBeUndefined();
		expect((entities[3] as any).__cache.destroyed()).toBe(true);
		// Pane
		expect((entities[4] as any)._cache).toBeUndefined();
		expect((entities[4] as any).__cache.destroyed()).toBe(true);
		expect((entities[4] as any)._bgSurface).toBeUndefined();
		expect((entities[4] as any).__bgSurface.destroyed()).toBe(true);
		expect((entities[4] as any)._childrenSurface).toBeUndefined();
		expect((entities[4] as any).__childrenSurface.destroyed()).toBe(true);
		// BitmapFontは自動破棄されない
		expect(bmpfont.destroyed()).toBe(false);
		bmpfont.destroy();
		expect(bmpfont.destroyed()).toBe(true);

		expect(scene.destroyed()).toBe(true);
	});

	it("destroy surface", () => {
		const scene = runtime.scene;
		const entities = createEntities(scene);
		const r = new Renderer();
		entities.forEach(e => {
			if ((e as any).invalidate) (e as any).invalidate();
			else e.modified();
			scene.append(e);
		});
		entities.forEach(e => {
			e.render(r);
		});

		function destroyAndCheckProp(e: any, propName: string): void {
			const tmp = e[propName];
			expect(e[propName].destroyed()).toBe(false);
			e.destroy(true);
			expect(e[propName]).toBeUndefined();
			expect(tmp.destroyed()).toBe(true);
		}
		destroyAndCheckProp(entities[1], "surface"); // Sprite
		destroyAndCheckProp(entities[2], "surface"); // FrameSprite
	});

	it("Sprite1つの破棄で複数Spriteが破壊される", () => {
		const scene = runtime.scene;
		const surface = new Surface(480, 480);
		const entities = [
			new Sprite({
				scene: scene,
				src: surface,
				width: 32,
				height: 48,
				srcWidth: 32,
				srcHeight: 48
			}),
			new Sprite({
				scene: scene,
				src: surface,
				width: 32,
				height: 48,
				srcWidth: 32,
				srcHeight: 48
			}),
			new Sprite({
				scene: scene,
				src: surface,
				width: 32,
				height: 48,
				srcWidth: 32,
				srcHeight: 48
			})
		];
		const r = new Renderer();
		entities.forEach(e => {
			scene.append(e);
			e.modified();
		});
		entities.forEach(e => {
			e.render(r);
		});
		entities[0].destroy(true);
		entities.forEach(e => {
			// entities[1]と[2]のSpriteは壊れているが、destroy扱いにはならない
			expect(e.destroyed()).toBe(e === entities[0]);
			// surfaceのみ破壊されている。（本来あってはいけない状態）
			if (e === entities[0]) {
				expect(e.surface).toBeUndefined();
			} else {
				expect(e.surface.destroyed()).toBe(true);
			}
		});
	});

	it("Scene#destroyでもSurfaceは暗黙破棄されず、明示的に破棄する必要がある", () => {
		const scene = runtime.scene;
		const surface = new Surface(480, 480);
		const entities = [
			new Sprite({
				scene: scene,
				src: surface,
				width: 32,
				height: 48,
				srcWidth: 32,
				srcHeight: 48
			}),
			new Sprite({
				scene: scene,
				src: surface,
				width: 32,
				height: 48,
				srcWidth: 32,
				srcHeight: 48
			}),
			new Sprite({
				scene: scene,
				src: surface,
				width: 32,
				height: 48,
				srcWidth: 32,
				srcHeight: 48
			})
		];
		const r = new Renderer();
		entities.forEach(e => {
			scene.append(e);
		});
		entities.forEach(e => {
			e.render(r);
		});
		scene.destroy();
		entities.forEach(e => {
			expect(e.destroyed()).toBe(true);
			expect(e.surface).toBeUndefined();
		});
		expect(surface.destroyed()).toBe(false);
		surface.destroy();
		expect(surface.destroyed()).toBe(true);
		expect(scene.destroyed()).toBe(true);
	});
});
