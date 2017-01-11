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
		expect(player._loop).toBe(true);
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
		expect(player._loop).toBe(false);
		expect(player.volume).toBe(system.volume);
		expect(player.played.constructor).toBe(g.Trigger);
		expect(player.stopped.constructor).toBe(g.Trigger);
		expect(player).toHaveUndefinedValue("currentAudio");
	});
});
