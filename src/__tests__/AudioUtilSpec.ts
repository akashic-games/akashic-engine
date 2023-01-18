import { AudioUtil } from "../AudioUtil";
import { skeletonRuntime } from "./helpers";

describe("test AudioUtil", () => {
	describe("fadeIn", () => {
		it("normal", () => {
			const { game } = skeletonRuntime();
			const system = game.audio.music;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});
			const context = system.create(asset);
			expect(context.volume).toBe(1.0);

			AudioUtil.fadeIn(game, context, 1000, 0.3);
			expect(context.volume).toBe(0);

			// 音量の変化がなくなるまで手動で tick を進める
			let beforeVolume: number;
			do {
				beforeVolume = context.volume;
				game.tick(true);
				expect(context.volume).toBeGreaterThanOrEqual(0);
				expect(context.volume).toBeLessThanOrEqual(0.3);
				expect(context.volume).toBeGreaterThanOrEqual(beforeVolume);
			} while (beforeVolume < context.volume);

			expect(context.volume).toBe(0.3);
		});

		it("complete", () => {
			const { game } = skeletonRuntime();
			const system = game.audio.music;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});
			const context = system.create(asset);
			const { complete } = AudioUtil.fadeIn(game, context, 1000, 0.3);

			game.tick(true);
			game.tick(true);
			game.tick(true);

			// complete 後に tick を進めても音量が変更しないことを確認
			complete();
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			expect(context.volume).toBe(0.3);
		});

		it("cancel", () => {
			const { game } = skeletonRuntime();
			const system = game.audio.music;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});
			const context = system.create(asset);
			const mockContextStop = jest.spyOn(context, "stop");
			const { cancel } = AudioUtil.fadeIn(game, context, 1000, 0.3);

			game.tick(true);
			game.tick(true);
			game.tick(true);

			const volume = context.volume;

			// cancel 後に tick を進めても音量が変更しないことを確認
			cancel();
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			expect(context.volume).toBe(volume);

			// 音声は停止しない
			expect(mockContextStop).toBeCalledTimes(0);
		});

		it("cancel (revert)", () => {
			const { game } = skeletonRuntime();
			const system = game.audio.music;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});
			const context = system.create(asset);
			const mockContextStop = jest.spyOn(context, "stop");
			const { cancel } = AudioUtil.fadeIn(game, context, 1000, 0.3);

			game.tick(true);
			game.tick(true);
			game.tick(true);

			// cancel 後に tick を進めても音量が変更しないことを確認
			cancel(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			expect(context.volume).toBe(0);
			expect(mockContextStop).toBeCalledTimes(1);
		});
	});

	describe("fadeOut", () => {
		it("normal", () => {
			const { game } = skeletonRuntime();
			const system = game.audio.music;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});
			const context = system.create(asset);
			context.changeVolume(0.3);

			AudioUtil.fadeOut(game, context, 1000);

			// 音量の変化がなくなるまで手動で tick を進める
			let beforeVolume: number;
			do {
				beforeVolume = context.volume;
				game.tick(true);
				expect(context.volume).toBeGreaterThanOrEqual(0);
				expect(context.volume).toBeLessThanOrEqual(0.3);
				expect(context.volume).toBeLessThanOrEqual(beforeVolume);
			} while (context.volume < beforeVolume);

			expect(context.volume).toBe(0);
		});

		it("complete", () => {
			const { game } = skeletonRuntime();
			const system = game.audio.music;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});
			const context = system.create(asset);
			const { complete } = AudioUtil.fadeOut(game, context, 1000);

			let beforeVolume = context.volume;

			game.tick(true);
			expect(context.volume).toBeLessThan(beforeVolume);
			beforeVolume = context.volume;

			game.tick(true);
			expect(context.volume).toBeLessThan(beforeVolume);
			beforeVolume = context.volume;

			// complete 後に tick を進めても音量が変更しないことを確認
			complete();
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			expect(context.volume).toBe(0);
		});

		it("complete", () => {
			const { game } = skeletonRuntime();
			const system = game.audio.music;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});
			const context = system.create(asset);
			const mockContextStop = jest.spyOn(context, "stop");
			const { complete } = AudioUtil.fadeOut(game, context, 1000);

			game.tick(true);
			game.tick(true);
			game.tick(true);

			// complete 後に tick を進めても音量が変更しないことを確認
			complete();
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			expect(context.volume).toBe(0);
			expect(mockContextStop).toBeCalledTimes(1);
		});

		it("cancel", () => {
			const { game } = skeletonRuntime();
			const system = game.audio.music;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});
			const context = system.create(asset);
			const mockContextStop = jest.spyOn(context, "stop");
			const { cancel } = AudioUtil.fadeOut(game, context, 1000);

			const volume = context.volume;

			// cancel 後に tick を進めても音量が変更しないことを確認
			cancel();
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			expect(context.volume).toBe(volume);

			// 音声は停止しない
			expect(mockContextStop).toBeCalledTimes(0);
		});

		it("cancel (revert)", () => {
			const { game } = skeletonRuntime();
			const system = game.audio.music;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});
			const context = system.create(asset);
			const mockContextStop = jest.spyOn(context, "stop");
			const { cancel } = AudioUtil.fadeOut(game, context, 1000);

			const volume = context.volume;

			// cancel 後に tick を進めても音量が変更しないことを確認
			cancel();
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			expect(context.volume).toBe(volume);

			// 音声は停止しない
			expect(mockContextStop).toBeCalledTimes(0);
		});
	});

	describe("crossFade", () => {
		it("normal", () => {
			const { game } = skeletonRuntime();
			const system = game.audio.music;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});
			const fadeInContext = system.create(asset);
			const fadeOutContext = system.create(asset);

			fadeOutContext.changeVolume(0.3);

			AudioUtil.crossFade(game, fadeInContext, fadeOutContext, 1000, 0.5);

			let beforeFadeInContextVolume: number;
			let beforeFadeOutContextVolume: number;

			// 音量の変化がなくなるまで手動で tick を進める
			do {
				beforeFadeInContextVolume = fadeInContext.volume;
				beforeFadeOutContextVolume = fadeOutContext.volume;

				game.tick(true);

				expect(fadeInContext.volume).toBeGreaterThanOrEqual(0);
				expect(fadeInContext.volume).toBeLessThanOrEqual(0.5);
				expect(fadeInContext.volume).toBeGreaterThanOrEqual(beforeFadeInContextVolume);
				expect(fadeOutContext.volume).toBeGreaterThanOrEqual(0);
				expect(fadeOutContext.volume).toBeLessThanOrEqual(0.3);
				expect(fadeOutContext.volume).toBeLessThanOrEqual(beforeFadeOutContextVolume);
			} while (beforeFadeInContextVolume < fadeInContext.volume || fadeOutContext.volume < beforeFadeOutContextVolume);

			expect(fadeInContext.volume).toBe(0.5);
			expect(fadeOutContext.volume).toBe(0);
		});

		it("complete", () => {
			const { game } = skeletonRuntime();
			const system = game.audio.music;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});
			const fadeInContext = system.create(asset);
			const fadeOutContext = system.create(asset);
			const mockFadeInContextStop = jest.spyOn(fadeInContext, "stop");
			const mockFadeOutContextStop = jest.spyOn(fadeOutContext, "stop");

			fadeOutContext.changeVolume(0.3);

			const { complete } = AudioUtil.crossFade(game, fadeInContext, fadeOutContext, 1000, 0.5);

			let beforeFadeInContextVolume = fadeInContext.volume;
			let beforeFadeOutContextVolume = fadeOutContext.volume;

			game.tick(true);
			expect(fadeInContext.volume).toBeGreaterThanOrEqual(beforeFadeInContextVolume);
			expect(fadeOutContext.volume).toBeLessThanOrEqual(beforeFadeOutContextVolume);
			beforeFadeInContextVolume = fadeInContext.volume;
			beforeFadeOutContextVolume = fadeOutContext.volume;

			game.tick(true);
			expect(fadeInContext.volume).toBeGreaterThanOrEqual(beforeFadeInContextVolume);
			expect(fadeOutContext.volume).toBeLessThanOrEqual(beforeFadeOutContextVolume);
			beforeFadeInContextVolume = fadeInContext.volume;
			beforeFadeOutContextVolume = fadeOutContext.volume;

			// complete 後に tick を進めても音量が変更しないことを確認
			complete();
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			expect(fadeInContext.volume).toBe(0.5);
			expect(fadeOutContext.volume).toBe(0);

			expect(mockFadeInContextStop).toBeCalledTimes(0);
			expect(mockFadeOutContextStop).toBeCalledTimes(1);
		});

		it("cancel", () => {
			const { game } = skeletonRuntime();
			const system = game.audio.music;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});
			const fadeInContext = system.create(asset);
			const fadeOutContext = system.create(asset);
			const mockFadeInContextStop = jest.spyOn(fadeInContext, "stop");
			const mockFadeOutContextStop = jest.spyOn(fadeOutContext, "stop");

			const { cancel } = AudioUtil.crossFade(game, fadeInContext, fadeOutContext, 1000, 0.6);

			game.tick(true);
			game.tick(true);

			const fadeInVolume = fadeInContext.volume;
			const fadeOutVolume = fadeOutContext.volume;

			// cancel 後に tick を進めても音量が変更しないことを確認
			cancel();
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			expect(fadeInContext.volume).toBe(fadeInVolume);
			expect(fadeOutContext.volume).toBe(fadeOutVolume);

			expect(mockFadeInContextStop).toBeCalledTimes(0);
			expect(mockFadeOutContextStop).toBeCalledTimes(0);
		});

		it("cancel (revert)", () => {
			const { game } = skeletonRuntime();
			const system = game.audio.music;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});
			const fadeInContext = system.create(asset);
			const fadeOutContext = system.create(asset);
			const mockFadeInContextStop = jest.spyOn(fadeInContext, "stop");
			const mockFadeOutContextStop = jest.spyOn(fadeOutContext, "stop");

			const fadeOutVolume = fadeOutContext.volume;
			const { cancel } = AudioUtil.crossFade(game, fadeInContext, fadeOutContext, 1000, 0.6);

			game.tick(true);
			game.tick(true);

			// cancel 後に tick を進めても音量が変更しないことを確認
			cancel(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			expect(fadeInContext.volume).toBe(0);
			expect(fadeOutContext.volume).toBe(fadeOutVolume);

			expect(mockFadeInContextStop).toBeCalledTimes(1);
			expect(mockFadeOutContextStop).toBeCalledTimes(0);
		});
	});

	describe("transitionVolume", () => {
		it("normal", () => {
			const { game } = skeletonRuntime();
			const system = game.audio.music;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});
			const context = system.create(asset);

			context.changeVolume(0.3);

			AudioUtil.transitionVolume(game, context, 1000, 0.8);

			let beforeVolume: number;

			// 音量の変化がなくなるまで手動で tick を進める
			do {
				beforeVolume = context.volume;

				game.tick(true);

				expect(context.volume).toBeGreaterThanOrEqual(0.3);
				expect(context.volume).toBeLessThanOrEqual(0.8);
			} while (beforeVolume < context.volume);

			expect(context.volume).toBe(0.8);

			AudioUtil.transitionVolume(game, context, 1000, 0.1);

			// 音量の変化がなくなるまで手動で tick を進める
			do {
				beforeVolume = context.volume;

				game.tick(true);

				expect(context.volume).toBeGreaterThanOrEqual(0.1);
				expect(context.volume).toBeLessThanOrEqual(0.8);
			} while (context.volume < beforeVolume);

			expect(context.volume).toBe(0.1);
		});

		it("complete", () => {
			const { game } = skeletonRuntime();
			const system = game.audio.music;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});
			const context = system.create(asset);

			context.changeVolume(0.3);

			const { complete } = AudioUtil.transitionVolume(game, context, 1000, 0.6);

			let beforeVolume = context.volume;

			game.tick(true);
			expect(context.volume).toBeGreaterThanOrEqual(beforeVolume);
			beforeVolume = context.volume;

			game.tick(true);
			expect(context.volume).toBeGreaterThanOrEqual(beforeVolume);
			beforeVolume = context.volume;

			// complete 後に tick を進めても音量が変更しないことを確認
			complete();
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			expect(context.volume).toBe(0.6);
		});

		it("cancel", () => {
			const { game } = skeletonRuntime();
			const system = game.audio.music;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});
			const context = system.create(asset);

			context.changeVolume(0.3);

			const { cancel } = AudioUtil.transitionVolume(game, context, 1000, 0.6);

			game.tick(true);
			game.tick(true);

			const volume = context.volume;

			// cancel 後に tick を進めても音量が変更しないことを確認
			cancel();
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			expect(context.volume).toBe(volume);
		});

		it("cancel (revert)", () => {
			const { game } = skeletonRuntime();
			const system = game.audio.music;
			const asset = game.resourceFactory.createAudioAsset("a1", "./", 2000, system, false, {});
			const context = system.create(asset);

			context.changeVolume(0.3);

			const { cancel } = AudioUtil.transitionVolume(game, context, 1000, 0.6);

			game.tick(true);
			game.tick(true);

			// cancel 後に tick を進めても音量が変更しないことを確認
			cancel(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			game.tick(true);
			expect(context.volume).toBe(0.3);
		});
	});
});
