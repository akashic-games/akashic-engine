import { AssetLike } from "./AssetLike";
import { AudioAssetHint } from "./AudioAssetHint";
import { AudioPlayerLike } from "./AudioPlayerLike";
import { AudioSystemLike } from "./AudioSystemLike";

/**
 * 音リソースを表すインターフェース。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
 * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
 * Scene#assets、またはGame#assetsによって取得して利用する。
 *
 * AudioAsset#playを呼び出す事で、その音を再生することが出来る。
 */
export interface AudioAssetLike extends AssetLike {
	type: "audio";
	data: any;
	duration: number;
	loop: boolean;
	hint: AudioAssetHint;
	_system: AudioSystemLike;

	play(): AudioPlayerLike;

	stop(): void;

	inUse(): boolean;
}
