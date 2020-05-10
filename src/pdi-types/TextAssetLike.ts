import { AssetLike } from "./AssetLike";

/**
 * 文字列リソースを表すインターフェース。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
 * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
 * Scene#assets、またはGame#assetsによって取得して利用する。
 *
 * TextAsset#dataによって、本リソースが保持する文字列を取得することが出来る。
 */
export interface TextAssetLike extends AssetLike {
	type: "text";
	data: string;
}
