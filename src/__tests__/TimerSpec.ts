import { Trigger } from "@akashic/trigger";
import { Timer } from "..";

describe("test Timer", () => {
	it("初期化", () => {
		let interval = 1;
		const timer = new Timer(interval, 30);

		expect(timer.interval).toEqual(interval);
		expect(timer.onElapsed instanceof Trigger).toBe(true);
		expect(timer._scaledElapsed).toEqual(0);
		expect(timer._scaledInterval).toEqual(interval * 30);

		interval = 2;
		const timer2 = new Timer(interval, 30);

		expect(timer2.interval).toEqual(interval);
		expect(timer2.onElapsed instanceof Trigger).toBe(true);
		expect(timer2._scaledElapsed).toEqual(0);
		expect(timer2._scaledInterval).toEqual(interval * 30);

		interval = 3.3;
		const timer3 = new Timer(interval, 30);

		expect(timer3.interval).toEqual(interval);
		expect(timer3.onElapsed instanceof Trigger).toBe(true);
		expect(timer3._scaledElapsed).toEqual(0);
		expect(timer3._scaledInterval).toEqual(Math.round(interval * 30));
	});

	it("tick with elpased fire", () => {
		const interval = 1;
		const timer = new Timer(interval, 30);
		let firedCounter = 0;
		timer.onElapsed.fire = () => {
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

	it("canDelete", () => {
		const interval = 1;
		const timer = new Timer(interval, 30);

		expect(timer.canDelete()).toBe(true);

		timer.onElapsed.add(() => {
			/* do nothing */
		});

		expect(timer.canDelete()).toBe(false);
	});

	it("destroy with destoyed", () => {
		const interval = 1;
		const timer = new Timer(interval, 30);
		let elapsedDestoyFlg = false;
		timer.onElapsed.destroy = () => {
			elapsedDestoyFlg = true;
		};

		expect(timer.destroyed()).toBe(false);

		timer.destroy();

		expect(timer.destroyed()).toBe(true);
		expect(timer.interval).toBeUndefined();
		expect(timer.onElapsed).toBeUndefined();
		expect(elapsedDestoyFlg).toBe(true);
	});
});
