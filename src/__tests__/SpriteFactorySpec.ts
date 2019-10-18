import { E, Sprite, SpriteFactory } from "..";
import { skeletonRuntime } from "./helpers";

describe("test SpriteFactory", () => {
	it("createSpriteFromE", () => {
		const runtime = skeletonRuntime();
		const scene = runtime.scene;
		const e = new E({ scene: scene });
		e.width = 100;
		e.height = 50;
		e.opacity = 0.5;
		scene.append(e);

		const sp = SpriteFactory.createSpriteFromE(scene, e);
		expect(sp instanceof Sprite).toBe(true);
		expect(sp.width).toBe(100);
		expect(sp.height).toBe(50);
	});

	it("createSpriteFromE with children", () => {
		const runtime = skeletonRuntime();
		const scene = runtime.scene;
		const e = new E({ scene: scene });

		const oldModified = e.modified;
		let modifiedCounter = 0;
		e.modified = () => {
			++modifiedCounter;
			oldModified.call(e);
		};

		e.width = 100;
		e.height = 50;
		e.opacity = 0.5;
		scene.append(e);

		const e2 = new E({ scene: scene });
		e2.width = 200;
		e2.height = 100;
		e2.opacity = 0.1;
		e2.scale(2);
		scene.append(e2);

		e.append(e2);

		const modCount = modifiedCounter;
		const sp = SpriteFactory.createSpriteFromE(scene, e);
		expect(sp instanceof Sprite).toBe(true);
		expect(sp.width).toBe(400);
		expect(sp.height).toBe(200);
		expect(modifiedCounter).toBe(modCount); // createSpriteFromE() は modified() しない
	});

	it("createSpriteFromE with hide", () => {
		const runtime = skeletonRuntime();
		const scene = runtime.scene;
		const e = new E({ scene: scene });
		e.width = 100;
		e.height = 50;
		scene.append(e);

		const e2 = new E({ scene: scene });
		e2.width = 200;
		e2.height = 100;
		e2.hide();
		scene.append(e2);

		e.append(e2);

		const sp = SpriteFactory.createSpriteFromE(scene, e);
		expect(sp instanceof Sprite).toBe(true);
		expect(sp.width).toBe(100);
		expect(sp.height).toBe(50);

		e2.show();
		const sp2 = SpriteFactory.createSpriteFromE(scene, e);
		expect(sp2 instanceof Sprite).toBe(true);
		expect(sp2.width).toBe(200);
		expect(sp2.height).toBe(100);
	});

	it("createSpriteFromScene", () => {
		const runtime = skeletonRuntime();
		const scene = runtime.scene;
		const sp = SpriteFactory.createSpriteFromScene(scene, scene);
		expect(sp instanceof Sprite).toBe(true);
		expect(sp.width).toBe(runtime.game.width);
		expect(sp.height).toBe(runtime.game.height);

		const sceneHasChild = runtime.scene;
		sceneHasChild.append(sp);
		const spHasChild = SpriteFactory.createSpriteFromScene(sceneHasChild, scene);
		expect(spHasChild instanceof Sprite).toBe(true);
		expect(spHasChild.width).toBe(runtime.game.width);
		expect(spHasChild.height).toBe(runtime.game.height);
	});
});
