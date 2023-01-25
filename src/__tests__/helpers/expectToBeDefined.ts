export function expectToBeDefined<T>(arg: T): asserts arg is NonNullable<T> {
	expect(arg).toBeDefined();
}
