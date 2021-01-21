import type { Constructor } from '@d-fischer/shared-utils';
import { createCacheKey } from '../utils/createCacheKey';
import type { CacheEntry } from '../types/CacheEntry';

export type CacheableType<T> = T & {
	getFromCache: (key: string) => unknown;
	setCache: (key: string, value: unknown, timeInSeconds: number) => void;
	removeFromCache: (key: string | string[], prefix?: boolean) => void;
};

export function Cacheable<T>(cls: Constructor<T>): Constructor<CacheableType<T>> {
	return (class extends (cls as Constructor<any>) {
		cache = new Map<string, CacheEntry>();

		getFromCache(cacheKey: string): unknown | undefined {
			this._cleanCache();
			if (this.cache.has(cacheKey)) {
				const entry = this.cache.get(cacheKey);

				if (entry) {
					return entry.value;
				}
			}

			return undefined;
		}

		setCache(cacheKey: string, value: unknown, timeInSeconds: number) {
			this.cache.set(cacheKey, {
				value,
				expires: Date.now() + timeInSeconds * 1000
			});
		}

		removeFromCache(cacheKey: string | string[], prefix?: boolean) {
			const internalCacheKey = this._getInternalCacheKey(cacheKey, prefix);
			if (prefix) {
				this.cache.forEach((val, key) => {
					if (key.startsWith(internalCacheKey)) {
						this.cache.delete(key);
					}
				});
			} else {
				this.cache.delete(internalCacheKey);
			}
		}

		private _cleanCache() {
			const now = Date.now();
			this.cache.forEach((val, key) => {
				if (val.expires < now) {
					this.cache.delete(key);
				}
			});
		}

		private _getInternalCacheKey(cacheKey: string | string[], prefix: boolean | undefined): string {
			if (typeof cacheKey === 'string') {
				let internalCacheKey = cacheKey;
				if (!internalCacheKey.endsWith('/')) {
					internalCacheKey += '/';
				}
				return internalCacheKey;
			} else {
				const propName = cacheKey.shift()!;
				return createCacheKey(propName, cacheKey, prefix);
			}
		}
	} as unknown) as Constructor<CacheableType<T>>;
}
