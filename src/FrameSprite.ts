namespace g {
	/**
	 * `FrameSprite` のコンストラクタに渡すことができるパラメータ。
	 * 各メンバの詳細は `FrameSprite` の同名メンバの説明を参照すること。
	 */
	export interface FrameSpriteParameterObject extends SpriteParameterObject {
		/**
		 * 画像として使う `Surface` または `ImageAsset` 。
		 */
		src: Surface|ImageAsset;

		/**
		 * このエンティティの幅
		 */
		width: number;

		/**
		 * このエンティティの高さ
		 */
		height: number;

		/**
		 * 最初に表示される画像片のインデックス。
		 * `start()` 呼び出しによりタイマーで自動的に書き換えられていくが、ゲーム開発者が明示的に値を設定してもよい。
		 * @default 0
		 */
		frameNumber?: number;

		/**
		 * アニメーションの内容。
		 *
		 * アニメーションの各フレームでの表示内容を指定するインデックスの配列を指定する。
		 * インデックスは、コンストラクタに渡された画像を幅 `srcWidth`, 高さ `srcHeight` 単位の小さな画像(画像片)の集まりであるとみなして、
		 * 各画像片を特定する値である。左上の画像片を 0, その右隣の画像片を 1 として左上から右下に順に割り振られる。
		 * @default [0]
		 */
		frames?: number[];

		/**
		 * アニメーションの更新頻度(ミリ秒)。
		 * 省略された場合、 `start()` 時にFPSの逆数に設定される。(つまり、1フレームごとに画像が切り替わっていく)
		 * @default (1000 / game.fps)
		 */
		interval?: number;

		/**
		 * 切り出し範囲の左上端のx座標。
		 * @default 0
		 */
		cutoutX?: number;

		/**
		 * 切り出し範囲の左上端のy座標。
		 * @default 0
		 */
		cutoutY?: number;

		/**
		 * 切り出し範囲の横幅。
		 */
		cutoutWidth?: number;

		/**
		 * 切り出し範囲の縦幅。
		 * ただし、この値は現在は使用していない。
		 */
		cutoutHeight?: number;
	}

	/**
	 * フレームとタイマーによるアニメーション機構を持つ `Sprite` 。
	 *
	 * このクラスは、コンストラクタで渡された画像を、
	 * 幅 `srcWidth`, 高さ `srcHeight` 単位で区切られた小さな画像(以下、画像片)の集まりであると解釈する。
	 * 各画像片は、左上から順に 0 から始まるインデックスで参照される。
	 *
	 * ゲーム開発者は、このインデックスからなる配列を `FrameSprite#frames` に設定する。
	 * `FrameSprite` は、 `frames` に指定されたインデックス(が表す画像片)を順番に描画することでアニメーションを実現する。
	 * アニメーションは `interval` ミリ秒ごとに進み、 `frames` の内容をループする。
	 *
	 * このクラスにおける `srcWidth`, `srcHeight` の扱いは、親クラスである `Sprite` とは異なっていることに注意。
	 */
	export class FrameSprite extends Sprite {
		/**
		 * 現在表示されている画像片のインデックス。
		 *
		 * `start()` 呼び出しによりタイマーで自動的に書き換えられていくが、ゲーム開発者が明示的に値を設定してもよい。
		 * 初期値は `0` である。
		 * この値を変更した場合、 `this.modified()` を呼び出す必要がある。
		 */
		frameNumber: number;

		/**
		 * アニメーションの内容。
		 *
		 * アニメーションの各フレームでの表示内容を指定するインデックスの配列を指定する。初期値は `[0]` である。
		 * インデックスは、コンストラクタに渡された画像を幅 `srcWidth`, 高さ `srcHeight` 単位の小さな画像(画像片)の集まりであるとみなして、
		 * 各画像片を特定する値である。左上の画像片を 0, その右隣の画像片を 1 として左上から右下に順に割り振られる。
		 *
		 * この値を変更した場合、 `this.modified()` を呼び出す必要がある。
		 */
		frames: number[];

		/**
		 * アニメーションの更新頻度(ミリ秒)。
		 * 指定しなかった場合、 `start()` 時にFPSの逆数に設定される。(つまり、1フレームごとに画像が切り替わっていく)
		 * この値を変更した場合、反映には `this.start()` を呼び出す必要がある。
		 */
		interval: number;

		/**
		 * 対象画像の切り出し範囲の左上端のx座標。
		 * この値を変更した場合、 `this.modified()` を呼び出す必要がある。
		 */
		cutoutX: number;

		/**
		 * 対象画像の切り出し範囲の左上端のy座標。
		 * この値を変更した場合、 `this.modified()` を呼び出す必要がある。
		 */
		cutoutY: number;

		/**
		 * 対象画像の切り出し範囲の横幅。
		 * この値を変更した場合、 `this.modified()` を呼び出す必要がある。
		 */
		cutoutWidth: number;

		/**
		 * 対象画像の切り出し範囲の縦幅。
		 * ただし、この値は現在は使用していない。
		 */
		cutoutHeight: number;

		/**
		 * @private
		 */
		_timer: Timer;

		/**
		 * @private
		 */
		_lastUsedIndex: number;

		/**
		 * @deprecated
		 * `Sprite` から `FrameSprite` を作成する。
		 * @param sprite 画像として使う`Sprite`
		 * @param width 作成されるエンティティの高さ。省略された場合、 `sprite.width`
		 * @param hegith 作成されるエンティティの高さ。省略された場合、 `sprite.height`
		 */
		static createBySprite(sprite: Sprite, width?: number, height?: number): FrameSprite {
			var frameSprite = new FrameSprite({
				scene: sprite.scene,
				src: sprite.surface,
				width: width === undefined ? sprite.width : width,
				height: height === undefined ? sprite.height : height
			});
			frameSprite.srcHeight = height === undefined ? sprite.srcHeight : height;
			frameSprite.srcWidth = width === undefined ? sprite.srcWidth : width;
			return frameSprite;
		}

		/**
		 * 各種パラメータを指定して `FrameSprite` のインスタンスを生成する。
		 * @param param `FrameSprite` に設定するパラメータ
		 */
		constructor(param: FrameSpriteParameterObject) {
			super(param);
			this._lastUsedIndex = 0;
			this.frameNumber = param.frameNumber || 0;
			this.frames = "frames" in param ? param.frames : [0];
			this.interval = param.interval;
			this._timer = undefined;
			this.cutoutX = param.cutoutX ? param.cutoutX : 0;
			this.cutoutY = param.cutoutY ? param.cutoutY : 0;
			this.cutoutWidth = param.cutoutWidth ? param.cutoutWidth : this.surface.width;
			this.cutoutHeight = param.cutoutHeight ? param.cutoutHeight : this.surface.height;
			this._modifiedSelf();
		}

		/**
		 * アニメーションを開始する。
		 */
		start(): void {
			if (this.interval === undefined)
				this.interval = 1000 / this.game().fps;

			if (this._timer)
				this._free();

			this._timer = this.scene.createTimer(this.interval);
			this._timer.elapsed.add(this._onElapsed, this);
		}

		/**
		 * このエンティティを破棄する。
		 * デフォルトでは利用している `Surface` の破棄は行わない点に注意。
		 * @param destroySurface trueを指定した場合、このエンティティが抱える `Surface` も合わせて破棄する
		 */
		destroy(destroySurface?: boolean): void {
			this.stop();
			super.destroy(destroySurface);
		}

		/**
		 * アニメーションを停止する。
		 */
		stop(): void {
			if (this._timer)
				this._free();
		}

		/**
		 * このエンティティに対する変更をエンジンに通知する。詳細は `E#modified()` のドキュメントを参照。
		 */
		modified(isBubbling?: boolean): void {
			this._modifiedSelf(isBubbling);
			super.modified(isBubbling);
		}

		/**
		 * @private
		 */
		_onElapsed(): void {
			if (++this.frameNumber >= this.frames.length)
				this.frameNumber = 0;

			this.modified();
		}

		/**
		 * @private
		 */
		_free(): void {
			if (! this._timer)
				return;

			this._timer.elapsed.remove(this._onElapsed, this);
			if (this._timer.canDelete())
				this.scene.deleteTimer(this._timer);

			this._timer = undefined;
		}

		/**
		 * @private
		 */
		_changeFrame(offset: CommonOffset = this._getCurrentOffset()): void {
			this.srcX = offset.x;
			this.srcY = offset.y;
			this._lastUsedIndex = this.frames[this.frameNumber];
		}

		private _modifiedSelf(isBubbling?: boolean): void {
			const currentOffset = this._getCurrentOffset();
			if (this._lastUsedIndex !== this.frames[this.frameNumber]
				|| this.srcX !== currentOffset.x
				|| this.srcY !== currentOffset.y
			) {
				this._changeFrame(currentOffset);
			}
		}

		private _getCurrentOffset(): CommonOffset {
			const frame = this.frames[this.frameNumber];
			const sep = Math.floor(this.cutoutWidth / this.srcWidth);
			return {
				x: (frame % sep) * this.srcWidth + this.cutoutX,
				y: Math.floor(frame / sep) * this.srcHeight + this.cutoutY
			};
		}
	}
}
