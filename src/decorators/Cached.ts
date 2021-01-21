import type { CacheableType } from './Cacheable';
import { createCacheKey } from '../utils/createCacheKey';

export function Cached(timeInSeconds: number = Infinity, cacheFailures: boolean = false) {
	return function (target: any, propName: string, descriptor: PropertyDescriptor): PropertyDescriptor {
		const origFn = descriptor.value;

		descriptor.value = async function (this: CacheableType<unknown>, ...params: any[]) {
			const cacheKey = createCacheKey(propName, params);
			const cachedValue = this.getFromCache(cacheKey);

			if (cachedValue) {
				return cachedValue;
			}

			const result = await origFn.apply(this, params);
			if (result != null || cacheFailures) {
				this.setCache(cacheKey, result, timeInSeconds);
			}
			return result;
		};

		return descriptor;
	};
}
