
その他変更
 * `g.Trigger` のAPIを抜本的に見直し

### ゲーム開発者への影響

 * `g.Trigger` のAPIを見直し
    * 抜本的にAPIを見直しています。変更が大きいため、詳細は以下別項にまとめます。
    * v1 から移行するゲームでは複数の追従作業が必要です。後述の新旧仕様の対応表をご参考ください。
 * `g.ConditionalChainTrigger` を廃止
    * `g.Trigger` から `chain` 機能そのものを分離したため、 `ConditionalChainTrigger` は `g.ChainTrigger` に一般化されました。
    * 利用している場合、 `g.ChainTrigger` に変更してください。コンストラクタの引数順が変わっている (`this` が後になった) 点以外に違いはありません。

#### `Trigger` の変更詳細と新旧記述対応表

 * `g.Trigger#handle()` `handleInsert()` に代わる `g.Trigger#add()` を追加。
    * 従来の `Trigger#handle()` は、 `owner` (`this` として関数に渡される値) の有無によって引数順が変化する紛らわしい仕様になっていました。
      ECMAScriptの `Array.prototype.map()`, `filter()` などの `this` の与え方とも噛み合っていませんでした。
    * 引数順を変更し、常に関数を第一引数に取る `add()` を加えます。
    * `add()` はオブジェクト引数もとれるようにし、引数順に左右されない記述を可能にします。
    * オブジェクト引数には `index: number` を含められるようにし、 `handleInsert()` を `add()` に統合します。
 * ハンドラ登録時に `once` オプションを追加。ハンドラ関数が `boolean` を返す場合の処理を削除。
    * `add()` のオブジェクト引数に `once: boolean` を与えられるようにし、一度だけ実行されるハンドラを登録できるようにします。
    * これに伴い、ハンドラ関数が `true` を返した場合にハンドラを解除する動作を廃止します。
      必要であれば `return true` の代わりに登録解除処理を記述してください。
 * `g.Trigger#remove()`, `removeAll()` の仕様を変更、ハンドラ登録解除APIをこの二つに集約
    * 従来の `Trigger` には、全ハンドラを登録解除するメソッドが存在しませんでした。
      `removeAll()` はあるものの、「特定のオーナーに紐づくハンドラすべて」が削除対象であり、名前と処理内容が一致していませんでした。
    * またそれぞれがほぼ同じ処理の `removeAllBy〜()` が散在しており、不必要にコードが膨らんでいました。
    * 登録解除APIの体系を抜本的に見直し、 `remove()`, `removeAll()` に集約します。
    * 引数なしの `trigger.removeAll()` ですべてのハンドラを解除することができるようにします。
 * `g.Trigger#isHandled()` 廃止、 `contains()` 追加。
    * `handle` に代えて `add()` を導入した影響で名前を `contains()` に変更しています。引数順も `owner` が後になる(普通の省略引数になる)よう改めています。
 * `g.Trigger#removeAllBy〜()` をすべて廃止。
    * 上記 `removeAll()`, `remove()` に機能的に統合されたため不要になりました。

||旧仕様での記述|新仕様での記述|
|----|----|----|
|関数 `func` を登録|`trigger.handle(func)`|`trigger.add(func)`|
|関数 `func` を登録(`owner` を `this` に利用)|`trigger.handle(owner, func)`|`trigger.add(func, owner)`|
|関数 `f` を `name` という名で登録|`trigger.handle(f, name)`|`trigger.add({ func: f, name })`|
|関数 `f` を `idx` 番目に挿入して登録(`owner` を `this` に利用)|`trigger.handleInsert(idx, owner, f)`|`trigger.add({ owner, func: f, index: idx })`|
|一度呼び出したら解除される関数 `f` を登録|N/A|`trigger.add({ func: f, once: true })`|
|`func` と `owner` の組み合わせが登録済みか確認|`trigger.isHandled(owner, func)`|`trigger.contains(func, owner)`|
|全ハンドラを登録解除|N/A|`trigger.removeAll()`|
|`owner` を `this` に使うよう登録した全ハンドラを解除|`trigger.removeAll(owner)`|`trigger.removeAll({ owner })`|
|関数 `f` で登録した全ハンドラを解除|`trigger.removeAllHandler(f)`|`trigger.removeAll({ func: f })`|

### 非推奨機能の変更

 * `g.Trigger#handle()` を非推奨に
    * 利用中のユーザは `add()` を使うようにしてください。
    * ハンドラ関数が `boolean` を返す処理はサポートされなくなりました。常に真を返していた場合は `addOnce()` を利用してください。
		  必要なら `return true` の代わりにハンドラ登録解除処理を記述してください。

### エンジン開発者への影響

 * `g.Trigger` のAPI見直し
    * ゲーム開発者同様に追従が必要です。

