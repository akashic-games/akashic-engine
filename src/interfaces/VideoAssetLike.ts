import { AssetLike } from "./AssetLike";
import { SurfaceLike } from "./SurfaceLike";
import { VideoPlayerLike } from "./VideoPlayerLike";

/**
 * 動画リソースを表すインターフェース。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
 * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
 * Scene#assets、またはGame#assetsによって取得して利用する。
 */
export interface VideoAssetLike extends AssetLike {
	type: "video";
	width: number;
	height: number;

	/**
	 * 動画の本来の幅。
	 *
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更してはならない。
	 */
	realWidth: number;

	/**
	 * 動画の本来の高さ。
	 *
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更してはならない。
	 */
	realHeight: number;

	asSurface(): SurfaceLike;

	play(_loop?: boolean): VideoPlayerLike;

	stop(): void;

	getPlayer(): VideoPlayerLike;

	destroy(): void;
}
