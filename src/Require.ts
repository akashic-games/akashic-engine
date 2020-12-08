export interface Require {
	(path: string): any;
	resolve(path: string): string;
}
