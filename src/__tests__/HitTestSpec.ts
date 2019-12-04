import { E } from "..";
import { Runtime, skeletonRuntime } from "./helpers";

describe("test E", () => {
	let runtime: Runtime, e: E;

	beforeEach(() => {
		runtime = skeletonRuntime();
		e = new E({ scene: runtime.scene });
		runtime.scene.append(e);
		e.width = 30;
		e.height = 20;
		e.touchable = true;
		e.modified();
	});

	it("移動なし", () => {
		for (let x = 0; x < e.width; x++) {
			for (let y = 0; y < e.height; y++) {
				const t = e.findPointSourceByPoint({ x: x, y: y });
				expect(t.target).toBe(e);
			}
		}
		let t = e.findPointSourceByPoint({ x: e.width, y: e.height - 1 });
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({ x: e.width, y: e.height });
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({ x: -1, y: 0 });
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({ x: 0, y: -1 });
		expect(t).toBeUndefined();
	});

	it("移動あり", () => {
		const xp = 20;
		const yp = 10;
		e.moveTo(xp, yp);
		for (let x = xp; x < e.width + xp; x++) {
			for (let y = yp; y < e.height + yp; y++) {
				const t = e.findPointSourceByPoint({ x: x, y: y });
				expect(t.target).toBe(e);
			}
		}
		let t = e.findPointSourceByPoint({ x: e.width + xp, y: e.height + yp - 1 });
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({ x: e.width + xp - 1, y: e.height + yp });
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({ x: xp - 1, y: yp });
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({ x: xp, y: yp - 1 });
		expect(t).toBeUndefined();
	});

	it("拡大あり: アンカーポイントが左上", () => {
		const scale = 2;
		const fromX = 0;
		const fromY = 0;
		const toX = e.width * scale;
		const toY = e.height * scale;
		e.scale(scale);
		for (let x = fromX; x < toX; x++) {
			for (let y = fromY; y < toY; y++) {
				const t = e.findPointSourceByPoint({ x, y });
				expect(t.target).toBe(e);
			}
		}
		let t = e.findPointSourceByPoint({
			x: fromX,
			y: fromY - 1
		});
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({
			x: fromX - 1,
			y: fromY
		});
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({ x: toX + 1, y: toY });
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({ x: toX, y: toY + 1 });
		expect(t).toBeUndefined();
	});

	it("拡大あり: アンカーポイントが中央", () => {
		const scale = 2;
		const w = e.width * scale;
		const h = e.height * scale;
		const fromX = e.width / 2 - (e.width * scale) / 2;
		const fromY = e.height / 2 - (e.height * scale) / 2;
		const toX = fromX + w;
		const toY = fromY + h;
		e.moveTo(e.width / 2, e.height / 2);
		e.anchor(0.5, 0.5);
		e.scale(scale);
		for (let x = fromX; x < toX; x++) {
			for (let y = fromY; y < toY; y++) {
				const t = e.findPointSourceByPoint({ x, y });
				expect(t.target).toBe(e);
			}
		}
		let t = e.findPointSourceByPoint({
			x: fromX,
			y: fromY - 1
		});
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({
			x: fromX - 1,
			y: fromY
		});
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({ x: toX + 1, y: toY });
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({ x: toX, y: toY + 1 });
		expect(t).toBeUndefined();
	});

	it("回転あり: アンカーポイントが左上", () => {
		const fromX = -e.height;
		const fromY = 0;
		const toX = 0;
		const toY = e.width;
		const angle = 90;
		e.angle = angle;
		for (let x = fromX + 0.1; x < toX; x++) {
			for (let y = fromY + 0.1; y < toY; y++) {
				const t = e.findPointSourceByPoint({ x, y });
				expect(t.target).toBe(e);
			}
		}
		let t = e.findPointSourceByPoint({
			x: fromX + 0.1,
			y: fromY - 1
		});
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({
			x: fromX - 1,
			y: fromY + 0.1
		});
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({ x: toX + 1, y: toY });
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({ x: toX, y: toY + 1 });
		expect(t).toBeUndefined();
	});

	it("回転あり: アンカーポイントが中央", () => {
		const fromX = 0;
		const fromY = 0;
		const toX = e.width;
		const toY = e.height;
		const angle = 180;
		e.anchor(0.5, 0.5);
		e.moveTo(e.width / 2, e.height / 2);
		e.angle = angle;
		for (let x = fromX + 0.1; x < toX; x++) {
			for (let y = fromY + 0.1; y < toY; y++) {
				const t = e.findPointSourceByPoint({ x, y });
				expect(t.target).toBe(e);
			}
		}
		let t = e.findPointSourceByPoint({
			x: fromX + 0.1,
			y: fromY - 1
		});
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({
			x: fromX - 1,
			y: fromY + 0.1
		});
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({ x: toX + 1, y: toY });
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({ x: toX, y: toY + 1 });
		expect(t).toBeUndefined();
	});

	it("拡大+回転あり", () => {
		const angle = 180;
		const scale = 2;
		const fromX = -e.width * scale;
		const fromY = -e.height * scale;
		const toX = 0;
		const toY = 0;
		e.scale(scale);
		e.angle = angle;
		for (let x = fromX + 0.1; x < toX; x++) {
			for (let y = fromY + 0.1; y < toY; y++) {
				const t = e.findPointSourceByPoint({ x, y });
				expect(t.target).toBe(e);
			}
		}
		let t = e.findPointSourceByPoint({
			x: fromX + 0.1,
			y: fromY - 1
		});
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({
			x: fromX - 1,
			y: fromY + 0.1
		});
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({ x: toX + 1, y: toY });
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({ x: toX, y: toY + 1 });
		expect(t).toBeUndefined();
	});

	it("入れ子", () => {
		e.scale(2);
		const e2 = new E({ scene: runtime.scene });
		e2.width = 10;
		e2.height = 10;
		e2.scale(1.5);
		e.touchable = false;
		e.append(e2);
		e2.touchable = true;
		e2.modified();
		expect(e2.touchable).toBe(true);
		expect(e.touchable).toBe(false);
		expect(e._hasTouchableChildren).toBe(true);

		let t = e.findPointSourceByPoint({ x: 20, y: 10 });
		expect(t.target).toBe(e2);
		t = e.findPointSourceByPoint({ x: 30, y: 11 });
		expect(t).toBeUndefined();
	});

	it("入れ子で両方有効", () => {
		e.scale(2);
		const e2 = new E({ scene: runtime.scene });
		e2.width = 10;
		e2.height = 10;
		e2.scale(1.5);
		e.touchable = true;
		e.append(e2);
		e2.modified();
		e2.touchable = true;
		expect(e2.touchable).toBe(true);
		expect(e._hasTouchableChildren).toBe(true);

		let t = e.findPointSourceByPoint({ x: 20, y: 10 });
		expect(t.target).toBe(e2);
		t = e.findPointSourceByPoint({ x: 30, y: 11 });
		expect(t.target).toBe(e);
		t = e.findPointSourceByPoint({ x: 30, y: 40 });
		expect(t).toBeUndefined();
	});

	it("入れ子のやつをappendしてその後remove", () => {
		e.scale(2);
		const e2 = new E({ scene: runtime.scene });
		e2.width = 10;
		e2.height = 10;
		e2.scale(1.5);
		e.touchable = false;
		e2.touchable = true;
		e.append(e2);
		e2.modified();
		expect(e2.touchable).toBe(true);
		expect(e.touchable).toBe(false);
		expect(e._hasTouchableChildren).toBe(true);

		e2.remove();
		expect(e._hasTouchableChildren).toBe(false);
	});

	it("deprecated: 座標基点=左上, 拡大+回転の基点=中央", () => {
		const angle = 180;
		const scale = 2;
		const w = e.width * scale;
		const h = e.height * scale;
		const fromX = e.width / 2 - w / 2;
		const fromY = e.height / 2 - h / 2;
		const toX = fromX + w;
		const toY = fromY + h;
		e.scale(scale);
		e.angle = angle;
		e.anchorX = null;
		for (let x = fromX + 0.1; x < toX; x++) {
			for (let y = fromY + 0.1; y < toY; y++) {
				const t = e.findPointSourceByPoint({ x, y });
				expect(t.target).toBe(e);
			}
		}
		let t = e.findPointSourceByPoint({
			x: fromX + 0.1,
			y: fromY - 1
		});
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({
			x: fromX - 1,
			y: fromY + 0.1
		});
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({ x: toX + 1, y: toY });
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({ x: toX, y: toY + 1 });
		expect(t).toBeUndefined();
	});
});
