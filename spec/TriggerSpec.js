describe("test Trigger", function() {
	var g = require('../lib/');
	var trigger;

	beforeEach(function() {
		trigger = new g.Trigger();
	});

	it("初期化", function() {
		expect(trigger._handlers.length).toBe(0);
	});

	it("addOnce", function() {
		var counter = 0;
		var mockHandle = function() {
			counter++;
			return true;
		};
		trigger.addOnce(mockHandle);
		trigger.fire();
		expect(counter).toBe(1);
		expect(trigger._handlers.length).toBe(0);
	});

	it("remove", function() {
		var counter = 0;
		var mockHandle = function() {
			counter++;
		};
		trigger.add(mockHandle);
		trigger.fire();
		expect(counter).toBe(1);
		trigger.remove(trigger._handlers[0]);
		trigger.fire();
		expect(counter).toBe(1);
	});

	it("add", function() {
		var owner = {};
		var mockHandle = function() {};
		trigger.add({owner: owner, func: mockHandle, name: "name"});
		expect(trigger._handlers.length).toBe(1);
		expect(trigger._handlers[0]).toEqual({owner: owner, func: mockHandle, name:"name", once: false});
		trigger.add(mockHandle, owner);
		expect(trigger._handlers.length).toBe(2);
		expect(trigger._handlers[1]).toEqual({owner: owner, func: mockHandle, name: undefined, once: false});
		trigger.add(mockHandle);
		expect(trigger._handlers.length).toBe(3);
		expect(trigger._handlers[2]).toEqual({owner: undefined, func: mockHandle, name: undefined, once: false});
	});

	it("destory with destroyed", function() {
		expect(trigger.destroyed()).toBe(false);
		trigger.destroy();
		expect(trigger.destroyed()).toBe(true);
		expect(trigger._handlers).toBe(null);
	});

	it("contains", function() {
		var mockHandle = function() {};
		var mockHandle2 = function() {};
		var mockHandle3 = function() {};

		var owner = {id:1};
		var owner2 = {id:2};

		trigger.add(mockHandle, owner);
		expect(trigger.contains(mockHandle, owner)).toBe(true);
		expect(trigger.contains(mockHandle, owner2)).toBe(false);
		trigger.add(mockHandle2, owner2);
		expect(trigger.contains(mockHandle2, owner)).toBe(false);
		expect(trigger.contains(mockHandle2, owner2)).toBe(true);
		trigger.add(mockHandle3);
		expect(trigger.contains(mockHandle3, owner)).toBe(false);
		expect(trigger.contains(mockHandle3, owner2)).toBe(false);
		expect(trigger.contains(mockHandle3)).toBe(true);
	});

	it("remove", function() {
		var mockHandle1 = function() {};
		var mockHandle2 = function() {};
		var mockHandle3 = function() {};
		trigger.add(mockHandle1);
		trigger.add(mockHandle2);
		trigger.add(mockHandle3);
		expect(trigger._handlers.length).toBe(3);
		trigger.remove(mockHandle1);
		expect(trigger._handlers.length).toBe(2);
		trigger.remove(mockHandle2);
		expect(trigger._handlers.length).toBe(1);
		trigger.remove(mockHandle3);
		expect(trigger._handlers.length).toBe(0);
	});

	it("removeAll by owner", function() {
		var mockHandle = function() {};
		var mockHandle2 = function() {};
		var mockHandle3 = function() {};

		var owner = {id:1};
		var owner2 = {id:2};
		var owner3 = {id:3};

		trigger.add(mockHandle, owner);
		trigger.removeAll({owner: owner});
		expect(trigger._handlers.length).toBe(0);

		trigger.add(mockHandle2, owner2);
		trigger.add(mockHandle3, owner3);
		trigger.removeAll({owner: owner2});
		expect(trigger._handlers.length).toBe(1);
		expect(trigger._handlers[0]).toEqual({func: mockHandle3, owner: owner3, once: false, name: undefined});

		trigger.add(mockHandle, owner3);
		trigger.add(mockHandle2, owner3);
		trigger.removeAll({owner: owner3});
		expect(trigger._handlers.length).toBe(0);
	});

	it("removeAll by name", function() {
		var owner = {};
		var mockHandle = function() {};
		trigger.add({owner: owner, func: mockHandle, name: "name1"});
		trigger.add({owner: owner, func: mockHandle, name: "name2"});
		trigger.add({func: mockHandle, name: "name3"});
		trigger.removeAll({name: "nameFoo"});
		trigger.add({owner: owner, func: mockHandle, name: "names"});
		trigger.add({owner: owner, func: mockHandle, name: "names"});
		expect(trigger._handlers.length).toBe(5);
		trigger.removeAll({name: "name1"});
		expect(trigger._handlers.length).toBe(4);
		trigger.removeAll({name: "name2"});
		expect(trigger._handlers.length).toBe(3);
		trigger.removeAll({name: "names"});
		expect(trigger._handlers.length).toBe(1);
	});

	it("removeAll by handler", function() {
		var mockHandle = function() {};
		var mockHandle2 = function() {};
		var mockHandle3 = function() {};

		var owner = {id:1};
		var owner2 = {id:2};
		var owner3 = {id:3};
		var owner4 = {id:4};

		trigger.add(mockHandle);
		trigger.removeAll({func: mockHandle});
		expect(trigger._handlers.length).toBe(0);

		trigger.add(mockHandle2, owner);
		trigger.add(mockHandle3, owner2);
		trigger.removeAll({func: mockHandle2});
		expect(trigger._handlers.length).toEqual(1);
		expect(trigger._handlers[0]).toEqual({func: mockHandle3, owner: owner2, once: false, name: undefined});

		trigger.add(mockHandle3, owner3);
		trigger.add(mockHandle3, owner4);
		trigger.removeAll({func: mockHandle3});
		expect(trigger._handlers.length).toBe(0);
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

		trigger.add(mockHandle);
		trigger.fire();
		expect(counter).toBe(1);
		expect(trigger._handlers.length).toBe(1);

		trigger.fire(true);
		expect(counter).toBe(2);
		expect(trigger._handlers.length).toBe(0);

		trigger.add(mockHandle, owner);
		trigger.fire();
		expect(counter).toBe(3);
		expect(trigger._handlers.length).toBe(1);
		expect(that).toBe(owner);
	});

	it("can stop fire, if handler was destroyed", function() {
		var counter = 0;
		var mockHandle = function() {
			counter++;
		};
		trigger.add(mockHandle);
		trigger.fire();
		expect(counter).toBe(1);
		trigger.destroy();
		trigger.fire();
		expect(counter).toBe(1);
	});
});
