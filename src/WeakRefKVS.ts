interface WeakRefLike<T extends object> {
	deref(): T | undefined;
}

/**
 * @private
 */
class PseudoWeakRef<T extends object> {
	private _target: T;

	constructor(target: T) {
		this._target = target;
	}

	deref(): T | undefined {
		return this._target;
	}
}

/**
 * 対象の値を弱参照として保持する Key-Value 型データストア。
 * 通常、ゲーム開発者はこのクラスを利用する必要はない。
 */
export class WeakRefKVS<T extends object> {
	/**
	 * @ignore
	 */
	_weakRefClass: any = typeof WeakRef !== "undefined" ? WeakRef<T> : PseudoWeakRef<T>;

	/**
	 * @ignore
	 */
	_refMap: { [key: string]: WeakRefLike<T> } = Object.create(null);

	set(key: string | number, value: T): void {
		if (this._refMap[key]) {
			this.delete(key);
		}

		this._refMap[key] = new this._weakRefClass(value);
	}

	get(key: string | number): T | undefined {
		const ref = this._refMap[key];

		if (!ref) {
			return undefined;
		}

		return ref.deref();
	}

	has(key: string | number): boolean {
		return key in this._refMap;
	}

	delete(key: string | number): void {
		delete this._refMap[key];
	}

	keys(): string[] {
		return Object.keys(this._refMap);
	}

	clear(): void {
		this._refMap = Object.create(null);
	}

	/**
	 * 参照されなくなった target のキーをマップから削除する。
	 */
	clean(): void {
		for (const [key, ref] of Object.entries(this._refMap)) {
			if (ref.deref() === undefined) this.delete(key);
		}
	}
}
