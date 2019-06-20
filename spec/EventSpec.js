describe("test Event", function() {
	var g = require('../lib/');

	beforeEach(function() {
	});

	afterEach(function() {
	});

	it("初期化 - PointDown", function() {
		var point = {x: 1, y: 2};
		var player = {id: 3, name: "p"};
		var pointDownEvent = new g.PointDownEvent(1, null, point, player, false, 2);
		expect(pointDownEvent.type).toBe(g.EventType.PointDown);
		expect(pointDownEvent.priority).toBe(2);
		expect(pointDownEvent.local).toBe(false);
		expect(pointDownEvent.point).toBe(point);
		expect(pointDownEvent.player).toBe(player);
		expect(pointDownEvent.pointerId).toBe(1);
		expect(pointDownEvent.target).toBe(null);
	});

	it("初期化 - PointUp", function() {
		var point = {x: 1, y: 2};
		var pointAfter = {x: 0, y: 4};
		var player = {id: 3, name: "p"};
		var pointUpEvent = new g.PointUpEvent(1, null, point, pointAfter, point, player, false, 2);
		expect(pointUpEvent.type).toBe(g.EventType.PointUp);
		expect(pointUpEvent.priority).toBe(2);
		expect(pointUpEvent.local).toBe(false);
		expect(pointUpEvent.point).toBe(point);
		expect(pointUpEvent.player).toBe(player);
		expect(pointUpEvent.pointerId).toBe(1);
		expect(pointUpEvent.target).toBe(null);
		expect(pointUpEvent.prevDelta).toEqual(pointAfter);
		expect(pointUpEvent.startDelta).toEqual(point);
	});

	it("初期化 - PointMove", function() {
		var point = {x: 1, y: 2};
		var pointAfter = {x: 0, y: 4};
		var player = {id: 3, name: "p"};
		var pointMoveEvent = new g.PointMoveEvent(1, null, point, pointAfter, point, player, false, 2);
		expect(pointMoveEvent.type).toBe(g.EventType.PointMove);
		expect(pointMoveEvent.priority).toBe(2);
		expect(pointMoveEvent.local).toBe(false);
		expect(pointMoveEvent.point).toBe(point);
		expect(pointMoveEvent.player).toBe(player);
		expect(pointMoveEvent.pointerId).toBe(1);
		expect(pointMoveEvent.target).toBe(null);
		expect(pointMoveEvent.prevDelta).toEqual(pointAfter);
		expect(pointMoveEvent.startDelta).toEqual(point);
	});

	it("初期化 - Message", function() {
		var player = {id: 3, name: "p"};
		var data = {hoge: "foo"};
		var messageEvent = new g.MessageEvent(data, player, true, 1);
		expect(messageEvent.type).toBe(g.EventType.Message);
		expect(messageEvent.priority).toBe(1);
		expect(messageEvent.local).toBe(true);
		expect(messageEvent.data).toEqual(data);
	});

	it("初期化 - Join", function() {
		var player = {id: 3, name: "p"};
		var joinEvent = new g.JoinEvent(player, undefined, 1);
		expect(joinEvent.type).toBe(g.EventType.Join);
		expect(joinEvent.priority).toBe(1);
	});

	it("初期化 - Leave", function() {
		var player = {id: 3, name: "p"};
		var leaveEvent = new g.LeaveEvent(player, 1);
		expect(leaveEvent.type).toBe(g.EventType.Leave);
		expect(leaveEvent.priority).toBe(1);
	});

	it("初期化 - Timestamp", function() {
		var player = {id: 3, name: "p"};
		var timestampEvent = new g.TimestampEvent(42, player, 1);
		expect(timestampEvent.type).toBe(g.EventType.Timestamp);
		expect(timestampEvent.priority).toBe(1);
		expect(timestampEvent.timestamp).toBe(42);
	});

	it("初期化 - Seed", function() {
		var generator = new g.RandomGenerator(42);
		var seedEvent = new g.SeedEvent(generator, 1);
		expect(seedEvent.type).toBe(g.EventType.Seed);
		expect(seedEvent.priority).toBe(1);
		expect(seedEvent.generator).toEqual(generator);
	});

	it("初期化 - Operation", function() {
		var point = {x: 1, y: 2};
		var player = {id: 3, name: "p"};
		var data = { point: point, target: undefined };
		event = new g.OperationEvent(10, data, player, false, 2);
		expect(event.type).toBe(g.EventType.Operation);
		expect(event.priority).toBe(2);
		expect(event.local).toBe(false);
		expect(event.player).toBe(player);
		expect(event.code).toBe(10);
		expect(event.data.point).toBe(point);
		expect(event.data.target).toBe(undefined);
	});
});
