var g = require("../lib/");
var mock = require("./helpers/mock");
describe("test Storage", function () {
	beforeEach(function () {
	});
	afterEach(function () {
	});

	var assetsConfiguration = {
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

	var game = new mock.Game({
		width: 320,
		height: 320,
		assets: assetsConfiguration
	});

	it("初期化", function () {
		var storage = new g.Storage(game);
		expect(storage._game).toBe(game);
	});

	it("_registerLoad", function() {
		var storage = new g.Storage(game);
		expect(storage._game).toBe(game);

		var mockScene = {
			_onStorageLoadError: function() {},
			_onStorageLoaded: function() {}
		};

		var loadCalled = false;
		var loadMethod = function(k, l) {
			loadCalled = true;
			expect(this).toBe(storage);
			expect(k).toEqual([]);
			expect(l).toBe(loader);
			expect(l._valueStoreSerialization).toBe("myserialization");
		};
		storage._registerLoad(loadMethod);
		expect(storage._load).toBe(loadMethod);
		var loader = storage._createLoader([], "myserialization");
		loader._load(mockScene);
		expect(loadCalled).toBe(true);
	});


	it("_registerWrite", function() {
		var storage = new g.Storage(game);
		expect(storage._game).toBe(game);

		var mockScene = {
			_onStorageLoadError: function() {},
			_onStorageLoaded: function() {}
		};

		var writeCalled = false;
		var writeMethod = function(k, v) {
			writeCalled = true;
			expect(this).toBe(storage);
		};
		storage._registerWrite(writeMethod);
		expect(storage._write).toBe(writeMethod);

		storage.write(null, null);
		expect(writeCalled).toBe(true);
	});

	it("StorageValueStore - get/getOne", function() {
		var keys = [
			{region: g.StorageRegion.Values, regionKey: "a001.b001", gameId: "123", userId: "456"},
			{region: g.StorageRegion.Values, regionKey: "a001.b002", gameId: "123", userId: "456"},
			{region: g.StorageRegion.Values, regionKey: "a001.b003.*", gameId: "123", userId: "456"},
			{region: g.StorageRegion.Counts, regionKey: "a001.b004", gameId: "123", userId: "456"},
			{region: g.StorageRegion.Scores, regionKey: "a001.b005", gameId: "123", userId: "456"},
			{region: g.StorageRegion.Counts, regionKey: "a001.b005", gameId: "123", userId: "*"}
		];
		var values = [
			[{data: "apple"}],
			[{data: "orange"}],
			[
				{data: "red", storageKey: {region: g.StorageRegion.Values, regionKey: "a001.b003.c001", gameId: "123", userId: "456"}},
				{data: "blue", storageKey: {region: g.StorageRegion.Values, regionKey: "a001.b003.c001", gameId: "123", userId: "456"}}
			],
			[{data: 20}],
			[{data: 130}],
			[
				{data: "foo", storageKey: {region: g.StorageRegion.Values, regionKey: "a001.b005", gameId: "123", userId: "456"}},
				{data: "bar", storageKey: {region: g.StorageRegion.Values, regionKey: "a001.b005", gameId: "123", userId: "789"}},
				{data: "baz", storageKey: {region: g.StorageRegion.Values, regionKey: "a001.b005", gameId: "123", userId: "012"}},
			]
		];
		var storage = new g.Storage(game);
		storage._registerLoad(function(k, l) {
			l._onLoaded(values);
		});
		var loader = storage._createLoader(keys);
		loader._load();

		var store = loader._valueStore;
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

	it("StorageValueStore - get with StorageKeyObject", function() {
		var keys = [
			{region: g.StorageRegion.Values, regionKey: "a001.b001", gameId: "123", userId: "456"},
		];
		var values = [
			[{data: "apple"}],
		];
		var storage = new g.Storage(game);
		storage._registerLoad(function(k, l) {
			l._onLoaded(values);
		});
		var loader = storage._createLoader(keys);
		var store = loader._valueStore;
		loader._load();

		expect(store.get(1)).toBeUndefined();
		expect(store.get({region: g.StorageRegion.Values, regionKey: "a001.b001", gameId: "123", userId: "456"})).toBe(values[0]);
	});

	it("_createLoader", function() {
		var keys = [
			{region: g.StorageRegion.Values, regionKey: "a001.b001", gameId: "123", userId: "456"}
		];
		var storage = new g.Storage(game);
		var loader = storage._createLoader(keys);
		expect(loader._loaded).toBe(false);
		expect(loader._storage).toBe(storage);
		expect(loader._valueStore).toBeDefined();
		expect(loader._handler).toBeUndefined();
	});

	it("StorageLoader - _load", function() {
		var keys = [
			{region: g.StorageRegion.Values, regionKey: "a001.b001", gameId: "123", userId: "456"}
		];
		var values = [[{data: "apple"}]];
		var storage = new g.Storage(game);
		storage._registerLoad(function(k, l) {
			l._onLoaded(values);
		});
		var loader = storage._createLoader(keys);
		loader._load();
		expect(loader._loaded).toBe(true);
		expect(loader._valueStore._values).toBe(values);
	});

	it("StorageLoader - handler", function() {
		var loadedParent = null;
		var errorParent = null;
		var loadedCount = 0;
		var errorCount = 0;
		var goError = false;

		var mockScene = {
			_onStorageLoadError: function() {
				errorCount++;
			},
			_onStorageLoaded: function() {
				loadedCount++;
			}
		};
		var keys = [
			{region: g.StorageRegion.Values, regionKey: "a001.b001", gameId: "123", userId: "456"}
		];
		var values = [
			[{data: "apple"}],
		];
		var storage = new g.Storage(game);
		storage._registerLoad(function(keys, loader) {
			if (goError) {
				loader._onError();
			} else {
				loader._onLoaded();
			}
		});
		var loader = storage._createLoader(keys);

		loader._load(mockScene);

		expect(loadedCount).toBe(1);
		goError = true;
		loader._load(mockScene);
		expect(errorCount).toBe(1);
	});

	it("Storage - write to values", function(done) {
		var storage = new g.Storage(game);
		var key = {region: g.StorageRegion.Values, regionKey: "a001.b001", gameId: "123", userId: "456"};
		var value = {data: "apple"};
		storage._registerWrite(function(writeKey, writeValue) {
			expect(this).toBe(storage);
			expect(writeKey).toBe(key);
			expect(writeValue).toBe(value);
			done();
		});
		storage.write(key, value);
	});

	it("Storage - write to values with option", function(done) {
		var storage = new g.Storage(game);
		var key = {region: g.StorageRegion.Values, regionKey: "a001.b001", gameId: "123", userId: "456"};
		var value = {data: "apple"};
		var option = {
			condition: g.StorageCondition.Equal,
			comparisonValue: "orange"
		};
		storage._registerWrite(function(writeKey, writeValue, option) {
			expect(this).toBe(storage);
			expect(writeKey).toBe(key);
			expect(writeValue).toBe(value);
			done();
		});
		storage.write(key, value, option);
	});

	it("Storage - write to counts", function(done) {
		var storage = new g.Storage(game);
		var key = {region: g.StorageRegion.Counts, regionKey: "a001.b001", gameId: "123", userId: "456"};
		var value = {data: 1};
		storage._registerWrite(function(writeKey, writeValue) {
			expect(this).toBe(storage);
			expect(writeKey).toBe(key);
			expect(writeValue).toBe(value);
			done();
		});
		storage.write(key, value);
	});

	it("Storage - write to counts with option", function(done) {
		var storage = new g.Storage(game);
		var key = {region: g.StorageRegion.Counts, regionKey: "a001.b001", gameId: "123", userId: "456"};
		var value = {data: 10};
		var option = {
			condition: g.StorageCondition.GreaterThan,
			comparisonValue: 20
		};
		storage._registerWrite(function(writeKey, writeValue, option) {
			expect(this).toBe(storage);
			expect(writeKey).toBe(key);
			expect(writeValue).toBe(value);
			done();
		});
		storage.write(key, value, option);
	});

	it("Storage - write to counts with option(incr)", function(done) {
		var storage = new g.Storage(game);
		var key = {region: g.StorageRegion.Counts, regionKey: "a001.b001", gameId: "123", userId: "456"};
		var value = {data: null};
		var option = {
			condition: g.StorageCondition.GreaterThan,
			comparisonValue: 10,
			operation: g.StorageCountsOperation.Incr
		};
		storage._registerWrite(function(writeKey, writeValue, option) {
			expect(this).toBe(storage);
			expect(writeKey).toBe(key);
			expect(writeValue).toBe(value);
			done();
		});
		storage.write(key, value, option);
	});
});
