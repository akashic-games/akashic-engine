describe("test Timer", function() {
    var g = require('../lib/');
    var mock = require("./helpers/mock");
    var skeletonRuntime = require("./helpers/skeleton");

    beforeEach(function() {
    });

    afterEach(function() {
    });

    it("初期化", function() {
        var interval = 1;
        var timer = new g.Timer(interval, 30);

        expect(timer.interval).toEqual(interval);
        expect(timer.elapsed instanceof g.Trigger).toBe(true);
        expect(timer._scaledElapsed).toEqual(0);
        expect(timer._scaledInterval).toEqual(interval * 30);

        interval = 2;
        var timer2 = new g.Timer(interval, 30);

        expect(timer2.interval).toEqual(interval);
        expect(timer2.elapsed instanceof g.Trigger).toBe(true);
        expect(timer2._scaledElapsed).toEqual(0);
        expect(timer2._scaledInterval).toEqual(interval * 30);

        interval = 3.3;
        var timer3 = new g.Timer(interval, 30);

        expect(timer3.interval).toEqual(interval);
        expect(timer3.elapsed instanceof g.Trigger).toBe(true);
        expect(timer3._scaledElapsed).toEqual(0);
        expect(timer3._scaledInterval).toEqual(Math.round(interval * 30));
    });

    it("tick with elpased fire", function() {
        var interval = 1;
        var timer = new g.Timer(interval, 30);
        var firedCounter = 0;
        timer.elapsed.fire = function() {
            firedCounter++;
        };
        timer.tick();
        expect(firedCounter).toEqual(33);

        timer.tick();
        expect(firedCounter).toEqual(66);

        firedCounter = 0;
        timer.interval = 2;
        timer._scaledInterval = 2 * 30;
        timer._scaledElapsed = 0;
        timer.tick();
        expect(firedCounter).toEqual(16);
    });

    it("canDelete", function() {
        var interval = 1;
        var timer = new g.Timer(interval, 30);

        expect(timer.canDelete()).toBe(true);

        timer.elapsed.add(function() {});

        expect(timer.canDelete()).toBe(false);
    });

    it("destroy with destoyed", function() {
        var interval = 1;
        var timer = new g.Timer(interval, 30);
        var elapsedDestoyFlg = false;
        timer.elapsed.destroy = function() {
            elapsedDestoyFlg = true;
        };

        expect(timer.destroyed()).toBe(false);

        timer.destroy();

        expect(timer.destroyed()).toBe(true);
        expect(timer.interval).toBeUndefined();
        expect(timer.elapsed).toBeUndefined();
        expect(elapsedDestoyFlg).toBe(true);
    });
});
