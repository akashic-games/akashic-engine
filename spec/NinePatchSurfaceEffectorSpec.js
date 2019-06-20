describe("test NinePatchSurfaceEffector", function() {
	var g = require('../lib/');
	var mock = require("./helpers/mock");
	var game;

	beforeEach(function() {
		jasmine.addMatchers(require("./helpers/customMatchers"));
		game = new mock.Game({ width: 320, height: 320 });
	});

	afterEach(function() {
	});

	it("constructor - default borderWidth = 4", function() {
		var ninePatch = new g.NinePatchSurfaceEffector(game);

		expect(ninePatch.borderWidth.top).toBe(4);
		expect(ninePatch.borderWidth.bottom).toBe(4);
		expect(ninePatch.borderWidth.left).toBe(4);
		expect(ninePatch.borderWidth.right).toBe(4);
	});

	it("constructor - given borderWidth", function() {
		var borderWidth = {
			top: 1,
			bottom: 2,
			left: 3,
			right: 4
		}
		var ninePatch = new g.NinePatchSurfaceEffector(game, borderWidth);

		expect(ninePatch.borderWidth.top).toBe(1);
		expect(ninePatch.borderWidth.bottom).toBe(2);
		expect(ninePatch.borderWidth.left).toBe(3);
		expect(ninePatch.borderWidth.right).toBe(4);
	});

	it("render - drawImage", function() {
		var borderWidth = {
			top: 1,
			bottom: 2,
			left: 3,
			right: 4
		}
		var ninePatch = new g.NinePatchSurfaceEffector(game, borderWidth);
		var surface = new g.Surface(100, 100);
		var ninePatchSurface = ninePatch.render(surface, 100, 100);
		var drawImage = ninePatchSurface.createdRenderer.methodCallParamsHistory("drawImage");
		expect(drawImage.length).toBe(9);

		// corners
		expect(drawImage[0].width).toBe(3);
		expect(drawImage[0].height).toBe(1);
		expect(drawImage[1].width).toBe(4);
		expect(drawImage[1].height).toBe(1);
		expect(drawImage[2].width).toBe(3);
		expect(drawImage[2].height).toBe(2);
		expect(drawImage[3].width).toBe(4);
		expect(drawImage[3].height).toBe(2);

		// borders
		expect(drawImage[4].width).toBe(93);
		expect(drawImage[4].height).toBe(1);
		expect(drawImage[5].width).toBe(3);
		expect(drawImage[5].height).toBe(97);
		expect(drawImage[6].width).toBe(4);
		expect(drawImage[6].height).toBe(97);
		expect(drawImage[7].width).toBe(93);
		expect(drawImage[7].height).toBe(2);

		// center
		expect(drawImage[8].width).toBe(93);
		expect(drawImage[8].height).toBe(97);
	});
});
