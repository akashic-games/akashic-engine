describe("test XorshiftRandomGenerator", function() {
	var g = require('../lib/main.node.js');
	var refXorshift = require('./support/xorshift').constructor;

	beforeEach(function() {
		jasmine.addMatchers(require("./helpers/customMatchers"));
	});

	afterEach(function() {
	});

	it("Xorshift - nextInt", function() {
		// この関数のマジックナンバーは単にテスト用であり他に依存しない

		for (var i = 0; i < 10; ++i) {
			var generator = new g.Xorshift(i);
			var count = [0, 0, 0];
			for (var j = 0; j < 100; ++j) {
				count[generator.nextInt(0, 3)] += 1;
			}
			expect(count[0] + count[1] + count[2]).toBe(100);
			expect(count[0]).not.toBe(0);
			expect(count[1]).not.toBe(0);
			expect(count[2]).not.toBe(0);
		}
	});

	it("Xorshift - vs reference implementation", function() {
		var generator = new g.Xorshift(0);
		generator._state0U = 100;
		generator._state0L = 101;
		generator._state1U = 102;
		generator._state1L = 103;		
		var ref = new refXorshift([100, 101, 102, 103]);

		var result = [];
		var refResult = [];
		for (var i = 0; i < 1000; ++i) {
			result.push(generator.random());
			refResult.push(ref.random());
		}
		expect(result).toEqual(refResult);
	});
});
