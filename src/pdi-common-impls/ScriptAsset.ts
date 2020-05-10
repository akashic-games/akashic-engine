import { ScriptAssetLike } from "../pdi-types/ScriptAssetLike";
import { ScriptAssetRuntimeValue } from "../pdi-types/ScriptAssetRuntimeValue";
import { Asset } from "./Asset";

/**
 * スクリプトリソースを表すクラス。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
 * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
 * Scene#assets、またはGame#assetsによって取得して利用する。
 *
 * ScriptAsset#executeによって、本リソースが表すスクリプトを実行し、その結果を受け取る事が出来る。
 * requireによる参照とは異なり、executeはキャッシュされないため、何度でも呼び出し違う結果を受け取ることが出来る。
 */
export abstract class ScriptAsset extends Asset implements ScriptAssetLike {
	type: "script" = "script";
	script: string;

	abstract execute(execEnv: ScriptAssetRuntimeValue): any;

	destroy(): void {
		this.script = undefined;
		super.destroy();
	}
}
