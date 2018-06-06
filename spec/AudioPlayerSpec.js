describe("test AudioPlayer", function() {
	var g = require('../lib/main.node.js');
	var mock = require('./helpers/mock');

	beforeEach(function() {
		jasmine.addMatchers(require("./helpers/customMatchers"));
	});

	afterEach(function() {
	});

	it("初期化-music", function() {
		var game = new mock.Game({ width: 320, height: 320 });
		var system = new g.MusicAudioSystem("music", game);
		var player = new g.AudioPlayer(system, true);
		expect(player.volume).toBe(system.volume);
		expect(player.played.constructor).toBe(g.Trigger);
		expect(player.stopped.constructor).toBe(g.Trigger);
		expect(player).toHaveUndefinedValue("currentAudio");
	});

	it("初期化-sound", function() {
		var game = new mock.Game({ width: 320, height: 320 });
		var system = new g.SoundAudioSystem("voice", game);
		system.volume = 0.5;
		var player = new g.AudioPlayer(system);
		expect(player.volume).toBe(system.volume);
		expect(player.played.constructor).toBe(g.Trigger);
		expect(player.stopped.constructor).toBe(g.Trigger);
		expect(player).toHaveUndefinedValue("currentAudio");
	});

	it("can chnage volume", function() {
		var game = new mock.Game({ width: 320, height: 320 });
		var system = new g.MusicAudioSystem("music", game);
		var player = new mock.AudioPlayer(system);
		var volumeAfterChanged = 0.3;
		player.changeVolume(volumeAfterChanged);
		expect(player.volume).toBe(volumeAfterChanged);
		expect(player._volumeBeforeMuted).toBe(volumeAfterChanged);
	});

	it("can become mute mode and cancel mute mode", function() {
		var game = new mock.Game({ width: 320, height: 320 });
		var system = new g.MusicAudioSystem("music", game);
		var player = new mock.AudioPlayer(system);
		var volumeAfterChanged = 0.3;
		player.changeVolume(volumeAfterChanged);
		player._changeMuted(true);
		expect(player.volume).toBe(0);
		expect(player._volumeBeforeMuted).toBe(volumeAfterChanged);
		player._changeMuted(false);
		expect(player.volume).toBe(volumeAfterChanged);
		expect(player._volumeBeforeMuted).toBe(volumeAfterChanged);
	});

	it("can change volume-before-muted in mute mode", function() {
		var game = new mock.Game({ width: 320, height: 320 });
		var system = new g.MusicAudioSystem("music", game);
		var player = new mock.AudioPlayer(system);
		var volumeAfterChanged = 0.3;
		player.changeVolume(1);
		player._changeMuted(true);
		expect(player.volume).toBe(0);
		expect(player._volumeBeforeMuted).toBe(1);
		player.changeVolume(volumeAfterChanged);
		player._changeMuted(false);
		expect(player.volume).toBe(volumeAfterChanged);
		expect(player._volumeBeforeMuted).toBe(volumeAfterChanged);
	});
});
