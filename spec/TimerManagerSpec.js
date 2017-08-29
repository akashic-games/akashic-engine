var g = require("../lib/main.node.js");
var mock = require("./helpers/mock");

describe("test TimerManager", function () {
	var skeletonRuntime = require("./helpers/skeleton");
	var trigger;

	beforeEach(function () {
		jasmine.addMatchers(require("./helpers/customMatchers"));
		trigger = new g.Trigger();
	});

	afterEach(function () {
	});

	function loopFire(count) {
		var i = 0;
		while(i < count) {
			trigger.fire.call(trigger);
			i++;
		}
	}

	it("constructor", function () {
		var m = new g.TimerManager(trigger, 30);

		expect(m._timers.length).toEqual(0);
		expect(m._trigger).toBe(trigger);
		expect(m._identifiers.length).toEqual(0);
		expect(m._fps).toBe(30);
		expect(m._registered).toBe(false);
		expect(m._trigger.isHandled(m, m._tick)).toBe(false);
	});

	it("createTimer", function() {
		var m = new g.TimerManager(trigger, 30);

		var timer = m.createTimer(100);
		expect(m._timers.length).toBe(1);
		expect(m._timers[0]).toBe(timer);
		expect(m._registered).toBe(true);
		expect(m._trigger.isHandled(m, m._tick)).toBe(true);
		expect(m._identifiers.length).toEqual(0);
	});

	it("createTimer - shared timer(same interval)", function() {
		var m = new g.TimerManager(trigger, 30);

		var timer1 = m.createTimer(100);
		var timer2 = m.createTimer(100);
		expect(m._timers.length).toBe(1);
		expect(timer1).toBe(timer2);
	});

	it("createTimer - new timer(different interval)", function() {
		var m = new g.TimerManager(trigger, 30);

		var timer1 = m.createTimer(100);
		var timer2 = m.createTimer(101);
		expect(m._timers.length).toBe(2);
		expect(timer1).not.toBe(timer2);
	});

	it("createTimer - new timer(same interval)", function() {
		var m = new g.TimerManager(trigger, 30);

		var timer1 = m.createTimer(100);
		trigger.fire();
		var timer2 = m.createTimer(100);
		expect(m._timers.length).toBe(2);
		expect(timer1).not.toBe(timer2);
	});

	it("createTimer - error", function() {
		var m = new g.TimerManager(trigger, 30);
		expect(function() { m.createTimer(-1); }).toThrowError("AssertionError");
	});

	it("deleteTimer", function() {
		var m = new g.TimerManager(trigger, 30);

		var timer = m.createTimer(100);
		expect(m._timers.length).toBe(1);
		expect(m._identifiers.length).toEqual(0);
		expect(m._timers[0]).toBe(timer);
		expect(m._registered).toBe(true);
		m.deleteTimer(timer);
		expect(m._timers.length).toBe(0);
		expect(m._registered).toBe(false);
		expect(timer.destroyed()).toBe(true);
		expect(trigger.isHandled(m, m._tick)).toBe(false);
	});

	it("deleteTimer - handler remains", function() {
		var m = new g.TimerManager(trigger, 30);

		var timer1 = m.createTimer(100);
		var timer2 = m.createTimer(101);
		m.deleteTimer(timer1);
		expect(timer1.destroyed()).toBe(true);
		expect(m._registered).toBe(true);
		expect(m._trigger.isHandled(m, m._tick)).toBe(true);
		m.deleteTimer(timer2);
		expect(timer2.destroyed()).toBe(true);
		expect(m._registered).toBe(false);
		expect(m._trigger.isHandled(m, m._tick)).toBe(false);
	});

	it("deleteTimer - error (invalid context)", function() {
		var m = new g.TimerManager(trigger, 30);

		var t = new g.Timer(100);
		expect(function() { m.deleteTimer(t); }).toThrowError("AssertionError");
	});

	it("deleteTimer - error (invalid status)", function() {
		var m = new g.TimerManager(trigger, 30);

		var t = m.createTimer(100);
		m._registered = false;
		expect(function() { m.deleteTimer(t); }).toThrowError("AssertionError");
	});

	it("setTimeout", function() {
		var m = new g.TimerManager(trigger, 30);

		var parent = new Object();
		var passedOwner = null;
		var count = 0;
		var timeout = m.setTimeout(function() {
			count++;
			passedOwner = this;
		}, 1000, parent);
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

	it("setInterval - check calculation error", function() {
		var m = new g.TimerManager(trigger, 30);

		var parent = new Object();
		var count = 0;
		var timeout = m.setInterval(function() {
			count++;
		}, 2000, parent);
		loopFire(60);
		expect(count).toBe(1);
	});


	it("setTimeout - invalid status", function() {
		var m = new g.TimerManager(trigger, 30);

		var parent = new Object();
		var count = 0;
		var timeout = m.setTimeout(function() {
			count++;
		}, 1000, parent);
		expect(m._identifiers.length).toEqual(1);
		m._identifiers.length = 0;
		expect(function() { loopFire(30); }).toThrowError("AssertionError");
	});

	it("setTimeout - serial two timers(same interval)", function() {
		var m = new g.TimerManager(trigger, 30);

		var count1 = 0;
		var count2 = 0;
		var timeout1 = m.setTimeout(function() {
			count1++;
		}, 1000);
		expect(m._identifiers.length).toEqual(1);
		loopFire(30); // 1000ms
		expect(m._identifiers.length).toEqual(0);
		expect(count1).toBe(1);

		var timeout2 = m.setTimeout(function() {
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

	it("setTimeout - parallel two timers(same interval)", function() {
		var m = new g.TimerManager(trigger, 30);

		var count1 = 0;
		var count2 = 0;
		var timeout1 = m.setTimeout(function() {
			count1++;
		}, 1000);
		var timeout2 = m.setTimeout(function() {
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

	it("setTimeout - serial two timers(different interval)", function() {
		var m = new g.TimerManager(trigger, 10);

		var count1 = 0;
		var count2 = 0;
		var timeout1 = m.setTimeout(function() {
			count1++;
		}, 500);
		loopFire(5); // 500ms
		expect(count1).toBe(1);

		var timeout2 = m.setTimeout(function() {
			count2++;
		}, 1000);
		loopFire(10); // 1500ms
		expect(count2).toBe(1);
		loopFire(15); // 3000ms
		expect(count2).toBe(1);
		expect(count1).toBe(1);
		expect(m._identifiers.length).toEqual(0);
	});

	it("setTimeout - parallel two timers(different interval)", function() {
		var m = new g.TimerManager(trigger, 10);

		var count1 = 0;
		var count2 = 0;
		var timeout1 = m.setTimeout(function() {
			count1++;
		}, 500);
		var timeout2 = m.setTimeout(function() {
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

	it("setTimeout - zero interval", function() {
		var m = new g.TimerManager(trigger, 10);

		var count = 0;
		var timeout = m.setTimeout(function() {
			count++;
		}, 0);

		loopFire(1); // 100ms
		expect(count).toBe(1);
		loopFire(10); // 1100ms
		expect(count).toBe(1);
	});

	it("clearTimeout", function() {
		var m = new g.TimerManager(trigger, 10);

		var count = 0;
		var timeout = m.setTimeout(function() {
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

	it("clearTimeout - error(not found)", function() {
		var m = new g.TimerManager(trigger, 10);

		var timeout = m.setTimeout(function() {}, 500);
		loopFire(3);
		m.clearTimeout(timeout);
		expect(function() { m.clearTimeout(timeout); }).toThrowError("AssertionError");
	});

	it("clearTimeout - error(invalid identifier)", function() {
		var m = new g.TimerManager(trigger, 10);

		var timeout = m.setTimeout(function() {}, 500);
		loopFire(3);
		timeout.destroy();
		expect(function() { m.clearTimeout(timeout); }).toThrowError("AssertionError");
	});

	it("clearTimeout - parallel two timers", function() {
		var m = new g.TimerManager(trigger, 10);

		var count1 = 0;
		var count2 = 0;
		var timeout1 = m.setTimeout(function() {
			count1++;
		}, 500);
		var timeout2 = m.setTimeout(function() {
			count2++;
		}, 500);
		loopFire(3); // 300ms
		m.clearTimeout(timeout1);
		loopFire(2); // 500ms
		expect(count1).toBe(0);
		expect(count2).toBe(1);
	});

	it("clearTimeout - zero interval", function() {
		var m = new g.TimerManager(trigger, 10);

		var count = 0;
		var timeout = m.setTimeout(function() {
			count++;
		}, 0);
		m.clearTimeout(timeout);
		loopFire(10); // 1000ms
		expect(count).toBe(0);
	});

	it("setInterval", function() {
		var m = new g.TimerManager(trigger, 10);

		var parent = new Object();
		var passedOwner = null;
		var count = 0;
		var interval = m.setInterval(function() {
			count++;
			passedOwner = this;
		}, 500, parent);
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

	it("setInterval - two timers(same interval)", function() {
		var m = new g.TimerManager(trigger, 10);

		var count1 = 0;
		var count2 = 0;
		var interval1 = m.setInterval(function() {
			count1++;
		}, 500);
		var interval2 = m.setInterval(function() {
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

	it("setInterval - two timers(different interval)", function() {
		var m = new g.TimerManager(trigger, 10);

		var count1 = 0;
		var count2 = 0;
		var timeout1 = m.setInterval(function() {
			count1++;
		}, 500);
		var timeout2 = m.setInterval(function() {
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


	it("setInterval - zero interval", function() {
		var m = new g.TimerManager(trigger, 10);

		var count = 0;
		var interval = m.setInterval(function() {
			count++;
		}, 0);
		loopFire(10); // 1000ms
		expect(count).toBe(1000);
	});

	it("clearInterval", function() {
		var m = new g.TimerManager(trigger, 10);

		var count = 0;
		var interval = m.setInterval(function() {
			count++;
		}, 500);
		loopFire(20); // 2000ms
		expect(count).toBe(4);
		m.clearInterval(interval);
		expect(m._identifiers.length).toEqual(0);
		loopFire(20); // 4000ms
		expect(count).toBe(4);
	});

	it("clearInterval - error(not found)", function() {
		var m = new g.TimerManager(trigger, 10);

		var interval = m.setInterval(function() {}, 500);
		loopFire(3);
		m.clearInterval(interval);
		expect(function() { m.clearInterval(interval); }).toThrowError("AssertionError");
	});

	it("clearInterval - error(invalid identifier)", function() {
		var m = new g.TimerManager(trigger, 10);

		var interval = m.setInterval(function() {}, 500);
		loopFire(3);
		interval.destroy();
		expect(function() { m.clearInterval(interval); }).toThrowError("AssertionError");
	});

	it("clearInterval - two timers", function() {
		var m = new g.TimerManager(trigger, 10);

		var count1 = 0;
		var count2 = 0;
		var interval1 = m.setInterval(function() {
			count1++;
		}, 500);
		var interval2 = m.setInterval(function() {
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

	it("destroy", function () {
		var m = new g.TimerManager(trigger, 10);

		var timeout1 = m.setTimeout(function() {}, 100);
		var timeout2 = m.setTimeout(function() {}, 200);
		var timeout3 = m.setTimeout(function() {}, 300);
		var timer1 = timeout1._timer;
		var timer2 = timeout1._timer;
		var timer3 = timeout1._timer;


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
