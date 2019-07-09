var g = require("../lib");
var mock = require("./helpers/mock");
describe("test E", function () {
	var runtime, e;
	var skeletonRuntime = require("./helpers/skeleton");

	beforeEach(function () {
		runtime = skeletonRuntime();
		e = new g.E({scene: runtime.scene});
		runtime.scene.append(e);
		e.width = 30;
		e.height = 20;
		e.touchable = true;
		e.modified();
	});
	afterEach(function () {
	});

	it("移動なし", function () {
		for (var x=0; x<e.width; x++) {
			for (var y=0; y<e.height; y++) {
				var t = e.findPointSourceByPoint({x: x, y: y});
				expect(t.target).toBe(e);
			}
		}
		var t = e.findPointSourceByPoint({x: e.width, y: e.height - 1});
		expect(t).toBeUndefined();
		var t = e.findPointSourceByPoint({x: e.width, y: e.height });
		expect(t).toBeUndefined();
		var t = e.findPointSourceByPoint({x: -1, y: 0});
		expect(t).toBeUndefined();
		var t = e.findPointSourceByPoint({x: 0, y: -1});
		expect(t).toBeUndefined();
	});

	it("移動あり", function () {
		var xp = 20;
		var yp = 10;
		e.moveTo(xp, yp);
		for (var x=xp; x<(e.width+xp); x++) {
			for (var y=yp; y<(e.height+yp); y++) {
				var t = e.findPointSourceByPoint({x: x, y: y});
				expect(t.target).toBe(e);
			}
		}
		var t = e.findPointSourceByPoint({x: e.width+xp, y: e.height+yp-1});
		expect(t).toBeUndefined();
		var t = e.findPointSourceByPoint({x: e.width+xp-1, y: e.height+yp});
		expect(t).toBeUndefined();
		var t = e.findPointSourceByPoint({x: xp-1, y: yp});
		expect(t).toBeUndefined();
		var t = e.findPointSourceByPoint({x: xp, y: yp-1});
		expect(t).toBeUndefined();
	});

	it("拡大あり", function () {
		var xp = 20;
		var yp = 10;
		var scale = 2;
		var w = e.width * scale / 4;
		var h = e.height * scale / 4;
		e.moveTo(xp, yp);
		e.scale(scale);
		for (var x = xp - w; x<(e.width+w+xp); x++) {
			for (var y = yp - h; y<(e.height+h+yp); y++) {
				var t = e.findPointSourceByPoint({x: x, y: y});
				expect(t.target).toBe(e);
			}
		}
		var t = e.findPointSourceByPoint({x: e.width+xp+w, y: e.height+yp+h-1});
		expect(t).toBeUndefined();
		var t = e.findPointSourceByPoint({x: e.width+xp+w-1, y: e.height+yp+h});
		expect(t).toBeUndefined();
		var t = e.findPointSourceByPoint({x: xp-w-1, y: yp-h});
		expect(t).toBeUndefined();
		var t = e.findPointSourceByPoint({x: xp-w, y: yp-h-1});
		expect(t).toBeUndefined();
	});

	it("回転あり", function () {
		var xp = 0;
		var yp = 0;
		var angle = 180;
		e.moveTo(xp, yp);
		e.angle = angle;
		for (var x=xp+0.1; x<(e.width+xp); x++) {
			for (var y=yp+0.1; y<(e.height+yp); y++) {
				var t = e.findPointSourceByPoint({x: x, y: y});
				expect(t.target).toBe(e);
			}
		}
		var t = e.findPointSourceByPoint({x: e.width+xp+0.1, y: e.height+yp-1});
		expect(t).toBeUndefined();
		var t = e.findPointSourceByPoint({x: e.width+xp-1, y: e.height+yp+0.1});
		expect(t).toBeUndefined();
		var t = e.findPointSourceByPoint({x: xp-1, y: yp});
		expect(t).toBeUndefined();
		var t = e.findPointSourceByPoint({x: xp, y: yp-1});
		expect(t).toBeUndefined();
	});

	it("拡大+回転あり", function () {
		var xp = 20;
		var yp = 10;
		var scale = 2;
		var w = e.width * scale / 4;
		var h = e.height * scale / 4;
		var angle = 180;
		e.moveTo(xp, yp);
		e.scale(scale);
		e.angle = angle;
		for (var x = xp - w+0.1; x<(e.width+w+xp); x++) {
			for (var y = yp - h+0.1; y<(e.height+h+yp); y++) {
				var t = e.findPointSourceByPoint({x: x, y: y});
				expect(t.target).toBe(e);
			}
		}
		var t = e.findPointSourceByPoint({x: e.width+xp+w+0.1, y: e.height+yp+h-1});
		expect(t).toBeUndefined();
		var t = e.findPointSourceByPoint({x: e.width+xp+w-1, y: e.height+yp+h+0.1});
		expect(t).toBeUndefined();
		var t = e.findPointSourceByPoint({x: xp-w-1, y: yp-h});
		expect(t).toBeUndefined();
		var t = e.findPointSourceByPoint({x: xp-w, y: yp-h-1});
		expect(t).toBeUndefined();
	});

	it("入れ子", function () {
		var xp = 20;
		var yp = 10;
		e.moveTo(xp, yp);
		e.scale(2);
		var e2 = new g.E({scene: runtime.scene});
		e2.width = 10;
		e2.height = 10;
		e2.scale(1.5);
		e.touchable = false;
		e.append(e2);
		e2.touchable = true;
		e2.modified();
		expect(e2.touchable).toBe(true);
		expect(e.touchable).toBe(false);
		expect(e._hasTouchableChildren).toBe(true);

		var t = e.findPointSourceByPoint({x: 20, y: 10});
		expect(t.target).toBe(e2);
		var t = e.findPointSourceByPoint({x: 30, y: 11});
		expect(t).toBeUndefined();
	});

	it("入れ子で両方有効", function () {
		var xp = 20;
		var yp = 10;
		e.moveTo(xp, yp);
		e.scale(2);
		var e2 = new g.E({scene: runtime.scene});
		e2.width = 10;
		e2.height = 10;
		e2.scale(1.5);
		e.touchable = true;
		e.append(e2);
		e2.modified();
		e2.touchable = true;
		expect(e2.touchable).toBe(true);
		expect(e._hasTouchableChildren).toBe(true);

		var t = e.findPointSourceByPoint({x: 20, y: 10});
		expect(t.target).toBe(e2);
		var t = e.findPointSourceByPoint({x: 30, y: 11});
		expect(t.target).toBe(e);
		var t = e.findPointSourceByPoint({x: 30, y: 40});
		expect(t).toBeUndefined();
	});

	it("入れ子のやつをappendしてその後remove", function () {
		var xp = 20;
		var yp = 10;
		e.moveTo(xp, yp);
		e.scale(2);
		var e2 = new g.E({scene: runtime.scene});
		e2.width = 10;
		e2.height = 10;
		e2.scale(1.5);
		e.touchable = false;
		e2.touchable = true;
		e.append(e2);
		e2.modified();
		expect(e2.touchable).toBe(true);
		expect(e.touchable).toBe(false);
		expect(e._hasTouchableChildren).toBe(true);

		e2.remove();
		expect(e._hasTouchableChildren).toBe(false);
	});
});
