import { Trigger } from "@akashic/trigger";
import { MusicAudioSystem, SoundAudioSystem } from "..";
import { AudioPlayer, Game } from "./helpers";

describe("test AudioPlayer", () => {
	it("初期化-music", () => {
		const game = new Game({ width: 320, height: 320, main: "" });
		const system = new MusicAudioSystem({
			id: "music",
			muted: game._audioSystemManager._muted,
			isSuppressed: game._audioSystemManager._isSuppressed,
			resourceFactory: game.resourceFactory
		});
		const player = new AudioPlayer({ volume: system.volume, muted: system._isSuppressed || system._muted });
		expect(player.volume).toBe(system.volume);
		expect(player.played.constructor).toBe(Trigger);
		expect(player.stopped.constructor).toBe(Trigger);
		expect(player.currentAudio).toBeUndefined();
	});

	it("初期化-sound", () => {
		const game = new Game({ width: 320, height: 320, main: "" });
		const system = new SoundAudioSystem({
			id: "voice",
			muted: game._audioSystemManager._muted,
			isSuppressed: game._audioSystemManager._isSuppressed,
			resourceFactory: game.resourceFactory
		});
		system.volume = 0.5;
		const player = new AudioPlayer({ volume: system.volume, muted: system._isSuppressed || system._muted });
		expect(player.volume).toBe(system.volume);
		expect(player.played.constructor).toBe(Trigger);
		expect(player.stopped.constructor).toBe(Trigger);
		expect(player.currentAudio).toBeUndefined();
	});
});
