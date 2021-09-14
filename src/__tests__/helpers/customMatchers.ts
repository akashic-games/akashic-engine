declare global {
	namespace jest {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		interface Matchers<R, T> {
			toHaveProperty(...properties: string[]): R;
			toHaveUndefinedValue(...properties: string[]): R;
			toThrowError(func: () => void): R;
			toBeNear(expected: number[], threshold: number): R;
			toBeApproximation(expected: number, threshold: number): R;
		}
	}
}

export const customMatchers = {
	toHaveProperty: (received: any, ...properties: string[]): jest.CustomMatcherResult => {
		let message: string = "";
		const pass =
			properties.filter(v => {
				if (!(v in received)) message = "does not contains " + v;
				return v in received;
			}).length === properties.length;
		return {
			pass,
			message: () => message
		};
	},
	toHaveUndefinedValue: (received: any, ...properties: string[]): jest.CustomMatcherResult => {
		let message: string = "";
		const pass =
			properties
				.filter(v => {
					if (!(v in received)) message = "does not contains " + v;
					return v in received;
				})
				.filter(v => {
					if (received[v] !== undefined) message = v + " is defined";
					return received[v] === undefined;
				}).length === properties.length;
		return {
			pass,
			message: () => message
		};
	},
	toThrowError: (received: any, expected: string): jest.CustomMatcherResult => {
		const result = { pass: false, message: () => "" };
		let threw = false;
		let thrown!: Error;

		if (typeof received !== "function") {
			throw new Error("Actual is not a Function");
		}

		try {
			received();
		} catch (e) {
			threw = true;
			thrown = e;
		}

		if (!threw) {
			result.message = () => "Expected function to throw an exception.";
			return result;
		}
		if (!(thrown instanceof Error)) {
			result.message = () => "Expected function to throw an Error";
			return result;
		}

		if (expected == null) {
			result.pass = true;
			result.message = () => "Expected function not to throw, but it threw " + ".";
			return result;
		}

		if (thrown.name === expected) {
			result.pass = true;
		}

		return result;
	},
	toBeNear: (received: number[], expected: number[], threshold: number): jest.CustomMatcherResult => {
		return {
			pass: near(received, expected, threshold),
			message: () => ""
		};
	},
	toBeApproximation: (received: number, expected: number, threshold: number): jest.CustomMatcherResult => {
		return {
			pass: isApproximate(received, expected, threshold),
			message: () => `The distance between actual(${received}) and expected(${expected}) is not less than ${Math.pow(10, -threshold)}`
		};
	}
};

function near(received: number[], expected: number[], threshold: number): boolean {
	return expected.every((v, i) => isApproximate(received[i], v, threshold));
}

function isApproximate(received: number, expected: number, threshold: number): boolean {
	return Math.abs(expected - received) <= Math.pow(10, -threshold);
}
