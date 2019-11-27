import createCacheKey from '../utils/createCacheKey';

export default function Cached(timeInSeconds: number = Infinity, cacheFailures: boolean = false) {
	return function(target: any, propName: string, descriptor: PropertyDescriptor) {
		const origFn = descriptor.value;

		descriptor.value = async function(this: any, ...params: any[]) {
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
