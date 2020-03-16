/**
 * シーンに与えるローカルティックの種類
 * @deprecated 非推奨である。将来的に削除される。代わりに `LocalTickModeString` を利用すること。
 */
export enum LocalTickMode {
	/**
	 * ローカルティックを受け取らない。
	 * 通常の(非ローカル)シーン。
	 */
	NonLocal,

	/**
	 * ローカルティックのみ受け取る。
	 * ローカルシーン。
	 */
	FullLocal,

	/**
	 * 消化すべきティックがない場合にローカルティックを受け取る。
	 * ローカルティック補間シーン。
	 */
	InterpolateLocal
}

export type LocalTickModeString = "non-local" | "full-local" | "interpolate-local";
