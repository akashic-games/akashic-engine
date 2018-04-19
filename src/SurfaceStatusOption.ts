namespace g {
	/**
	 * surfaceの状態に関するオプション
	 */
	export const enum SurfaceStatusOption {
		/**
		 * 動画であることを示す
		 */
		isDynamic = 1 << 0,

		/**
		 * スケール変更可能かを示す
		 */
		hasVariableResolution = 1 << 1,

		/**
		 * 上記全ての状態を持っていることを示す
		 */
		All = 0x03,

		/**
		 * 上記全ての状態を持っていないことを示す
		 */
		None = 0
	}
}
