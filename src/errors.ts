namespace g {
	/**
	 * 純粋仮想エラー。
	 * サブクラスにおいて実装されていなければならない、純粋仮想メソッドが呼び出された際にthrowされる。
	 */
	export interface PureVirtualError extends Error {
		cause?: any;
	}

	/**
	 * アサーションエラー。
	 * エンジンが想定しない状態に陥った場合にthrowされる。メソッドの引数が正しくない場合などもこのエラーがthrowされる。
	 */
	export interface AssertionError extends Error {
		cause?: any;
	}

	/**
	 * 型ミスマッチエラー。
	 * 期待されるものと異なる型の値が与えられた場合にthrowされる。
	 */
	export interface TypeMismatchError extends Error {
		cause?: any;

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
	export interface AssetLoadError extends Error {
		cause?: any;

		/**
		 * 再試行できるエラーかどうか。
		 *
		 * `Asset#_load()` が再試行できない要因 (HTTP 404 Not Found など) で失敗した時、偽。でなければ真。
		 * 通常の場合 (`Scene` 経由で読み込んだ場合)、読み込み失敗回数が再試行回数上限 `AssetManager.MAX_ERROR_COUNT` を超えた際にも偽になる。
		 */
		retriable: boolean;

		/**
		 * エラーの種別。
		 *
		 * ダンプやエラーメッセージ出力のためのエラー種別情報。
		 * この値はあくまでも `message` (内容がアセットの実装依存) の補助情報である。
		 * 読み込み再試行の可否は `retriable` によって判断すべきである。
		 */
		type: AssetLoadErrorType;
	}

	/**
	 * 例外生成ファクトリ。
	 * エンジン内部での例外生成に利用するもので、ゲーム開発者は通常本モジュールを利用する必要はない。
	 */
	export module ExceptionFactory {
		export function createPureVirtualError(methodName: string, cause?: any): PureVirtualError {
			var e: PureVirtualError = <PureVirtualError>new Error(methodName + " has no implementation.");
			e.name = "PureVirtualError";
			e.cause = cause;
			return e;
		}

		export function createAssertionError(message: string, cause?: any): AssertionError {
			var e: AssertionError = <AssertionError>new Error(message);
			e.name = "AssertionError";
			e.cause = cause;
			return e;
		}

		export function createTypeMismatchError(methodName: string, expected: any, actual?: any, cause?: any): TypeMismatchError {
			var message = "Type mismatch on " + methodName + ","
				+ " expected type is " + expected;
			if (arguments.length > 2) { // actual 指定時
				try {
					var actualString: string;
					if (actual && actual.constructor && actual.constructor.name) {
						actualString = actual.constructor.name;
					} else {
						actualString = typeof actual;
					}
					message += ", actual type is "
						+ (actualString.length > 40 ? actualString.substr(0, 40) : actualString);
				} catch (ex) {
					// メッセージ取得時に例外が発生したらactualの型情報出力はあきらめる
				}
			}
			message += ".";
			var e: TypeMismatchError = <TypeMismatchError>new Error(message);
			e.name = "TypeMismatchError";
			e.cause = cause;
			e.expected = expected;
			e.actual = actual;
			return e;
		}

		export function createAssetLoadError(message: string, retriable: boolean = true,
		                                     type: AssetLoadErrorType = AssetLoadErrorType.Unspecified, cause?: any): AssetLoadError {
			var e: AssetLoadError = <AssetLoadError>new Error(message);
			e.name = "AssetLoadError";
			e.cause = cause;
			e.retriable = retriable;
			e.type = type;
			return e;
		}
	}
	/*
	 * ストレージエラー。
	 * `StorageLoader#_load()` が失敗した時、`StorageLoadHandler#_onStorageLoadError` に渡される。
	 */
	export interface StorageLoadError extends Error {
		cause?: any;
	}
}
