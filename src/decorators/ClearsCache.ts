export default function ClearsCache<T>(cacheName: keyof T, numberOfArguments?: number) {
	return function(target: any, propName: string, descriptor: PropertyDescriptor) {
		const origFn = descriptor.value;

		descriptor.value = async function(this: any, ...params: any[]) {
			const result = await origFn.apply(this, params);
			const args = numberOfArguments === undefined ? params.slice() : params.slice(0, numberOfArguments);
			this.removeFromCache([cacheName, ...args], true);
			return result;
		};

		return descriptor;
	};
}
