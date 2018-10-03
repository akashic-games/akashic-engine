
機能追加
 * `g.Game#isLastTickLocal` を追加
 * `g.Game#lastOmittedLocalTickCount` を追加

### ゲーム開発者への影響

 * `g.Game#isLastTickLocal` を追加
    * この変数は、直近の `update` がローカルティックによるものであったか否かを保持します。
    * この変数は、主にローカルティック補間シーン(生成時に `local: g.LocalTickMode.InterpolateLocal` を指定したシーン)での最適化のためのものです。
      ローカルティック補間シーンを利用していない場合、参照する必要はありません。
 * `g.Game#lastOmittedLocalTickCount` を追加
    * この変数は、直近の `update` の通知時(の直前)に(タイムスタンプ待ちを省略する動作などの影響でエンジンが)省いたローカルティックの数を保持します。
    * `isLastTickLocal` 同様、主にローカルティック補間シーンでの最適化のための変数です。
      ローカルティック補間シーンを利用していない場合、参照する必要はありません。

