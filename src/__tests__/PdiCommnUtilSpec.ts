import { PdiCommonUtil } from "..";

describe("test PdiCommonUtil", () => {
	it("addExtname", () => {
		expect(PdiCommonUtil.addExtname("file", "ext")).toBe("file.ext");
		expect(PdiCommonUtil.addExtname("http://example/file?query", "ext")).toBe("http://example/file.ext?query");
		expect(PdiCommonUtil.addExtname("http://example/?query", "ext")).toBe("http://example/.ext?query");
	});
});
