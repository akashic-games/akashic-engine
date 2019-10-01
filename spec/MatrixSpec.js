var g = require("../lib/");
describe("test Matrix", function () {

	beforeEach(function () {
		jasmine.addMatchers(require("./helpers/customMatchers"));
	});
	afterEach(function () {
	});

	it("初期化", function () {
		var m;
		m = new g.PlainMatrix();
		expect(m._matrix).toEqual([1, 0, 0, 1, 0, 0]);

		m = new g.PlainMatrix(0, 0, 2, 3, 45);
		var revSqrt2 = 1 / Math.sqrt(2);
		var expected = [
			2 * revSqrt2,
			2 * revSqrt2,
			-3 * revSqrt2,
			3 * revSqrt2,
			0,
			0
		];
		expect(m._matrix).toBeNear(expected, 10);

		m = new g.PlainMatrix(m);
		expect(m._matrix).toBeNear(expected, 10);
	});

	it("update", function () {
		var m = new g.PlainMatrix();
		var angle = 50;
		var rad = angle * Math.PI / 180;
		var cosValue = Math.cos(rad);
		var sinValue = Math.sin(rad);
		m.update(10, 8, 2, 3, angle, 100, 50);

		var expected = new g.PlainMatrix();
		var tmp = new g.PlainMatrix();

		tmp._matrix = [1, 0, 0, 1, 10/2, 8/2];
		expected.multiply(tmp);
		tmp._matrix = [1, 0, 0, 1, 100, 50];
		expected.multiply(tmp);
		tmp._matrix = [cosValue, sinValue, -sinValue, cosValue, 0, 0];
		expected.multiply(tmp);
		tmp._matrix = [2, 0, 0, 3, 0, 0];
		expected.multiply(tmp);
		tmp._matrix = [1, 0, 0, 1, -10/2, -8/2];
		expected.multiply(tmp);

		expect(m._matrix).toBeNear(expected._matrix, 10);
	});

	it("updateWithAnchor", function () {
		var m = new g.PlainMatrix();
		var angle = 50;
		var rad = angle * Math.PI / 180;
		var cosValue = Math.cos(rad);
		var sinValue = Math.sin(rad);
		var anchorX = 0;
		var anchorY = 0.5;
		m.updateWithAnchor(10, 8, 2, 3, angle, 100, 50, anchorX, anchorY);

		var expected = new g.PlainMatrix();
		var tmp = new g.PlainMatrix();

		tmp._matrix = [1, 0, 0, 1, anchorX * 10, anchorY * 8];
		expected.multiply(tmp);
		tmp._matrix = [1, 0, 0, 1, 100 - anchorX * 10, 50 - anchorY * 8];
		expected.multiply(tmp);
		tmp._matrix = [cosValue, sinValue, -sinValue, cosValue, 0, 0];
		expected.multiply(tmp);
		tmp._matrix = [2, 0, 0, 3, 0, 0];
		expected.multiply(tmp);
		tmp._matrix = [1, 0, 0, 1, -1 * anchorX * 10, -1 * anchorY * 8];
		expected.multiply(tmp);

		expect(m._matrix).toBeNear(expected._matrix, 10);
	});

	it("updateByInverse", function () {
		var m = new g.PlainMatrix();
		var angle = 50;
		var rad = angle * Math.PI / 180;
		var cosValue = Math.cos(rad);
		var sinValue = Math.sin(rad);
		m.updateByInverse(10, 8, 2, 3, angle, 100, 50);

		var expected = new g.PlainMatrix();
		var tmp = new g.PlainMatrix();

		tmp._matrix = [1, 0, 0, 1, 10/2, 8/2];
		expected.multiply(tmp);
		tmp._matrix = [1/2, 0, 0, 1/3, 0, 0];
		expected.multiply(tmp);
		tmp._matrix = [cosValue, -sinValue, sinValue, cosValue, 0, 0];
		expected.multiply(tmp);
		tmp._matrix = [1, 0, 0, 1, -100, -50];
		expected.multiply(tmp);
		tmp._matrix = [1, 0, 0, 1, -10/2, -8/2];
		expected.multiply(tmp);

		expect(m._matrix).toBeNear(expected._matrix, 10);
	});

	it("updateByInverseWithAnchor", function () {
		var m = new g.PlainMatrix();
		var angle = 50;
		var rad = angle * Math.PI / 180;
		var cosValue = Math.cos(rad);
		var sinValue = Math.sin(rad);
		var anchorX = 1;
		var anchorY = 0;
		m.updateByInverseWithAnchor(10, 8, 2, 3, angle, 100, 50, anchorX, anchorY);

		var expected = new g.PlainMatrix();
		var tmp = new g.PlainMatrix();

		tmp._matrix = [1, 0, 0, 1, anchorX * 10, anchorY * 8];
		expected.multiply(tmp);
		tmp._matrix = [1/2, 0, 0, 1/3, 0, 0];
		expected.multiply(tmp);
		tmp._matrix = [cosValue, -sinValue, sinValue, cosValue, 0, 0];
		expected.multiply(tmp);
		tmp._matrix = [1, 0, 0, 1, -100 + anchorX * 10, -50 + anchorY * 8];
		expected.multiply(tmp);
		tmp._matrix = [1, 0, 0, 1, -1 * anchorX * 10, -1 * anchorY * 8];
		expected.multiply(tmp);

		expect(m._matrix).toBeNear(expected._matrix, 10);
	});
});
