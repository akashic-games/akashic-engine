import { Trigger } from "@akashic/trigger";
import { Game } from "./helpers";

describe("test AudioPlayer", () => {
	it("初期化-music", () => {
		const game = new Game({ width: 320, height: 320, main: "" });
		const system = game.audio.music;
		const player = system.createPlayer();
		expect(player.volume).toBe(system.volume);
		expect(player.onPlay.constructor).toBe(Trigger);
		expect(player.onStop.constructor).toBe(Trigger);
		expect(player.currentAudio).toBeUndefined();
	});

	it("初期化-sound", () => {
		const game = new Game({ width: 320, height: 320, main: "" });
		const system = game.audio.sound;
		system.volume = 0.5;
		const player = system.createPlayer();
		expect(player.volume).toBe(system.volume);
		expect(player.onPlay.constructor).toBe(Trigger);
		expect(player.onStop.constructor).toBe(Trigger);
		expect(player.currentAudio).toBeUndefined();
	});
});
