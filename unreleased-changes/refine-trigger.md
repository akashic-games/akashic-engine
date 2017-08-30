
その他変更
 * `g.Trigger` のAPIを抜本的に見直し

### ゲーム開発者への影響

 * `g.Trigger` のAPIを見直し
    * 抜本的にAPIを見直しています。変更が大きいため、詳細は以下別項にまとめます。
    * v1 から移行するゲームでは複数の追従作業が必要です。後述の新旧仕様の対応表もご参考ください。
 * `g.ConditionalChainTrigger` を廃止
    * `g.Trigger` から `chain` 機能そのものを分離したため、 `ConditionalChainTrigger` は `g.ChainTrigger` に一般化されました。
    * 利用している場合、 `g.ChainTrigger` に変更してください。コンストラクタの引数順が変わっている (`this` が後になった) 点以外に違いはありません。

`Trigger` の新旧記述の対応は概ね次のとおりです:

||旧仕様での記述|新仕様での記述|
|----|----|----|
|関数 `func` を登録|`trigger.handle(func)`|`trigger.add(func)`|
|関数 `func` を登録(`owner` を `this` に利用)|`trigger.handle(owner, func)`|`trigger.add(func, owner)`|
|関数 `f` を `name` という名で登録|`trigger.handle(f, name)`|`trigger.add({ func: f, name })`|
|関数 `f` を `idx` 番目に挿入して登録(`owner` を `this` に利用)|`trigger.handleInsert(idx, owner, f)`|`trigger.add({ owner, func: f, index: idx })`|
|一度呼び出したら解除される関数 `f` を登録|N/A|`trigger.add({ func: f, once: true })`|
|`func` と `owner` の組み合わせが登録済みか確認|`trigger.isHandled(owner, func)`|`trigger.contains(func, owner)`|
|`func` と `owner` の組み合わせの登録を一つ解除|N/A|`trigger.remove(f, owner)`|
|全ハンドラを登録解除|N/A|`trigger.removeAll()`|
|`owner` を `this` として使う全ハンドラを解除|`trigger.removeAll(owner)`|`trigger.removeAll({ owner })`|
|関数 `f` を使う全ハンドラを解除|`trigger.removeAllByHandler(f)`|`trigger.removeAll({ func: f })`|

#### `Trigger` の仕様変更詳細

##### `add()` を追加

* 従来の `Trigger#handle()` は、 `owner` (`this` として関数に渡される値) の有無によって引数順が変化する紛らわしい仕様になっていました。
* 引数順を変更して、常に関数を第一引数に取る `add()` を加えます。
* `add()` はオブジェクト引数もとれるようにし、引数順に左右されない記述を可能にします。
* オブジェクト引数には `index: number` を含められるようにし、 `handleInsert()` を `add()` に統合します。

##### `remove()` を「登録を一つ解除するメソッド」に変更

* 従来の `Trigger` には、 `handle()` と対になる「登録を一つ解除するメソッド」が存在しませんでした。
  `remove()` は重複して登録されているハンドラを全部解除してしまうもので、 `handle()` と対称ではありませんでした。
* "add" と "remove" で名前上対称になったことを鑑み、 `remove()` を「該当する登録を一つ解除する」メソッドに変更します。

##### 「登録を複数解除するメソッド」を `removeAll()` に統一

* 従来の `Trigger` には、 `removeAllByHandler()`, `removeByName()`, `removeAll()`, `remove()` が存在し、それぞれ登録解除の条件以外はほぼ同じ処理でした。
* また「全ハンドラの登録を解除するメソッド」が存在しませんでした。
  特に `removeAll()` は「特定のオーナーに紐づくハンドラすべて」が解除対象であり、名前と処理が一致していませんでした。
* これらの「該当するハンドラをすべて登録解除するメソッド」を `removeAll()` に一本化します。
* このメソッドは、解除の条件としてオブジェクト引数を一つとり、引数がない場合は全ハンドラを解除します。

#### `g.Trigger#isHandled()` 廃止、 `contains()` 追加。

* `handle` に代えて `add()` を導入した影響で名前を `contains()` に変更します。
* 引数順も `owner` が後になる(普通の省略引数になる)よう改めます。

##### ハンドラ登録時に `once` オプションを追加

* 従来、一回だけ実行されるハンドラを明示的に登録することはできませんでした。
  ハンドラ関数は自力で登録を解除するか、または `true` を戻り値として返す必要がありました。
* `add()` のオブジェクト引数に `once: boolean` を与えられるようにし、一度だけ実行されるハンドラを登録できるようにします。
* これに伴い、ハンドラ関数が `true` を返した場合にハンドラを解除する動作は廃止します。
  常に `true` を返す関数であれば `once` オプションを、でなければ `return true` の代わりに登録解除処理を記述してください。

### 非推奨機能の変更

 * `g.Trigger#handle()` を非推奨に
    * 利用中のユーザは `add()` を使うようにしてください。
    * ハンドラ関数が `boolean` を返す処理はサポートされなくなりました。常に真を返していた場合は `addOnce()` を利用してください。
		  必要なら `return true` の代わりにハンドラ登録解除処理を記述してください。

### エンジン開発者への影響

 * `g.Trigger` のAPI見直し
    * ゲーム開発者同様に追従が必要です。

