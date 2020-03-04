import { Trigger } from "@akashic/trigger";
import { VideoPlayer } from "..";

describe("VideoPlayer", () => {
	it("initializes itself", () => {
		const player = new VideoPlayer();
		expect(player._loop).toBe(false);
		expect(player.volume).toBe(1.0);
		expect(player.onPlay.constructor).toBe(Trigger);
		expect(player.onStop.constructor).toBe(Trigger);
		expect(player.currentVideo).toBeUndefined();
	});
});
