
その他変更
 * `g.Game#random` を配列でないように変更

### ゲーム開発者への影響

 * `g.Game#random` を配列でないように変更
   * 型を `g.RandomGenerator[]` から `g.RandomGenerator` に変更しました。
   * 従来 `g.game.random[0]` で参照できた乱数生成器は、 `g.game.random` に置かれるようになりました。
     (`random` は歴史的経緯から配列として定義されていましたが、第0要素以外は利用されていませんでした。)

### 非推奨機能の変更

 * `g.game.random[0]` を非推奨に
    * 利用している場合、 `g.game.random` を使うよう変更してください。

