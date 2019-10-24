import {
	EventType,
	JoinEvent,
	LeaveEvent,
	MessageEvent,
	OperationEvent,
	PointDownEvent,
	PointMoveEvent,
	PointUpEvent,
	SeedEvent,
	TimestampEvent,
	XorshiftRandomGenerator
} from "..";

describe("test Event", () => {
	it("初期化 - PointDown", () => {
		const point = { x: 1, y: 2 };
		const player = { id: "3", name: "p" };
		const pointDownEvent = new PointDownEvent(1, null, point, player, false, 2);
		expect(pointDownEvent.type).toBe(EventType.PointDown);
		expect(pointDownEvent.priority).toBe(2);
		expect(pointDownEvent.local).toBe(false);
		expect(pointDownEvent.point).toBe(point);
		expect(pointDownEvent.player).toBe(player);
		expect(pointDownEvent.pointerId).toBe(1);
		expect(pointDownEvent.target).toBe(null);
	});

	it("初期化 - PointUp", () => {
		const point = { x: 1, y: 2 };
		const pointAfter = { x: 0, y: 4 };
		const player = { id: "3", name: "p" };
		const pointUpEvent = new PointUpEvent(1, null, point, pointAfter, point, player, false, 2);
		expect(pointUpEvent.type).toBe(EventType.PointUp);
		expect(pointUpEvent.priority).toBe(2);
		expect(pointUpEvent.local).toBe(false);
		expect(pointUpEvent.point).toBe(point);
		expect(pointUpEvent.player).toBe(player);
		expect(pointUpEvent.pointerId).toBe(1);
		expect(pointUpEvent.target).toBe(null);
		expect(pointUpEvent.prevDelta).toEqual(pointAfter);
		expect(pointUpEvent.startDelta).toEqual(point);
	});

	it("初期化 - PointMove", () => {
		const point = { x: 1, y: 2 };
		const pointAfter = { x: 0, y: 4 };
		const player = { id: "3", name: "p" };
		const pointMoveEvent = new PointMoveEvent(1, null, point, pointAfter, point, player, false, 2);
		expect(pointMoveEvent.type).toBe(EventType.PointMove);
		expect(pointMoveEvent.priority).toBe(2);
		expect(pointMoveEvent.local).toBe(false);
		expect(pointMoveEvent.point).toBe(point);
		expect(pointMoveEvent.player).toBe(player);
		expect(pointMoveEvent.pointerId).toBe(1);
		expect(pointMoveEvent.target).toBe(null);
		expect(pointMoveEvent.prevDelta).toEqual(pointAfter);
		expect(pointMoveEvent.startDelta).toEqual(point);
	});

	it("初期化 - Message", () => {
		const player = { id: "3", name: "p" };
		const data = { hoge: "foo" };
		const messageEvent = new MessageEvent(data, player, true, 1);
		expect(messageEvent.type).toBe(EventType.Message);
		expect(messageEvent.priority).toBe(1);
		expect(messageEvent.local).toBe(true);
		expect(messageEvent.data).toEqual(data);
	});

	it("初期化 - Join", () => {
		const player = { id: "3", name: "p" };
		const joinEvent = new JoinEvent(player, undefined, 1);
		expect(joinEvent.type).toBe(EventType.Join);
		expect(joinEvent.priority).toBe(1);
	});

	it("初期化 - Leave", () => {
		const player = { id: "3", name: "p" };
		const leaveEvent = new LeaveEvent(player, 1);
		expect(leaveEvent.type).toBe(EventType.Leave);
		expect(leaveEvent.priority).toBe(1);
	});

	it("初期化 - Timestamp", () => {
		const player = { id: "3", name: "p" };
		const timestampEvent = new TimestampEvent(42, player, 1);
		expect(timestampEvent.type).toBe(EventType.Timestamp);
		expect(timestampEvent.priority).toBe(1);
		expect(timestampEvent.timestamp).toBe(42);
	});

	it("初期化 - Seed", () => {
		const generator = new XorshiftRandomGenerator(42);
		const seedEvent = new SeedEvent(generator, 1);
		expect(seedEvent.type).toBe(EventType.Seed);
		expect(seedEvent.priority).toBe(1);
		expect(seedEvent.generator).toEqual(generator);
	});

	it("初期化 - Operation", () => {
		const point = { x: 1, y: 2 };
		const player = { id: "3", name: "p" };
		const data = { point: point, target: undefined as any };
		const event = new OperationEvent(10, data, player, false, 2);
		expect(event.type).toBe(EventType.Operation);
		expect(event.priority).toBe(2);
		expect(event.local).toBe(false);
		expect(event.player).toBe(player);
		expect(event.code).toBe(10);
		expect(event.data.point).toBe(point);
		expect(event.data.target).toBe(undefined);
	});
});
