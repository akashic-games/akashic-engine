describe("test Camera", function() {
	var g = require('../lib/main.node.js');
	var mock = require("./helpers/mock");
	var runtime, e;
	var skeletonRuntime = require("./helpers/skeleton");

	beforeEach(function() {
	});

	afterEach(function() {
	});

	it("初期化", function() {
		var game = new mock.Game({ width: 320, height: 320 });
		game.suppressedLogLevel = g.LogLevel.Debug;
		var cam = new g.Camera2D({ game: game });
		expect(cam.game).toBe(game);
		expect(cam.id).toBe(0);
		expect(cam.local).toBe(false);
		expect(cam.name).toBeUndefined();
		expect(cam.x).toBe(0);
		expect(cam.y).toBe(0);
		expect(cam.angle).toBe(0);
		expect(cam.width).toBe(320);
		expect(cam.height).toBe(320);
		expect(cam._modifiedCount).toBe(0);

		var cam = new g.Camera2D({
			game: game,
			name: "foo",
			x: 100,
			y: 10,
			angle: 4,
			width: 80,
			height: 70
		});
		expect(cam.game).toBe(game);
		expect(cam.id).toBe(1);
		expect(cam.local).toBe(false);
		expect(cam.name).toBe("foo");
		expect(cam.x).toBe(100);
		expect(cam.y).toBe(10);
		expect(cam.angle).toBe(4);
		expect(cam.width).toBe(320);  // width, height 指定は無視される
		expect(cam.height).toBe(320);
		expect(cam._modifiedCount).toBe(0);

		var cam2 = new g.Camera2D({
			game: game,
			local: true,
			name: "bar",
			x: 100,
			y: 10,
		});
		expect(cam2.game).toBe(game);
		expect(cam2.id).toBeUndefined();
		expect(cam2.local).toBe(true);
		expect(cam2.name).toBe("bar");
		expect(cam2.x).toBe(100);
		expect(cam2.y).toBe(10);
		expect(cam2.angle).toBe(0);
		expect(cam2.width).toBe(320);
		expect(cam2.height).toBe(320);
		expect(cam2._modifiedCount).toBe(0);
	});

	it("modified", function() {
		var game = new mock.Game({ width: 320, height: 320 });
		var cam = new g.Camera2D({game: game});

		game.modified = false;  // テストのためリセット
		expect(cam._modifiedCount).toBe(0);
		cam.modified();
		expect(cam._modifiedCount).toBe(1);
		expect(game.modified).toBe(true);
		var matrix = cam._matrix;
		cam.getMatrix();
		cam.modified();
		expect(cam._modifiedCount).toBe(2);
		expect(game.modified).toBe(true);
		expect(cam._matrix._modified).toBe(true);
		expect(cam._matrix).not.toEqual(matrix);
	});

	it("x, y, angle", function() {
		var game = new mock.Game({ width: 320, height: 240 });
		var cam = new g.Camera2D({game: game});
		var expected = new g.PlainMatrix();
		var mat;

		mat = cam.getMatrix();
		expect(mat._matrix).toEqual([1, 0, 0, 1, 0, 0]);

		cam.x = 10;
		cam.y = 100;
		cam.modified();
		mat = cam.getMatrix();
		expected.reset(-10, -100);  // カメラは x, y の逆方向のオフセットがかかる
		expect(mat._matrix).toEqual(expected._matrix);

		var angle = 10;
		cam.angle = angle;
		cam.modified();
		mat = cam.getMatrix();
		expected.updateByInverse(320, 240, 1, 1, 10, 10, 100);  // angle も逆方向に作用する
		expect(mat._matrix).toEqual(expected._matrix);
	});

	it("_applyTransformToRenderer", function() {
		var game = new mock.Game({ width: 320, height: 240 });
		var cam = new g.Camera2D({game: game});
		var surface = game.resourceFactory.createSurface(320, 240);
		var renderer = surface.renderer();

		cam.opacity = 0.5;
		cam.modified();
		renderer.clearMethodCallHistory();
		cam._applyTransformToRenderer(renderer);
		expect(renderer.methodCallHistory).toEqual(["translate", "opacity"]);
		expect(renderer.methodCallParamsHistory("translate")).toEqual([{ x: -0, y: -0 }]);
		expect(renderer.methodCallParamsHistory("opacity")).toEqual([{ opacity: 0.5 }]);

		cam.opacity = 1;
		cam.x = 10;
		cam.y = 100;
		cam.modified();
		renderer.clearMethodCallHistory();
		cam._applyTransformToRenderer(renderer);
		expect(renderer.methodCallHistory).toEqual(["translate"]);
		expect(renderer.methodCallParamsHistory("translate")).toEqual([{ x: -10, y: -100 }]);

		cam.angle = 10;
		cam.modified();
		renderer.clearMethodCallHistory();
		cam._applyTransformToRenderer(renderer);
		expect(renderer.methodCallHistory).toEqual(["transform"]);
		var mat = new g.PlainMatrix();
		mat.updateByInverse(320, 240, 1, 1, 10, 10, 100);  // angle も逆方向に作用する
		expect(cam.getMatrix()._matrix).toEqual(mat._matrix);
		expect(renderer.methodCallParamsHistory("transform")).toEqual([{ matrix: mat._matrix }]);
	});

	it("serialize", function() {
		var game = new mock.Game({ width: 320, height: 240 });

		var cam = new g.Camera2D({
			game: game,
			x: 32,
			y: 15,
			angle: 3,
			name: "mycamera1",
		});
		var ser = cam.serialize();

		var cam2 = g.Camera2D.deserialize(ser, game);
		expect(cam2.game).toBe(game);
		expect(cam2.x).toBe(32);
		expect(cam2.y).toBe(15);
		expect(cam2.angle).toBe(3);
		expect(cam2.scaleX).toBe(1);
		expect(cam2.scaleY).toBe(1);
		expect(cam2.opacity).toBe(1);
		expect(cam2.name).toBe("mycamera1");
		expect(cam2.local).toBe(false);
		expect(cam2.id).not.toBe(undefined);
		expect(cam.id === cam2.id).toBe(true);

		cam2.x = 10;
		cam2.y = 100;
		cam2.opacity = 0.5;
		ser = cam2.serialize();

		var cam3 = g.Camera2D.deserialize(ser, game);
		expect(cam3.game).toBe(game);
		expect(cam3.x).toBe(10);
		expect(cam3.y).toBe(100);
		expect(cam3.angle).toBe(3);
		expect(cam3.scaleX).toBe(1);
		expect(cam3.scaleY).toBe(1);
		expect(cam3.opacity).toBe(0.5);
		expect(cam3.name).toBe("mycamera1");
		expect(cam3.local).toBe(false);
		expect(cam3.id).not.toBe(undefined);
		expect(cam.id === cam3.id).toBe(true);
	});
});

