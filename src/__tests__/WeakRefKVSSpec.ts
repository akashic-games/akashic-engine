import { WeakRefKVS } from "..";

describe("WeakRefKVS", () => {
	it("check the CRUD operations", () => {
		const db = new WeakRefKVS();
		const target = {
			value: "test"
		};

		db.set("key", target);
		expect(db.get("key")).toBe(target);
		expect(db.get("another-key")).toBeUndefined();

		db.delete("key");
		expect(db.get("key")).toBeUndefined();
		expect(db.keys()).toEqual([]);

		db.set("key-1", {});
		db.set("key-2", {});
		expect(db.keys()).toEqual(["key-1", "key-2"]);

		db.clear();
		expect(db.get("key-1")).toBeUndefined();
		expect(db.get("key-2")).toBeUndefined();
		expect(db.keys()).toEqual([]);
	});
});
