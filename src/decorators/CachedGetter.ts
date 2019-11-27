import createCacheKey from '../utils/createCacheKey';

export default function CachedGetter(timeInSeconds: number = Infinity) {
	return function(target: any, propName: string, descriptor: PropertyDescriptor) {
		if (descriptor.get) {
			const origFn = descriptor.get;

			descriptor.get = function(this: any, ...params: any[]) {
				const cacheKey = createCacheKey(propName, params);
				const cachedValue = this.getFromCache(cacheKey);

				if (cachedValue) {
					return cachedValue;
				}

				const result = origFn.apply(this, params);
				this.setCache(cacheKey, result, timeInSeconds);
				return result;
			};
		}

		return descriptor;
	};
}
