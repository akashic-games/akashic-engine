namespace g {
	/**
	 * カメラを表すインターフェース。
	 */
	export interface Camera {
		/**
		 * 紐づいている `Game` 。
		 */
		game: Game;

		/**
		 * このカメラのID。
		 * カメラ生成時に暗黙に設定される値。
		 * `local` が真である場合、この値は `undefined` である。
		 */
		id: number;

		/**
		 * このカメラがローカルであるか否か。
		 */
		local: boolean;

		/**
		 * @private
		 */
		_modifiedCount: number;

		/**
		 * @private
		 */
		_applyTransformToRenderer: (renderer: Renderer) => void;

		serialize: () => any;
	}

	export interface Camera2DSerialization {
		id: number;
		param: Camera2DParameterObject;
	}

	/**
	 * `Camera2D` のコンストラクタに渡すことができるパラメータ。
	 * 各メンバの詳細は `Camera2D` の同名メンバの説明を参照すること。
	 *
	 * 例外的に、`Camera2D` のコンストラクタは `width`, `height` のみ無視することに注意。
	 */
	export interface Camera2DParameterObject extends Object2DParameterObject {
		/**
		 * このカメラに紐づける `Game` 。
		 */
		game: Game;

		/**
		 * このカメラがローカルであるか否か。
		 * @default false
		 */
		local?: boolean;

		/**
		 * このカメラの名前。
		 * @default undefined
		 */
		name?: string;
	}

	/**
	 * 2D世界におけるカメラ。
	 */
	export class Camera2D extends Object2D implements Camera {
		/**
		 * 紐づいている `Game` 。
		 */
		game: Game;

		/**
		 * このカメラのID。
		 *
		 * カメラ生成時に暗黙に設定される値。
		 * `local` が真である場合、この値は `undefined` である。
		 *
		 * ひとつの実行環境中、ある `Game` に対して、ある `undefined` ではない `id` を持つカメラは、最大でもひとつしか存在しない。
		 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を直接変更してはならない。
		 */
		id: number;

		/**
		 * このカメラがローカルであるか否か。
		 *
		 * 初期値は偽である。
		 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を直接変更してはならない。
		 */
		local: boolean;

		/**
		 * このカメラの名前。
		 * 初期値は `undefined` である。
		 */
		name: string;

		/**
		 * @private
		 */
		_modifiedCount: number;

		/**
		 * 与えられたシリアリゼーションでカメラを復元する。
		 *
		 * @param ser `Camera2D#serialize()` の戻り値
		 * @param game 復元されたカメラの属する Game
		 */
		static deserialize(ser: any, game: Game): Camera2D {
			var s: Camera2DSerialization = <Camera2DSerialization>ser;
			s.param.game = game;
			var ret = new Camera2D(s.param);
			ret.id = s.id;
			return ret;
		}

		/**
		 * 指定されたパラメータで `Camera2D` のインスタンスを生成する。
		 * @param param 初期化に用いるパラメータのオブジェクト
		 */
		constructor(param: Camera2DParameterObject) {
			super(param);
			this.game = param.game;
			this.local = !!param.local;
			this.name = param.name;
			this._modifiedCount = 0;

			// param の width と height は無視する
			this.width = param.game.width;
			this.height = param.game.height;

			this.id = this.local ? undefined : this.game._cameraIdx++;
		}

		/**
		 * カメラ状態の変更をエンジンに通知する。
		 *
		 * このメソッドの呼び出し後、このカメラのプロパティに対する変更が各 `Renderer` の描画に反映される。
		 * ただし逆は真ではない。すなわち、再描画は他の要因によって行われることもある。
		 * ゲーム開発者は、このメソッドを呼び出していないことをもって再描画が行われていないことを仮定してはならない。
		 *
		 * 本メソッドは、このオブジェクトの `Object2D` 由来のプロパティ (`x`, `y`, `angle` など) を変更した場合にも呼びだす必要がある。
		 */
		modified(): void {
			this._modifiedCount = (this._modifiedCount + 1) % 32768;
			if (this._matrix) this._matrix._modified = true;

			this.game.modified = true;
		}

		/**
		 * このカメラをシリアライズする。
		 *
		 * このメソッドの戻り値を `Camera2D#deserialize()` に渡すことで同じ値を持つカメラを復元することができる。
		 */
		serialize(): any {
			var ser = <Camera2DSerialization>{
				id: this.id,
				param: {
					game: <Game>undefined,
					local: this.local,
					name: this.name,
					x: this.x,
					y: this.y,
					width: this.width,
					height: this.height,
					opacity: this.opacity,
					scaleX: this.scaleX,
					scaleY: this.scaleY,
					angle: this.angle,
					compositeOperation: this.compositeOperation
				}
			};
			return ser;
		}

		/**
		 * @private
		 */
		_applyTransformToRenderer(renderer: Renderer): void {
			if (this.angle || this.scaleX !== 1 || this.scaleY !== 1 || this.anchorX != null || this.anchorY != null) {
				// Note: this.scaleX/scaleYが0の場合描画した結果何も表示されない事になるが、特殊扱いはしない
				renderer.transform(this.getMatrix()._matrix);
			} else {
				renderer.translate(-this.x, -this.y);
			}
			if (this.opacity !== 1) renderer.opacity(this.opacity);
		}

		/**
		 * @private
		 */
		_updateMatrix(): void {
			// カメラの angle, x, y はエンティティと逆方向に作用することに注意。
			if (this.anchorX != null && this.anchorY != null) {
				this._matrix.updateByInverseWithAnchor(
					this.width,
					this.height,
					this.scaleX,
					this.scaleY,
					this.angle,
					this.x,
					this.y,
					this.anchorX,
					this.anchorY
				);
			} else if (this.angle || this.scaleX !== 1 || this.scaleY !== 1) {
				this._matrix.updateByInverse(this.width, this.height, this.scaleX, this.scaleY, this.angle, this.x, this.y);
			} else {
				this._matrix.reset(-this.x, -this.y);
			}
		}
	}
}
