export default interface CacheEntry<T = any> {
	value: T;
	expires: number;
}
