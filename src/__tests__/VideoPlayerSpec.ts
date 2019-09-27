import { VideoPlayer, Trigger } from "..";

describe("VideoPlayer", () => {
	it("initializes itself", () => {
		const player = new VideoPlayer();
		expect(player._loop).toBe(false);
		expect(player.volume).toBe(1.0);
		expect(player.played.constructor).toBe(Trigger);
		expect(player.stopped.constructor).toBe(Trigger);
		expect(player.currentVideo).toBeUndefined();
	});
});
