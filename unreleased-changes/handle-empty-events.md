
機能追加
 * `g.Game#addEventFilter() に省略可能な引数 `handleEmpty` を追加

### エンジン開発者への影響

 * `g.Game#addEventFilter() に省略可能な引数 `handleEmpty` を追加
    * 実装はこの値が真である場合、イベントがない場合でも定期的にそのイベントフィルタを呼び出す必要があります。

