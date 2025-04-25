import { AudioPlayContext } from "../AudioPlayContext";
import type { AudioPlayer } from "./helpers";
import { customMatchers, Game, ResourceFactory } from "./helpers";

expect.extend(customMatchers);

describe("test AudioSystem", () => {
	it("AudioSystem#volumeの入力値チェック", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const system = game.audio.music;
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
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const system = game.audio.music;
		const audio = new ResourceFactory().createAudioAsset("testId", "testAssetPath", 0, system, false, {});

		system.requestDestroy(audio);
		expect(system._destroyRequestedAssets[audio.id]).toEqual(audio);
		expect(system.getDestroyRequestedAsset(audio.id)).toEqual(audio);

		system.cancelRequestDestroy(audio);
		expect(system.getDestroyRequestedAsset(audio.id)).toBeNull();
		expect(system._destroyRequestedAssets[audio.id]).toBeUndefined();
	});

	it("AudioSystem#_setPlaybackRate", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const system = game.audio.sound;
		const player1 = system.createPlayer();
		const player2 = system.createPlayer();

		expect(player1._muted).toBeFalsy();
		expect(player2._muted).toBeFalsy();

		system._setPlaybackRate(0.3);
		expect(player1._muted).toBeTruthy();
		expect(player2._muted).toBeTruthy();
	});

	it("AudioSystem#_changeMuted", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const system = game.audio.sound;
		const player1 = system.createPlayer();
		const asset = game.resourceFactory.createAudioAsset("a1", "./dummypath", 2000, system, false, {});

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
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const system = game.audio.sound;
		const asset = game.resourceFactory.createAudioAsset("dummy", "audio/dummy", 0, system, true, {});
		const player = system.createPlayer();

		system._setPlaybackRate(0.3);
		system.requestDestroy(asset);
		expect(system._destroyRequestedAssets.dummy).toBe(asset);

		system._reset();
		expect(player._muted).toBeTruthy();
		expect(system._destroyRequestedAssets).toEqual({});
	});

	it("MusicAudioSystem#_reset", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const system = game.audio.music;
		const asset = game.resourceFactory.createAudioAsset("dummy", "audio/dummy", 0, system, true, {});
		const player = system.createPlayer();

		system._setPlaybackRate(0.3);
		system.requestDestroy(asset);
		expect(player._muted).toBeTruthy();
		expect(system._destroyRequestedAssets.dummy).toBe(asset);

		system._reset();
		expect(system._destroyRequestedAssets).toEqual({});
	});

	it("MusicAudioSystem#_setPlaybackRate", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const system = game.audio.music;
		const player1 = system.createPlayer() as AudioPlayer;
		const asset = game.resourceFactory.createAudioAsset("a1", "./dummypath", 2000, system, false, {});

		let playedCalled = 0;
		let stoppedCalled = 0;
		function resetCalledCount(): void {
			playedCalled = 0;
			stoppedCalled = 0;
		}

		player1.onPlay.add(() => {
			++playedCalled;
		});
		player1.onStop.add(() => {
			++stoppedCalled;
		});

		resetCalledCount();
		player1.play(asset);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);

		// 再生速度が非等倍になったらミュートにする
		system._setPlaybackRate(0.4);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);
		expect(player1._muted).toBeTruthy();

		// 再生速度が非等倍の状態で再生された場合、ミュートとなる
		player1.stop();
		resetCalledCount();
		player1.play(asset);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);
		expect(player1._muted).toBeTruthy();

		// 再生速度が等倍再生に戻った場合、ミュートが解除される
		system._setPlaybackRate(1.0);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);
		expect(player1._muted).toBeFalsy();
	});

	it("SoundAudioSystem#_setPlaybackRate", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const system = game.audio.sound;
		const player1 = system.createPlayer() as AudioPlayer;
		const asset = game.resourceFactory.createAudioAsset("a1", "./dummypath", 2000, system, false, {});

		let playedCalled = 0;
		let stoppedCalled = 0;
		function resetCalledCount(): void {
			playedCalled = 0;
			stoppedCalled = 0;
		}

		player1.onPlay.add(() => {
			++playedCalled;
		});
		player1.onStop.add(() => {
			++stoppedCalled;
		});

		resetCalledCount();
		player1.play(asset);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);

		// 再生速度が非等倍になったらミュートにする
		system._setPlaybackRate(0.6);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);
		expect(player1._muted).toBeTruthy();
		player1.stop();

		// 再生速度が非等倍の状態で再生された場合、ミュートとなる
		const player2 = system.createPlayer() as AudioPlayer;
		resetCalledCount();
		player2.onPlay.add(() => {
			++playedCalled;
		});
		player2.play(asset);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);
		expect(player2._muted).toBeTruthy();

		// 再生速度が等倍速度に戻っても Sound はミュートのままとなる。
		const player3 = system.createPlayer() as AudioPlayer;
		system._setPlaybackRate(0.5);
		expect(player3._muted).toBeTruthy();
		system._setPlaybackRate(1.0);
		expect(player3._muted).toBeTruthy();
	});

	it("MusicAudioSystem#_onVolumeChanged", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const system = game.audio.music;
		const player = system.createPlayer() as AudioPlayer;

		const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});
		const ctx1 = system.create(asset);
		// systemのvolumeが変更されても、playerの音量は変わらない
		player.changeVolume(0.2);
		system.volume = 0.7;
		expect(player.volume).toBe(0.2);
		expect(system.volume).toBe(0.7);
		expect(ctx1.volume).toBe(0.7);
	});

	it("SoundAudioSystem#_onVolumeChanged", () => {
		const game = new Game({ width: 320, height: 320, main: "", assets: {} });
		const system = game.audio.sound;
		const player = system.createPlayer() as AudioPlayer;
		const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});
		const ctx1 = system.create(asset);
		// systemのvolumeが変更されても、playerの音量は変わらない
		player.changeVolume(0.3);
		system.volume = 0.7;
		expect(player.volume).toBe(0.3);
		expect(system.volume).toBe(0.7);
		expect(ctx1.volume).toBe(0.7);
	});

	describe("AudioPlayContext operations", () => {
		beforeEach(() => {
			jest.resetAllMocks();
		});

		it("MusicAudioSystem#create", () => {
			const game = new Game({ width: 320, height: 320, main: "", assets: {} });
			const system = game.audio.music;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});

			const ctx1 = system.create(asset);
			const ctx2 = system.create(asset);
			const ctx3 = system.create(asset);

			expect(ctx1.volume).toBe(1.0);
			expect(ctx1._id).toBe("music-0");
			expect(ctx2.volume).toBe(1.0);
			expect(ctx2._id).toBe("music-1");
			expect(ctx3.volume).toBe(1.0);
			expect(ctx3._id).toBe("music-2");
		});

		it("SoundAudioSystem#create", () => {
			const game = new Game({ width: 320, height: 320, main: "", assets: {} });
			const system = game.audio.sound;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});

			const ctx1 = system.create(asset);
			const ctx2 = system.create(asset);
			const ctx3 = system.create(asset);

			expect(ctx1.volume).toBe(1.0);
			expect(ctx1._id).toBe("sound-0");
			expect(ctx2.volume).toBe(1.0);
			expect(ctx2._id).toBe("sound-1");
			expect(ctx3.volume).toBe(1.0);
			expect(ctx3._id).toBe("sound-2");
		});

		it("MusicAudioSystem#play", () => {
			const game = new Game({ width: 320, height: 320, main: "", assets: {} });
			const system = game.audio.music;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});

			const mockPlay = jest.spyOn(AudioPlayContext.prototype, "play");
			const ctx = system.play(asset);

			expect(ctx.volume).toBe(1.0);
			expect(ctx._id).toBe("music-0");
			expect(mockPlay).toBeCalledTimes(1);
		});

		it("SoundAudioSystem#play", () => {
			const game = new Game({ width: 320, height: 320, main: "", assets: {} });
			const system = game.audio.sound;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});

			const mockPlay = jest.spyOn(AudioPlayContext.prototype, "play");
			const ctx = system.play(asset);

			expect(ctx.volume).toBe(1.0);
			expect(ctx._id).toBe("sound-0");
			expect(mockPlay).toBeCalledTimes(1);
		});

		it("MusicAudioSystem#stopAll", () => {
			const game = new Game({ width: 320, height: 320, main: "", assets: {} });
			const system = game.audio.music;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});

			const ctx1 = system.play(asset);
			const ctx2 = system.play(asset);
			const ctx3 = system.play(asset);

			const mockCtx1Stop = jest.spyOn(ctx1, "stop");
			const mockCtx2Stop = jest.spyOn(ctx2, "stop");
			const mockCtx3Stop = jest.spyOn(ctx3, "stop");

			system.stopAll();

			expect(mockCtx1Stop).toBeCalledTimes(1);
			expect(mockCtx2Stop).toBeCalledTimes(1);
			expect(mockCtx3Stop).toBeCalledTimes(1);
		});

		it("SoundAudioSystem#stopAll", () => {
			const game = new Game({ width: 320, height: 320, main: "", assets: {} });
			const system = game.audio.sound;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});

			const ctx1 = system.play(asset);
			const ctx2 = system.play(asset);
			const ctx3 = system.play(asset);

			const mockCtx1Stop = jest.spyOn(ctx1, "stop");
			const mockCtx2Stop = jest.spyOn(ctx2, "stop");
			const mockCtx3Stop = jest.spyOn(ctx3, "stop");

			system.stopAll();

			expect(mockCtx1Stop).toBeCalledTimes(1);
			expect(mockCtx2Stop).toBeCalledTimes(1);
			expect(mockCtx3Stop).toBeCalledTimes(1);
		});

		it("MusicAudioSystem: should be cleaned the context map every 5 times an audio context is created", () => {
			const game = new Game({ width: 320, height: 320, main: "", assets: {} });
			const system = game.audio.music;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});
			const mockCleanMap = jest.spyOn(system._contextMap, "clean");

			for (let i = 0; i < 1; i++) {
				system.create(asset);
			}
			expect(mockCleanMap).toBeCalledTimes(0);

			for (let i = 0; i < 5; i++) {
				system.create(asset);
			}
			expect(mockCleanMap).toBeCalledTimes(1);

			for (let i = 0; i < 5; i++) {
				system.create(asset);
			}
			expect(mockCleanMap).toBeCalledTimes(2);
		});

		it("SoundAudioSystem: should be cleaned the context map every 50 times an audio context is created", () => {
			const game = new Game({ width: 320, height: 320, main: "", assets: {} });
			const system = game.audio.sound;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});
			const mockCleanMap = jest.spyOn(system._contextMap, "clean");

			for (let i = 0; i < 5; i++) {
				system.create(asset);
			}
			expect(mockCleanMap).toBeCalledTimes(0);

			for (let i = 0; i < 50; i++) {
				system.create(asset);
			}
			expect(mockCleanMap).toBeCalledTimes(1);

			for (let i = 0; i < 50; i++) {
				system.create(asset);
			}
			expect(mockCleanMap).toBeCalledTimes(2);
		});

		it("MusicAudioSystem: should suppress audio players when AudioSystem#_startSuppress() is called", () => {
			const game = new Game({ width: 320, height: 320, main: "", assets: {} });
			const system = game.audio.music;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});

			const ctx1 = system.create(asset);
			const ctx2 = system.create(asset);
			const ctx3 = system.create(asset);

			ctx1.changeVolume(0.3);
			ctx2.changeVolume(0.4);
			ctx3.changeVolume(0.5);

			expect(ctx1._player.volume).toBe(0.3);
			expect(ctx2._player.volume).toBe(0.4);
			expect(ctx3._player.volume).toBe(0.5);

			system._startSuppress();
			expect(ctx1._player.volume).toBe(0);
			expect(ctx2._player.volume).toBe(0);
			expect(ctx3._player.volume).toBe(0);

			system._endSuppress();
			expect(ctx1._player.volume).toBe(0.3);
			expect(ctx2._player.volume).toBe(0.4);
			expect(ctx3._player.volume).toBe(0.5);
		});

		it("SoundAudioSystem: should suppress audio players when AudioSystem#_startSuppress() is called", () => {
			const game = new Game({ width: 320, height: 320, main: "", assets: {} });
			const system = game.audio.sound;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});

			const ctx1 = system.create(asset);
			const ctx2 = system.create(asset);
			const ctx3 = system.create(asset);

			expect(ctx1._player.volume).toBe(1.0);
			expect(ctx2._player.volume).toBe(1.0);
			expect(ctx3._player.volume).toBe(1.0);

			const mockCtx1Stop = jest.spyOn(ctx1._player, "stop");
			const mockCtx2Stop = jest.spyOn(ctx2._player, "stop");
			const mockCtx3Stop = jest.spyOn(ctx3._player, "stop");

			system._startSuppress();

			expect(mockCtx1Stop).toBeCalledTimes(1);
			expect(mockCtx2Stop).toBeCalledTimes(1);
			expect(mockCtx3Stop).toBeCalledTimes(1);
		});
	});
});
