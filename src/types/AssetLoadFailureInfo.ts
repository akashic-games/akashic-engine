import { AssetLike } from "../interfaces/AssetLike";
import { AssetLoadError } from "./errors";

/**
 * `Asset` の読み込み失敗を通知するインターフェース。
 */
export interface AssetLoadFailureInfo {
	/**
	 * 読み込みに失敗したアセット。
	 */
	asset: AssetLike;

	/**
	 * 失敗の内容を表すエラー。
	 * `error.retriable` が偽である場合、エンジンは強制的にゲーム続行を断念する (`Game#terminateGame()` を行う) 。
	 */
	error: AssetLoadError;

	/**
	 * 読み込み再試行をキャンセルするかどうか。
	 * 初期値は偽である。
	 * ゲーム開発者はこの値を真に変更することで、再試行をさせない(ゲーム続行を断念する)ことができる。
	 * `error.retriable` が偽である場合、この値の如何にかかわらず再試行は行われない。
	 */
	cancelRetry: boolean;
}
