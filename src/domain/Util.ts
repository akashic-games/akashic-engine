import { CommonArea, CommonOffset } from "../types/commons";
import { CompositeOperation, CompositeOperationString } from "../types/CompositeOperation";
import { FontFamily, FontFamilyString } from "../types/FontFamily";
import { FontWeight, FontWeightString } from "../types/FontWeight";
import { LocalTickMode, LocalTickModeString } from "../types/LocalTickMode";
import { TextAlign, TextAlignString } from "../types/TextAlign";
import { TextBaseline, TextBaselineString } from "../types/TextBaseline";

/**
 * ユーティリティ。
 */
export module Util {
	/**
	 * 2点間(P1..P2)の距離(pixel)を返す。
	 * @param {number} p1x P1-X
	 * @param {number} p1y P1-Y
	 * @param {number} p2x P2-X
	 * @param {number} p2y P2-Y
	 */
	export function distance(p1x: number, p1y: number, p2x: number, p2y: number): number {
		return Math.sqrt(Math.pow(p1x - p2x, 2) + Math.pow(p1y - p2y, 2));
	}

	/**
	 * 2点間(P1..P2)の距離(pixel)を返す。
	 * @param {CommonOffset} p1 座標1
	 * @param {CommonOffset} p2 座標2
	 */
	export function distanceBetweenOffsets(p1: CommonOffset, p2: CommonOffset): number {
		return Util.distance(p1.x, p1.y, p2.x, p2.y);
	}

	/**
	 * 2つの矩形の中心座標(P1..P2)間の距離(pixel)を返す。
	 * @param {CommonArea} p1 矩形1
	 * @param {CommonArea} p2 矩形2
	 */
	export function distanceBetweenAreas(p1: CommonArea, p2: CommonArea): number {
		return Util.distance(p1.x + p1.width / 2, p1.y + p1.height / 2, p2.x + p2.width / 2, p2.y + p2.height / 2);
	}

	/**
	 * idx文字目の文字のchar codeを返す。
	 *
	 * これはString#charCodeAt()と次の点で異なる。
	 * - idx文字目が上位サロゲートの時これを16bit左シフトし、idx+1文字目の下位サロゲートと論理和をとった値を返す。
	 * - idx文字目が下位サロゲートの時nullを返す。
	 *
	 * @param str 文字を取り出される文字列
	 * @param idx 取り出される文字の位置
	 */
	// highly based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
	export function charCodeAt(str: string, idx: number): number {
		var code = str.charCodeAt(idx);

		if (0xd800 <= code && code <= 0xdbff) {
			var hi = code;
			var low = str.charCodeAt(idx + 1);
			return (hi << 16) | low;
		}

		if (0xdc00 <= code && code <= 0xdfff) {
			// Low surrogate
			return null;
		}

		return code;
	}

	/** CompositeOperationを対応する文字列に変換する */
	export const stringOfCompositeOperation = (operation: CompositeOperation): CompositeOperationString => {
		return toSnakeCase(CompositeOperation[operation]) as CompositeOperationString;
	};

	/** FontFamilyを対応する文字列に変換する */
	export const stringOfFontFamilyString = (family: FontFamily): FontFamilyString => {
		return toSnakeCase(FontFamily[family]) as FontFamilyString;
	};

	/** FontWeightを対応する文字列に変換する */
	export const stringOfFontWeightString = (weight: FontWeight): FontWeightString => {
		return toSnakeCase(FontWeight[weight]) as FontWeightString;
	};

	/** LocalTickModeを対応する文字列に変換する */
	export const stringOfLocalTickModeString = (mode: LocalTickMode): LocalTickModeString => {
		return toSnakeCase(LocalTickMode[mode]) as LocalTickModeString;
	};

	/** TextAlignを対応する文字列に変換する */
	export const stringOfTextAlignString = (textAlign: TextAlign): TextAlignString => {
		return toSnakeCase(TextAlign[textAlign]) as TextAlignString;
	};

	/** TextBaselineを対応する文字列に変換する */
	export const stringOfTextBaselineString = (textBaseline: TextBaseline): TextBaselineString => {
		return toSnakeCase(TextBaseline[textBaseline]) as TextBaselineString;
	};

	// UpperCamelな文字列をsnake-caseな文字列に変換
	function toSnakeCase(s: string): string {
		return s[0].toLowerCase() + s.slice(1).replace(/[A-Z]/g, (c: string) => "-" + c.toLowerCase());
	}
}
