namespace g {
	export interface RequireCacheable {
		/**
		 * @private
		 */
		_cachedValue: () => any;
	}
}
