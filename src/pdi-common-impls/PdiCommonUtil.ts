/**
 * pdi-browserから使用されるユーティリティ
 */
export module PdiCommonUtil {
	/**
	 * 与えられたパス文字列に与えられた拡張子を追加する。
	 * @param path パス文字列
	 * @param ext 追加する拡張子
	 */
	export function addExtname(path: string, ext: string): string {
		var index = path.indexOf("?");
		if (index === -1) {
			return path + "." + ext;
		}
		// hoge?query => hoge.ext?query
		return path.substring(0, index) + "." + ext + path.substring(index, path.length);
	}
}
