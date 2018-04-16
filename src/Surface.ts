namespace g {
	/**
	 * 描画領域を表すクラス。
	 *
	 * このクラスのインスタンスは、エンジンによって暗黙に生成される。
	 * ゲーム開発者はこのクラスのインスタンスを明示的に生成する必要はなく、またできない。
	 */
	export abstract class Surface implements CommonSize, Destroyable {
		/**
		 * 描画領域の幅。
		 * この値を直接書き換えてはならない。
		 */
		width: number;

		/**
		 * 描画領域の高さ。
		 * この値を直接書き換えてはならない。
		 */
		height: number;

		/**
		 * 本Surfaceの画像が動画であるかを示す値。真の時、動画。
		 * この値は参照のみに利用され、変更してはならない。
		 */
		isDynamic: boolean;

		/**
		 * 本Surfaceの画像がスケール変更可能かを示す値。真の時、スケール変更可能。
		 * この値は参照のみに利用され、変更してはならない。
		 */
		hasVariableResolution: boolean;

		/**
		 * 本Surfaceのx方向のスケール値
		 */
		xScale: number;

		/**
		 * 本Surfaceのy方向のスケール値
		 */
		yScale: number;

		/**
		 * 本Surfaceの再描画イベント
		 * hasVariableResolutionが偽の時undefined
		 */
		contentReset: Trigger<void>;

		/**
		 * アニメーション再生開始イベント。
		 * isDynamicが偽の時undefined。
		 */
		animatingStarted: Trigger<void>;

		/**
		 * アニメーション再生停止イベント。
		 * isDynamicが偽の時undefined。
		 */
		animatingStopped: Trigger<void>;

		/**
		 * 描画可能な実体。
		 * 具体的には renderer().drawImage() の実装が描画対象として利用できる値。
		 * @private
		 */
		_drawable: any;

		/**
		 * 本Surfaceが破棄済であるかを示す値。
		 * @private
		 */
		_destroyed: boolean;

		/**
		 * `Surface` のインスタンスを生成する。
		 * @param width 描画領域の幅（整数値でなければならない）
		 * @param height 描画領域の高さ（整数値でなければならない）
		 * @param drawable 描画可能な実体。省略された場合、 `undefined`
		 * @param optionalFlag 本surfaceに関するフラグをまとめたもの。詳細は以下の通り。
		 * 1ビット目：drawableが動画であることを示す値、2ビット目：本Surfaceの画像がスケール変更可能かを示す値
		 * また、互換性を保つためbooleanも許可している。
		 */
		constructor(width: number, height: number, drawable?: any, optionalFlag: number|boolean = false) {
			if (width % 1 !== 0 || height % 1 !== 0) {
				throw ExceptionFactory.createAssertionError("Surface#constructor: width and height must be integers");
			}

			this.width = width;
			this.height = height;
			this.xScale = 1;
			this.yScale = 1;
			if (drawable)
				this._drawable = drawable;
			const normalizedOptionalFlag = Number(optionalFlag) & parseInt("11", 2);
			this.isDynamic = Boolean(normalizedOptionalFlag & parseInt("1", 2));
			this.hasVariableResolution = Boolean(normalizedOptionalFlag & parseInt("10", 2));
			if (this.hasVariableResolution) {
				this.contentReset = new Trigger<void>();
			} else {
				this.contentReset = undefined;
			}
			if (this.isDynamic) {
				this.animatingStarted = new Trigger<void>();
				this.animatingStopped = new Trigger<void>();
			} else {
				this.animatingStarted = undefined;
				this.animatingStopped = undefined;
			}
			// this._destroyedは破棄時に一度だけ代入する特殊なフィールドなため、コンストラクタで初期値を代入しない
		}

		/**
		 * このSurfaceへの描画手段を提供するRendererを生成して返す。
		 */
		abstract renderer(): Renderer;

		/**
		 * このSurfaceが動画を再生中であるかどうかを判定する。
		 */
		abstract isPlaying(): boolean;

		/**
		 * このSurfaceの破棄を行う。
		 * 以後、このSurfaceを利用することは出来なくなる。
		 */
		destroy(): void {
			if (this.animatingStarted) {
				this.animatingStarted.destroy();
			}
			if (this.animatingStopped) {
				this.animatingStopped.destroy();
			}
			this._destroyed = true;
		}

		/**
		 * このSurfaceが破棄済であるかどうかを判定する。
		 */
		destroyed(): boolean {
			// _destroyedはundefinedかtrueなため、常にbooleanが返すように!!演算子を用いる
			return !!this._destroyed;
		}
	}
}
