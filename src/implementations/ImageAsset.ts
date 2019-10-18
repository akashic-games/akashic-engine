import { ImageAssetHint } from "../interfaces/AssetConfiguration";
import { ImageAssetLike } from "../interfaces/ImageAssetLike";
import { SurfaceLike } from "../interfaces/SurfaceLike";
import { Asset } from "./Asset";

/**
 * 画像リソースを表すクラス。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
 * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
 * Scene#assets、またはGame#assetsによって取得して利用する。
 *
 * width, heightでメタデータとして画像の大きさをとることは出来るが、
 * ゲーム開発者はそれ以外の情報を本クラスから直接は取得せず、Sprite等に本リソースを指定して利用する。
 */
export abstract class ImageAsset extends Asset implements ImageAssetLike {
	type: "image" = "image";
	width: number;
	height: number;
	hint: ImageAssetHint;

	constructor(id: string, assetPath: string, width: number, height: number) {
		super(id, assetPath);
		this.width = width;
		this.height = height;
	}

	abstract asSurface(): SurfaceLike;

	initialize(hint: ImageAssetHint): void {
		this.hint = hint;
	}
}
