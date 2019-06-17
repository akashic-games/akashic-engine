import { Asset } from "./Asset";
import { ImageAsset } from "./ImageAsset";
import { Surface } from "./Surface";
import { ExceptionFactory } from "./errors";

export class SurfaceUtil {
	/**
	 * 引数 `src` が `undefined` または `Surface` でそのまま返す。
	 * そうでなくかつ `ImageAsset` であれば `Surface` に変換して返す。
	 *
	 * @param src
	 */
	static asSurface(src: Asset|Surface): Surface {
		// Note: TypeScriptのtype guardを活用するため、あえて1つのifで1つの型しか判定していない
		if (!src)
			return <Surface>src;
		if (src instanceof Surface)
			return src;
		if (src instanceof ImageAsset)
			return src.asSurface();
		throw ExceptionFactory.createTypeMismatchError("Surface#asSurface", "ImageAsset|Surface", src);
	}
}
