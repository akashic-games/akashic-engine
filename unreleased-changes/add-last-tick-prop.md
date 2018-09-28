
機能追加
 * `g.Game#lastTickProperty` を追加

### ゲーム開発者への影響

 * `g.Game#lastTickProperty` を追加
    * ゲーム開発者は、この値を参照することで、直近のティックがローカルであったかなどの情報を得ることができます。
    * この値は、主にローカルティック補間シーン(生成時に `local: g.LocalTickMode.InterpolateLocal` を指定したシーン)での最適化のためのものです。
      ローカルティック補間シーンを利用していない場合、参照する必要はありません。

