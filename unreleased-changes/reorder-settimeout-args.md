
その他変更
 * `g.Scene#setTimeout()`, `setInterval()` の引数順を変更。旧仕様を非推奨に。

### ゲーム開発者への影響

 * `g.Scene#setTimeout()`, `g.Scene#setInterval()` の引数順を変更。
    * DOM Level 0(Webブラウザの `window.setTimeout()` など)により近くなるよう、
      引数を `(handler: () => void, milliseconds: number, owner?: any)` の順で与えるよう変更しました。
    * なおDOMとの完全な互換性は意図していません。次の点で異なります。
       * 第三引数以降に引数を与えることはできません(代わりに `this` が指定可能)
       * 関数の代わりに文字列を与えることはできません
    * 従来は `(milliseconds, handler)` または `(millicseconds, owner, handler)` の順でした。

### 非推奨機能の変更

 * `g.Scene#setTimeout()`, `g.Scene#setInterval()` のうち、第一引数が `milliseconds: number` であるものを非推奨に。
    * 利用中のユーザは第一引数に関数を指定するものに移行してください。

