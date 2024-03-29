import type { Matrix } from "..";
import { Camera2D, PlainMatrix } from "..";
import type { Renderer } from "./helpers";
import { Game } from "./helpers";

describe("test Camera", () => {
	it("初期化", () => {
		const cam1 = new Camera2D({ width: 320, height: 240 });
		expect(cam1.local).toBe(false);
		expect(cam1.name).toBeUndefined();
		expect(cam1.x).toBe(0);
		expect(cam1.y).toBe(0);
		expect(cam1.angle).toBe(0);
		expect(cam1.width).toBe(320);
		expect(cam1.height).toBe(240);
		expect(cam1._modifiedCount).toBe(0);

		const cam2 = new Camera2D({
			name: "foo",
			x: 100,
			y: 10,
			angle: 4,
			width: 80,
			height: 70
		});
		expect(cam2.local).toBe(false);
		expect(cam2.name).toBe("foo");
		expect(cam2.x).toBe(100);
		expect(cam2.y).toBe(10);
		expect(cam2.angle).toBe(4);
		expect(cam2.width).toBe(80);
		expect(cam2.height).toBe(70);
		expect(cam2._modifiedCount).toBe(0);

		const cam3 = new Camera2D({
			local: true,
			name: "bar",
			x: 100,
			y: 10
		});
		expect(cam3.local).toBe(true);
		expect(cam3.name).toBe("bar");
		expect(cam3.x).toBe(100);
		expect(cam3.y).toBe(10);
		expect(cam3.angle).toBe(0);
		expect(cam3.width).toBe(0);
		expect(cam3.height).toBe(0);
		expect(cam3._modifiedCount).toBe(0);
	});

	it("modified", () => {
		const cam = new Camera2D({});

		expect(cam._modifiedCount).toBe(0);
		cam.modified();
		expect(cam._modifiedCount).toBe(1);
		const matrix = cam._matrix;
		cam.getMatrix();
		cam.modified();
		expect(cam._modifiedCount).toBe(2);
		expect(cam._matrix!._modified).toBe(true);
		expect(cam._matrix).not.toEqual(matrix);
	});

	it("x, y, angle", () => {
		const cam = new Camera2D({});
		const expected = new PlainMatrix();
		let mat: Matrix;

		mat = cam.getMatrix();
		expect(mat._matrix).toEqual([1, 0, 0, 1, 0, 0]);

		cam.x = 10;
		cam.y = 100;
		cam.modified();
		mat = cam.getMatrix();
		expected.reset(-10, -100); // カメラは x, y の逆方向のオフセットがかかる
		expect(mat._matrix).toEqual(expected._matrix);

		const angle = 10;
		cam.angle = angle;
		cam.modified();
		mat = cam.getMatrix();
		expected.updateByInverse(320, 240, 1, 1, 10, 10, 100, 0, 0); // angle も逆方向に作用する
		expect(mat._matrix).toEqual(expected._matrix);
	});

	it("anchor", () => {
		const cam = new Camera2D({ width: 320, height: 240, angle: 10, x: 10, y: 100, anchorX: 0.5, anchorY: 0.5 });
		const expected = new PlainMatrix();
		const mat = cam.getMatrix();
		expected.updateByInverse(320, 240, 1, 1, 10, 10, 100, 0.5, 0.5);
		expect(mat._matrix).toEqual(expected._matrix);
	});

	it("_applyTransformToRenderer", () => {
		const game = new Game({ width: 320, height: 240, main: "", assets: {} });
		const cam = new Camera2D({});
		const surface = game.resourceFactory.createSurface(320, 240);
		const renderer = surface.renderer() as Renderer;

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
		const mat = new PlainMatrix();
		mat.updateByInverse(320, 240, 1, 1, 10, 10, 100, 0, 0); // angle も逆方向に作用する
		expect(cam.getMatrix()._matrix).toEqual(mat._matrix);
		expect(renderer.methodCallParamsHistory("transform")).toEqual([{ matrix: mat._matrix }]);
	});

	it("serialize", () => {
		const cam = new Camera2D({
			x: 32,
			y: 15,
			angle: 3,
			name: "mycamera1"
		});
		let ser = cam.serialize();

		const cam2 = Camera2D.deserialize(ser);
		expect(cam2.x).toBe(32);
		expect(cam2.y).toBe(15);
		expect(cam2.angle).toBe(3);
		expect(cam2.scaleX).toBe(1);
		expect(cam2.scaleY).toBe(1);
		expect(cam2.opacity).toBe(1);
		expect(cam2.anchorX).toBe(0);
		expect(cam2.anchorY).toBe(0);
		expect(cam2.name).toBe("mycamera1");
		expect(cam2.local).toBe(false);

		cam2.x = 10;
		cam2.y = 100;
		cam2.opacity = 0.5;
		cam2.anchor(1.0, 0.5);
		ser = cam2.serialize();

		const cam3 = Camera2D.deserialize(ser);
		expect(cam3.x).toBe(10);
		expect(cam3.y).toBe(100);
		expect(cam3.angle).toBe(3);
		expect(cam3.scaleX).toBe(1);
		expect(cam3.scaleY).toBe(1);
		expect(cam3.anchorX).toBe(1.0);
		expect(cam3.anchorY).toBe(0.5);
		expect(cam3.opacity).toBe(0.5);
		expect(cam3.name).toBe("mycamera1");
		expect(cam3.local).toBe(false);
	});
});
