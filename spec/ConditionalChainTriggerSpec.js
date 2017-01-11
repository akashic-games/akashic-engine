describe("test ConditionalChainTrigger", function() {
	var g = require('../lib/main.node.js');
	
	beforeEach(function() {
	});

	afterEach(function() {
	});

	it("初期化", function() {
		var trigger = new g.Trigger();
		var filterOwner = {};
		var filter = function(e) {
			return true;
		};
		var conditionalChaintrigger = new g.ConditionalChainTrigger(trigger, filterOwner, filter);

		expect(conditionalChaintrigger.chain).toBe(trigger);
		expect(conditionalChaintrigger.filterOwner).toBe(filterOwner);
		expect(conditionalChaintrigger.filter).toBe(filter);
	});

	it("fire", function() {
		var trigger = new g.Trigger();
		var filterOwner = {};
		var filter = function(e) {
			return e;
		};
		var conditionalChaintrigger = new g.ConditionalChainTrigger(trigger, filterOwner, filter);
		var counter = 0;
		var mockHandle = function(param) {
			counter++;
		};
		conditionalChaintrigger.handle(mockHandle);

		trigger.fire(false);
		expect(counter).toBe(0);
		trigger.fire(true);
		expect(counter).toBe(1);
		trigger.fire(false);
		expect(counter).toBe(1);
		trigger.fire(true);
		expect(counter).toBe(2);
		trigger.fire(true);
		expect(counter).toBe(3);
	});
});
