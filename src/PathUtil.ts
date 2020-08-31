namespace g {
	/**
	 * パスユーティリティ。
	 * 通常、ゲーム開発者がファイルパスを扱うことはなく、このモジュールのメソッドを呼び出す必要はない。
	 */
	export module PathUtil {
		export interface PathComponents {
			host: string;
			path: string;
		}

		/**
		 * 二つのパス文字列をつなぎ、相対パス表現 (".", "..") を解決して返す。
		 * @param base 左辺パス文字列 (先頭の "./" を除き、".", ".." を含んではならない)
		 * @param path 右辺パス文字列
		 */
		export function resolvePath(base: string, path: string): string {
			function split(str: string): string[] {
				var ret = str.split("/");
				if (ret[ret.length - 1] === "") ret.pop();
				return ret;
			}
			if (path === "") return base;
			var baseComponents = PathUtil.splitPath(base);
			var parts = split(baseComponents.path).concat(split(path));
			var resolved: string[] = [];
			for (var i = 0; i < parts.length; ++i) {
				var part = parts[i];
				switch (part) {
				case "..":
					var popped = resolved.pop();
					if (popped === undefined || popped === "" || popped === ".")
						throw ExceptionFactory.createAssertionError("PathUtil.resolvePath: invalid arguments");
					break;
				case ".":
					if (resolved.length === 0) {
						resolved.push(".");
					}
					break;
				case "": // 絶対パス
					resolved = [""];
					break;
				default:
					resolved.push(part);
				}
			}
			return baseComponents.host + resolved.join("/");
		}

		/**
		 * パス文字列からディレクトリ名部分を切り出して返す。
		 * @param path パス文字列
		 */
		export function resolveDirname(path: string): string {
			var index = path.lastIndexOf("/");
			if (index === -1) return path;

			return path.substr(0, index);
		}

		/**
		 * パス文字列から拡張子部分を切り出して返す。
		 * @param path パス文字列
		 */
		export function resolveExtname(path: string): string {
			for (var i = path.length - 1; i >= 0; --i) {
				var c = path.charAt(i);
				if (c === ".") {
					return path.substr(i);
				} else if (c === "/") {
					return "";
				}
			}
			return "";
		}

		/**
		 * パス文字列から、node.js において require() の探索範囲になるパスの配列を作成して返す。
		 * @param path ディレクトリを表すパス文字列
		 */
		export function makeNodeModulePaths(path: string): string[] {
			var pathComponents = PathUtil.splitPath(path);
			var host = pathComponents.host;
			path = pathComponents.path;

			if (path[path.length - 1] === "/") {
				path = path.slice(0, path.length - 1);
			}

			var parts = path.split("/");
			var firstDir = parts.indexOf("node_modules");
			var root = firstDir > 0 ? firstDir - 1 : 0;
			var dirs: string[] = [];
			for (var i = parts.length - 1; i >= root; --i) {
				if (parts[i] === "node_modules") continue;
				var dirParts = parts.slice(0, i + 1);
				dirParts.push("node_modules");
				var dir = dirParts.join("/");
				dirs.push(host + dir);
			}
			return dirs;
		}

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

		/**
		 * 与えられたパス文字列からホストを切り出す。
		 * @param path パス文字列
		 */
		export function splitPath(path: string): PathComponents {
			var host = "";
			var doubleSlashIndex = path.indexOf("//");
			if (doubleSlashIndex >= 0) {
				var hostSlashIndex = path.indexOf("/", doubleSlashIndex + 2); // 2 === "//".length
				if (hostSlashIndex >= 0) {
					host = path.slice(0, hostSlashIndex);
					path = path.slice(hostSlashIndex); // 先頭に "/" を残して絶対パス扱いさせる
				} else {
					host = path;
					path = "/"; // path全体がホストだったので、絶対パス扱いさせる
				}
			} else {
				host = "";
			}
			return { host: host, path: path };
		}
	}
}
