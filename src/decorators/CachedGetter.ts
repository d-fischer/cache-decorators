import { createCacheKey } from '../utils/createCacheKey';
import type { CacheableType } from './Cacheable';

export function CachedGetter(timeInSeconds: number = Infinity) {
	return function (target: any, propName: string, descriptor: PropertyDescriptor): PropertyDescriptor {
		if (descriptor.get) {
			// eslint-disable-next-line @typescript-eslint/unbound-method
			const origFn = descriptor.get;

			descriptor.get = function (this: CacheableType<unknown>, ...params: any[]) {
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
