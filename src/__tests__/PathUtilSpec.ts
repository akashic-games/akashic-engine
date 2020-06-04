import { PathUtil } from "..";

describe("test PathUtil", () => {
	describe("resolvePath", () => {
		it("resolves relative path", () => {
			expect(PathUtil.resolvePath("hoge/fuga/sugoi/", "../a/./b/../c.js")).toBe("hoge/fuga/a/c.js");
			expect(PathUtil.resolvePath("/absolute/directory/foo", "../././a.js")).toBe("/absolute/directory/a.js");
			expect(PathUtil.resolvePath("/", "a/./b/../c.js")).toBe("/a/c.js");
			expect(PathUtil.resolvePath("/", "a.js")).toBe("/a.js");
			expect(PathUtil.resolvePath("./hoge/fuga/sugoi/", "../a/./b/../c.js")).toBe("./hoge/fuga/a/c.js");
			expect(PathUtil.resolvePath("./relative/directory/foo", "../././a.js")).toBe("./relative/directory/a.js");
			expect(PathUtil.resolvePath("", "a.js")).toBe("a.js");
			expect(PathUtil.resolvePath("", "a/./b/../c.js")).toBe("a/c.js");
			expect(PathUtil.resolvePath("./", "a/./b/../c.js")).toBe("./a/c.js");
			expect(PathUtil.resolvePath("./", "a.js")).toBe("./a.js");
			expect(PathUtil.resolvePath(".", "a/./b/../c.js")).toBe("./a/c.js");
			expect(PathUtil.resolvePath(".", "a.js")).toBe("./a.js");
			expect(PathUtil.resolvePath("hoge/", "../hoge/../a.js")).toBe("a.js");
			expect(PathUtil.resolvePath("hoge/", "../hoge/a.js")).toBe("hoge/a.js");
			expect(PathUtil.resolvePath("hoge/", "./hoge/a.js")).toBe("hoge/hoge/a.js");
			expect(PathUtil.resolvePath("http://hoge/fuga/sugoi/", "../a/./b/../c.js")).toBe("http://hoge/fuga/a/c.js");
			expect(PathUtil.resolvePath("http://foo.test/absolute/directory/foo/", "../././a.js")).toBe(
				"http://foo.test/absolute/directory/a.js"
			);
			expect(PathUtil.resolvePath("http://foo.test:80/", "a/./b/../c.js")).toBe("http://foo.test:80/a/c.js");
			expect(PathUtil.resolvePath("http://foo.test/", "a.js")).toBe("http://foo.test/a.js");
			expect(PathUtil.resolvePath("http://hoge/fuga/sugoi", "../a/./b/../c.js")).toBe("http://hoge/fuga/a/c.js");
			expect(PathUtil.resolvePath("http://foo.test/absolute/directory/foo", "../././a.js")).toBe(
				"http://foo.test/absolute/directory/a.js"
			);
			expect(PathUtil.resolvePath("http://foo.test:80", "a/./b/../c.js")).toBe("http://foo.test:80/a/c.js");
			expect(PathUtil.resolvePath("http://foo.test", "a.js")).toBe("http://foo.test/a.js");
		});

		it("resolves absolute path", () => {
			expect(PathUtil.resolvePath("hoge/fuga/sugoi/", "/a/./b/../c.js")).toBe("/a/c.js");
			expect(PathUtil.resolvePath("/absolute/directory/foo", "..//././a.js")).toBe("/a.js");
			expect(PathUtil.resolvePath("/", "/a/./b/../c.js")).toBe("/a/c.js");
			expect(PathUtil.resolvePath("/", "/a.js")).toBe("/a.js");
			expect(PathUtil.resolvePath("./hoge/fuga/sugoi/", "/a/./b/../c.js")).toBe("/a/c.js");
			expect(PathUtil.resolvePath("./relative/directory/foo", "/./a.js")).toBe("/a.js");
			expect(PathUtil.resolvePath("", "/a.js")).toBe("/a.js");
			expect(PathUtil.resolvePath("", "/a/./b/../c.js")).toBe("/a/c.js");
			expect(PathUtil.resolvePath("./", "a/.//b//c.js")).toBe("/c.js");
			expect(PathUtil.resolvePath("./", "/a.js")).toBe("/a.js");
			expect(PathUtil.resolvePath(".", "/a/./b/../c.js")).toBe("/a/c.js");
			expect(PathUtil.resolvePath(".", "/a.js")).toBe("/a.js");
			expect(PathUtil.resolvePath("hoge/", "/hoge/../a.js")).toBe("/a.js");
			expect(PathUtil.resolvePath("hoge/", "/hoge/a.js")).toBe("/hoge/a.js");
			expect(PathUtil.resolvePath("http://hoge/fuga/sugoi/", "/a/./b/../c.js")).toBe("http://hoge/a/c.js");
			expect(PathUtil.resolvePath("http://foo.test/absolute/directory/foo/", "//./a.js")).toBe("http://foo.test/a.js");
			expect(PathUtil.resolvePath("http://foo.test:80/", "/a/./b/../c.js")).toBe("http://foo.test:80/a/c.js");
			expect(PathUtil.resolvePath("http://foo.test/", "/a.js")).toBe("http://foo.test/a.js");
			expect(PathUtil.resolvePath("http://hoge/fuga/sugoi", "..//a/./b/../c.js")).toBe("http://hoge/a/c.js");
			expect(PathUtil.resolvePath("http://foo.test/absolute/directory/foo", "/a.js")).toBe("http://foo.test/a.js");
			expect(PathUtil.resolvePath("http://foo.test:80", "/a/./b/../c.js")).toBe("http://foo.test:80/a/c.js");
			expect(PathUtil.resolvePath("http://foo.test", "/a.js")).toBe("http://foo.test/a.js");
		});

		it("rejects invalid arguments", () => {
			expect(() => {
				PathUtil.resolvePath("hoge/", "../../a.js");
			}).toThrowError("PathUtil.resolvePath: invalid arguments");
			expect(() => {
				PathUtil.resolvePath(".", "../a.js");
			}).toThrowError("PathUtil.resolvePath: invalid arguments");
			expect(() => {
				PathUtil.resolvePath("./", "../a.js");
			}).toThrowError("PathUtil.resolvePath: invalid arguments");
			expect(() => {
				PathUtil.resolvePath("./hoge", "./../../a.js");
			}).toThrowError("PathUtil.resolvePath: invalid arguments");
		});
	});

	it("resolveExtname", () => {
		expect(PathUtil.resolveExtname("hoge/fuga/sugoi/foo.js")).toBe(".js");
		expect(PathUtil.resolveExtname("/absolute/directory/bar.js")).toBe(".js");
		expect(PathUtil.resolveExtname("/")).toBe("");
		expect(PathUtil.resolveExtname("")).toBe("");
	});

	it("resolveDirname", () => {
		expect(PathUtil.resolveDirname("hoge/fuga/sugoi/c.js")).toBe("hoge/fuga/sugoi");
		expect(PathUtil.resolveDirname("hoge")).toBe("hoge");
		expect(PathUtil.resolveDirname("")).toBe("");
	});

	it("makeNodeModulePaths", () => {
		let paths = PathUtil.makeNodeModulePaths("/foo/bar/zoo/node_modules/aaa/node_modules/ccc/node_modules/ddd/eee");
		expect(paths).toEqual([
			"/foo/bar/zoo/node_modules/aaa/node_modules/ccc/node_modules/ddd/eee/node_modules",
			"/foo/bar/zoo/node_modules/aaa/node_modules/ccc/node_modules/ddd/node_modules",
			"/foo/bar/zoo/node_modules/aaa/node_modules/ccc/node_modules",
			"/foo/bar/zoo/node_modules/aaa/node_modules",
			"/foo/bar/zoo/node_modules"
		]);

		paths = PathUtil.makeNodeModulePaths("/foo/bar/zoo/node_modules/aaa/node_modules/ccc/node_modules/ddd/eee/");
		expect(paths).toEqual([
			"/foo/bar/zoo/node_modules/aaa/node_modules/ccc/node_modules/ddd/eee/node_modules",
			"/foo/bar/zoo/node_modules/aaa/node_modules/ccc/node_modules/ddd/node_modules",
			"/foo/bar/zoo/node_modules/aaa/node_modules/ccc/node_modules",
			"/foo/bar/zoo/node_modules/aaa/node_modules",
			"/foo/bar/zoo/node_modules"
		]);

		paths = PathUtil.makeNodeModulePaths("/foo/bar/zoo/aaa");
		expect(paths).toEqual([
			"/foo/bar/zoo/aaa/node_modules",
			"/foo/bar/zoo/node_modules",
			"/foo/bar/node_modules",
			"/foo/node_modules",
			"/node_modules"
		]);

		paths = PathUtil.makeNodeModulePaths("/foo/bar/");
		expect(paths).toEqual(["/foo/bar/node_modules", "/foo/node_modules", "/node_modules"]);

		paths = PathUtil.makeNodeModulePaths("/");
		expect(paths).toEqual(["/node_modules"]);

		paths = PathUtil.makeNodeModulePaths("/node_modules/foo/node_modules/bar/node_modules/aaa");
		expect(paths).toEqual([
			"/node_modules/foo/node_modules/bar/node_modules/aaa/node_modules",
			"/node_modules/foo/node_modules/bar/node_modules",
			"/node_modules/foo/node_modules",
			"/node_modules"
		]);

		paths = PathUtil.makeNodeModulePaths("https://hoge.test/foo/bar/zoo/node_modules/aaa/node_modules/ccc/node_modules/ddd/eee");
		expect(paths).toEqual([
			"https://hoge.test/foo/bar/zoo/node_modules/aaa/node_modules/ccc/node_modules/ddd/eee/node_modules",
			"https://hoge.test/foo/bar/zoo/node_modules/aaa/node_modules/ccc/node_modules/ddd/node_modules",
			"https://hoge.test/foo/bar/zoo/node_modules/aaa/node_modules/ccc/node_modules",
			"https://hoge.test/foo/bar/zoo/node_modules/aaa/node_modules",
			"https://hoge.test/foo/bar/zoo/node_modules"
		]);

		paths = PathUtil.makeNodeModulePaths("https://hoge.test/foo/bar/zoo/aaa");
		expect(paths).toEqual([
			"https://hoge.test/foo/bar/zoo/aaa/node_modules",
			"https://hoge.test/foo/bar/zoo/node_modules",
			"https://hoge.test/foo/bar/node_modules",
			"https://hoge.test/foo/node_modules",
			"https://hoge.test/node_modules"
		]);

		paths = PathUtil.makeNodeModulePaths("https://hoge.test/");
		expect(paths).toEqual(["https://hoge.test/node_modules"]);
		paths = PathUtil.makeNodeModulePaths("https://hoge.test");
		expect(paths).toEqual(["https://hoge.test/node_modules"]);

		paths = PathUtil.makeNodeModulePaths("https://node_modules/");
		expect(paths).toEqual(["https://node_modules/node_modules"]);
		paths = PathUtil.makeNodeModulePaths("https://node_modules");
		expect(paths).toEqual(["https://node_modules/node_modules"]);
	});

	it("splitPath", () => {
		expect(PathUtil.splitPath("http://example.com/file.ext")).toEqual({
			host: "http://example.com",
			path: "/file.ext"
		});
		expect(PathUtil.splitPath("http://example.com")).toEqual({
			host: "http://example.com",
			path: "/"
		});
		expect(PathUtil.splitPath("example/file.ext")).toEqual({
			host: "",
			path: "example/file.ext"
		});
	});
});
