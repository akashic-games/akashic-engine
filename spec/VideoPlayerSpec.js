describe("VideoPlayer", function() {
	var g = require('../lib/main.node.js');

	it("initializes itself", function() {
		const player = new g.VideoPlayer();
		expect(player._loop).toBe(false);
		expect(player.volume).toBe(1.0);
		expect(player.played.constructor).toBe(g.Trigger);
		expect(player.stopped.constructor).toBe(g.Trigger);
		expect(player.currentVideo).toBeUndefined();
	});
});
