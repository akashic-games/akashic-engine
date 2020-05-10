/**
 * テキストの計測情報。
 */
export interface TextMetrics {
	width: number;
	actualBoundingBoxLeft: number;
	actualBoundingBoxRight: number;
}

/**
 * テキストの計測情報。
 * @deprecated 非推奨である。将来的に削除される。代わりに `TextMetrics` を利用すること。
 */
export interface TextMetrix extends TextMetrics {}
