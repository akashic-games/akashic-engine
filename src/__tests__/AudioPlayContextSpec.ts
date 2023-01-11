import { AudioPlayContext, Scene } from "..";
import type { GameConfiguration } from "..";
import { Game } from "./helpers";

describe("test AudioPlayContext", () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	const gameConfiguration: GameConfiguration = {
		width: 320,
		height: 320,
		fps: 30,
		main: "mainScene",
		audio: {
			user2: {
				loop: true,
				hint: { streaming: true }
			}
		},
		assets: {
			zoo: {
				type: "audio",
				path: "/path/to/a/zoo",
				virtualPath: "path/to/a/zoo",
				systemId: "music",
				duration: 1984
			},
			baz: {
				type: "audio",
				path: "/path/to/a/baz",
				virtualPath: "path/to/a/baz",
				systemId: "music",
				duration: 42,
				loop: false,
				hint: { streaming: false }
			},
			qux: {
				type: "audio",
				path: "/path/to/a/qux",
				virtualPath: "path/to/a/qux",
				systemId: "sound",
				duration: 667408
			},
			quux: {
				type: "audio",
				path: "/path/to/a/quux",
				virtualPath: "path/to/a/quux",
				systemId: "sound",
				duration: 5972,
				loop: true,
				hint: { streaming: true }
			}
		}
	};

	const prepareLoadedScene = async (): Promise<{ game: Game; scene: Scene }> => {
		return new Promise(resolve => {
			const game = new Game(gameConfiguration);
			const scene = new Scene({ game, assetIds: ["zoo", "baz", "qux", "quux"] });
			game.pushScene(scene);
			game._flushPostTickTasks();
			scene._onReady.add(() => {
				resolve({ game, scene });
			});
			scene._load();
		});
	};

	it("initialize", async () => {
		const { game, scene } = await prepareLoadedScene();

		const resourceFactory = game.resourceFactory;
		const music = game.audio.music;
		const zoo = scene.asset.getAudioById("zoo");

		const ctx1 = new AudioPlayContext({
			id: "play-context-1",
			resourceFactory,
			system: music,
			systemId: music.id,
			asset: zoo
		});

		expect(ctx1.asset).toEqual(zoo);
		expect(ctx1._id).toBe("play-context-1");
		expect(ctx1._system).toEqual(music);
		expect(ctx1._volume).toBe(1.0);
		expect(ctx1._player).toBeDefined();

		const sound = game.audio.sound;
		sound._setMuted(true);
		sound.volume = 0.5;
		const qux = scene.asset.getAudioById("qux");

		const ctx2 = new AudioPlayContext({
			id: "play-context-2",
			resourceFactory,
			system: sound,
			systemId: sound.id,
			asset: qux,
			volume: 0.8
		});

		expect(ctx2.asset).toEqual(qux);
		expect(ctx2._id).toBe("play-context-2");
		expect(ctx2._system).toEqual(sound);
		expect(ctx2._volume).toBe(0.8); // AudioSystem とは独立
		expect(ctx2._player).toBeDefined();
	});

	it("should stop audio context when its asset has been destroyed", async () => {
		const { game, scene } = await prepareLoadedScene();

		const resourceFactory = game.resourceFactory;
		const music = game.audio.music;
		const zoo = scene.asset.getAudioById("zoo");

		const ctx = new AudioPlayContext({
			id: "play-context",
			resourceFactory,
			system: music,
			systemId: music.id,
			asset: zoo
		});

		const mockStop = jest.spyOn(ctx._player, "stop");
		zoo.onDestroyed.fire(zoo);

		expect(mockStop).toBeCalledTimes(1);
	});

	it("should suppress the audio player when AudioPlayContext#_suppress() is called", async () => {
		const { game, scene } = await prepareLoadedScene();

		const resourceFactory = game.resourceFactory;
		const music = game.audio.music;
		const sound = game.audio.sound;
		const zoo = scene.asset.getAudioById("zoo");

		const ctx1 = new AudioPlayContext({
			id: "play-context-1",
			resourceFactory,
			system: music,
			systemId: music.id,
			asset: zoo
		});

		ctx1.changeVolume(0.3);
		ctx1._startSuppress();
		expect(ctx1._player.volume).toBe(0);

		ctx1._endSuppress();
		// systemId: music の場合は endSuppress 後に再生を続ける
		expect(ctx1._player.volume).toBe(0.3);

		const ctx2 = new AudioPlayContext({
			id: "play-context-2",
			resourceFactory,
			system: sound,
			systemId: sound.id,
			asset: zoo
		});

		const mockCtx2Stop = jest.spyOn(ctx2._player, "stop");
		ctx2._startSuppress();

		// systemId: music 以外の場合は startSuppress 時点で停止する
		expect(mockCtx2Stop).toBeCalledTimes(1);
		ctx2._endSuppress();
	});
});
