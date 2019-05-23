
/**
 * 状態のビットフラグを表す数値。
 */
export const enum EntityStateFlags {
	/**
	 * 特にフラグが立っていない状態。
	 */
	None = 0,
	/**
	 * 非表示フラグ。
	 */
	Hidden = 1 << 0,
	/**
	 * 描画結果がキャッシュ済みであることを示すフラグ。
	 */
	Cached = 1 << 1,
	/**
	 * modifiedされ、描画待ちであることを示すフラグ。
	 */
	Modified = 1 << 2,
	/**
	 * 軽量な描画処理を利用できることを示すフラグ。
	 */
	ContextLess = 1 << 3
}
