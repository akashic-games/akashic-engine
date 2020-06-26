import { Surface } from "@akashic/pdi-types";

/**
 * `Surface` に対して様々な表現によって書き込む事が出来ることを表すインターフェース。
 *
 * `Surface` を受け取る一部のクラスは、同時に `SurfaceEffector` を受け取り、
 * `Surface` の描画方法をカスタマイズできるようになっている。(現在は `Pane` のみ)
 * ゲーム開発者は、そのようなクラスに対して `SurfaceEffector` のインスタンスを生成して渡すことができる。
 * 通常、 `SurfaceEffector` の個別のメソッドをゲーム開発者が呼び出す必要はない。
 *
 * @deprecated 非推奨である。将来的に削除される。
 */
export interface SurfaceEffector {
	/**
	 * 指定の大きさに拡大・縮小した描画結果の `Surface` を生成して返す。
	 *
	 * 通常、このメソッドはエンジンによって暗黙に呼び出される。ゲーム開発者が明示的に呼び出す必要はない。
	 * @param srcSurface 拡大・縮小して描画する `Surface`
	 * @param width 描画する幅
	 * @param height 描画する高さ
	 */
	render(srcSurface: Surface, width: number, height: number): Surface;
}
