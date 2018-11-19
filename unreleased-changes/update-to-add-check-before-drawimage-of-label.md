
その他変更
 * Labelの描画タイミングで、`glyph.surface` が存在しない場合の対応
   - `drawImage` 前に、`glyph.isSurfaceValid` にてチェックを行い、破棄されていた場合、改めてglyphの作成を行うよう修正。


