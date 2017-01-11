# ストレージについて

## <a name="これは"></a> これは

ストレージの仕様とゲームコンテンツからストレージを操作するストレージインターフェースの利用方法をまとめます。

対象バージョンは akashic-engine@1.0.0 以降です。

## <a name="ストレージ"></a> ストレージ

*NOTE: この項目はストレージの仕様が現時点で未確定な部分があるため、仕様の概要のみを説明しています。*

**ストレージ** は、ゲームコンテンツから利用できる、永続的なデータを保存するための機能です。

ストレージを操作するには **ストレージキー** が必要です。

ストレージ内の値は、ストレージキーにより一意に決定する出来ます。

ストレージキーは **リージョン**, **リージョンキー**, **ユーザID**, **ゲームID** の組み合わせで構成されます。

以下、それぞれについて説明します。

### リージョン

ストレージには書き込む値の種類に応じて領域が用意されています。

この領域を リージョンと呼称します。

リージョンは **Values**、**Counts**、**Scores** の3種類となっており、それぞれ

* Scores - スコアの保存（数値）
* Counts - アイテム数（数値）
* Values - 自由な値（文字列）

を保存することを想定しています。

### リージョンキー

リージョンキーは、リージョン内の値を決定するために用いられる文字列です。

レイヤーキーのフォーマットは `[a-z][a-z0-9]{0, 31}` となります。

例: a001

また、リージョンキーは `.` を区切り文字とした階層構造で表記することができ、最大階層は4階層となります。

例: a001.b001.c001.d001

### ゲームID

ゲームIDは数値となっており、Akashicのゲームコンテンツを識別するIDを指定することになります。

この値は未指定とすることが可能ですが、その場合、後述のユーザIDの指定が必須となります。

### ユーザID

ユーザIDは数値となっており、Akashicの `g.Player#id` を指定することになります。

この値は未指定とすることが可能ですが、その場合、ゲームIDの指定が必須となります。

#### ゲームIDとユーザIDの組み合わせ

ゲームIDとユーザIDはそれぞれ指定・未指定が可能であり、ゲームコンテンツは値の用途に応じて適切な組み合わせを指定する必要があります。

| ゲームID | ユーザID | 用途                                                                                                        |
|:---------|:--------:|:-----------------------------------------------------------------------------------------------------------:|
| 指定     | 未指定   | ゲームコンテンツに紐づくデータ（ゲームの総プレイ回数等）を保存                                              |
| 未指定   | 指定     | 他のゲームコンテンツと共有可能な、プレイヤーに紐づくデータ（複数ゲーム間で共有されるアイテムの情報等）を保存|
| 指定     | 指定     | ゲームコンテンツをプレイしたプレイヤーに紐づくデータ（ゲームのハイスコア等）を保存                          |

## <a name="ストレージインターフェース"></a> ストレージインターフェース

ゲームコンテンツは、ストレージインターフェースを通してストレージを操作することができます。

ストレージインターフェースは `g.Storage*` に当てはまるインターフェース、クラス、列挙型を指します。

ここからは、コード例を示しながらストレージインターフェースの利用方法を説明します。

ストレージインターフェースの詳細な仕様はAPIリファレンスを参照してください。
<!-- TODO: APIリファレンスへのハイパーリンク -->

### 値の書き込み

値の書き込みは `g.Storage#write()` を利用します。
ゲームに紐づく `g.Storage` のインスタンスは `g.Game#storage` となります。

例えば、Valuesリージョンに値を書き込むには以下のような記述を行います。

```javascript
// g.StorageKeyを作成
var key = {
    region: g.StorageRegion.Values,
    regionKey: "fruit.like",
    userId: player.id,
    gameId: "$gameId"
};
// g.StorageValueを作成
var value = {
    data: "apple",
    tag: "foo"
};
// 書き込みを行う
game.storage.write(key, value);
```

この例において、`player` はゲームに参加しているプレイヤーを指す `g.Player` のインスタンスとなります。

値の書き込みにはストレージキーを表す `g.StorageKey` と値を表す `g.StorageValue` が必要です。

この例では、 `key` が `g.StorageKey`、 `value` が `g.StorageValue` となります。

`key.gameId` に指定している `"$gameId"` はゲームIDを示す予約語を表しています。
この予約語が `g.StorageKey#gameId` に指定されたとき、Akashic は自動的にゲームIDの解決を行います。

書き込む値は `g.StorageValue#data` に指定します。
この例では、`"apple"` を指定しています。

`g.StorageValue#tag` は値の付加情報となっており、値の検証を行う場合等に利用することが可能です。

`game.storage.write(key, value)` で実際に書き込みが行われます。

ここで、ゲームコンテンツは書き込みの成功・失敗を検知することが出来ないことに注意して下さい。

次に、Scoresリージョンに値を書き込む例を示します。

```javascript
var clickCounts = {};
scene.pointDownCapture.handle(function(o) {
    if (!o.player.id) {
        return;
    }
    var clickCount = clickCounts[o.player.id] ? clickCounts[o.player.id] : 1;
    var key = {
        region: g.StorageRegion.Scores,
        regionKey: "click",
        userId: o.player.id,
        gameId: "$gameId"
    };
    var value = {
        data: clickCount
    };
    // 書き込みオプションを指定
    var option = {
        condition: g.StorageCondition.LessThan,
        comparisonValue: clickCount
    };
    game.storage.write(key, value, option);
    clickCounts[o.player.id] = clickCount;
});
```

この例では、シーンのクリック数をゲームのスコアとしてストレージに保存しています。
`o.player` により、クリックしたプレイヤーを取得しています。

値を書き込む場合、同じゲームが同時に実行されているケースを想定する必要があります。

例えば、ゲームがA, Bの2つの実行単位で実行されており、A, Bに同じユーザが参加しているケースを考えます。

Aでクリック数20をスコアとして書き込んだ後に、Bでクリック数10を書き込むと最終的なスコアは10となってしまいます。

最新のクリック数をスコアとするゲームであれば問題ありませんが、多くの場合は最大クリック数をスコアとすることになると思います。

このようなケースでは、`g.StorageWriteOption` で書き込み実行条件を指定することになります。

上記の例では、`option` が `g.StorageWriteOption` となっており、「現在の値が `clickCount` 未満の場合に `clickCount` を値として書き込む」という条件指定が行われています。

次に、Countsリージョンに値を書き込む例を示します。

Countsリージョンでは、これまでValuesリージョンやScoresリージョンの説明で行ったような値を指定した書き込みに加え、値のインクリメント、デクリメント処理を行うことが出来ます。

以下の例では、ゲームのプレイ回数をインクリメントして保存しています。

```javascript
scene.loaded.handle(function() {
    var key = {
        region: g.StorageRegion.Counts,
        regionKey: "play",
        userId: player.id,
        gameId: "$gameId"
    };
    var value = {data: undefined};
    var option = {
        operation: g.StorageCountsOperation.Incr
    };
    game.storage.write(key, value, option);
});
```

`value.data` に数値を指定すると、指定した数値を現在の値に加算する処理となります。

```javascript
// 現在の値に10加算する
game.storage.write(key, {data: 10}, option);
```

### 値の読み込み

値の読み込みはシーンの開始時に行われ、シーン開始後に読み込みを行うことはできません。

以下のように読み込み行うストレージキーを `g.StorageReadKey` として生成し、その一覧を `g.Scene` のコンストラクタに指定します。

```javascript
// ストレージから読み込むキーのリスト
var keys = [
    {region: g.StorageRegion.Values, regionKey: "fruit.like", userId: game.vars.player.id, gameId: "$gameId"},
    {region: g.StorageRegion.Counts, regionKey: "play", userId: game.vars.player.id, gameId: "$gameId"},
    {region: g.StorageRegion.Scores, regionKey: "click", userId: game.vars.player.id, gameId: "$gameId"}
];
var scene = new g.Scene({game: game, storageKeys: keys});
scene.loaded.handle(function() {
...
});
```

この例では、シーン開始前に、`g.Game#join` を通して参加者を表す `g.Player` が `game.vars.player` にセットされていることを想定しています。

読み込んだ値は、シーン開始後に利用することができます。

例えば、 `keys[0]` に対応する値を取得するには `scene.loaded.handle` に登録したハンドラ内で

```javascript
scene.storageValues.getOne(keys[0]);
```

とします。

値の一括取得を行う際は、 `g.StorageReadKey#regionKey` にアスタリスク `*` を含んだ文字列を指定します。

例えば、 `a001.b00*` を指定すると `a001.b001` 、`a001.b002` のリージョンキーにマッチする値を取得できます。

また、`g.StorageReadKey#userId` を アスタリスク `*` とすることができ、これは全ユーザにマッチすることになります。

```javascript
var keys = [{region: g.StorageRegion.Counts, regionKey: "play", userId: "*", gameId: "$gameId"}];
var scene = new g.Scene({game: game, storageKeys: keys});
scene.loaded.handle(function() {
    // 一括取得の結果（g.StorageValueの配列）を取得
    var result = scene.storageValues.get(keys[0]);
    // => [{data: 2, storageKey: {region: g.StorageRegion.Counts, regionKey: "play", userId: "user1", gameId: "2"}},
    //     {data: 5, storageKey: {region: g.StorageRegion.Counts, regionKey: "play", userId: "user1", gameId: "2"}},
    //     {data: 8, storageKey: {region: g.StorageRegion.Counts, regionKey: "play", userId: "user1", gameId: "2"}}]
});
```

**リージョンキーとユーザIDの一括取得を同時に指定することは出来ない**ので注意が必要です。

取得した値を表す `g.StorageValue` のメンバである `storageKey` は値に対応するストレージキーを表します。

一括取得した値に対応するストレージキーを知りたい場合は、このメンバを利用します。
