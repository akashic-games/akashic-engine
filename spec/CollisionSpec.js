describe("Collision.intersect()", function() {
	var g = require('../lib/main.node.js');

	beforeEach(function() {
	});

	afterEach(function() {
	});

	it("Hit", function() {
		expect(g.Collision.intersect(0, 0, 100, 100, 100, 100, 1, 1)).toBe(true);
		expect(g.Collision.intersect(-100, -100, 100, 100, 0, 0, 1, 1)).toBe(true);
	});

	it("Miss", function() {
		expect(g.Collision.intersect(0, 0, 99, 100, 100, 100, 100, 100)).toBe(false);
		expect(g.Collision.intersect(0, 0, 100, 99, 100, 100, 100, 100)).toBe(false);
		expect(g.Collision.intersect(0, 0, -99, -100, -100, -100, -100, -100)).toBe(false);
		expect(g.Collision.intersect(0, 0, -100, -99, -100, -100, -100, -100)).toBe(false);
	});
});

describe("Collision.intersectAreas()", function() {
	var g = require('../lib/main.node.js');

	beforeEach(function() {
	});

	afterEach(function() {
	});

	var area1 = {x: 2, y: 2, width: 2, height: 2};
	var area2 = {x: 3, y: 5, width: 2, height: 4};
	var area3 = {x: 1, y: 0, width: 2, height: 4};

	it("Hit", function() {
		expect(g.Collision.intersectAreas(area1, area3)).toBe(true);
	});

	it("Miss", function() {
		expect(g.Collision.intersectAreas(area1, area2)).toBe(false);
		expect(g.Collision.intersectAreas(area2, area3)).toBe(false);
	});
});

describe("Collision.within()", function() {
	var g = require('../lib/main.node.js');

	beforeEach(function() {
	});

	afterEach(function() {
	});

	it("Hit", function() {
		expect(g.Collision.within(0, 0, 1, 1, 1.42)).toBe(true);
		expect(g.Collision.within(0, 0, 0, 0)).toBe(true);
		expect(g.Collision.within(0, 0, 0, 1)).toBe(true);
		expect(g.Collision.within(0, 0, 1, 0)).toBe(true);
		expect(g.Collision.within(0, 0, 0, 0)).toBe(true);
		expect(g.Collision.within(0, 0, -1, 0)).toBe(true);
		expect(g.Collision.within(0, 0, 0, -1)).toBe(true);
	});

	it("Miss", function() {
		expect(g.Collision.within(0, 0, 1, 1, 1.41)).toBe(false);
		expect(g.Collision.within(0, 0, 1, 1)).toBe(false);
		expect(g.Collision.within(0, 0, 1, -1)).toBe(false);
		expect(g.Collision.within(0, 0, -1, -1)).toBe(false);
		expect(g.Collision.within(0, 0, 1.01, 0)).toBe(false);
		expect(g.Collision.within(0, 0, 0, -1.01)).toBe(false);
	});
});

describe("Collision.withinAreas()", function() {
	var g = require('../lib/main.node.js');

	beforeEach(function() {
	});

	afterEach(function() {
	});

	var area1 = {x: 0, y: 0, width: 2, height: 2};
	var area2 = {x: 3, y: 5, width: 2, height: 4};
	var area3 = {x: 1, y: 0, width: 2, height: 4};
	var distance = 2;

	it("Hit", function() {
		expect(g.Collision.withinAreas(area1, area3, distance)).toBe(true);
	});

	it("Miss", function() {
		expect(g.Collision.withinAreas(area1, area2, distance)).toBe(false);
		expect(g.Collision.withinAreas(area2, area3, distance)).toBe(false);
	});

	it("Miss Distance", function() {
		expect(g.Collision.withinAreas(area1, area1, 0)).toBe(true);
		expect(g.Collision.withinAreas(area2, area3)).toBe(false);
		expect(g.Collision.withinAreas(area2, area3), -1).toBe(false);
	});
});
