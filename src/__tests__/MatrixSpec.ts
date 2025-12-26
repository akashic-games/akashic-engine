import { Math as InternalMath, PlainMatrix } from "..";
import { customMatchers } from "./helpers";

expect.extend(customMatchers);

describe("test Matrix", () => {
	it("初期化", () => {
		let m: PlainMatrix;
		m = new PlainMatrix();
		expect(m._matrix).toEqual([1, 0, 0, 1, 0, 0]);

		m = new PlainMatrix(0, 0, 2, 3, 45, 0.5, 0.5);
		const rad45 = (45 * Math.PI) / 180;
		const cos45 = InternalMath.cos(rad45);
		const sin45 = InternalMath.sin(rad45);
		const expected = [2 * cos45, 2 * sin45, -3 * sin45, 3 * cos45, 0, 0];
		expect(m._matrix).toBeNear(expected, 10);

		m = new PlainMatrix(m);
		expect(m._matrix).toBeNear(expected, 10);
	});

	it("can multiply another matrix from right", () => {
		// m1のマトリクスの値：[2, 0, -0, 2, -10, -10]
		const m1 = new PlainMatrix(10, 10, 2, 2, 0, 0.5, 0.5);
		// m2のマトリクスの値：[cos60, sin60, -sin60, cos60, 0, 0]
		const m2 = new PlainMatrix(30, 50, 1, 1, 60, 0, 0);
		// m1*m2の期待値を計算
		const rad60 = (60 * Math.PI) / 180;
		const cos60 = InternalMath.cos(rad60);
		const sin60 = InternalMath.sin(rad60);
		const expected = [2 * cos60, 2 * sin60, -2 * sin60, 2 * cos60, -10, -10];
		m1.multiply(m2);
		// マトリクスの各値が小数点第3位まで合っていればパスとする
		expect(m1._matrix).toBeNear(expected, 4);
	});

	it("can multiply another matrix from left", () => {
		// m1のマトリクスの値：[2, 0, -0, 2, -10, -10]
		const m1 = new PlainMatrix(10, 10, 2, 2, 0, 0.5, 0.5);
		// m2のマトリクスの値：[cos60, sin60, -sin60, cos60, 0, 0]
		const m2 = new PlainMatrix(30, 50, 1, 1, 60, 0, 0);
		// m1*m2の期待値を計算
		const rad60 = (60 * Math.PI) / 180;
		const cos60 = InternalMath.cos(rad60);
		const sin60 = InternalMath.sin(rad60);
		const expected = [2 * cos60, 2 * sin60, -2 * sin60, 2 * cos60, -10, -10];
		m2.multiplyLeft(m1);
		// マトリクスの各値が小数点第3位まで合っていればパスとする
		expect(m2._matrix).toBeNear(expected, 4);
	});

	it("update", () => {
		const m = new PlainMatrix();
		const angle = 50;
		const rad = (angle * Math.PI) / 180;
		const cosValue = InternalMath.cos(rad);
		const sinValue = InternalMath.sin(rad);
		m.update(10, 8, 2, 3, angle, 100, 50, 0.5, 0.5);

		const expected = new PlainMatrix();
		const tmp = new PlainMatrix();

		tmp._matrix = [1, 0, 0, 1, 100, 50];
		expected.multiply(tmp);
		tmp._matrix = [cosValue, sinValue, -sinValue, cosValue, 0, 0];
		expected.multiply(tmp);
		tmp._matrix = [2, 0, 0, 3, 0, 0];
		expected.multiply(tmp);
		tmp._matrix = [1, 0, 0, 1, -10 / 2, -8 / 2];
		expected.multiply(tmp);

		expect(m._matrix).toBeNear(expected._matrix, 10);
	});

	it("updateByInverse", () => {
		const m = new PlainMatrix();
		const angle = 50;
		const rad = (angle * Math.PI) / 180;
		const cosValue = InternalMath.cos(rad);
		const sinValue = InternalMath.sin(rad);
		m.updateByInverse(10, 8, 2, 3, angle, 100, 50, 0.5, 0.5);

		const expected = new PlainMatrix();
		const tmp = new PlainMatrix();

		tmp._matrix = [1, 0, 0, 1, 10 / 2, 8 / 2];
		expected.multiply(tmp);
		tmp._matrix = [1 / 2, 0, 0, 1 / 3, 0, 0];
		expected.multiply(tmp);
		tmp._matrix = [cosValue, -sinValue, sinValue, cosValue, 0, 0];
		expected.multiply(tmp);
		tmp._matrix = [1, 0, 0, 1, -100, -50];
		expected.multiply(tmp);

		expect(m._matrix).toBeNear(expected._matrix, 10);
	});

	it("deprecated: updateWithoutAnchor", () => {
		const m = new PlainMatrix();
		const angle = 50;
		const rad = (angle * Math.PI) / 180;
		const cosValue = InternalMath.cos(rad);
		const sinValue = InternalMath.sin(rad);
		m._updateWithoutAnchor(10, 8, 2, 3, angle, 100, 50);
		const expected = new PlainMatrix();
		const tmp = new PlainMatrix();
		tmp._matrix = [1, 0, 0, 1, 10 / 2, 8 / 2];
		expected.multiply(tmp);
		tmp._matrix = [1, 0, 0, 1, 100, 50];
		expected.multiply(tmp);
		tmp._matrix = [cosValue, sinValue, -sinValue, cosValue, 0, 0];
		expected.multiply(tmp);
		tmp._matrix = [2, 0, 0, 3, 0, 0];
		expected.multiply(tmp);
		tmp._matrix = [1, 0, 0, 1, -10 / 2, -8 / 2];
		expected.multiply(tmp);
		expect(m._matrix).toBeNear(expected._matrix, 10);
	});

	it("deprecated: updateByInverseWithoutAnchor", () => {
		const m = new PlainMatrix();
		const angle = 50;
		const rad = (angle * Math.PI) / 180;
		const cosValue = InternalMath.cos(rad);
		const sinValue = InternalMath.sin(rad);
		m._updateByInverseWithoutAnchor(10, 8, 2, 3, angle, 100, 50);
		const expected = new PlainMatrix();
		const tmp = new PlainMatrix();
		tmp._matrix = [1, 0, 0, 1, 10 / 2, 8 / 2];
		expected.multiply(tmp);
		tmp._matrix = [1 / 2, 0, 0, 1 / 3, 0, 0];
		expected.multiply(tmp);
		tmp._matrix = [cosValue, -sinValue, sinValue, cosValue, 0, 0];
		expected.multiply(tmp);
		tmp._matrix = [1, 0, 0, 1, -100, -50];
		expected.multiply(tmp);
		tmp._matrix = [1, 0, 0, 1, -10 / 2, -8 / 2];
		expected.multiply(tmp);
		expect(m._matrix).toBeNear(expected._matrix, 10);
	});
});
