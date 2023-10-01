import type { ConstructedType, Constructor } from '@d-fischer/shared-utils';
import { createCacheKey } from '../utils/createCacheKey';
import type { CacheEntry } from '../types/CacheEntry';

export type CacheableType<T> = T & {
	getFromCache: (key: string) => unknown;
	setCache: (key: string, value: unknown, timeInSeconds: number) => void;
	removeFromCache: (key: string | string[], prefix?: boolean) => void;
};

const cacheSymbol = Symbol('cache');

export function Cacheable<T extends Constructor<any>>(cls: T): Constructor<CacheableType<ConstructedType<T>>> & T {
	return class extends (cls as Constructor<any>) {
		private readonly [cacheSymbol] = new Map<string, CacheEntry>();

		getFromCache(cacheKey: string): unknown | undefined {
			this._cleanCache();
			if (this[cacheSymbol].has(cacheKey)) {
				const entry = this[cacheSymbol].get(cacheKey);

				if (entry) {
					return entry.value;
				}
			}

			return undefined;
		}

		setCache(cacheKey: string, value: unknown, timeInSeconds: number) {
			this[cacheSymbol].set(cacheKey, {
				value,
				expires: Date.now() + timeInSeconds * 1000
			});
		}

		removeFromCache(cacheKey: string | string[], prefix?: boolean) {
			const internalCacheKey = this._getInternalCacheKey(cacheKey, prefix);
			if (prefix) {
				this[cacheSymbol].forEach((val, key) => {
					if (key.startsWith(internalCacheKey)) {
						this[cacheSymbol].delete(key);
					}
				});
			} else {
				this[cacheSymbol].delete(internalCacheKey);
			}
		}

		private _cleanCache() {
			const now = Date.now();
			this[cacheSymbol].forEach((val, key) => {
				if (val.expires < now) {
					this[cacheSymbol].delete(key);
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
	} as unknown as Constructor<CacheableType<ConstructedType<T>>> & T;
}
