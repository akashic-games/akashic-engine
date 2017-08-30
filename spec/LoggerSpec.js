describe("Logger", function() {
	var g = require('../lib/main.node.js');
	var mock = require("./helpers/mock");
	var skeletonRuntime = require("./helpers/skeleton");

	beforeEach(function() {
	});

	afterEach(function() {
	});

	it("ログ出力テスト", function() {
		var runtime = skeletonRuntime({ width: 320, height: 320 });

		var loggedCount = 0;
		var expectedLevel, expectedMessage, expectedCause;
		function resetLoggingExpectation(level, message, cause) {
			expectedLevel = level;
			expectedMessage = message;
			expectedCause = cause;
		}
		runtime.game.logger.logging.add(function(log) {
			expect(log.level).toBe(expectedLevel);
			expect(log.message).toBe(expectedMessage);
			expect(log.cause).toBe(expectedCause);
			++loggedCount;
		});

		runtime.game.suppressedLogLevel = g.LogLevel.Error;
		resetLoggingExpectation(g.LogLevel.Error, "error", "error-cause");
		runtime.game.logger.error("error", "error-cause");
		expect(loggedCount).toBe(1);
		resetLoggingExpectation(g.LogLevel.Error, "error-no-cause", undefined);
		runtime.game.logger.error("error-no-cause");
		expect(loggedCount).toBe(2);

		resetLoggingExpectation(g.LogLevel.Warn, "warn", "warn-cause");
		runtime.game.logger.warn("warn", "warn-cause");
		expect(loggedCount).toBe(3);
		resetLoggingExpectation(g.LogLevel.Warn, "warn-no-cause", undefined);
		runtime.game.logger.warn("warn-no-cause");
		expect(loggedCount).toBe(4);

		resetLoggingExpectation(g.LogLevel.Info, "info", "info-cause");
		runtime.game.logger.info("info", "info-cause");
		expect(loggedCount).toBe(5);
		resetLoggingExpectation(g.LogLevel.Info, "info-no-cause", undefined);
		runtime.game.logger.info("info-no-cause");
		expect(loggedCount).toBe(6);

		resetLoggingExpectation(g.LogLevel.Debug, "debug", "debug-cause");
		runtime.game.logger.debug("debug", "debug-cause");
		expect(loggedCount).toBe(7);
		resetLoggingExpectation(g.LogLevel.Debug, "debug-no-cause", undefined);
		runtime.game.logger.debug("debug-no-cause");
		expect(loggedCount).toBe(8);
	});
});
