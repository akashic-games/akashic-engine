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
		const player2 = system.createPlayer();

		expect(player1._playbackRate).toBe(1.0);
		expect(player2._playbackRate).toBe(1.0);

		system._setPlaybackRate(0.3);
		expect(player1._playbackRate).toBe(0.3);
		expect(player2._playbackRate).toBe(0.3);
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
		expect(player._playbackRate).toBe(0.3);
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
		const player = system.createPlayer();

		system._setPlaybackRate(0.3);
		system.requestDestroy(asset);
		expect(player._playbackRate).toBe(0.3);
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

		expect(player1._playbackRate).toBe(1.0);

		resetCalledCount();
		player1.play(asset);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);

		// 非等倍になった時点で鳴っていた音はミュートにしない
		system._setPlaybackRate(0.4);
		expect(player1._playbackRate).toBe(0.4);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);
		expect(player1._muted).toBeFalsy();

		// 非等倍再生時、開始直後にミュートとなる
		player1.stop();
		resetCalledCount();
		player1.play(asset);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);
		expect(player1._muted).toBeTruthy();

		// 等倍再生に戻すと、再生され直す
		system._setPlaybackRate(1.0);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);
		expect(player1._muted).toBeFalsy();

		// 再生速度サポートの場合
		expect(player1._playbackRate).toBe(1.0);

		resetCalledCount();
		player1.play(asset);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);

		system._setPlaybackRate(0.4);
		expect(player1._playbackRate).toBe(0.4);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);

		player1.stop();
		resetCalledCount();
		player1.play(asset);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);

		system._setPlaybackRate(1.0);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);
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

		expect(player1._playbackRate).toBe(1.0);

		resetCalledCount();
		player1.play(asset);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);

		// 非等倍になった時点で鳴っていた音を止める
		system._setPlaybackRate(0.6);
		expect(player1._playbackRate).toBe(0.6);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(1);

		// 非等倍再生時、開始直後に止まる
		player1.stop();
		resetCalledCount();
		player1.play(asset);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(1);

		// 等倍再生に戻しても再生しなおしはない (SoundAudioSystemの場合)
		system._setPlaybackRate(1.0);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(1);
	});
});
