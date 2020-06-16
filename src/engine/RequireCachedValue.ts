import { RequireCacheable } from "./RequireCacheable";

export class RequireCachedValue implements RequireCacheable {
	/**
	 * @private
	 */
	_value: any;

	constructor(value: any) {
		this._value = value;
	}

	/**
	 * @private
	 */
	_cachedValue(): any {
		return this._value;
	}
}
