import type { AssertionError, AssetLoadError, TypeMismatchError } from "@akashic/pdi-types";
import type { RequestAssetDetail, RequestAssetLoadError } from "./errors";

/**
 * 例外生成ファクトリ。
 * エンジン内部での例外生成に利用するもので、ゲーム開発者は通常本モジュールを利用する必要はない。
 */
export module ExceptionFactory {
	export function createAssertionError(message: string, cause?: any): AssertionError {
		const e: AssertionError = new Error(message) as AssertionError;
		e.name = "AssertionError";
		e.cause = cause;
		return e;
	}

	export function createTypeMismatchError(methodName: string, expected: any, actual?: any, cause?: any): TypeMismatchError {
		let message = "Type mismatch on " + methodName + "," + " expected type is " + expected;
		if (arguments.length > 2) {
			// actual 指定時
			try {
				let actualString: string;
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
		const e: TypeMismatchError = new Error(message) as TypeMismatchError;
		e.name = "TypeMismatchError";
		e.cause = cause;
		e.expected = expected;
		e.actual = actual;
		return e;
	}

	export function createAssetLoadError(
		message: string,
		retriable: boolean = true,
		_type: unknown = null, // 歴史的経緯により残っている値。利用していない。
		cause?: any
	): AssetLoadError {
		const e: AssetLoadError = new Error(message) as AssetLoadError;
		e.name = "AssetLoadError";
		e.cause = cause;
		e.retriable = retriable;
		return e;
	}

	export function createRequestAssetLoadError(message: string, detail: RequestAssetDetail, cause?: any): RequestAssetLoadError {
		const e = new Error(message) as RequestAssetLoadError;
		e.name = "RequestAssetLoadError";
		e.detail = detail;
		e.cause = cause;
		return e;
	}
}
