import { TextAssetLike } from "../interfaces/TextAssetLike";
import { Asset } from "./Asset";

/**
 * 文字列リソースを表すクラス。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
 * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
 * Scene#assets、またはGame#assetsによって取得して利用する。
 *
 * TextAsset#dataによって、本リソースが保持する文字列を取得することが出来る。
 */
export abstract class TextAsset extends Asset implements TextAssetLike {
	type: "text" = "text";
	data: string;

	constructor(id: string, assetPath: string) {
		super(id, assetPath);
		this.data = undefined;
	}

	destroy(): void {
		this.data = undefined;
		super.destroy();
	}
}
