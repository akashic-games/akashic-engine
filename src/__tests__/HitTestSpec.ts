import { skeletonRuntime } from "./helpers";
import { E } from "..";

describe("test E", () => {
	let runtime: any, e: E;

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

	it("拡大あり", () => {
		const xp = 20;
		const yp = 10;
		const scale = 2;
		const w = (e.width * scale) / 4;
		const h = (e.height * scale) / 4;
		e.moveTo(xp, yp);
		e.scale(scale);
		for (let x = xp - w; x < e.width + w + xp; x++) {
			for (let y = yp - h; y < e.height + h + yp; y++) {
				const t = e.findPointSourceByPoint({ x: x, y: y });
				expect(t.target).toBe(e);
			}
		}
		let t = e.findPointSourceByPoint({
			x: e.width + xp + w,
			y: e.height + yp + h - 1
		});
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({
			x: e.width + xp + w - 1,
			y: e.height + yp + h
		});
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({ x: xp - w - 1, y: yp - h });
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({ x: xp - w, y: yp - h - 1 });
		expect(t).toBeUndefined();
	});

	it("回転あり", () => {
		const xp = 0;
		const yp = 0;
		const angle = 180;
		e.moveTo(xp, yp);
		e.angle = angle;
		for (let x = xp + 0.1; x < e.width + xp; x++) {
			for (let y = yp + 0.1; y < e.height + yp; y++) {
				const t = e.findPointSourceByPoint({ x: x, y: y });
				expect(t.target).toBe(e);
			}
		}
		let t = e.findPointSourceByPoint({
			x: e.width + xp + 0.1,
			y: e.height + yp - 1
		});
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({
			x: e.width + xp - 1,
			y: e.height + yp + 0.1
		});
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({ x: xp - 1, y: yp });
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({ x: xp, y: yp - 1 });
		expect(t).toBeUndefined();
	});

	it("拡大+回転あり", () => {
		const xp = 20;
		const yp = 10;
		const scale = 2;
		const w = (e.width * scale) / 4;
		const h = (e.height * scale) / 4;
		const angle = 180;
		e.moveTo(xp, yp);
		e.scale(scale);
		e.angle = angle;
		for (let x = xp - w + 0.1; x < e.width + w + xp; x++) {
			for (let y = yp - h + 0.1; y < e.height + h + yp; y++) {
				const t = e.findPointSourceByPoint({ x: x, y: y });
				expect(t.target).toBe(e);
			}
		}
		let t = e.findPointSourceByPoint({
			x: e.width + xp + w + 0.1,
			y: e.height + yp + h - 1
		});
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({
			x: e.width + xp + w - 1,
			y: e.height + yp + h + 0.1
		});
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({ x: xp - w - 1, y: yp - h });
		expect(t).toBeUndefined();
		t = e.findPointSourceByPoint({ x: xp - w, y: yp - h - 1 });
		expect(t).toBeUndefined();
	});

	it("入れ子", () => {
		const xp = 20;
		const yp = 10;
		e.moveTo(xp, yp);
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
		const xp = 20;
		const yp = 10;
		e.moveTo(xp, yp);
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
		const xp = 20;
		const yp = 10;
		e.moveTo(xp, yp);
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
});
