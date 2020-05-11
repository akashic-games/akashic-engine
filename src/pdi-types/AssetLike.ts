import { Trigger } from "@akashic/trigger";
import { AssetLoadError } from "./errors";

/**
 * `Asset` の読み込みまたは読み込み失敗を受け取るハンドラのインターフェース定義。
 * 通常、このインターフェースをゲーム開発者が利用する必要はない。
 * `AssetManagerLoadHandler` とは異なる。こちらは `Asset` の読み込み処理を直接実行する場合に用いるハンドラである。
 */
export interface AssetLoadHandler {
	/**
	 * 読み込失敗の通知を受ける関数。
	 * @param asset 読み込みに失敗したアセット
	 * @param error 失敗の内容を表すエラー
	 */
	_onAssetError(asset: AssetLike, error: AssetLoadError): void;

	/**
	 * 読み込み完了の通知を受ける関数。
	 * @param asset 読み込みが完了したアセット
	 */
	_onAssetLoad(asset: AssetLike): void;
}

/**
 * 各種リソースを表すインターフェース定義。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
 * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
 * Scene#assets、またはGame#assetsによって取得して利用する。
 */
export interface AssetLike {
	id: string;
	type: string;
	path: string;
	originalPath: string;
	onDestroyed: Trigger<AssetLike>;

	/**
	 * 現在利用中で解放出来ない `Asset` かどうかを返す。
	 * 戻り値は、利用中である場合真、でなければ偽である。
	 *
	 * 本メソッドは通常 `false` が返るべきである。
	 * 例えば `Sprite` の元画像として使われているケース等では、その `Sprite` によって `Asset` は `Surface` に変換されているべきで、
	 * `Asset` が利用中で解放出来ない状態になっていない事を各プラットフォームで保障する必要がある。
	 *
	 * 唯一、例外的に本メソッドが `true` を返すことがあるのは音楽を表す `Asset` である。
	 * BGM等はシーンをまたいで演奏することもありえる上、
	 * 演奏中のリソースのコピーを常に各プラットフォームに強制するにはコストがかかりすぎるため、
	 * 本メソッドは `true` を返し、適切なタイミングで `Asset` が解放されるよう制御する必要がある。
	 */
	inUse(): boolean;

	/**
	 * このアセットのリソースの破棄を行う。
	 */
	destroy(): void;

	/**
	 * このアセットのリソースが破棄済みであるかどうかを判定する。
	 */
	destroyed(): boolean;

	/**
	 * アセットの読み込みを行う。
	 *
	 * ゲーム開発者がアセット読み込み失敗時の挙動をカスタマイズする際、読み込みを再試行する場合は、
	 * (このメソッドではなく) `AssetLoadFailureInfo#cancelRetry` に真を代入する必要がある。
	 *
	 * @param loader 読み込み結果の通知を受け取るハンドラ
	 * @private
	 */
	_load(loader: AssetLoadHandler): void;

	/**
	 * @private
	 */
	_assetPathFilter(path: string): string;
}
