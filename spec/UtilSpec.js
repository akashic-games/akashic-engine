describe("test Util", function() {
	var g = require('../lib/');
	var mock = require("./helpers/mock");
	var skeletonRuntime = require("./helpers/skeleton");

	beforeEach(function() {
	});

	afterEach(function() {
	});

	it("distance = 0", function() {
		expect(g.Util.distance(0, 0, 0, 0).toFixed(2)).toEqual('0.00');
		expect(g.Util.distance(100, 100, 100, 100).toFixed(2)).toEqual('0.00');
		expect(g.Util.distance(-100, -100, -100, -100).toFixed(2)).toEqual('0.00');
		expect(g.Util.distanceBetweenOffsets({x: -100, y: -100}, {x: -100, y: -100}).toFixed(2)).toEqual('0.00');
		expect(g.Util.distanceBetweenOffsets({x: 100, y: 100}, {x: 100, y: 100}).toFixed(2)).toEqual('0.00');
		expect(g.Util.distanceBetweenOffsets({x: -100, y: -100}, {x: -100, y: -100}).toFixed(2)).toEqual('0.00');
	});

	it("distance = 1", function() {
		expect(g.Util.distance(-1, -1, 0, -1).toFixed(2)).toEqual('1.00');
		expect(g.Util.distance(-1, -1, -1, 0).toFixed(2)).toEqual('1.00');
		expect(g.Util.distance(0, 0, 0, -1).toFixed(2)).toEqual('1.00');
		expect(g.Util.distance(0, 0, -1, 0).toFixed(2)).toEqual('1.00');
		expect(g.Util.distanceBetweenOffsets({x: -1, y: -1}, {x: 0, y: -1}).toFixed(2)).toEqual('1.00');
		expect(g.Util.distanceBetweenOffsets({x: -1, y: -1}, {x: -1, y: 0}).toFixed(2)).toEqual('1.00');
		expect(g.Util.distanceBetweenOffsets({x: 0, y: 0}, {x: 0, y: -1}).toFixed(2)).toEqual('1.00');
		expect(g.Util.distanceBetweenOffsets({x: 0, y: 0}, {x: -1, y: 0}).toFixed(2)).toEqual('1.00');
	});

	it("distance = sqrt(2)", function() {
		expect(g.Util.distance(2, 2, 1, 1).toFixed(2)).toEqual('1.41');
		expect(g.Util.distance(-1, -1, -2, -2).toFixed(2)).toEqual('1.41');
		expect(g.Util.distance(1, 1, 2, 2).toFixed(2)).toEqual('1.41');
		expect(g.Util.distance(-2, -2, -1, -1).toFixed(2)).toEqual('1.41');
		expect(g.Util.distanceBetweenOffsets({x: 2, y: 2}, {x: 1, y: 1}).toFixed(2)).toEqual('1.41');
		expect(g.Util.distanceBetweenOffsets({x: -1, y: -1}, {x: -2, y: -2}).toFixed(2)).toEqual('1.41');
		expect(g.Util.distanceBetweenOffsets({x: 1, y: 1}, {x: 2, y: 2}).toFixed(2)).toEqual('1.41');
		expect(g.Util.distanceBetweenOffsets({x: -2, y: -2}, {x: -1, y: -1}).toFixed(2)).toEqual('1.41');
	});

	it("distance = 0.5", function() {
		expect(g.Util.distance(0.5, 0.5, 1.0, 0.5).toFixed(2)).toEqual('0.50');
		expect(g.Util.distance(0.25, 0.25, 0.75, 0.25).toFixed(2)).toEqual('0.50');
		expect(g.Util.distance(-0.5, 0.5, -1.0, 0.5).toFixed(2)).toEqual('0.50');
		expect(g.Util.distance(0.25, 0.25, 0.25, -0.25).toFixed(2)).toEqual('0.50');
		expect(g.Util.distanceBetweenOffsets({x: 0.5, y: 0.5}, {x: 1.0, y: 0.5}).toFixed(2)).toEqual('0.50');
		expect(g.Util.distanceBetweenOffsets({x: 0.25, y: 0.25}, {x: 0.75, y: 0.25}).toFixed(2)).toEqual('0.50');
		expect(g.Util.distanceBetweenOffsets({x: -0.5, y: 0.5}, {x: -1.0, y: 0.5}).toFixed(2)).toEqual('0.50');
		expect(g.Util.distanceBetweenOffsets({x: 0.25, y: 0.25}, {x: 0.25, y: -0.25}).toFixed(2)).toEqual('0.50');
	});

	it("distanceBetweenAreas", function() {
		var area1 = {x: 2, y: 2, width: 2, height: 2}; // center: (3, 3)
		var area2 = {x: 3, y: 5, width: 2, height: 4}; // center: (4, 7)
		var area3 = {x: -4, y: 3, width: 7, height: -4}; // center: (-0.5, 1)
		expect(g.Util.distanceBetweenAreas(area1, area2).toFixed(2)).toEqual(Math.sqrt(Math.pow(4 - 3, 2) + Math.pow(7 - 3, 2)).toFixed(2));
		expect(g.Util.distanceBetweenAreas(area1, area3).toFixed(2)).toEqual(Math.sqrt(Math.pow(-0.5 - 3, 2) + Math.pow(1 - 3, 2)).toFixed(2));
	});
});
