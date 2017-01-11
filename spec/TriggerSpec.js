describe("test Trigger", function() {
	var g = require('../lib/main.node.js');
	var trigger;

	beforeEach(function() {
		trigger = new g.Trigger();
	});

	afterEach(function() {
	});

	it("初期化", function() {
		expect(trigger._handlers.length).toEqual(0);
	});

	it("handleOnce", function() {
		var counter = 0;
		var mockHandle = function() {
			counter++;
			return true;
		};
		trigger.handle(mockHandle);
		trigger.fire();
		expect(counter).toBe(1);
		expect(trigger._handlers.length).toEqual(0);
	});

	it("_remove", function() {
		var counter = 0;
		var mockHandle = function() {
			counter++;
		};
		trigger.handle(mockHandle);
		trigger.fire();
		expect(counter).toBe(1);
		trigger._remove(trigger._handlers[0]);
		trigger.fire();
		expect(counter).toBe(1);
	});

	it("_reset", function(done) {
		trigger.handle(done.fail);
		trigger.handle(done, done.fail);
		expect(trigger._handlers.length).toBe(2);
		trigger._reset();
		expect(trigger._handlers.length).toBe(0);
		trigger.fire();
		done();
	});

	it("handle", function() {
		var owner = {};
		var mockHandle = function() {};
		trigger.handle(owner, mockHandle, "name");
		expect(trigger._handlers.length).toEqual(1);
		expect(trigger._handlers[0]).toEqual({owner: owner, handler: mockHandle, name:"name"});
		trigger.handle(owner, mockHandle);
		expect(trigger._handlers.length).toEqual(2);
		expect(trigger._handlers[1]).toEqual({owner: owner, handler: mockHandle, name: undefined});
		trigger.handle(mockHandle);
		expect(trigger._handlers.length).toEqual(3);
		expect(trigger._handlers[2]).toEqual({owner: undefined, handler: mockHandle, name: undefined});
	});

	it("destory with destroyed", function() {
		expect(trigger.destroyed()).toBe(false);
		trigger.destroy();
		expect(trigger.destroyed()).toBe(true);
		expect(trigger.chain).toBeUndefined();
		expect(trigger._handlers).toBeUndefined();
	});

	it("hasHandler", function() {
		expect(trigger.hasHandler()).toBe(false);
		var mockHandle = function() {};
		trigger.handle(mockHandle);
		expect(trigger.hasHandler()).toBe(true);
	});

	it("handleInsert", function() {
		var mockHandle = function() {};
		var mockHandle2 = function() {};
		var mockHandle3 = function() {};
		trigger.handle(mockHandle);
		expect(trigger._handlers[0].handler).toBe(mockHandle);
		trigger.handleInsert(0, mockHandle2);
		expect(trigger._handlers[0].handler).toBe(mockHandle2);
		trigger.handleInsert(1, mockHandle3);
		expect(trigger._handlers[1].handler).toBe(mockHandle3);
		
		expect(trigger._handlers[0].handler).toBe(mockHandle2);
		expect(trigger._handlers[1].handler).toBe(mockHandle3);
		expect(trigger._handlers[2].handler).toBe(mockHandle);
	});

	it("removeAll", function() {
		var mockHandle = function() {};
		var mockHandle2 = function() {};
		var mockHandle3 = function() {};

		var owner = {id:1};
		var owner2 = {id:2};
		var owner3 = {id:3};
		
		trigger.handle(owner, mockHandle);
		trigger.removeAll(owner);
		expect(trigger.hasHandler()).toBe(false);

		trigger.handle(owner2, mockHandle2);
		trigger.handle(owner3, mockHandle3);
		trigger.removeAll(owner2);
		expect(trigger._handlers.length).toEqual(1);
		expect(trigger._handlers[0].handler).toBe(mockHandle3);

		trigger.handle(owner3, mockHandle);
		trigger.handle(owner3, mockHandle2);
		trigger.removeAll(owner3);
		expect(trigger.hasHandler()).toBe(false);
	});

	it("removeAllByHandler", function() {
		var mockHandle = function() {};
		var mockHandle2 = function() {};
		var mockHandle3 = function() {};

		var owner = {id:1};
		var owner2 = {id:2};
		var owner3 = {id:3};
		var owner4 = {id:4};

		trigger.handle(mockHandle);
		trigger.removeAllByHandler(mockHandle);
		expect(trigger.hasHandler()).toBe(false);

		trigger.handle(owner, mockHandle2);
		trigger.handle(owner2, mockHandle3);
		trigger.removeAllByHandler(mockHandle2);
		expect(trigger._handlers.length).toEqual(1);
		expect(trigger._handlers[0].handler).toBe(mockHandle3);

		trigger.handle(owner3, mockHandle3);
		trigger.handle(owner4, mockHandle3);
		trigger.removeAllByHandler(mockHandle3);
		expect(trigger.hasHandler()).toBe(false);
	});

	it("removeByName", function() {
		var owner = {};
		var mockHandle = function() {};
		trigger.handle(owner, mockHandle, "name1");
		trigger.handle(owner, mockHandle, "name2");
		trigger.handle(mockHandle, "name3");
		trigger.removeByName("nameFoo");
		trigger.handle(owner, mockHandle, "names");
		trigger.handle(owner, mockHandle, "names");
		expect(trigger._handlers.length).toBe(5);
		trigger.removeByName("name1");
		expect(trigger._handlers.length).toBe(4);
		trigger.removeByName("name2");
		expect(trigger._handlers.length).toBe(3);
		trigger.removeByName("names");
		expect(trigger._handlers.length).toBe(1);
	});

	it("isHandled", function() {
		var mockHandle = function() {};
		var mockHandle2 = function() {};
		var mockHandle3 = function() {};

		var owner = {id:1};
		var owner2 = {id:2};

		trigger.handle(owner, mockHandle);
		expect(trigger.isHandled(owner, mockHandle)).toBe(true);
		expect(trigger.isHandled(owner2, mockHandle)).toBe(false);
		trigger.handle(owner2, mockHandle2);
		expect(trigger.isHandled(owner, mockHandle2)).toBe(false);
		expect(trigger.isHandled(owner2, mockHandle2)).toBe(true);
		trigger.handle(mockHandle3);
		expect(trigger.isHandled(owner, mockHandle3)).toBe(false);
		expect(trigger.isHandled(owner2, mockHandle3)).toBe(false);
		expect(trigger.isHandled(mockHandle3)).toBe(true);
	});

	it("fire", function() {
		var counter = 0;
		var that;
		var mockHandle = function(param) {
			counter++;
			that = this;
			return !!param;
		};

		var owner = {id:1};

		trigger.handle(mockHandle);
		trigger.fire();
		expect(counter).toBe(1);
		expect(trigger.hasHandler()).toBe(true);
		
		trigger.fire(true);
		expect(counter).toBe(2);
		expect(trigger.hasHandler()).toBe(false);

		trigger.handle(owner, mockHandle);
		trigger.fire();
		expect(counter).toBe(3);
		expect(trigger.hasHandler()).toBe(true);
		expect(that).toBe(owner);
	});

	it("_activateChain, _deactivateChain and chain fire", function() {
		var counter = 0;
		var mockHandle = function() {
			counter++;
		};
		var trigger2 = new g.Trigger(trigger);
		trigger2.handle(mockHandle);
		trigger2._deactivateChain();
		trigger.fire();
		expect(counter).toBe(0);
		trigger2._activateChain();
		trigger.fire();
		expect(counter).toBe(1);
		trigger2._deactivateChain();
		trigger.fire();
		expect(counter).toBe(1);
	});
});
