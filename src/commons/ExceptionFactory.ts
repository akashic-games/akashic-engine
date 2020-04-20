import { AssetLoadErrorType } from "../types/AssetLoadErrorType";
import { AssertionError, AssetLoadError, TypeMismatchError } from "../types/errors";

/**
 * 例外生成ファクトリ。
 * エンジン内部での例外生成に利用するもので、ゲーム開発者は通常本モジュールを利用する必要はない。
 */
export module ExceptionFactory {
	export function createAssertionError(message: string, cause?: any): AssertionError {
		var e: AssertionError = <AssertionError> new Error(message);
		e.name = "AssertionError";
		e.cause = cause;
		return e;
	}

	export function createTypeMismatchError(methodName: string, expected: any, actual?: any, cause?: any): TypeMismatchError {
		var message = "Type mismatch on " + methodName + "," + " expected type is " + expected;
		if (arguments.length > 2) {
			// actual 指定時
			try {
				var actualString: string;
				if (actual && actual.constructor && actual.constructor.name) {
					actualString = actual.constructor.name;
				} else {
					actualString = typeof actual;
				}
				message += ", actual type is " + (actualString.length > 40 ? actualString.substr(0, 40) : actualString);
			} catch (ex) {
				// メッセージ取得時に例外が発生したらactualの型情報出力はあきらめる
			}
		}
		message += ".";
		var e: TypeMismatchError = <TypeMismatchError> new Error(message);
		e.name = "TypeMismatchError";
		e.cause = cause;
		e.expected = expected;
		e.actual = actual;
		return e;
	}

	export function createAssetLoadError(
		message: string,
		retriable: boolean = true,
		type: AssetLoadErrorType = AssetLoadErrorType.Unspecified,
		cause?: any
	): AssetLoadError {
		var e: AssetLoadError = <AssetLoadError> new Error(message);
		e.name = "AssetLoadError";
		e.cause = cause;
		e.retriable = retriable;
		e.type = type;
		return e;
	}
}
