exports.spec = function (it, expect, randomGenerator) {
	it("初期化", function() {
		var generator = new randomGenerator(1);
		expect(generator.seed).toEqual(1);
	});

	it("初期化 - missed seed", function() {
		expect(function() {
			var generator = new randomGenerator()
		}).toThrow();
	});

	it("can be serialized", function () {
		// この関数のマジックナンバーは単にテスト用であり他に依存しない

		var generator = new randomGenerator(42);

		for (var i = 0; i < 10; ++i)
			generator.get(0, 10000);

		var copy1 = randomGenerator.deserialize(generator.serialize());
		expect(copy1.get(0, 10000)).toBe(generator.get(0, 10000));
		expect(copy1.get(0, 10000)).toBe(generator.get(0, 10000));
		expect(copy1.get(0, 10000)).toBe(generator.get(0, 10000));
		expect(copy1.get(0, 10000)).toBe(generator.get(0, 10000));

		var copy2 = randomGenerator.deserialize(copy1.serialize());
		expect(copy2.get(0, 10000)).toBe(generator.get(0, 10000));
		expect(copy2.get(0, 10000)).toBe(generator.get(0, 10000));
		expect(copy2.get(0, 10000)).toBe(generator.get(0, 10000));
		expect(copy2.get(0, 10000)).toBe(generator.get(0, 10000));

		var ser = generator.serialize();
		var copy3 = randomGenerator.deserialize(JSON.parse(JSON.stringify(ser)));
		expect(copy3.get(0, 10000)).toBe(generator.get(0, 10000));
		expect(copy3.get(0, 10000)).toBe(generator.get(0, 10000));
		expect(copy3.get(0, 10000)).toBe(generator.get(0, 10000));
		expect(copy3.get(0, 10000)).toBe(generator.get(0, 10000));
	});

	it("is distribution within expectation", function () {
		// このテストは厳密な仕様記述ではなく、「10000回やればこれぐらいの範囲になるだろう」という期待値でしかないことに注意
		var generator = new randomGenerator(1);
		var testCases = [[-8, 8], [-8, -4], [-8, 0], [0, 8], [4, 8]];
		testCases.forEach(function(testCase) {
			var resultMap = [];
			for (var i = 0; i < 10000; i++) {
				resultMap.push(generator.get(testCase[0], testCase[1]));
			}
			var sum = 0;
			resultMap.forEach(function(v) {
				expect(v).toBeGreaterThan(testCase[0] - 1);
				expect(v).toBeLessThan(testCase[1] + 1);
				sum += v;
			});
			expect(sum / 10000).toBeGreaterThan((testCase[0] + testCase[1]) / 2 - 1);
			expect(sum / 10000).toBeLessThan((testCase[0] + testCase[1]) / 2 + 1);
		});
	});

	it("is difference within expectation", function() {
		// このテストは厳密な仕様記述ではなく、「10000回やればこれぐらいの分布になるだろう」という期待値でしかないことに注意
		var cycle = 10000;
		var testCases = [[-10, 10], [-26, -6], [-20, 0], [0, 20], [4, 24]];
		// 上記各テストケースの乱数範囲に対応したカイ2乗分布表で危険率0.01の値
		var threshold = 37.5622;
		for (var seed = 0; seed < 5; ++seed) {
			testCases.forEach(function(testCase) {
				var generator = new randomGenerator(seed);
				var resultMap = new Array(testCase[1] - testCase[0] + 1);
				for (var i = 0; i < cycle; i++) {
					var num = generator.get(testCase[0], testCase[1]) + (0 - testCase[0]);
					if (!resultMap[num])
						resultMap[num] = 0;
					++resultMap[num];
				}
				var score = 0;
				var expected = cycle / (testCase[1] - testCase[0] + 1);
				for (var i = 0; i <= testCase[1] - testCase[0]; ++i) {
					score += (resultMap[i] - expected) * (resultMap[i] - expected) / expected;
				}
				expect(score).toBeLessThan(threshold);
			});
		}
	});
}
