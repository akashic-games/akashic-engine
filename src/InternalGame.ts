import { AssetManager } from "./domain/AssetManager";
import { E } from "./domain/entities/E";
import { ModuleManager } from "./domain/ModuleManager";
import { RuntimeGame } from "./RuntimeGame";
import { Scene, SceneAssetHolder } from "./Scene";

/**
 * akashic-engine 内部から参照可能な Game の型定義。
 */
export interface InternalGame extends RuntimeGame {
	/**
	 * このコンテンツに関連付けられるエンティティ。(ローカルなエンティティを除く)
	 */
	db: { [idx: number]: E };

	/**
	 * Assetの読み込みに使うベースパス。
	 * ゲーム開発者が参照する必要はない。
	 * 値はプラットフォーム由来のパス(絶対パス)とゲームごとの基準パス(相対パス)をつないだものになる。
	 */
	assetBase: string;

	/**
	 * このゲームに紐づくローカルなエンティティ (`E#local` が真のもの)
	 */
	// ローカルエンティティは他のゲームインスタンス(他参加者・視聴者など)とは独立に生成される可能性がある。
	// そのため `db` (`_idx`) 基準で `id` を与えてしまうと `id` の値がずれることがありうる。
	// これを避けるため、 `db` からローカルエンティティ用のDBを独立させたものがこの値である。
	_localDb: { [id: number]: E };

	/**
	 * アセットの管理者。
	 */
	_assetManager: AssetManager;

	/**
	 * モジュールの管理者。
	 */
	_moduleManager: ModuleManager;

	/**
	 * 画面更新が必要のフラグを設定する。
	 */
	modified(): void;

	/**
	 * このGameにエンティティを登録する。
	 *
	 * このメソッドは各エンティティに対して暗黙に呼び出される。ゲーム開発者がこのメソッドを明示的に利用する必要はない。
	 * `e.id` が `undefined` である場合、このメソッドの呼び出し後、 `e.id` には `this` に一意の値が設定される。
	 * `e.local` が偽である場合、このメソッドの呼び出し後、 `this.db[e.id] === e` が成立する。
	 * `e.local` が真である場合、 `e.id` の値は不定である。
	 *
	 * @param e 登録するエンティティ
	 */
	register(e: E): void;

	/**
	 * このGameからエンティティの登録を削除する。
	 *
	 * このメソッドは各エンティティに対して暗黙に呼び出される。ゲーム開発者がこのメソッドを明示的に利用する必要はない。
	 * このメソッドの呼び出し後、 `this.db[e.id]` は未定義である。
	 * @param e 登録を削除するエンティティ
	 */
	unregister(e: E): void;

	/**
	 * このゲームを終了する。
	 *
	 * エンジンに対して続行の断念を通知する。
	 * このメソッドの呼び出し後、このクライアントの操作要求は送信されない。
	 * またこのクライアントのゲーム実行は行われない(updateを含むイベントのfireはおきない)。
	 */
	terminateGame(): void;

	_callSceneAssetHolderHandler(assetHolder: SceneAssetHolder): void;
	_fireSceneReady(scene: Scene): void;
	_fireSceneLoaded(scene: Scene): void;
}
