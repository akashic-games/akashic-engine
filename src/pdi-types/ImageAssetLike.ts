import { AssetLike } from "./AssetLike";
import { ImageAssetHint } from "./ImageAssetHint";
import { SurfaceLike } from "./SurfaceLike";

/**
 * 画像リソースを表すインターフェース。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
 * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
 * Scene#assets、またはGame#assetsによって取得して利用する。
 *
 * width, heightでメタデータとして画像の大きさをとることは出来るが、
 * ゲーム開発者はそれ以外の情報を本クラスから直接は取得せず、Sprite等に本リソースを指定して利用する。
 */
export interface ImageAssetLike extends AssetLike {
	type: "image";
	width: number;
	height: number;
	hint: ImageAssetHint | undefined;

	asSurface(): SurfaceLike;
	initialize(hint: ImageAssetHint | undefined): void;
}
