import { Destroyable } from "./Destroyable";
import { GlyphLike } from "./GlyphLike";
import { ResourceFactoryLike } from "./ResourceFactoryLike";
import { SurfaceAtlasSlotLike } from "./SurfaceAtlasSlotLike";
import { SurfaceLike } from "./SurfaceLike";

/**
 * サーフェスアトラス。
 *
 * 与えられたサーフェスの指定された領域をコピーし一枚のサーフェスにまとめる。
 *
 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
 */
export interface SurfaceAtlasLike extends Destroyable {
	/**
	 * @private
	 */
	_surface: SurfaceLike;

	/**
	 * @private
	 */
	_accessScore: number;

	/**
	 * サーフェスの追加。
	 *
	 * @param glyph グリフのサーフェスが持つ情報をSurfaceAtlasへ配置
	 */
	addSurface(glyph: GlyphLike): SurfaceAtlasSlotLike;

	/**
	 * _surfaceを複製する。
	 *
	 * 複製されたSurfaceは文字を格納するのに必要な最低限のサイズになる。
	 */
	duplicateSurface(resourceFactory: ResourceFactoryLike): SurfaceLike;
}
