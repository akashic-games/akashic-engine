import type { Asset } from "@akashic/pdi-types";
import { CameraCancellingE } from "./entities/CameraCancellingE";
import { FilledRect } from "./entities/FilledRect";
import type { Game } from "./Game";
import { LoadingScene } from "./LoadingScene";
import type { Scene } from "./Scene";

/**
 * `DefaultLoadingScene` のコンストラクタに渡すことができるパラメータ。
 * 汎用性のあるクラスではなく、カスタマイズすべき余地は大きくないので LoadingSceneParameterObject は継承していない。
 */
export interface DefaultLoadingSceneParameterObject {
	/**
	 * このシーンが属する `Game` 。
	 */
	game: Game;
	style?: "default" | "compact";
}

/**
 * デフォルトローディングシーン。
 *
 * `Game#_defaultLoadingScene` の初期値として利用される。
 * このシーンはいかなるアセットも用いてはならない。
 */
export class DefaultLoadingScene extends LoadingScene {
	private _totalWaitingAssetCount: number;
	private _gauge: FilledRect;
	private _gaugeUpdateCount: number;
	private _barWidth: number;
	private _barHeight: number;
	private _style: "default" | "compact";

	/**
	 * `DefaultLoadingScene` のインスタンスを生成する。
	 * @param param 初期化に用いるパラメータのオブジェクト
	 */
	constructor(param: DefaultLoadingSceneParameterObject) {
		super({ game: param.game, name: "akashic:default-loading-scene" });
		if (param.style === "compact") {
			this._barWidth = this.game.width / 4;
			this._barHeight = 5;
			this._style = "compact";
		} else {
			this._barWidth = Math.min(this.game.width, Math.max(100, this.game.width / 2));
			this._barHeight = 5;
			this._style = "default";
		}
		this._gauge = undefined!;
		this._gaugeUpdateCount = 0;
		this._totalWaitingAssetCount = 0;
		this.onLoad.add(this._handleLoad, this);
		this.onTargetReset.add(this._handleTargetReset, this);
		this.onTargetAssetLoad.add(this._handleTargetAssetLoad, this);
	}

	/**
	 * @private
	 */
	_handleLoad(): boolean {
		let barX, barY, bgColor;
		if (this._style === "compact") {
			const margin = Math.min(this.game.width, this.game.height) * 0.05;
			barX = this.game.width - margin - this._barWidth;
			barY = this.game.height - margin - this._barHeight;
			bgColor = "transparent";
		} else {
			barX = (this.game.width - this._barWidth) / 2;
			barY = (this.game.height - this._barHeight) / 2;
			bgColor = "rgba(0, 0, 0, 0.8)";
		}
		let gauge: FilledRect;
		this.append(
			new CameraCancellingE({
				scene: this,
				children: [
					new FilledRect({
						scene: this,
						width: this.game.width,
						height: this.game.height,
						cssColor: bgColor,
						children: [
							new FilledRect({
								scene: this,
								x: barX,
								y: barY,
								width: this._barWidth,
								height: this._barHeight,
								cssColor: "gray",
								children: [
									(gauge = new FilledRect({
										scene: this,
										width: 0,
										height: this._barHeight,
										cssColor: "white"
									}))
								]
							})
						]
					})
				]
			})
		);
		gauge.onUpdate.add(this._handleUpdate, this);
		this._gauge = gauge;
		return true; // Trigger 登録を解除する
	}

	/**
	 * @private
	 */
	_handleUpdate(): void {
		const BLINK_RANGE = 50;
		const BLINK_PER_SEC = 2 / 3;
		++this._gaugeUpdateCount;

		// 白を上限に sin 波で明滅させる (updateしていることの確認)
		const c = Math.round(
			255 - BLINK_RANGE + Math.sin((this._gaugeUpdateCount / this.game.fps) * BLINK_PER_SEC * (2 * Math.PI)) * BLINK_RANGE
		);
		this._gauge.cssColor = "rgb(" + c + "," + c + "," + c + ")";
		this._gauge.modified();
	}

	/**
	 * @private
	 */
	_handleTargetReset(targetScene: Scene): void {
		if (this._gauge) {
			this._gauge.width = 0;
			this._gauge.modified();
		}
		this._totalWaitingAssetCount = targetScene._sceneAssetHolder.waitingAssetsCount;
	}

	/**
	 * @private
	 */
	_handleTargetAssetLoad(_asset: Asset): void {
		const waitingAssetsCount = this._targetScene._sceneAssetHolder.waitingAssetsCount;
		this._gauge.width = Math.ceil((1 - waitingAssetsCount / this._totalWaitingAssetCount) * this._barWidth);
		this._gauge.modified();
	}
}
