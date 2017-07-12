
機能追加
 * `g.Game#resized` を追加

### ゲーム開発者への影響

 * `g.Game#resized` を追加
    * ゲーム開発者は `g.Game#resized` トリガーを使ってコンテンツ解像度の変更通知を受けることができます。
    * リサイズに応じて `g.Game#width`, `g.Game#height` の値も同様に変更されます。
    * `g.Game#resized` の引数に、変更後の  `g.Game#width`, `g.Game#height` からなる `g.CommonSize` の値が与えられます。
    * 現在のバージョンにおいて、この機能は実験的なものです。利用するエンジンモジュールによっては正常な動作を保証できません。

### エンジン開発者への影響

 * `g.Game#resized` を追加
    * 本機能をサポートする場合、エンジン開発者は外部からコンテンツ解像度の変更要求を受け取った後 `g.Game#width`, `g.Game#height` の値を変更し、 `g.Game#resized` をfireする必要があります。
    * `g.Game#resized` の引数に、変更後の  `g.Game#width`, `g.Game#height` からなる `g.CommonSize` の値を指定する必要があります。
