/**
 * オフセット特性インターフェース。
 */
export interface CommonOffset {
	x: number;
	y: number;
}

/**
 * サイズ特性インターフェース。
 */
export interface CommonSize {
	width: number;
	height: number;
}

/**
 * 汎用領域インターフェース。
 */
export interface CommonArea extends CommonOffset, CommonSize {}

/**
 * 汎用矩形インターフェース。
 */
export interface CommonRect {
	left: number;
	right: number;
	top: number;
	bottom: number;
}
