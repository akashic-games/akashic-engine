
機能追加
 * `g.TimeStampEvent` を追加

### ゲーム開発者への影

 * `g.TimeStampEvent` を追加
    * `g.Game#raiseTick()` でティックを生成するなどの際、生成時の時刻情報を保持するイベントとして利用できます。
    * 将来の拡張のために予約される機能です。現在のバージョンでは用途はありません。
 * `g.Game#saveSnapshot()` の引数に `timestamp: number` を追加
    * `g.TimeStampEvent` を生成するゲームにおいて、スナップショットを保存する場合、
      他の `g.TimeStampEvent` と同じ基準の時刻情報を渡す `timestamp` として `saveSnapshot()` に与える必要があります。
    * 将来の拡張のために予約される機能です。現在のバージョンでは用途はありません。

### エンジン開発者への影響

 * `g.TimeStampEvent` を追加
    * 対応する場合、 `g.TimeStampEvent` の時刻情報を取得し、ティックの消化を遅延する必要があります。

