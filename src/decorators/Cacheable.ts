import { Constructor } from '@d-fischer/shared-utils';
import createCacheKey from '../utils/createCacheKey';
import CacheEntry from '../types/CacheEntry';

export default function Cacheable<T extends Constructor>(cls: T) {
	return class extends cls {
		cache: Map<string, CacheEntry> = new Map();

		getFromCache(cacheKey: string): {} | undefined {
			this._cleanCache();
			if (this.cache.has(cacheKey)) {
				const entry = this.cache.get(cacheKey);

				if (entry) {
					return entry.value;
				}
			}

			return undefined;
		}

		setCache(cacheKey: string, value: {}, timeInSeconds: number) {
			this.cache.set(cacheKey, {
				value,
				expires: Date.now() + timeInSeconds * 1000
			});
		}

		removeFromCache(cacheKey: string | string[], prefix?: boolean) {
			let internalCacheKey: string;
			if (typeof cacheKey === 'string') {
				internalCacheKey = cacheKey;
				if (!internalCacheKey.endsWith('/')) {
					internalCacheKey += '/';
				}
			} else {
				const propName = cacheKey.shift()!;
				internalCacheKey = createCacheKey(propName, cacheKey, prefix);
			}
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

		_cleanCache() {
			const now = Date.now();
			this.cache.forEach((val, key) => {
				if (val.expires < now) {
					this.cache.delete(key);
				}
			});
		}
	};
}
