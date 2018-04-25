namespace g {
	/**
	 * surfaceの状態に関するオプション
	 */
	export enum SurfaceStateFlags {
		/**
		 * 動画であることを示す
		 */
		isDynamic = 1 << 0,

		/**
		 * スケール変更可能かを示す
		 */
		hasVariableResolution = 1 << 1,

		/**
		 * 上記全ての状態を持っていないことを示す
		 */
		None = 0
	}
}
