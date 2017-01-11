describe("test ResourceFactory", function() {
	var g = require('../lib/main.node.js');
	var resource;

	beforeEach(function() {
		jasmine.addMatchers(require("./helpers/customMatchers"));
		resource = new g.ResourceFactory();
	});

	afterEach(function() {
	});

	it("createImageAsset", function() {
		try {
			expect(function(){resource.createImageAsset("aiueo", "hello", 0, 0)}).toThrowError("PureVirtualError");
		} catch(ex) {
			console.log(ex);
		}
	});

	it("createAudioAsset", function() {
		expect(function(){resource.createAudioAsset("aiueo", "hello", undefined)}).toThrowError("PureVirtualError");
	});

	it("createTextAsset", function() {
		expect(function(){resource.createTextAsset("aiueo", "hello")}).toThrowError("PureVirtualError");
	});

	it("createSurface", function() {
		expect(function(){resource.createSurface()}).toThrowError("PureVirtualError");
	});

	it("createAudioPlayer", function() {
		expect(function(){resource.createAudioPlayer()}).toThrowError("PureVirtualError");
	});

	it("createScriptAsset", function() {
		expect(function(){resource.createScriptAsset("aiueo", "hello")}).toThrowError("PureVirtualError");
	});
});
