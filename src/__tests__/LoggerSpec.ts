import { LogLevel, Log } from "..";
import { skeletonRuntime } from "./helpers";

describe("Logger", () => {
	it("ログ出力テスト", () => {
		const runtime = skeletonRuntime({ width: 320, height: 320 });

		let loggedCount = 0;
		let expectedLevel: LogLevel, expectedMessage: string, expectedCause: string;
		function resetLoggingExpectation(level: LogLevel, message: string, cause: string): void {
			expectedLevel = level;
			expectedMessage = message;
			expectedCause = cause;
		}
		runtime.game.logger.logging.add((log: Log) => {
			expect(log.level).toBe(expectedLevel);
			expect(log.message).toBe(expectedMessage);
			expect(log.cause).toBe(expectedCause);
			++loggedCount;
		});

		runtime.game.suppressedLogLevel = LogLevel.Error;
		resetLoggingExpectation(LogLevel.Error, "error", "error-cause");
		runtime.game.logger.error("error", "error-cause");
		expect(loggedCount).toBe(1);
		resetLoggingExpectation(LogLevel.Error, "error-no-cause", undefined);
		runtime.game.logger.error("error-no-cause");
		expect(loggedCount).toBe(2);

		resetLoggingExpectation(LogLevel.Warn, "warn", "warn-cause");
		runtime.game.logger.warn("warn", "warn-cause");
		expect(loggedCount).toBe(3);
		resetLoggingExpectation(LogLevel.Warn, "warn-no-cause", undefined);
		runtime.game.logger.warn("warn-no-cause");
		expect(loggedCount).toBe(4);

		resetLoggingExpectation(LogLevel.Info, "info", "info-cause");
		runtime.game.logger.info("info", "info-cause");
		expect(loggedCount).toBe(5);
		resetLoggingExpectation(LogLevel.Info, "info-no-cause", undefined);
		runtime.game.logger.info("info-no-cause");
		expect(loggedCount).toBe(6);

		resetLoggingExpectation(LogLevel.Debug, "debug", "debug-cause");
		runtime.game.logger.debug("debug", "debug-cause");
		expect(loggedCount).toBe(7);
		resetLoggingExpectation(LogLevel.Debug, "debug-no-cause", undefined);
		runtime.game.logger.debug("debug-no-cause");
		expect(loggedCount).toBe(8);
	});

	it("destroy()", () => {
		const runtime = skeletonRuntime({ width: 320, height: 320 });
		const self = runtime.game.logger;
		expect(self.destroyed()).toBe(false);
		runtime.game.logger.destroy();
		expect(self.destroyed()).toBe(true);
		expect(self.logging).toBe(undefined);
	});
});
