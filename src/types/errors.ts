export interface ErrorLike {
	name: string;
	message: string;
	stack?: string;
	cause?: any;
}

/**
 * アサーションエラー。
 * エンジンが想定しない状態に陥った場合にthrowされる。メソッドの引数が正しくない場合などもこのエラーがthrowされる。
 */
export interface AssertionError extends ErrorLike {
	name: "AssertionError";
}

/**
 * 型ミスマッチエラー。
 * 期待されるものと異なる型の値が与えられた場合にthrowされる。
 */
export interface TypeMismatchError extends ErrorLike {
	name: "TypeMismatchError";

	/**
	 * 期待される型情報。
	 */
	expected: string;

	/**
	 * 実際に渡されたオブジェクト。
	 */
	actual: any;
}

/**
 * アセットロードエラー。
 * `Asset#_load()` が失敗した時、`AssetLoadHandler#_onAssetError` に渡される。
 *
 * エラーの理由は `message` から、そのおおまかな種別は `type` から得ることができる。
 * ただし特に `message` の内容はアセットの実装に依存するため、 `message` の値で処理を変更してはならない。
 * 読み込みの再試行が可能かどうかは `retriable` で判断すべきである。
 */
export interface AssetLoadError extends ErrorLike {
	name: "AssetLoadError";

	/**
	 * 再試行できるエラーかどうか。
	 *
	 * `Asset#_load()` が再試行できない要因 (HTTP 404 Not Found など) で失敗した時、偽。でなければ真。
	 * 通常の場合 (`Scene` 経由で読み込んだ場合)、読み込み失敗回数が再試行回数上限 `AssetManager.MAX_ERROR_COUNT` を超えた際にも偽になる。
	 */
	retriable: boolean;
}

/*
 * ストレージエラー。
 * `StorageLoader#_load()` が失敗した時、`StorageLoadHandler#_onStorageLoadError` に渡される。
 */
export interface StorageLoadError extends ErrorLike {
	name: "StorageLoadError";
}
