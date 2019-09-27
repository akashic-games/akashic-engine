import { MusicAudioSystem, Trigger, SoundAudioSystem } from "..";
import { Game, AudioPlayer, customMatchers } from "./helpers";

describe("test AudioPlayer", () => {
	beforeEach(() => {
		expect.extend(customMatchers);
	});

	it("初期化-music", () => {
		var game = new Game({ width: 320, height: 320 });
		var system = new MusicAudioSystem("music", game);
		var player = new AudioPlayer(system);
		expect(player.volume).toBe(system.volume);
		expect(player.played.constructor).toBe(Trigger);
		expect(player.stopped.constructor).toBe(Trigger);
		expect(player.currentAudio).toBeUndefined();
	});

	it("初期化-sound", () => {
		var game = new Game({ width: 320, height: 320 });
		var system = new SoundAudioSystem("voice", game);
		system.volume = 0.5;
		var player = new AudioPlayer(system);
		expect(player.volume).toBe(system.volume);
		expect(player.played.constructor).toBe(Trigger);
		expect(player.stopped.constructor).toBe(Trigger);
		expect(player.currentAudio).toBeUndefined();
	});
});
