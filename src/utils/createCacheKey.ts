function createSingleCacheKey(param: any) {
	// noinspection FallThroughInSwitchStatementJS
	switch (typeof param) {
		case 'undefined': {
			return '';
		}
		case 'object': {
			if (param === null) {
				return '';
			}
			if ('cacheKey' in param) {
				return param.cacheKey;
			}
			const objKey = JSON.stringify(param);
			if (objKey !== '{}') {
				return objKey;
			}
		}
		// fallthrough
		default: {
			return param.toString();
		}
	}
}

export function createCacheKey(propName: string, params: any[], prefix?: boolean): string {
	return [propName, ...params.map(createSingleCacheKey)].join('/') + (prefix ? '/' : '');
}
