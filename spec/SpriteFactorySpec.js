describe("SpriteFactory", function() {
	var g = require('../lib/main.node.js');
	it("createSpriteFromE", function () {
		var runtime = skeletonRuntime();
		var scene = runtime.scene;
		var e = new g.E({scene: scene});
		e.width = 100;
		e.height = 50;
		e.opacity = 0.5;
		scene.append(e);

		var sp = g.SpriteFactory.createSpriteFromE(scene, e);
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
		};

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
		var sp = g.SpriteFactory.createSpriteFromE(scene, e);
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

		var sp = g.SpriteFactory.createSpriteFromE(scene, e);
		expect(sp instanceof g.Sprite).toBe(true);
		expect(sp.width).toBe(100);
		expect(sp.height).toBe(50);

		e2.show();
		var sp2 = g.SpriteFactory.createSpriteFromE(scene, e);
		expect(sp2 instanceof g.Sprite).toBe(true);
		expect(sp2.width).toBe(200);
		expect(sp2.height).toBe(100);
	});

	it("createSpriteFromScene", function () {
		var runtime = skeletonRuntime();
		var scene = runtime.scene;
		var sp = g.SpriteFactory.createSpriteFromScene(scene, scene);
		expect(sp instanceof g.Sprite).toBe(true);
		expect(sp.width).toBe(runtime.game.width);
		expect(sp.height).toBe(runtime.game.height);

		var sceneHasChild = runtime.scene;
		sceneHasChild.append(sp);
		var spHasChild = g.SpriteFactory.createSpriteFromScene(sceneHasChild, scene);
		expect(spHasChild instanceof g.Sprite).toBe(true);
		expect(spHasChild.width).toBe(runtime.game.width);
		expect(spHasChild.height).toBe(runtime.game.height);
	});
});