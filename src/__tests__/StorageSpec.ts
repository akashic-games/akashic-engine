import {
	AssetConfiguration,
	Storage,
	StorageKey,
	StorageLoader,
	Scene,
	StorageValue,
	StorageWriteOption,
	StorageRegion,
	StorageCondition,
	StorageCountsOperation
} from "..";
import { Game } from "./helpers";

describe("test Storage", () => {
	const assetsConfiguration: { [name: string]: AssetConfiguration } = {
		foo: {
			type: "image",
			path: "/path1.png",
			virtualPath: "path1.png",
			width: 1,
			height: 1
		},
		baa: {
			type: "image",
			path: "/path2.png",
			virtualPath: "path2.png",
			width: 1,
			height: 1
		}
	};

	const game = new Game({
		width: 320,
		height: 320,
		assets: assetsConfiguration
	});

	it("初期化", () => {
		const storage = new Storage();
		expect(storage.write instanceof Function).toBe(true);
	});

	it("_registerLoad", () => {
		const storage = new Storage();
		const scene = new Scene({ game });
		let loadCalled = false;
		const loadMethod = function(k: StorageKey[], l: StorageLoader): void {
			loadCalled = true;
			expect(this).toBe(storage);
			expect(k).toEqual([]);
			expect(l).toBe(loader);
			expect(l._valueStoreSerialization).toBe("myserialization");
		};
		storage._registerLoad(loadMethod);
		expect(storage._load).toBe(loadMethod);
		const loader = storage._createLoader([], "myserialization");
		loader._load(scene);
		expect(loadCalled).toBe(true);
	});

	it("_registerWrite", () => {
		const storage = new Storage();
		let writeCalled = false;
		const writeMethod = function(k: StorageKey, v: StorageValue, o: StorageWriteOption): void {
			writeCalled = true;
			expect(this).toBe(storage);
		};
		storage._registerWrite(writeMethod);
		expect(storage._write).toBe(writeMethod);

		storage.write(null, null);
		expect(writeCalled).toBe(true);
	});

	it("StorageValueStore - get/getOne", () => {
		const keys = [
			{
				region: StorageRegion.Values,
				regionKey: "a001.b001",
				gameId: "123",
				userId: "456"
			},
			{
				region: StorageRegion.Values,
				regionKey: "a001.b002",
				gameId: "123",
				userId: "456"
			},
			{
				region: StorageRegion.Values,
				regionKey: "a001.b003.*",
				gameId: "123",
				userId: "456"
			},
			{
				region: StorageRegion.Counts,
				regionKey: "a001.b004",
				gameId: "123",
				userId: "456"
			},
			{
				region: StorageRegion.Scores,
				regionKey: "a001.b005",
				gameId: "123",
				userId: "456"
			},
			{
				region: StorageRegion.Counts,
				regionKey: "a001.b005",
				gameId: "123",
				userId: "*"
			}
		];
		const values = [
			[{ data: "apple" }],
			[{ data: "orange" }],
			[
				{
					data: "red",
					storageKey: {
						region: StorageRegion.Values,
						regionKey: "a001.b003.c001",
						gameId: "123",
						userId: "456"
					}
				},
				{
					data: "blue",
					storageKey: {
						region: StorageRegion.Values,
						regionKey: "a001.b003.c001",
						gameId: "123",
						userId: "456"
					}
				}
			],
			[{ data: 20 }],
			[{ data: 130 }],
			[
				{
					data: "foo",
					storageKey: {
						region: StorageRegion.Values,
						regionKey: "a001.b005",
						gameId: "123",
						userId: "456"
					}
				},
				{
					data: "bar",
					storageKey: {
						region: StorageRegion.Values,
						regionKey: "a001.b005",
						gameId: "123",
						userId: "789"
					}
				},
				{
					data: "baz",
					storageKey: {
						region: StorageRegion.Values,
						regionKey: "a001.b005",
						gameId: "123",
						userId: "012"
					}
				}
			]
		];
		const storage = new Storage();
		storage._registerLoad((k: StorageKey[], l: StorageLoader) => {
			l._onLoaded(values);
		});
		const loader = storage._createLoader(keys);
		loader._load(undefined);

		const store = loader._valueStore;
		expect(store.get(0)).toBe(values[0]);
		expect(store.get(keys[0])).toBe(values[0]);
		expect(store.get(keys[1])).toBe(values[1]);
		expect(store.get(keys[2])).toBe(values[2]);
		expect(store.get(keys[3])).toBe(values[3]);
		expect(store.get(keys[4])).toBe(values[4]);
		expect(store.get(keys[5])).toBe(values[5]);
		expect(store.get(6)).toBeUndefined();

		expect(store.getOne(0)).toBe(values[0][0]);
		expect(store.getOne(keys[0])).toBe(values[0][0]);
		expect(store.getOne(keys[1])).toBe(values[1][0]);
		expect(store.getOne(keys[2])).toBe(values[2][0]);
		expect(store.getOne(keys[3])).toBe(values[3][0]);
		expect(store.getOne(keys[4])).toBe(values[4][0]);
		expect(store.getOne(6)).toBeUndefined();
	});

	it("StorageValueStore - get with StorageKeyObject", () => {
		const keys = [
			{
				region: StorageRegion.Values,
				regionKey: "a001.b001",
				gameId: "123",
				userId: "456"
			}
		];
		const values = [[{ data: "apple" }]];
		const storage = new Storage();
		storage._registerLoad((k: StorageKey[], l: StorageLoader) => {
			l._onLoaded(values);
		});
		const loader = storage._createLoader(keys);
		const store = loader._valueStore;
		loader._load(undefined);

		expect(store.get(1)).toBeUndefined();
		expect(
			store.get({
				region: StorageRegion.Values,
				regionKey: "a001.b001",
				gameId: "123",
				userId: "456"
			})
		).toBe(values[0]);
	});

	it("_createLoader", () => {
		const keys: StorageKey[] = [
			{
				region: StorageRegion.Values,
				regionKey: "a001.b001",
				gameId: "123",
				userId: "456"
			}
		];
		const storage = new Storage();
		const loader = storage._createLoader(keys);
		expect(loader._loaded).toBe(false);
		expect(loader._storage).toBe(storage);
		expect(loader._valueStore).toBeDefined();
		expect(loader._handler).toBeUndefined();
	});

	it("StorageLoader - _load", () => {
		const keys = [
			{
				region: StorageRegion.Values,
				regionKey: "a001.b001",
				gameId: "123",
				userId: "456"
			}
		];
		const values = [[{ data: "apple" }]];
		const storage = new Storage();
		storage._registerLoad((k: StorageKey[], l: StorageLoader) => {
			l._onLoaded(values);
		});
		const loader = storage._createLoader(keys);
		loader._load(undefined);
		expect(loader._loaded).toBe(true);
		expect(loader._valueStore._values).toBe(values);
	});

	it("StorageLoader - handler", () => {
		let loadedCount = 0;
		let errorCount = 0;
		let goError = false;

		const mockScene = {
			_onStorageLoadError: () => {
				errorCount++;
			},
			_onStorageLoaded: () => {
				loadedCount++;
			}
		};
		const keys: StorageKey[] = [
			{
				region: StorageRegion.Values,
				regionKey: "a001.b001",
				gameId: "123",
				userId: "456"
			}
		];
		const storage = new Storage();
		const loader = storage._createLoader(keys);
		storage._registerLoad((k: StorageKey[], l: StorageLoader) => {
			if (goError) {
				loader._onError(undefined);
			} else {
				loader._onLoaded(undefined);
			}
		});

		loader._load(mockScene);

		expect(loadedCount).toBe(1);
		goError = true;
		loader._load(mockScene);
		expect(errorCount).toBe(1);
	});

	it("Storage - write to values", done => {
		const storage = new Storage();
		const key = {
			region: StorageRegion.Values,
			regionKey: "a001.b001",
			gameId: "123",
			userId: "456"
		};
		const value = { data: "apple" };
		storage._registerWrite(function(writeKey: StorageKey, writeValue: StorageValue): void {
			expect(this).toBe(storage);
			expect(writeKey).toBe(key);
			expect(writeValue).toBe(value);
			done();
		});
		storage.write(key, value);
	});

	it("Storage - write to values with option", done => {
		const storage = new Storage();
		const key = {
			region: StorageRegion.Values,
			regionKey: "a001.b001",
			gameId: "123",
			userId: "456"
		};
		const value = { data: "apple" };
		const option = {
			condition: StorageCondition.Equal,
			comparisonValue: "orange"
		};
		storage._registerWrite(function(writeKey: StorageKey, writeValue: StorageValue, option: StorageWriteOption): void {
			expect(this).toBe(storage);
			expect(writeKey).toBe(key);
			expect(writeValue).toBe(value);
			done();
		});
		storage.write(key, value, option);
	});

	it("Storage - write to counts", done => {
		const storage = new Storage();
		const key = {
			region: StorageRegion.Counts,
			regionKey: "a001.b001",
			gameId: "123",
			userId: "456"
		};
		const value = { data: 1 };
		storage._registerWrite(function(writeKey: StorageKey, writeValue: StorageValue, option: StorageWriteOption): void {
			expect(this).toBe(storage);
			expect(writeKey).toBe(key);
			expect(writeValue).toBe(value);
			done();
		});
		storage.write(key, value);
	});

	it("Storage - write to counts with option", done => {
		const storage = new Storage();
		const key = {
			region: StorageRegion.Counts,
			regionKey: "a001.b001",
			gameId: "123",
			userId: "456"
		};
		const value = { data: 10 };
		const option = {
			condition: StorageCondition.GreaterThan,
			comparisonValue: 20
		};
		storage._registerWrite(function(writeKey: StorageKey, writeValue: StorageValue, option: StorageWriteOption): void {
			expect(this).toBe(storage);
			expect(writeKey).toBe(key);
			expect(writeValue).toBe(value);
			done();
		});
		storage.write(key, value, option);
	});

	it("Storage - write to counts with option(incr)", done => {
		const storage = new Storage();
		const key = {
			region: StorageRegion.Counts,
			regionKey: "a001.b001",
			gameId: "123",
			userId: "456"
		};
		const value: StorageValue = { data: null };
		const option = {
			condition: StorageCondition.GreaterThan,
			comparisonValue: 10,
			operation: StorageCountsOperation.Incr
		};
		storage._registerWrite(function(writeKey: StorageKey, writeValue: StorageValue, option: StorageWriteOption): void {
			expect(this).toBe(storage);
			expect(writeKey).toBe(key);
			expect(writeValue).toBe(value);
			done();
		});
		storage.write(key, value, option);
	});
});
