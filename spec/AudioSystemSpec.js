describe("test AudioPlayer", function() {
	var g = require('../lib/main.node.js');
	var mock = require('./helpers/mock');

	beforeEach(function() {
		jasmine.addMatchers(require("./helpers/customMatchers"));
	});

	afterEach(function() {
	});

	it("AudioSystem#volumeの入力値チェック", function() {
		var game = new mock.Game({ width: 320, height: 320 });
		var system = new g.MusicAudioSystem("music", game);
		expect(function() { system.volume = NaN}).toThrowError("AssertionError");
		expect(function() { system.volume = undefined}).toThrowError("AssertionError");
		expect(function() { system.volume = null}).toThrowError("AssertionError");
		expect(function() { system.volume = ""}).toThrowError("AssertionError");
		expect(function() { system.volume = false}).toThrowError("AssertionError");
		expect(function() { system.volume = true}).toThrowError("AssertionError");
		expect(function() { system.volume = 0 - 0.001}).toThrowError("AssertionError");
		expect(function() { system.volume = 1 + 0.001}).toThrowError("AssertionError");
	});

	it("AudioSystem#PureVirtualError", function() {
		var game = new mock.Game({ width: 320, height: 320 });
		var system = new g.AudioSystem("music", game);
		var audio = new mock.ResourceFactory().createAudioAsset("testId", "testAssetPath");
		expect(function() { system.stopAll() }).toThrowError("PureVirtualError");
		expect(function() { system.findPlayers(audio) }).toThrowError("PureVirtualError");
		expect(function() { system.createPlayer() }).toThrowError("PureVirtualError");
		expect(function() { system._onVolumeChanged() }).toThrowError("PureVirtualError");
		system.requestDestroy(audio);
		expect(system._destroyRequestedAssets[audio.id]).toEqual(audio);
	});

	it("AudioSystem#_setPlaybackRate", function () {
		var game = new mock.Game({ width: 320, height: 320 });
		var system = game.audio["sound"];
		var player1 = system.createPlayer();
		var player2 = system.createPlayer();

		expect(player1._playbackRate).toBe(1.0);
		expect(player2._playbackRate).toBe(1.0);

		system._setPlaybackRate(0.3);
		expect(player1._playbackRate).toBe(0.3);
		expect(player2._playbackRate).toBe(0.3);
	});

	it("AudioSystem#_changeMuted", function () {
		var game = new mock.Game({ width: 320, height: 320 });
		var system = game.audio["sound"];
		var player1 = system.createPlayer();
		var asset = game.resourceFactory.createAudioAsset("a1", "./dummypath", 2000, "sound");

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

	it("SoundAudioSystem#_reset", function () {
		var game = new mock.Game({ width: 320, height: 320 });
		var system = game.audio["sound"];
		var asset = game.resourceFactory.createAudioAsset("dummy", "audio/dummy", 0, system, true, {});
		var player = system.createPlayer();

		system._setPlaybackRate(0.3);
		system.requestDestroy(asset);
		expect(player._playbackRate).toBe(0.3);
		expect(system._playbackRate).toBe(0.3);
		expect(system._destroyRequestedAssets["dummy"]).toBe(asset);

		system._reset();
		expect(system._playbackRate).toBe(1);
		expect(system._destroyRequestedAssets).toEqual({});
	});

	it("MusicAudioSystem#_reset", function () {
		var game = new mock.Game({ width: 320, height: 320 });
		var system = game.audio["music"];
		var asset = game.resourceFactory.createAudioAsset("dummy", "audio/dummy", 0, system, true, {});
		var player = system.createPlayer();

		system._setPlaybackRate(0.3);
		system.requestDestroy(asset);
		expect(player._playbackRate).toBe(0.3);
		expect(system._playbackRate).toBe(0.3);
		expect(system._destroyRequestedAssets["dummy"]).toBe(asset);

		system._reset();
		expect(system._playbackRate).toBe(1);
		expect(system._destroyRequestedAssets).toEqual({});
	});

	it("MusicAudioSystem#_setPlaybackRate", function () {
		var game = new mock.Game({ width: 320, height: 320 });
		var system = game.audio["music"];
		var player1 = system.createPlayer();
		var asset = game.resourceFactory.createAudioAsset("a1", "./dummypath", 2000, "music");

		var playedCalled, stoppedCalled;
		function resetCalledCount() {
			playedCalled = 0;
			stoppedCalled = 0;
		}

		player1.played.handle(function () {
			++playedCalled;
		});
		player1.stopped.handle(function () {
			++stoppedCalled;
		});

		expect(player1._playbackRate).toBe(1.0);
		player1.supportsPlaybackRateValue = false;

		resetCalledCount();
		player1.play(asset);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);

		// 再生速度非サポートでも、非等倍になった時点で鳴っていた音は止めない
		system._setPlaybackRate(0.4);
		expect(player1._playbackRate).toBe(0.4);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);

		// 非等倍再生時、開始直後に止まる
		player1.stop();
		resetCalledCount();
		player1.play(asset);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(1);

		// 等倍再生に戻すと、再生され直す
		system._setPlaybackRate(1.0);
		expect(playedCalled).toBe(2);
		expect(stoppedCalled).toBe(1);

		// 再生速度サポートの場合
		expect(player1._playbackRate).toBe(1.0);
		player1.supportsPlaybackRateValue = true;

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

	it("SoundAudioSystem#_setPlaybackRate", function () {
		var game = new mock.Game({ width: 320, height: 320 });
		var system = game.audio["sound"];
		var player1 = system.createPlayer();
		var asset = game.resourceFactory.createAudioAsset("a1", "./dummypath", 2000, "sound");

		var playedCalled, stoppedCalled;
		function resetCalledCount() {
			playedCalled = 0;
			stoppedCalled = 0;
		}

		player1.played.handle(function () {
			++playedCalled;
		});
		player1.stopped.handle(function () {
			++stoppedCalled;
		});

		expect(player1._playbackRate).toBe(1.0);
		player1.supportsPlaybackRateValue = false;

		resetCalledCount();
		player1.play(asset);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);

		// 再生速度非サポートでも、非等倍になった時点で鳴っていた音は止めない
		system._setPlaybackRate(0.6);
		expect(player1._playbackRate).toBe(0.6);
		expect(playedCalled).toBe(1);
		expect(stoppedCalled).toBe(0);

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
