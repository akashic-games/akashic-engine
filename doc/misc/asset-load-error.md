# アセットロードエラーについて

## <a name="これは"></a> これは

アセットロードエラーとそのハンドリング方法について述べます。

## <a name="アセットロードエラーとは"></a> アセットロードエラーとは

アセットロードエラーとはアセットの読み込みに失敗したことを意味するエラーです。

`game.json` で指定したアセットがサーバ上に存在しない場合や、ネットワークやサーバ異常によりダウンロード出来ない場合に発生します。


## <a name="エラーのハンドリング"></a> エラーのハンドリング

ゲームコンテンツからアセットロードエラーをハンドリングするコードの例を以下に示します。

```javascript
var scene = new g.Scene({game: game, assetIds: ["apple"], name: "SampleScene"});
// ハンドラを登録
scene.assetLoadFailed.handle(function (failure) {
    // Loggerでログ出力
    game.logger.warn("load error for '" + failure.asset.id + "' in " + scene.name, failure);
    // リトライ不可能の場合、この後ゲームが終了される
    if (!failure.error.retriable)
        game.logger.error("bye.", failure);
});
```

アセットロードエラーが発生した場合、 `Scene#assetLoadFailed` に登録したハンドラが呼び出されます。

上記の例では、アセットID `"apple"` の読み込みに失敗した場合に、ハンドラが呼び出されます。

ハンドラが呼び出された時、ハンドラの第一引数 `failure` は  `AssetLoadFailureInfo` となります。

`AssetLoadFailureInfo` にはアセットロードエラーに関する情報が含まれており、ゲームコンテンツは上記の例のようにログ出力等の処理を行うことが可能です。

`AssetLoadFailureInfo` の詳細はAPIリファレンスを参照してください。
<!-- TODO: APIリファレンスへのハイパーリンク -->

アセットの読み込みに失敗した場合、Akashicは読み込みの再試行を行う機構を備えています。

再試行できない要因（HTTP 404 Not Foundなど）で失敗、又は再試行回数の上限を超えた場合、Akashicは自動的にゲーム続行が不可能だと判断し、ハンドラの呼び出し後にゲームを終了します。

Akashicがアセット読み込みの再試行を行うかどうかは `failure.error.retriable` を参照することで判断することが可能です。

この値が `false` の場合、Akashicはハンドラ呼出し後にゲームを終了します。

## <a name="再試行のキャンセル"></a> 再試行のキャンセル

ゲームコンテンツは、 アセットロードエラーのハンドラ内で `failure.cancelRetry` に `true` にセットすることで、Akashicが行うアセット読み込みの再試行をキャンセルすることが可能です。

以下に例を示します。

```javascript
scene.assetLoadFailed.handle(function (failure) {
    // 再試行をキャンセルし、ゲーム続行を断念する
    failure.cancelRetry = true;
    game.logger.error("bye.", failure);
});
```

ハンドラ内で `failure.cancelRetry` に `true` がセットされると、 Akashicはハンドラ呼出し後にゲームを終了します。

## <a name="その他"></a> その他

アセットロードエラー発生時の処理は、実行環境によって異なるものになる可能性がありますのでご注意下さい。
