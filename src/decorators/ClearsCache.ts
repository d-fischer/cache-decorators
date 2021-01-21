import type { CacheableType } from './Cacheable';

export function ClearsCache<T>(cacheName: keyof T, numberOfArguments?: number) {
	return function (target: any, propName: string, descriptor: PropertyDescriptor): PropertyDescriptor {
		const origFn = descriptor.value;

		descriptor.value = async function (this: CacheableType<unknown>, ...params: any[]) {
			const result = await origFn.apply(this, params);
			const args = numberOfArguments === undefined ? params.slice() : params.slice(0, numberOfArguments);
			this.removeFromCache([cacheName, ...args], true);
			return result;
		};

		return descriptor;
	};
}
