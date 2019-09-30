import { Trigger, TimerManager, Timer } from "..";
import { customMatchers } from "./helpers";

expect.extend(customMatchers);

describe("test TimerManager", () => {
	let trigger: Trigger<void>;

	beforeEach(() => {
		trigger = new Trigger();
	});

	function loopFire(count: number): void {
		let i = 0;
		while (i < count) {
			trigger.fire.call(trigger);
			i++;
		}
	}

	it("constructor", () => {
		const m = new TimerManager(trigger, 30);

		expect(m._timers.length).toEqual(0);
		expect(m._trigger).toBe(trigger);
		expect(m._identifiers.length).toEqual(0);
		expect(m._fps).toBe(30);
		expect(m._registered).toBe(false);
		expect(m._trigger.contains(m._tick, m)).toBe(false);
	});

	it("createTimer", () => {
		const m = new TimerManager(trigger, 30);

		const timer = m.createTimer(100);
		expect(m._timers.length).toBe(1);
		expect(m._timers[0]).toBe(timer);
		expect(m._registered).toBe(true);
		expect(m._trigger.contains(m._tick, m)).toBe(true);
		expect(m._identifiers.length).toEqual(0);
	});

	it("createTimer - shared timer(same interval)", () => {
		const m = new TimerManager(trigger, 30);

		const timer1 = m.createTimer(100);
		const timer2 = m.createTimer(100);
		expect(m._timers.length).toBe(1);
		expect(timer1).toBe(timer2);
	});

	it("createTimer - new timer(different interval)", () => {
		const m = new TimerManager(trigger, 30);

		const timer1 = m.createTimer(100);
		const timer2 = m.createTimer(101);
		expect(m._timers.length).toBe(2);
		expect(timer1).not.toBe(timer2);
	});

	it("createTimer - new timer(same interval)", () => {
		const m = new TimerManager(trigger, 30);

		const timer1 = m.createTimer(100);
		trigger.fire();
		const timer2 = m.createTimer(100);
		expect(m._timers.length).toBe(2);
		expect(timer1).not.toBe(timer2);
	});

	it("createTimer - error", () => {
		const m = new TimerManager(trigger, 30);
		expect(() => {
			m.createTimer(-1);
		}).toThrowError("AssertionError");
	});

	it("deleteTimer", () => {
		const m = new TimerManager(trigger, 30);

		const timer = m.createTimer(100);
		expect(m._timers.length).toBe(1);
		expect(m._identifiers.length).toEqual(0);
		expect(m._timers[0]).toBe(timer);
		expect(m._registered).toBe(true);
		m.deleteTimer(timer);
		expect(m._timers.length).toBe(0);
		expect(m._registered).toBe(false);
		expect(timer.destroyed()).toBe(true);
		expect(trigger.contains(m._tick, m)).toBe(false);
	});

	it("deleteTimer - handler remains", () => {
		const m = new TimerManager(trigger, 30);

		const timer1 = m.createTimer(100);
		const timer2 = m.createTimer(101);
		m.deleteTimer(timer1);
		expect(timer1.destroyed()).toBe(true);
		expect(m._registered).toBe(true);
		expect(m._trigger.contains(m._tick, m)).toBe(true);
		m.deleteTimer(timer2);
		expect(timer2.destroyed()).toBe(true);
		expect(m._registered).toBe(false);
		expect(m._trigger.contains(m._tick, m)).toBe(false);
	});

	it("deleteTimer - error (invalid context)", () => {
		const m = new TimerManager(trigger, 30);
		const t = new Timer(100, undefined);
		expect(() => {
			m.deleteTimer(t);
		}).toThrowError("AssertionError");
	});

	it("deleteTimer - error (invalid status)", () => {
		const m = new TimerManager(trigger, 30);

		const t = m.createTimer(100);
		m._registered = false;
		expect(() => {
			m.deleteTimer(t);
		}).toThrowError("AssertionError");
	});

	it("setTimeout", () => {
		const m = new TimerManager(trigger, 30);

		const parent = new Object();
		let passedOwner = null;
		let count = 0;
		const timeout = m.setTimeout(
			function(): void {
				count++;
				passedOwner = this;
			},
			1000,
			parent
		);
		expect(m._identifiers.length).toEqual(1);
		loopFire(29); // 966.666ms
		expect(count).toBe(0);
		trigger.fire(); // 1000ms
		expect(count).toBe(1);
		loopFire(30); // 2000ms
		expect(count).toBe(1);
		expect(passedOwner).toBe(parent);
		expect(m._identifiers.length).toEqual(0);
	});

	it("setInterval - check calculation error", () => {
		const m = new TimerManager(trigger, 30);

		const parent = new Object();
		let count = 0;
		const timeout = m.setInterval(
			() => {
				count++;
			},
			2000,
			parent
		);
		loopFire(60);
		expect(count).toBe(1);
	});

	it("setTimeout - invalid status", () => {
		const m = new TimerManager(trigger, 30);

		const parent = new Object();
		let count = 0;
		const timeout = m.setTimeout(
			() => {
				count++;
			},
			1000,
			parent
		);
		expect(m._identifiers.length).toEqual(1);
		m._identifiers.length = 0;
		expect(() => {
			loopFire(30);
		}).toThrowError("AssertionError");
	});

	it("setTimeout - serial two timers(same interval)", () => {
		const m = new TimerManager(trigger, 30);

		let count1 = 0;
		let count2 = 0;
		const timeout1 = m.setTimeout(() => {
			count1++;
		}, 1000);
		expect(m._identifiers.length).toEqual(1);
		loopFire(30); // 1000ms
		expect(m._identifiers.length).toEqual(0);
		expect(count1).toBe(1);

		const timeout2 = m.setTimeout(() => {
			count2++;
		}, 1000);
		expect(m._identifiers.length).toEqual(1);
		loopFire(29); // 1966.666ms
		expect(count2).toBe(0);
		trigger.fire(); // 2000ms
		expect(count2).toBe(1);
		expect(m._identifiers.length).toEqual(0);
		loopFire(30); // 3000ms
		expect(count2).toBe(1);
		expect(count1).toBe(1);
	});

	it("setTimeout - parallel two timers(same interval)", () => {
		const m = new TimerManager(trigger, 30);

		let count1 = 0;
		let count2 = 0;
		const timeout1 = m.setTimeout(() => {
			count1++;
		}, 1000);
		const timeout2 = m.setTimeout(() => {
			count2++;
		}, 1000);
		expect(m._identifiers.length).toEqual(2);
		loopFire(29); // 966.666ms
		expect(count1).toBe(0);
		expect(count2).toBe(0);
		trigger.fire(); // 1000ms
		expect(count1).toBe(1);
		expect(count2).toBe(1);
		expect(m._identifiers.length).toEqual(0);
		loopFire(30); // 2000ms
		expect(count1).toBe(1);
		expect(count2).toBe(1);
	});

	it("setTimeout - serial two timers(different interval)", () => {
		const m = new TimerManager(trigger, 10);

		let count1 = 0;
		let count2 = 0;
		const timeout1 = m.setTimeout(() => {
			count1++;
		}, 500);
		loopFire(5); // 500ms
		expect(count1).toBe(1);

		const timeout2 = m.setTimeout(() => {
			count2++;
		}, 1000);
		loopFire(10); // 1500ms
		expect(count2).toBe(1);
		loopFire(15); // 3000ms
		expect(count2).toBe(1);
		expect(count1).toBe(1);
		expect(m._identifiers.length).toEqual(0);
	});

	it("setTimeout - parallel two timers(different interval)", () => {
		const m = new TimerManager(trigger, 10);

		let count1 = 0;
		let count2 = 0;
		const timeout1 = m.setTimeout(() => {
			count1++;
		}, 500);
		const timeout2 = m.setTimeout(() => {
			count2++;
		}, 1000);
		loopFire(5); // 500ms
		expect(count1).toBe(1);
		expect(count2).toBe(0);
		loopFire(5); // 1000ms
		expect(count1).toBe(1);
		expect(count2).toBe(1);
		expect(m._identifiers.length).toEqual(0);
	});

	it("setTimeout - zero interval", () => {
		const m = new TimerManager(trigger, 10);

		let count = 0;
		const timeout = m.setTimeout(() => {
			count++;
		}, 0);

		loopFire(1); // 100ms
		expect(count).toBe(1);
		loopFire(10); // 1100ms
		expect(count).toBe(1);
	});

	it("clearTimeout", () => {
		const m = new TimerManager(trigger, 10);

		let count = 0;
		const timeout = m.setTimeout(() => {
			count++;
		}, 500);
		expect(m._identifiers.length).toEqual(1);
		loopFire(3); // 300ms
		m.clearTimeout(timeout);
		expect(m._identifiers.length).toEqual(0);
		loopFire(2); // 500ms
		expect(count).toBe(0);
		loopFire(5); // 1000ms
		expect(count).toBe(0);
	});

	it("clearTimeout - error(not found)", () => {
		const m = new TimerManager(trigger, 10);

		const timeout = m.setTimeout(() => {
			/* do nothing */
		}, 500);
		loopFire(3);
		m.clearTimeout(timeout);
		expect(() => {
			m.clearTimeout(timeout);
		}).toThrowError("AssertionError");
	});

	it("clearTimeout - error(invalid identifier)", () => {
		const m = new TimerManager(trigger, 10);

		const timeout = m.setTimeout(() => {
			/* do nothing */
		}, 500);
		loopFire(3);
		timeout.destroy();
		expect(() => {
			m.clearTimeout(timeout);
		}).toThrowError("AssertionError");
	});

	it("clearTimeout - parallel two timers", () => {
		const m = new TimerManager(trigger, 10);

		let count1 = 0;
		let count2 = 0;
		const timeout1 = m.setTimeout(() => {
			count1++;
		}, 500);
		const timeout2 = m.setTimeout(() => {
			count2++;
		}, 500);
		loopFire(3); // 300ms
		m.clearTimeout(timeout1);
		loopFire(2); // 500ms
		expect(count1).toBe(0);
		expect(count2).toBe(1);
	});

	it("clearTimeout - zero interval", () => {
		const m = new TimerManager(trigger, 10);

		let count = 0;
		const timeout = m.setTimeout(() => {
			count++;
		}, 0);
		m.clearTimeout(timeout);
		loopFire(10); // 1000ms
		expect(count).toBe(0);
	});

	it("setInterval", () => {
		const m = new TimerManager(trigger, 10);

		const parent = new Object();
		let passedOwner = null;
		let count = 0;
		const interval = m.setInterval(
			function(): void {
				count++;
				passedOwner = this;
			},
			500,
			parent
		);
		loopFire(4); // 400ms
		expect(count).toBe(0);
		trigger.fire(); // 500ms
		expect(count).toBe(1);
		loopFire(5); // 1000ms
		expect(count).toBe(2);
		loopFire(5); // 1500ms
		expect(count).toBe(3);
		loopFire(5); // 2000ms
		expect(count).toBe(4);
		expect(passedOwner).toBe(parent);
		expect(m._identifiers.length).toEqual(1);
	});

	it("setInterval - two timers(same interval)", () => {
		const m = new TimerManager(trigger, 10);

		let count1 = 0;
		let count2 = 0;
		const interval1 = m.setInterval(() => {
			count1++;
		}, 500);
		const interval2 = m.setInterval(() => {
			count2++;
		}, 500);
		loopFire(4); // 400ms
		expect(count1).toBe(0);
		expect(count2).toBe(0);
		trigger.fire(); // 500ms
		expect(count1).toBe(1);
		expect(count2).toBe(1);
		loopFire(5); // 1000ms
		expect(count1).toBe(2);
		expect(count2).toBe(2);
		loopFire(5); // 1500ms
		expect(count1).toBe(3);
		expect(count2).toBe(3);
		loopFire(5); // 2000ms
		expect(count1).toBe(4);
		expect(count2).toBe(4);
		expect(m._identifiers.length).toEqual(2);
	});

	it("setInterval - two timers(different interval)", () => {
		const m = new TimerManager(trigger, 10);

		let count1 = 0;
		let count2 = 0;
		const timeout1 = m.setInterval(() => {
			count1++;
		}, 500);
		const timeout2 = m.setInterval(() => {
			count2++;
		}, 1000);
		loopFire(5); // 500ms
		expect(count1).toBe(1);
		expect(count2).toBe(0);
		loopFire(5); // 1000ms
		expect(count1).toBe(2);
		expect(count2).toBe(1);
		loopFire(5); // 1500ms
		expect(count1).toBe(3);
		expect(count2).toBe(1);
		loopFire(5); // 2000ms
		expect(count1).toBe(4);
		expect(count2).toBe(2);
		expect(m._identifiers.length).toEqual(2);
	});

	it("setInterval - zero interval", () => {
		const m = new TimerManager(trigger, 10);

		let count = 0;
		const interval = m.setInterval(() => {
			count++;
		}, 0);
		loopFire(10); // 1000ms
		expect(count).toBe(1000);
	});

	it("clearInterval", () => {
		const m = new TimerManager(trigger, 10);

		let count = 0;
		const interval = m.setInterval(() => {
			count++;
		}, 500);
		loopFire(20); // 2000ms
		expect(count).toBe(4);
		m.clearInterval(interval);
		expect(m._identifiers.length).toEqual(0);
		loopFire(20); // 4000ms
		expect(count).toBe(4);
	});

	it("clearInterval - error(not found)", () => {
		const m = new TimerManager(trigger, 10);

		const interval = m.setInterval(() => {
			/* do nothing */
		}, 500);
		loopFire(3);
		m.clearInterval(interval);
		expect(() => {
			m.clearInterval(interval);
		}).toThrowError("AssertionError");
	});

	it("clearInterval - error(invalid identifier)", () => {
		const m = new TimerManager(trigger, 10);

		const interval = m.setInterval(() => {
			/* do nothing */
		}, 500);
		loopFire(3);
		interval.destroy();
		expect(() => {
			m.clearInterval(interval);
		}).toThrowError("AssertionError");
	});

	it("clearInterval - two timers", () => {
		const m = new TimerManager(trigger, 10);

		let count1 = 0;
		let count2 = 0;
		const interval1 = m.setInterval(() => {
			count1++;
		}, 500);
		const interval2 = m.setInterval(() => {
			count2++;
		}, 500);
		expect(m._identifiers.length).toEqual(2);
		loopFire(20); // 2000ms
		m.clearInterval(interval1);
		loopFire(20); // 4000ms
		expect(count1).toBe(4);
		expect(count2).toBe(8);
		m.clearInterval(interval2);
		loopFire(20); // 6000ms
		expect(count1).toBe(4);
		expect(count2).toBe(8);
		expect(m._identifiers.length).toEqual(0);
	});

	it("destroy", () => {
		const m = new TimerManager(trigger, 10);

		const timeout1 = m.setTimeout(() => {
			/* do nothing */
		}, 100);
		const timeout2 = m.setTimeout(() => {
			/* do nothing */
		}, 200);
		const timeout3 = m.setTimeout(() => {
			/* do nothing */
		}, 300);
		const timer1 = timeout1._timer;
		const timer2 = timeout1._timer;
		const timer3 = timeout1._timer;

		expect(m._timers.length).toBe(3);
		expect(m.destroyed()).toBe(false);
		expect(timeout1.destroyed()).toBe(false);
		expect(timeout2.destroyed()).toBe(false);
		expect(timeout3.destroyed()).toBe(false);
		expect(timer1.destroyed()).toBe(false);
		expect(timer2.destroyed()).toBe(false);
		expect(timer3.destroyed()).toBe(false);
		expect(m._identifiers.length).toEqual(3);

		m.destroy();
		expect(m._timers).toBeUndefined();
		expect(timeout1.destroyed()).toBe(true);
		expect(timeout2.destroyed()).toBe(true);
		expect(timeout3.destroyed()).toBe(true);
		expect(timer1.destroyed()).toBe(true);
		expect(timer2.destroyed()).toBe(true);
		expect(timer3.destroyed()).toBe(true);
		expect(m._identifiers).toBeUndefined();
	});
});
