その他変更
 * `g.Logger` の各ログ出力メソッドを非推奨に

### ゲーム開発者への影響

 * `g.Logger` の各ログ出力メソッドを非推奨に
    * `g.Logger#error()` `g.Logger#warn()` `g.Logger#info()` `g.Logger#debug()` を利用している場合、 `console.log` に置き換えるか、 `Game` に紐づいた `Logger#logging` に `console.log` を出力する関数を登録してください。 

### 非推奨機能の変更

 * `g.Logger` の各ログ出力メソッドを非推奨に

### エンジン開発者への影響

 * `g.Logger` の各ログ出力メソッドを非推奨に
    * `game.logger.logging` にハンドラを登録する必要はありません。
