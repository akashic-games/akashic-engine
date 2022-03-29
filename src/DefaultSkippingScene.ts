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
function easingInOutQuadWithSaturation(t: number, b: number, c: number, d: number): number {
	if (t <= 0) return b + c;
	const threshold = d * 0.15;
	return t < threshold ? easeInOutQuad(t, b, c, threshold) : b + c;
}

/**
 * @ignore
 */
interface FlickeredFilledRectParameterObject extends FilledRectParameterObject {
	offsetDurationFrame: number;
	easingDurationFrame: number;
	valueFrom: number;
	valueTo: number;
	easing: (t: number, b: number, c: number, d: number) => number;
}

/**
 * @ignore
 */
class FlickeredFilledRect extends FilledRect {
	offsetDurationFrame: number;
	easingDurationFrame: number;
	valueFrom: number;
	valueTo: number;
	easing: (t: number, b: number, c: number, d: number) => number;

	private age: number = 0;

	constructor(param: FlickeredFilledRectParameterObject) {
		super(param);
		this.offsetDurationFrame = param.offsetDurationFrame;
		this.easingDurationFrame = param.easingDurationFrame;
		this.valueFrom = param.valueFrom;
		this.valueTo = param.valueTo;
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
		const { age, offsetDurationFrame, easingDurationFrame, valueFrom, valueTo, easing } = this;

		const t = Math.max(age - offsetDurationFrame, 0) % easingDurationFrame;
		const b = valueFrom;
		const c = valueTo - valueFrom;
		const d = easingDurationFrame;
		const col = easing(t, b, c, d);

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
		const offsetDurationFrame = 400 / (1000 / game.fps);
		const easingDurationFrame = 2500 / (1000 / game.fps);
		const valueFrom = 255 - 50;
		const valueTo = 255;
		const easing = easingInOutQuadWithSaturation;

		this.append(
			new CameraCancellingE({
				scene: this,
				children: [3, 2, 1, 0].map((offsetIndex, i) => {
					return new FlickeredFilledRect({
						scene: this,
						cssColor: `rgb(${valueTo}, ${valueTo}, ${valueTo})`,
						width: rectSize,
						height: rectSize,
						x: game.width - i * (rectSize + margin) - marginRight,
						y: game.height - marginBottom,
						anchorX: 1,
						anchorY: 1,
						offsetDurationFrame: offsetDurationFrame * offsetIndex,
						easingDurationFrame,
						valueFrom,
						valueTo,
						easing
					});
				})
			})
		);
	}
}
