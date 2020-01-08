import { MusicAudioSystem } from "..";
import { AudioPlayer, customMatchers, Game, ResourceFactory } from "./helpers";

expect.extend(customMatchers);

describe("test AudioPlayer", () => {
	it("AudioSystem#volumeの入力値チェック", () => {
		const game = new Game({ width: 320, height: 320, main: "" });
		const system = new MusicAudioSystem({
			id: "music",
			muted: game._audioSystemManager._muted,
			playbackRate: game._audioSystemManager._playbackRate,
			resourceFactory: game.resourceFactory
		});
		expect(() => {
			system.volume = NaN!;
		}).toThrowError();
		expect(() => {
			system.volume = undefined!;
		}).toThrowError();
		expect(() => {
			system.volume = null!;
		}).toThrowError();
		expect(() => {
			system.volume = "" as any;
		}).toThrowError();
		expect(() => {
			system.volume = false as any;
		}).toThrowError();
		expect(() => {
			system.volume = true as any;
		}).toThrowError();
		expect(() => {
			system.volume = 0 - 0.001;
		}).toThrowError();
		expect(() => {
			system.volume = 1 + 0.001;
		}).toThrowError();
	});

	it("AudioSystem#_destroyRequestedAssets", () => {
		const game = new Game({ width: 320, height: 320, main: "" });
		const system = new MusicAudioSystem({
			id: "music",
			muted: game._audioSystemManager._muted,
			playbackRate: game._audioSystemManager._playbackRate,
			resourceFactory: game.resourceFactory
		});
		const audio = new ResourceFactory().createAudioAsset("testId", "testAssetPath", 0, null, false, null);
		system.requestDestroy(audio);
		expect(system._destroyRequestedAssets[audio.id]).toEqual(audio);
	});

	it("AudioSystem#_setPlaybackRate", () => {
		const game = new Game({ width: 320, height: 320, main: "" });
		const system = game.audio.sound;
		const player1 = system.createPlayer();

		system._setPlaybackRate(0.3);
		expect(system._playbackRate).toBe(0.3);
		expect(player1._muted).toBeTruthy();
	});

	it("AudioSystem#_changeMuted", () => {
		const game = new Game({ width: 320, height: 320, main: "" });
		const system = game.audio.sound;
		const player1 = system.createPlayer();
		const asset = game.resourceFactory.createAudioAsset("a1", "./dummypath", 2000, system, false, null);

		expect(player1._muted).toBe(false);
		player1.play(asset);
		player1.stop();
		expect(player1._muted).toBe(false);

		player1._changeMuted(true);
		expect(player1._muted).toBe(true);
		player1.play(asset);
		player1.stop();
		expect(player1._muted).toBe(true);
	});

	it("SoundAudioSystem#_reset", () => {
		const game = new Game({ width: 320, height: 320, main: "" });
		const system = game.audio.sound;
		const asset = game.resourceFactory.createAudioAsset("dummy", "audio/dummy", 0, system, true, {});
		const player = system.createPlayer();

		system._setPlaybackRate(0.3);
		system.requestDestroy(asset);
		expect(system._playbackRate).toBe(0.3);
		expect(system._destroyRequestedAssets.dummy).toBe(asset);

		system._reset();
		expect(system._playbackRate).toBe(1);
		expect(system._destroyRequestedAssets).toEqual({});
	});

	it("MusicAudioSystem#_reset", () => {
		const game = new Game({ width: 320, height: 320, main: "" });
		const system = game.audio.music;
		const asset = game.resourceFactory.createAudioAsset("dummy", "audio/dummy", 0, system, true, {});

		system._setPlaybackRate(0.3);
		system.requestDestroy(asset);
		expect(system._playbackRate).toBe(0.3);
		expect(system._destroyRequestedAssets.dummy).toBe(asset);

		system._reset();
		expect(system._playbackRate).toBe(1);
		expect(system._destroyRequestedAssets).toEqual({});
	});

	it("MusicAudioSystem#_setPlaybackRate", () => {
		const game = new Game({ width: 320, height: 320, main: "" });
		const system = game.audio.music;
		const player1 = system.createPlayer() as AudioPlayer;
		const asset = game.resourceFactory.createAudioAsset("a1", "./dummypath", 2000, system, false, null);

		let playedCalled = 0;
		let stoppedCalled = 0;
		function resetCalledCount(): void {
			playedCalled = 0;
			stoppedCalled = 0;
		}

		player1.played.add(() => {
			++playedCalled;
		});
		player1.stopped.add(() => {
			++stoppedCalled;
		});

		resetCalledCount();
		player1.play(asset);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);

		// 非等倍になったらミュートにする
		system._setPlaybackRate(0.4);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);
		expect(player1._muted).toBeTruthy();

		// 非等倍で再生時、Triggerのplayed は実行されずミュートとなる
		player1.stop();
		resetCalledCount();
		player1.play(asset);
		expect(playedCalled).toBe(0);
		expect(stoppedCalled).toBe(0);
		expect(player1._muted).toBeTruthy();

		// 等倍再生に戻すと、ミュートが解除される
		player1.play(asset);
		system._setPlaybackRate(1.0);
		expect(playedCalled).toBe(0);
		expect(stoppedCalled).toBe(0);
		expect(player1._muted).toBeFalsy();
	});

	it("SoundAudioSystem#_setPlaybackRate", () => {
		const game = new Game({ width: 320, height: 320, main: "" });
		const system = game.audio.sound;
		const player1 = system.createPlayer() as AudioPlayer;
		const asset = game.resourceFactory.createAudioAsset("a1", "./dummypath", 2000, system, false, null);

		let playedCalled = 0;
		let stoppedCalled = 0;
		function resetCalledCount(): void {
			playedCalled = 0;
			stoppedCalled = 0;
		}

		player1.played.add(() => {
			++playedCalled;
		});
		player1.stopped.add(() => {
			++stoppedCalled;
		});

		resetCalledCount();
		player1.play(asset);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);

		// 非等倍になったらミュートにする
		system._setPlaybackRate(0.6);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);
		expect(player1._muted).toBeTruthy();
		player1.stop();

		// 非等倍で再生時、ミュートになりTriggerのplayed は実行されない
		const player2 = system.createPlayer() as AudioPlayer;
		resetCalledCount();
		player2.played.add(() => {
			++playedCalled;
		});
		player2.play(asset);
		expect(playedCalled).toBe(0);
		expect(stoppedCalled).toBe(0);
		expect(player2._muted).toBeTruthy();

		// 等倍速度に戻してもSoundはミュートのままとなる。
		const player3 = system.createPlayer() as AudioPlayer;
		system._setPlaybackRate(0.5);
		expect(player3._muted).toBeTruthy();
		system._setPlaybackRate(1.0);
		expect(player3._muted).toBeTruthy();
	});
});
