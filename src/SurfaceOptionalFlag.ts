namespace g {
	/**
	 * surfaceの状態を表現したビット値
	 */
	export const enum SurfaceOptionalFlag {
		/**
		 * 特にフラグが立っていない状態
		 */
		None = 0,

		/**
		 * 動画であることを示す
		 */
		isDynamic = 1 << 0,

		/**
		 * スケール変更可能かを示す
		 */
		hasVariableResolution = 1 << 1,

		/**
		 * 全フラグが立っている状態
		 */
		All = 0x03
	}
}
