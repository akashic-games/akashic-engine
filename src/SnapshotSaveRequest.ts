export interface SnapshotSaveRequest {
	/**
	 * ゲームの実行状態を表すスナップショット。
	 * JSONとして妥当な値でなければならない。
	 */
	snapshot: any;

	/**
	 * スナップショット生成時の時刻。
	 * `g.TimestampEvent` を利用するゲームの場合、それらと同じ基準の時間情報を与えなければならない。
	 */
	timestamp?: number;
}
