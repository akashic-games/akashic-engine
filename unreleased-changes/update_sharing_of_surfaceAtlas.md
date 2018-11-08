
その他変更
 * DynamicFontのメモリ節減対応
    * `g.DynamicFont` で使用する `g.SurfaceAtlas` の `width`, `height` の初期値を2048から512へ変更。
    * `g.DynamicFont` で使用する `g.SurfaceAtlas` を共有化する機能を追加。
