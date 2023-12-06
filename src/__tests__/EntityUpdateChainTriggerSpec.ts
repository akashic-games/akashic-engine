import { Trigger } from "@akashic/trigger";
import { EntityUpdateChainTrigger } from "../auxiliary/EntityUpdateChainTrigger";
import { skeletonRuntime } from "./helpers";

describe("test EntityUpdateChainTrigger", () => {
	it("can call the handler normally", () => {
		const { game } = skeletonRuntime();
		const chain = new Trigger<void>();
		const trigger = new EntityUpdateChainTrigger(game, chain);

		const func = jest.fn();
		trigger.add(func);

		trigger.fire();
		expect(func).toBeCalledTimes(1);

		trigger.fire();
		trigger.fire();
		trigger.fire();
		trigger.fire();
		expect(func).toBeCalledTimes(5);

		game.tick(false);
		trigger.fire();
		trigger.fire();
		trigger.fire();
		trigger.fire();
		expect(func).toBeCalledTimes(9);
	});

	it("can delay the call of the handler until the next tick if 'waitingNextTick' is true, ", () => {
		const { game } = skeletonRuntime();
		const chain = new Trigger<void>();
		const trigger = new EntityUpdateChainTrigger(game, chain);

		const func = jest.fn();

		trigger.waitingNextTick = true;
		trigger.add(func);

		trigger.fire();
		trigger.fire();
		trigger.fire();
		trigger.fire();
		expect(func).toBeCalledTimes(0);

		game.tick(false);
		trigger.fire();
		trigger.fire();
		trigger.fire();
		trigger.fire();
		expect(func).toBeCalledTimes(4);
	});

	it("can reference the 'filter' if registered", () => {
		const { game } = skeletonRuntime();
		const chain = new Trigger<void>();
		const trigger = new EntityUpdateChainTrigger(game, chain);

		const func = jest.fn();
		const filter = jest
			.fn()
			.mockImplementationOnce(() => false)
			.mockImplementation(() => true);

		trigger.waitingNextTick = true;
		trigger.add({
			func,
			filter
		});

		trigger.fire();
		trigger.fire();
		trigger.fire();
		trigger.fire();
		expect(func).toBeCalledTimes(0);
		expect(filter).toBeCalledTimes(0);

		game.tick(false);
		trigger.fire();
		expect(func).toBeCalledTimes(0);
		expect(filter).toBeCalledTimes(1);

		trigger.fire();
		expect(func).toBeCalledTimes(1);
		expect(filter).toBeCalledTimes(2);

		trigger.fire();
		expect(func).toBeCalledTimes(2);
		expect(filter).toBeCalledTimes(3);

		trigger.fire();
		expect(func).toBeCalledTimes(3);
		expect(filter).toBeCalledTimes(4);
	});
});
