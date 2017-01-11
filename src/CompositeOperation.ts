namespace g {
	/**
	 * 描画時の合成方法。
	 */
	export enum CompositeOperation {
		/**
		 * 先に描画された領域の上に描画する。
		 */
		SourceOver,
		/**
		 * 先に描画された領域と重なった部分のみを描画する。
		 */
		SourceAtop,
		/**
		 * 先に描画された領域と重なった部分の色を加算して描画する。
		 */
		Lighter,
		/**
		 * 先に描画された領域を全て無視して描画する。
		 */
		Copy
	}
}
