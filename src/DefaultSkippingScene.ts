import { CameraCancellingE } from "./entities/CameraCancellingE";
import type { FilledRectParameterObject } from "./entities/FilledRect";
import { FilledRect } from "./entities/FilledRect";
import type { SceneParameterObject } from "./Scene";
import { Scene } from "./Scene";

function easeInOutQuad(t: number, b: number, c: number, d: number): number {
	t /= d / 2;
	if (t < 1) return (c / 2) * t * t + b;
	--t;
	return (-c / 2) * (t * (t - 2) - 1) + b;
}

class AgedFilledRect extends FilledRect {
	age: number = 0;

	constructor(param: FilledRectParameterObject) {
		super(param);
		this.onUpdate.add(this._handleUpdate, this);
	}

	/**
	 * @private
	 */
	private _handleUpdate(): void {
		this.age++;
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
		super({ game: param.game, name: "akashic:default-skipping-scene" });

		if (param.style === "indicator") {
			this.onLoad.addOnce(this._handleLoadForIndicator, this);
		}
	}

	/**
	 * @private
	 */
	private _handleLoadForIndicator(): void {
		const game = this.game;
		const size = 12;
		const margin = 12;
		const marginRight = 12;
		const marginBottom = 8;
		const rotationAngle = 180;
		const offsetFrame = 1800 / game.fps;
		const rotationFrame = 1500 / game.fps;
		const waitingFrame = 9000 / game.fps;

		this.append(
			new CameraCancellingE({
				scene: this,
				children: [
					{ offsetFrame: offsetFrame * 0 },
					{ offsetFrame: offsetFrame * 1 },
					{ offsetFrame: offsetFrame * 2 },
					{ offsetFrame: offsetFrame * 3 }
				]
					.reverse()
					.map(({ offsetFrame }, i) => {
						const rect = new AgedFilledRect({
							scene: this,
							cssColor: "#3F3937",
							width: size,
							height: size,
							x: game.width - size / 2 - i * (size + margin) - marginRight,
							y: game.height - size / 2 - marginBottom,
							anchorX: 0.5,
							anchorY: 0.5
						});
						rect.onUpdate.add(() => {
							const remainder = Math.max(rect.age - offsetFrame, 0) % (rotationFrame + waitingFrame);
							if (remainder <= 0 || rotationFrame < remainder) return;
							const t = remainder;
							const b = 0;
							const c = rotationAngle;
							const d = rotationFrame;
							rect.angle = easeInOutQuad(t, b, c, d);
							rect.modified();
						});
						return rect;
					})
			})
		);
	}
}
