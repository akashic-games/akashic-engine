
機能追加
 * `CompositeOperation` の値を追加

### ゲーム開発者への影響

 * CompositeOpreationの値を追加
    * ゲーム開発者は、下記の追加された `CompositeOperation` の値を使用して、エンティティを描画する際の合成方法を指定することができます。
      * `ExperimentalSourceIn`
      * `ExperimentalSourceOut`
      * `ExperimentalDestinationAtop`
      * `ExperimentalDestinationIn`
      * `DestinationOut`
      * `DestinationOver`
      * `Xor`
    * 現在のバージョンにおいて、 `ExperimentalSourceIn` , `ExperimentalSourceOut` , `ExperimentalDestinationAtop` , `ExperimentalDestinationIn` の機能は試験的なものです。環境により、描画結果が大きく異なる可能性があります。

### エンジン開発者への影響

 * CompositeOpreationの値を追加
