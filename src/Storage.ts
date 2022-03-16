import type { StorageLoadError } from "@akashic/pdi-types";

// TODO: (GAMEDEV-1549) コメント整理
/**
 * 操作対象とするストレージのリージョンを表す。
 */
// サーバ仕様に則し、値を指定している。
export enum StorageRegion {
	/**
	 * slotsを表す。
	 */
	Slots = 1,
	/**
	 * scoresを表す。
	 */
	Scores = 2,
	/**
	 * countsを表す。
	 */
	Counts = 3,
	/**
	 * valuesを表す。
	 */
	Values = 4
}

/**
 * 一括取得を行う場合のソート順。
 */
export enum StorageOrder {
	/**
	 * 昇順。
	 */
	Asc,
	/**
	 * 降順。
	 */
	Desc
}

/**
 * 条件を表す。
 */
// サーバ仕様に則し、値を指定している。
export enum StorageCondition {
	/**
	 * 等価を表す（==）。
	 */
	Equal = 1,
	/**
	 * 「より大きい」を表す（>）。
	 */
	GreaterThan = 2,
	/**
	 * 「より小さい」を表す（<）。
	 */
	LessThan = 3
}

/**
 * Countsリージョンへの書き込み操作種別を表す。
 */
// サーバ仕様に則し、値を指定している。
export enum StorageCountsOperation {
	/**
	 * インクリメント操作を実行する。
	 */
	Incr = 1,
	/**
	 * デクリメント操作を実行する。
	 */
	Decr = 2
}

/**
 * `StorageWriter#write()` に指定する書き込みオプション。
 */
export interface StorageWriteOption {
	/**
	 * 比較条件を表す。
	 */
	condition?: StorageCondition;
	/**
	 * 現在保存されている値と比較する値。
	 */
	comparisonValue?: string | number;
	/**
	 * 操作種別。
	 */
	operation?: StorageCountsOperation;
}

/**
 * `StorageReadKey` に指定する取得オプション。
 */
export interface StorageReadOption {
	/**
	 * リージョンキーでソートして一括取得を行う場合のソート順。
	 */
	keyOrder?: StorageOrder;
	/**
	 * 値でソートして一括取得を行う場合のソート順。
	 */
	valueOrder?: StorageOrder;
}

/**
 * ストレージキーを表す。
 */
export interface StorageKey {
	/**
	 * リージョン。
	 */
	region: StorageRegion;
	/**
	 * リージョンキー。
	 */
	regionKey: string;
	/**
	 * ゲームID。
	 */
	gameId?: string;
	/**
	 * ユーザID。
	 */
	userId?: string;
}

/**
 * 値の読み込み時に指定するキーを表す。
 */
export interface StorageReadKey extends StorageKey {
	/**
	 * 取得オプション。
	 */
	option?: StorageReadOption;
}

/**
 * ストレージキーに対応する値を表す。
 */
export interface StorageValue {
	/**
	 * 取得結果を表すデータ。
	 */
	data: number | string;
	/**
	 * データタグ。
	 */
	tag?: string;
	/**
	 * この `StorageValue` に対応する `StorageKey`。
	 */
	storageKey?: StorageKey;
}

/**
 * `StorageLoader` の読み込みまたは読み込み失敗を受け取るハンドラのインターフェース定義。
 * 通常、このインターフェースをゲーム開発者が利用する必要はない。
 */
export interface StorageLoaderHandler {
	/**
	 * 読み込失敗の通知を受ける関数。
	 * @private
	 */
	_onStorageLoadError(error: StorageLoadError): void;
	/**
	 * 読み込完了の通知を受ける関数。
	 * @private
	 */
	_onStorageLoaded(): void;
}

/**
 * ストレージの値を保持するクラス。
 * ゲーム開発者がこのクラスのインスタンスを直接生成することはない。
 */
export class StorageValueStore {
	/**
	 * @private
	 */
	_keys: StorageKey[];

	/**
	 * @private
	 */
	_values: StorageValue[][] | undefined;

	constructor(keys: StorageKey[], values?: StorageValue[][]) {
		this._keys = keys;
		this._values = values;
	}

	/**
	 * 値の配列を `StorageKey` またはインデックスから取得する。
	 * 通常、インデックスは `Scene` のコンストラクタに指定した `storageKeys` のインデックスに対応する。
	 * @param keyOrIndex `StorageKey` 又はインデックス
	 */
	get(keyOrIndex: StorageReadKey | number): StorageValue[] | undefined {
		if (this._values === undefined) {
			return [];
		}
		if (typeof keyOrIndex === "number") {
			return this._values[keyOrIndex];
		} else {
			const index = this._keys.indexOf(keyOrIndex);
			if (index !== -1) {
				return this._values[index];
			}
			for (let i = 0; i < this._keys.length; ++i) {
				const target = this._keys[i];
				if (
					target.region === keyOrIndex.region &&
					target.regionKey === keyOrIndex.regionKey &&
					target.userId === keyOrIndex.userId &&
					target.gameId === keyOrIndex.gameId
				) {
					return this._values[i];
				}
			}
		}
		return [];
	}

	/**
	 * 値を `StorageKey` またはインデックスから取得する。
	 * 対応する値が複数ある場合は、先頭の値を取得する。
	 * 通常、インデックスは `Scene` のコンストラクタに指定した `storageKeys` のインデックスに対応する。
	 * @param keyOrIndex `StorageKey` 又はインデックス
	 */
	getOne(keyOrIndex: StorageReadKey | number): StorageValue | undefined {
		const values = this.get(keyOrIndex);
		if (!values) return undefined;

		return values[0];
	}
}

export type StorageValueStoreSerialization = any;

/**
 * ストレージの値をロードするクラス。
 * ゲーム開発者がこのクラスのインスタンスを直接生成することはなく、
 * 本クラスの機能を利用することもない。
 */
export class StorageLoader {
	/**
	 * @private
	 */
	_loaded: boolean;

	/**
	 * @private
	 */
	_storage: Storage;

	/**
	 * @private
	 */
	_valueStore: StorageValueStore;

	/**
	 * @private
	 */
	_handler: StorageLoaderHandler;

	/**
	 * @private
	 */
	_valueStoreSerialization: StorageValueStoreSerialization;

	constructor(storage: Storage, keys: StorageReadKey[], serialization?: StorageValueStoreSerialization) {
		this._loaded = false;
		this._storage = storage;
		this._valueStore = new StorageValueStore(keys);
		this._handler = undefined!;
		this._valueStoreSerialization = serialization;
	}

	/**
	 * @private
	 */
	_load(handler: StorageLoaderHandler): void {
		this._handler = handler;
		if (this._storage._load) {
			this._storage._load.call(this._storage, this._valueStore._keys, this, this._valueStoreSerialization);
		}
	}

	/**
	 * @private
	 */
	// 値の取得が完了したタイミングで呼び出される。
	// `values` は `this._valueStore._keys` に対応する値を表す `StorageValue` の配列。
	// 順番は `this._valueStore._keys` と同じでなければならない。
	_onLoaded(values: StorageValue[][], serialization?: StorageValueStoreSerialization): void {
		this._valueStore._values = values;
		this._loaded = true;
		if (serialization) this._valueStoreSerialization = serialization;
		if (this._handler) this._handler._onStorageLoaded();
	}

	/**
	 * @private
	 */
	_onError(error: StorageLoadError): void {
		if (this._handler) this._handler._onStorageLoadError(error);
	}
}

/**
 * ストレージ。
 * ゲーム開発者がこのクラスのインスタンスを直接生成することはない。
 */
export class Storage {
	/**
	 * @private
	 */
	_write: ((key: StorageKey, value: StorageValue, option?: StorageWriteOption) => void) | undefined;

	/**
	 * @private
	 */
	_load: ((keys: StorageReadKey[], load: StorageLoader, serialization?: StorageValueStoreSerialization) => void) | undefined;

	/**
	 * @private
	 */
	_requestedKeysForJoinPlayer: StorageReadKey[] | undefined;

	/**
	 * ストレージに値を書き込む。
	 * @param key ストレージキーを表す `StorageKey`
	 * @param value 値を表す `StorageValue`
	 * @param option 書き込みオプション
	 */
	write(key: StorageKey, value: StorageValue, option?: StorageWriteOption): void {
		if (this._write) {
			this._write(key, value, option);
		}
	}

	/**
	 * 参加してくるプレイヤーの値をストレージから取得することを要求する。
	 * 取得した値は `JoinEvent#storageValues` に格納される。
	 * @param keys ストレージキーを表す `StorageReadKey` の配列。`StorageReadKey#userId` は無視される。
	 */
	requestValuesForJoinPlayer(keys: StorageReadKey[]): void {
		this._requestedKeysForJoinPlayer = keys;
	}

	/**
	 * @private
	 */
	_createLoader(keys: StorageReadKey[], serialization?: StorageValueStoreSerialization): StorageLoader {
		return new StorageLoader(this, keys, serialization);
	}

	/**
	 * @private
	 */
	// ストレージに値の書き込むを行う関数を登録する。
	// 登録した関数内の `this` は `Storage` を指す。
	_registerWrite(write: (key: StorageKey, value: StorageValue, option?: StorageWriteOption) => void): void {
		this._write = write;
	}

	/**
	 * @private
	 */
	// ストレージから値の読み込みを行う関数を登録する。
	// 登録した関数内の `this` は `Storage` を指す。
	// 読み込み完了した場合は、登録した関数内で `loader._onLoaded(values)` を呼ばなければならない。
	// エラーが発生した場合は、登録した関数内で `loader._onError(error)` を呼ばなければならない。
	_registerLoad(load: (keys: StorageKey[], loader: StorageLoader, serialization?: StorageValueStoreSerialization) => void): void {
		this._load = load;
	}
}
