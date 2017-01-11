namespace g {
	export class RequireCachedValue implements RequireCacheable {
		_value: any;

		constructor(value: any) {
			this._value = value;
		}

		_cachedValue(): any {
			return this._value;
		}
	}
}
