describe("test PathUtil", function() {
	var g = require('../lib/');
	var mock = require("./helpers/mock");
	var skeletonRuntime = require("./helpers/skeleton");

	beforeEach(function() {
	});

	afterEach(function() {
	});

	describe("resolvePath", function() {
		it("resolves relative path", function() {
			expect(g.PathUtil.resolvePath("hoge/fuga/sugoi/", "../a/./b/../c.js")).toBe("hoge/fuga/a/c.js");
			expect(g.PathUtil.resolvePath("/absolute/directory/foo", "../././a.js")).toBe("/absolute/directory/a.js");
			expect(g.PathUtil.resolvePath("/", "a/./b/../c.js")).toBe("/a/c.js");
			expect(g.PathUtil.resolvePath("/", "a.js")).toBe("/a.js");
			expect(g.PathUtil.resolvePath("./hoge/fuga/sugoi/", "../a/./b/../c.js")).toBe("./hoge/fuga/a/c.js");
			expect(g.PathUtil.resolvePath("./relative/directory/foo", "../././a.js")).toBe("./relative/directory/a.js");
			expect(g.PathUtil.resolvePath("", "a.js")).toBe("a.js");
			expect(g.PathUtil.resolvePath("", "a/./b/../c.js")).toBe("a/c.js");
			expect(g.PathUtil.resolvePath("./", "a/./b/../c.js")).toBe("./a/c.js");
			expect(g.PathUtil.resolvePath("./", "a.js")).toBe("./a.js");
			expect(g.PathUtil.resolvePath(".", "a/./b/../c.js")).toBe("./a/c.js");
			expect(g.PathUtil.resolvePath(".", "a.js")).toBe("./a.js");
			expect(g.PathUtil.resolvePath("hoge/", "../hoge/../a.js")).toBe("a.js");
			expect(g.PathUtil.resolvePath("hoge/", "../hoge/a.js")).toBe("hoge/a.js");
			expect(g.PathUtil.resolvePath("hoge/", "./hoge/a.js")).toBe("hoge/hoge/a.js");
			expect(g.PathUtil.resolvePath("http://hoge/fuga/sugoi/", "../a/./b/../c.js")).toBe("http://hoge/fuga/a/c.js");
			expect(g.PathUtil.resolvePath("http://foo.test/absolute/directory/foo/", "../././a.js")).toBe("http://foo.test/absolute/directory/a.js");
			expect(g.PathUtil.resolvePath("http://foo.test:80/", "a/./b/../c.js")).toBe("http://foo.test:80/a/c.js");
			expect(g.PathUtil.resolvePath("http://foo.test/", "a.js")).toBe("http://foo.test/a.js");
			expect(g.PathUtil.resolvePath("http://hoge/fuga/sugoi", "../a/./b/../c.js")).toBe("http://hoge/fuga/a/c.js");
			expect(g.PathUtil.resolvePath("http://foo.test/absolute/directory/foo", "../././a.js")).toBe("http://foo.test/absolute/directory/a.js");
			expect(g.PathUtil.resolvePath("http://foo.test:80", "a/./b/../c.js")).toBe("http://foo.test:80/a/c.js");
			expect(g.PathUtil.resolvePath("http://foo.test", "a.js")).toBe("http://foo.test/a.js");
		});

		it("resolves absolute path", function() {
			expect(g.PathUtil.resolvePath("hoge/fuga/sugoi/", "/a/./b/../c.js")).toBe("/a/c.js");
			expect(g.PathUtil.resolvePath("/absolute/directory/foo", "..//././a.js")).toBe("/a.js");
			expect(g.PathUtil.resolvePath("/", "/a/./b/../c.js")).toBe("/a/c.js");
			expect(g.PathUtil.resolvePath("/", "/a.js")).toBe("/a.js");
			expect(g.PathUtil.resolvePath("./hoge/fuga/sugoi/", "/a/./b/../c.js")).toBe("/a/c.js");
			expect(g.PathUtil.resolvePath("./relative/directory/foo", "/./a.js")).toBe("/a.js");
			expect(g.PathUtil.resolvePath("", "/a.js")).toBe("/a.js");
			expect(g.PathUtil.resolvePath("", "/a/./b/../c.js")).toBe("/a/c.js");
			expect(g.PathUtil.resolvePath("./", "a/.//b//c.js")).toBe("/c.js");
			expect(g.PathUtil.resolvePath("./", "/a.js")).toBe("/a.js");
			expect(g.PathUtil.resolvePath(".", "/a/./b/../c.js")).toBe("/a/c.js");
			expect(g.PathUtil.resolvePath(".", "/a.js")).toBe("/a.js");
			expect(g.PathUtil.resolvePath("hoge/", "/hoge/../a.js")).toBe("/a.js");
			expect(g.PathUtil.resolvePath("hoge/", "/hoge/a.js")).toBe("/hoge/a.js");
			expect(g.PathUtil.resolvePath("http://hoge/fuga/sugoi/", "/a/./b/../c.js")).toBe("http://hoge/a/c.js");
			expect(g.PathUtil.resolvePath("http://foo.test/absolute/directory/foo/", "//./a.js")).toBe("http://foo.test/a.js");
			expect(g.PathUtil.resolvePath("http://foo.test:80/", "/a/./b/../c.js")).toBe("http://foo.test:80/a/c.js");
			expect(g.PathUtil.resolvePath("http://foo.test/", "/a.js")).toBe("http://foo.test/a.js");
			expect(g.PathUtil.resolvePath("http://hoge/fuga/sugoi", "..//a/./b/../c.js")).toBe("http://hoge/a/c.js");
			expect(g.PathUtil.resolvePath("http://foo.test/absolute/directory/foo", "/a.js")).toBe("http://foo.test/a.js");
			expect(g.PathUtil.resolvePath("http://foo.test:80", "/a/./b/../c.js")).toBe("http://foo.test:80/a/c.js");
			expect(g.PathUtil.resolvePath("http://foo.test", "/a.js")).toBe("http://foo.test/a.js");
		});

		it("rejects invalid arguments", function() {
			expect(function() {g.PathUtil.resolvePath("hoge/", "../../a.js")}).toThrowError("PathUtil.resolvePath: invalid arguments");
			expect(function() {g.PathUtil.resolvePath(".", "../a.js")}).toThrowError("PathUtil.resolvePath: invalid arguments");
			expect(function() {g.PathUtil.resolvePath("./", "../a.js")}).toThrowError("PathUtil.resolvePath: invalid arguments");
			expect(function() {g.PathUtil.resolvePath("./hoge", "./../../a.js")}).toThrowError("PathUtil.resolvePath: invalid arguments");
		});
	});

	it("resolveExtname", function() {
		expect(g.PathUtil.resolveExtname("hoge/fuga/sugoi/foo.js")).toBe(".js");
		expect(g.PathUtil.resolveExtname("/absolute/directory/bar.js")).toBe(".js");
		expect(g.PathUtil.resolveExtname("/")).toBe("");
		expect(g.PathUtil.resolveExtname("")).toBe("");
	});

	it("resolveDirname", function() {
		expect(g.PathUtil.resolveDirname("hoge/fuga/sugoi/c.js")).toBe("hoge/fuga/sugoi");
		expect(g.PathUtil.resolveDirname("hoge")).toBe("hoge");
		expect(g.PathUtil.resolveDirname("")).toBe("");
	});

	it("makeNodeModulePaths", function () {
		var paths = g.PathUtil.makeNodeModulePaths("/foo/bar/zoo/node_modules/aaa/node_modules/ccc/node_modules/ddd/eee");
		expect(paths).toEqual([
			"/foo/bar/zoo/node_modules/aaa/node_modules/ccc/node_modules/ddd/eee/node_modules",
			"/foo/bar/zoo/node_modules/aaa/node_modules/ccc/node_modules/ddd/node_modules",
			"/foo/bar/zoo/node_modules/aaa/node_modules/ccc/node_modules",
			"/foo/bar/zoo/node_modules/aaa/node_modules",
			"/foo/bar/zoo/node_modules"
		]);

		var paths = g.PathUtil.makeNodeModulePaths("/foo/bar/zoo/node_modules/aaa/node_modules/ccc/node_modules/ddd/eee/");
		expect(paths).toEqual([
			"/foo/bar/zoo/node_modules/aaa/node_modules/ccc/node_modules/ddd/eee/node_modules",
			"/foo/bar/zoo/node_modules/aaa/node_modules/ccc/node_modules/ddd/node_modules",
			"/foo/bar/zoo/node_modules/aaa/node_modules/ccc/node_modules",
			"/foo/bar/zoo/node_modules/aaa/node_modules",
			"/foo/bar/zoo/node_modules"
		]);

		var paths = g.PathUtil.makeNodeModulePaths("/foo/bar/zoo/aaa");
		expect(paths).toEqual([
			"/foo/bar/zoo/aaa/node_modules",
			"/foo/bar/zoo/node_modules",
			"/foo/bar/node_modules",
			"/foo/node_modules",
			"/node_modules"
		]);

		var paths = g.PathUtil.makeNodeModulePaths("/foo/bar/");
		expect(paths).toEqual([
			"/foo/bar/node_modules",
			"/foo/node_modules",
			"/node_modules"
		]);

		var paths = g.PathUtil.makeNodeModulePaths("/");
		expect(paths).toEqual([ "/node_modules" ]);

		var paths = g.PathUtil.makeNodeModulePaths("/node_modules/foo/node_modules/bar/node_modules/aaa");
		expect(paths).toEqual([
			"/node_modules/foo/node_modules/bar/node_modules/aaa/node_modules",
			"/node_modules/foo/node_modules/bar/node_modules",
			"/node_modules/foo/node_modules",
			"/node_modules",
		]);

		var paths = g.PathUtil.makeNodeModulePaths("https://hoge.test/foo/bar/zoo/node_modules/aaa/node_modules/ccc/node_modules/ddd/eee");
		expect(paths).toEqual([
			"https://hoge.test/foo/bar/zoo/node_modules/aaa/node_modules/ccc/node_modules/ddd/eee/node_modules",
			"https://hoge.test/foo/bar/zoo/node_modules/aaa/node_modules/ccc/node_modules/ddd/node_modules",
			"https://hoge.test/foo/bar/zoo/node_modules/aaa/node_modules/ccc/node_modules",
			"https://hoge.test/foo/bar/zoo/node_modules/aaa/node_modules",
			"https://hoge.test/foo/bar/zoo/node_modules"
		]);

		var paths = g.PathUtil.makeNodeModulePaths("https://hoge.test/foo/bar/zoo/aaa");
		expect(paths).toEqual([
			"https://hoge.test/foo/bar/zoo/aaa/node_modules",
			"https://hoge.test/foo/bar/zoo/node_modules",
			"https://hoge.test/foo/bar/node_modules",
			"https://hoge.test/foo/node_modules",
			"https://hoge.test/node_modules"
		]);

		var paths = g.PathUtil.makeNodeModulePaths("https://hoge.test/");
		expect(paths).toEqual([ "https://hoge.test/node_modules" ]);
		var paths = g.PathUtil.makeNodeModulePaths("https://hoge.test");
		expect(paths).toEqual([ "https://hoge.test/node_modules" ]);

		var paths = g.PathUtil.makeNodeModulePaths("https://node_modules/");
		expect(paths).toEqual([ "https://node_modules/node_modules" ]);
		var paths = g.PathUtil.makeNodeModulePaths("https://node_modules");
		expect(paths).toEqual([ "https://node_modules/node_modules" ]);
	});
	
	it("addExtname", function() {
		expect(g.PathUtil.addExtname("file", "ext")).toBe("file.ext");
		expect(g.PathUtil.addExtname("http://example/file?query", "ext")).toBe("http://example/file.ext?query");
		expect(g.PathUtil.addExtname("http://example/?query", "ext")).toBe("http://example/.ext?query");
	});

	it("splitPath", function(){
		expect(g.PathUtil.splitPath("http://example.com/file.ext")).toEqual({host: "http://example.com", path: "/file.ext"});
		expect(g.PathUtil.splitPath("http://example.com")).toEqual({host: "http://example.com", path: "/"});
		expect(g.PathUtil.splitPath("example/file.ext")).toEqual({host: "", path: "example/file.ext"});
	});
});
