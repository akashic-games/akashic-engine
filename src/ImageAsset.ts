import { Asset } from "./Asset";
import { Surface } from "./Surface";
import { ImageAssetHint } from "./GameConfiguration";
import { ExceptionFactory } from "./errors";

/**
 * 画像リソースを表すクラス。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
 * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
 * Scene#assets、またはGame#assetsによって取得して利用する。
 *
 * width, heightでメタデータとして画像の大きさをとることは出来るが、
 * ゲーム開発者はそれ以外の情報を本クラスから直接は取得せず、Sprite等に本リソースを指定して利用する。
 */
export abstract class ImageAsset extends Asset {
	width: number;
	height: number;
	hint: ImageAssetHint;

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

	constructor(id: string, assetPath: string, width: number, height: number) {
		super(id, assetPath);
		this.width = width;
		this.height = height;
	}

	abstract asSurface(): Surface;

	initialize(hint: ImageAssetHint): void {
		this.hint = hint;
	}
}
