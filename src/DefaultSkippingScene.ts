import { CameraCancellingE } from "./entities/CameraCancellingE";
import type { FilledRectParameterObject } from "./entities/FilledRect";
import { FilledRect } from "./entities/FilledRect";
import type { SceneParameterObject } from "./Scene";
import { Scene } from "./Scene";

/**
 * @ignore
 */
function easeInOutQuad(t: number, b: number, c: number, d: number): number {
	t /= d / 2;
	if (t < 1) return (c / 2) * t * t + b;
	--t;
	return (-c / 2) * (t * (t - 2) - 1) + b;
}

/**
 * @ignore
 */
interface FlickeredFilledRectParameterObject extends FilledRectParameterObject {
	offsetDurationFrame: number;
	waitingDurationFrame: number;
	easingDurationFrame: number;
	easingFrom: number;
	easingTo: number;
	easing: (t: number, b: number, c: number, d: number) => number;
}

/**
 * @ignore
 */
class FlickeredFilledRect extends FilledRect {
	offsetDurationFrame: number;
	easingDurationFrame: number;
	waitingDurationFrame: number;
	easingFrom: number;
	easingTo: number;
	easing: (t: number, b: number, c: number, d: number) => number;

	private age: number = 0;

	constructor(param: FlickeredFilledRectParameterObject) {
		super(param);
		this.offsetDurationFrame = param.offsetDurationFrame;
		this.easingDurationFrame = param.easingDurationFrame;
		this.waitingDurationFrame = param.waitingDurationFrame;
		this.easingFrom = param.easingFrom;
		this.easingTo = param.easingTo;
		this.easing = param.easing;
		this.onUpdate.add(this._incrementAge, this);
		this.onUpdate.add(this._updateColor, this);
	}

	private _incrementAge(): void {
		this.age++;
	}

	private _updateColor(): void {
		const cssColor = this._calculateCSSColor();
		if (this.cssColor !== cssColor) {
			this.cssColor = cssColor;
			this.modified();
		}
	}

	private _calculateCSSColor(): string {
		const { age, offsetDurationFrame, easingDurationFrame, waitingDurationFrame, easingFrom, easingTo, easing } = this;

		const remainder = Math.max(age - offsetDurationFrame, 0) % (easingDurationFrame + waitingDurationFrame);
		let col = easingTo;

		if (0 < remainder && remainder < easingDurationFrame) {
			const t = remainder;
			const b = easingFrom;
			const c = easingTo - easingFrom;
			const d = easingDurationFrame;
			col = easing(t, b, c, d);
		}

		return `rgb(${col}, ${col}, ${col})`;
	}
}

/**
 * `DefaultSkippingScene` のコンストラクタに渡すことができるパラメータ。
 */
export interface DefaultSkippingSceneParameterObject extends SceneParameterObject {
	style: "none" | "indicator";
}

/**
 * デフォルトスキッピングシーン。
 *
 * `Game#_defaultSkippingScene` の初期値として利用される。
 */
export class DefaultSkippingScene extends Scene {
	/**
	 * `DefaultSkippingScene` のインスタンスを生成する。
	 * @param param 初期化に用いるパラメータのオブジェクト
	 */
	constructor(param: DefaultSkippingSceneParameterObject) {
		super({ game: param.game, local: "full-local", name: "akashic:default-skipping-scene" });

		if (param.style === "indicator") {
			this.onLoad.addOnce(this._handleLoadForIndicator, this);
		}
	}

	/**
	 * @private
	 */
	private _handleLoadForIndicator(): void {
		const game = this.game;
		const rectSize = (Math.min(game.width, game.height) * 0.03) | 0;
		const margin = (Math.min(game.width, game.height) * 0.03) | 0;
		const marginRight = (Math.min(game.width, game.height) * 0.05) | 0;
		const marginBottom = (Math.min(game.width, game.height) * 0.05) | 0;
		const offsetDurationFrame = 1800 / game.fps;
		const easingDurationFrame = 1500 / game.fps;
		const waitingDurationFrame = 9000 / game.fps;
		const easingFrom = 255 - 50;
		const easingTo = 255;
		const easing = easeInOutQuad;

		this.append(
			new CameraCancellingE({
				scene: this,
				children: [
					{ offsetDurationFrame: offsetDurationFrame * 0 },
					{ offsetDurationFrame: offsetDurationFrame * 1 },
					{ offsetDurationFrame: offsetDurationFrame * 2 },
					{ offsetDurationFrame: offsetDurationFrame * 3 }
				]
					.reverse()
					.map(({ offsetDurationFrame }, i) => {
						return new FlickeredFilledRect({
							scene: this,
							cssColor: `rgb(${easingTo}, ${easingTo}, ${easingTo})`,
							width: rectSize,
							height: rectSize,
							x: game.width - rectSize / 2 - i * (rectSize + margin) - marginRight,
							y: game.height - rectSize / 2 - marginBottom,
							anchorX: 0.5,
							anchorY: 0.5,
							offsetDurationFrame,
							easingDurationFrame,
							waitingDurationFrame,
							easingFrom,
							easingTo,
							easing
						});
					})
			})
		);
	}
}
