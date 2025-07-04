# ChangeLog

## 3.21.0
* `g.Game#suspendLocalTick()`, `g.Game#resumeLocalTick()` を追加
* `g.GameHandlerSet#suspendLocalTick()`, `g.GameHandlerSet#resumeLocalTick()` を追加

## 3.20.3
* `g.game.audio.music|sound.volume` の変更が再生中の `AudioPlayContext` に反映されない問題を修正

## 3.20.2
* すでに削除済みのタイマーに対して clear しても例外としないように修正

## 3.20.1
* 内部モジュールの更新

## 3.20.0
* @akashic/game-configuration@2.5.0 に追従
  * `BundledTextAsset` を追加

## 3.19.1
* assetBundle が存在する状況においてスクリプトアセット以外を利用するとエラーとなる問題を修正

## 3.19.0
* @akashic/game-configuration@2.4.0 に追従
  * `assetBundle` に対応
  * `BundledScriptAsset` を追加

## 3.18.3
* `g.E#destroy()` で破棄済みチェックを行うように修正

## 3.18.2
* `OperationHandler#onOperaiton()` で `instanceof` での判定をやめ `Array.isArray()` を利用するように修正

## 3.18.1
* `moduleMainPaths` の挙動を `moduleMainScripts` が存在しない場合に利用するように修正

## 3.18.0
* @akashic/game-configuration@2.2.0 に追従
  * `moduleMainPaths` をサポート

## 3.17.1
* `g.Game#asset: AssetAccessor` を追加
* アセットIDからアクセッサパスを逆引きするメソッド `AssetAccessor#pathOf()` を追加

## 3.17.0
* @akashic/pdi-types@1.13.0 に追従
  * サポートする `CompositeOperation` に `"difference"` と `"saturation"` を追加

## 3.16.6
* exports.default をサポートする `g.ModuleManager#_internalRequire` を追加

## 3.16.5
* `g.Scene#requestAssets()` で対象のアセットのロード失敗時に `callback` 経由でエラーを通知するインタフェースを追加

## 3.16.4
不具合修正
 * `require()` で末尾の "index" や "index.js" を省略する表記としない表記を混在させた時、スクリプトが複数回評価される問題を修正

## 3.16.3
* 3.16.2 の不具合回避のため 3.16.1 と同じ内容にリバート

## 3.16.2
* `g.Game#localAge` を追加
* 次のティックまでハンドラの実行を遅延させる `EntityUpdateChainTrigger` を導入

## 3.16.1
不具合修正
 * スナップショットからの復元時、 `g.game._idx` が復元できないことがある問題を修正

## 3.16.0
* @akashic/pdi-types@1.12.0 に追従
  * `g.PointMoveEvent#button` の値が変更されます。

## 3.15.0
* `g.Storage` とその周辺のコードを削除
  * ゲーム開発者に影響はありません。
* `g.PathUtil` を @akashic/game-configuration から参照するように

### エンジン開発者への影響
* `g.Game#storage` が削除されます。
* `g.JoinEvent` のコンストラクタ関数の引数が一部変更になります。

## 3.14.2
* `g.Scene#seethrough` を追加

## 3.14.1
* `g.Scene#vars` を追加
* `g.Scene` のアセット読み込み後に任意の非同期処理を行うための `prepare` をサポート
   * `g.Game#pushScene()` に第2引数 `PushSceneOption` を追加
   * `g.Game#replaceScene()` の第2引数を `boolean | ReplaceSceneOption` に変更

## 3.14.0
* @akashic/pdi-types@1.10.0 に追従
  * `"binary"` アセットに対応
  * `ScriptAsset#exports` に対応

## 3.13.0
* どのボタンでマウスクリックが行われたか認識できるように
* 内部モジュールの更新

## 3.12.0
* @akashic/trigger@2.0.0 に更新

## 3.11.2
* 型キャストの見直し

## 3.11.1
* ローディングシーンの表示中にシーンスタックを変更すると正しく動作しない問題を修正

## 3.11.0
* 内部モジュールの更新

## 3.10.0
* @akashic/game-configuration@1.9.0 に追従
* xorshift のリファレンス実装を更新

### ゲーム開発者への影響
* xorshift のリファレンス実装の更新により、既存の playlog の再現性が失われる可能性があります。

## 3.9.3
機能追加
* game.json の `"maxPoints"` で最大同時タップ数を指定できるように

その他変更
* `g.Scene#deleteTimer()` に注釈コメント追加

## 3.9.2
機能追加
* `g.AudioUtil` を追加
  * 音声のフェードイン・フェードアウト・クロスフェード等の機能を提供します。
* `g.Game#onUpdate` を追加
  * ティックの進行後 (`g.Scene#onUpdate` が発火した後) に発火します。
* `g.Util#clamp()` を追加
* `EasingFunction` `AudioTransitionContext` を追加

## 3.9.1
* 早送り中に `g.AudioPlayContext` の再生を抑制するように

## 3.9.0
* `g.AudioPlayContext` を追加
* `g.AudioSystemManager#create()`, `g.AudioSystemManager#play()` を追加
* `g.AudioSystem#create()`, `g.AudioSystem#play()` を追加
* `g.Game#replaceScene()`, `g.Game#pushScene()` の呼び出しに起因するシーンの破棄順序を変更

### ゲーム開発者への影響
* `g.Game#replaceScene()`, `g.Game#pushScene()` の呼び出しに起因してシーンが破棄された場合、対象の `g.Scene` の state が `"destroyed"` となるタイミングが遅延されます。

## 3.8.0
* @akashic/pdi-types@1.6.0 に追従

## 3.7.1
その他変更
* エントリポイントでexportしている外部モジュールもAPIリファレンスでデフォルト表示されるように

## 3.7.0
* @akashic/pdi-types@1.5.0 に追従
* @akashic/game-configuration@1.6.0 に追従

## 3.7.0-beta.0
* @akashic/pdi-types@1.5.0-beta.0 に追従
* @akashic/game-configuration@1.6.0-beta.0 に追従

機能追加
* game.json でオーディオアセットに再生開始位置 `"offset"` を指定できるように

## 3.6.0
その他変更
* `WeakRefKVS` の追加
* `g.Game#db`, `g.Game#_localDb` を `WeakRefKVS` に変更

### ゲーム開発者への影響
`g.Game#db`, `g.Game#_localDb` の型が `WeakRefKVS` に変更されます。
`g.game.db[e.id]` や `Object.keys(g.game.db)` のようにプロパティを参照していた場合は `g.game.db.get(e.id)` や `g.game.db.keys()` を利用するように修正してください。

## 3.5.1
* `SurfaceUtil#renderNinePatch()` の追加

## 3.5.0
* @akashic/pdi-types@1.4.0 に追従

## 3.5.0-beta.2
* 非対応環境での GeneratedAsset の生成時にダミーのアセットを返すように

## 3.5.0-beta.1
* @akashic/pdi-types@1.4.0-beta.1 に追従

## 3.5.0-beta.0
* @akashic/pdi-types@1.4.0-beta.0 に追従

## 3.4.4
その他変更
 * `g.AudioSystem#_setPlaybackRate()` の整理

## 3.4.3

不具合修正
* `g.OperationPluginManager#stopAll()` で登録済みの操作プラグインが正常に停止できなかった不具合を修正

## 3.4.2

不具合修正
* `g.Scene#requestAssets()` で DynamicAsset の読み込みを要求した際に引数が normalize されていなかった不具合を修正

## 3.4.1
* 早送りの終了時にスキッピングシーンが描画され続けるケースがある問題の修正

## 3.4.0

機能追加
 * `g.Game#skippingScene` を追加
   * ゲームが早送りとなった際に描画される特殊なシーンが利用可能に

その他変更
 * `any` 型の利用箇所を削減
 * `DynamicAssetConfiguration` の継承関係を整理

## 3.3.0

機能追加
 * `PartialImageAsset` を追加。game.json の画像アセット定義に `slice` が指定されていた時、その部分のみを画像アセットとして使うように

## 3.2.3

不具合修正
 * 使用中のオーディオアセットの再利用処理が間違っていた不具合を修正

## 3.2.2

機能追加
 * `g.Game#requestSaveSnapshot()` を追加

非推奨機能の追加
 * `g.Game#shouldSaveSnapshot()` を非推奨に
 * `g.Game#saveSnapshot()` を非推奨に

## 3.2.1

不具合修正
 * シーンをまたいでオーディオアセットを再生した場合の不具合を修正

## 3.2.0

機能追加
 * `"vector-image"` アセットに対応

## 3.1.2

その他変更
 * @akashic/game-configuration を利用するように変更
 * @akashic/amflow@1.2.0 に更新

## 3.1.1

不具合修正
 * `g.Game#replaceScene()` で遷移先のシーンのアセットを prefetch するように修正

文書修正
 * `g.Game` のスナップショット関連の API コメントを修正
   * 動作への影響はありません。

## 3.1.0

不具合修正
 * スナップショットからの復元時、エンティティがないと `g.game._idx` が復元できない問題を修正

## 3.0.4

機能追加
 * `g.Collision.intersectEntities()` を追加
   * 同一シーン内の任意のエンティティ同士の矩形が重なっているかどうか判定することができます。
 * `g.Collision.intersectLineSegments()` を追加
   * 線分同士の衝突 (交差) を判定することができます。

仕様変更
 * `g.Label` の生成時、 fontSize (`g.LabelParameterObject#fontSize`) プロパティを省略可能に
   * デフォルト値は `g.Label` の生成時に指定された font (`g.LabelParameterObject#font`) プロパティの font.size と同じ値になります

## 3.0.3
* `g.Game#_reset()` 実行時に `g.Game#_moduleManager` を初期化する処理を追加

## 3.0.2
* @akashic/pdi-types@1.1.1 に更新
* `g.Player#id` の型を `string | undefined` に修正

## 3.0.1

機能追加
 * `g.Module#_resolvePath()` を追加
   * ゲーム開発者は、 `require.resolve()` を利用することで game.json をルートとする絶対パスを取得することができます。
 * パス形式でのアセットの取得時に、パスにモジュール名が含まれていたら絶対パスへと読み替えるように変更

仕様変更
 * `PlayerInfoEvent#player` を追加、 `PlayerInfoEvent` の `playerId`, `playerName`, `userData` を削除
   * 将来のために予約されている未使用の機能のため、ゲーム開発者に影響はありません。

## 3.0.0

v3.0.0-beta.X の正式リリース版です。

v3.0.0-beta.37 から変更はありません。
以下は v2.6.6 からの変更点です (v3.0.0-beta.X での変更のうち、v2.X に対応するものがないものをまとめています)。
v2 系ゲーム開発者への影響や追加機能については、
チュートリアル文書 [v2 からの移行](https://akashic-games.github.io/tutorial/v3/v3-migration-guide.html) を併せて参照してください。

機能追加
 * `g.Scene` のコンストラクタ引数に `assetPaths` を追加
 * `g.Scene#asset` を追加
 * `g.PlayerInfoEvent` と `g.Game#onPlayerInfo` を追加
 * `g.AudioSystemManager#stopAll` を追加
 * `g.Game#localRandom` を追加
 * `g.Game#onSceneChange` を追加
 * `g.Game#popScene()`で popする数を指定できるように
 * `g.E#localToGlobal()` と `g.E#globalToLocal()` を追加
 * `g.EventFilterController` を追加
 * `g.SurfaceUtil.drawNinePatch()` を追加
 * `g.OperationPluginManager` に `register()`, `start()`, `stop()` を追加
 * game.json の`defaultLoadingScene` に `compact` を追加

仕様変更
 * `g.E` の `anchorX`, `anchorY` の初期値を (0, 0) (エンティティ左上端) に変更
 * `g.Util` の一部メソッドを移動・廃止
    * `createSpriteFromE()` を `g.SpriteFactory.createSpriteFromE()` に移動
    * `createSpriteFromScene()` を `g.SpriteFactory.createSpriteFromScene()` に移動
    * `asSurface()`: `g.SurfaceUtil.asSurface()` に移動
    * `createMatrix()` を廃止
 * TypeScript 利用時の型定義ファイルを `lib/main.d.ts` から `index.runtime.d.ts` に変更
 * TypeScript 利用時、tsconfig.json に `allowUmdGlobalAccess: true` が必要に
 * `g.SystemLabel`, `g.TextBaseline` を廃止
 * `g.TickGenerationMode` を廃止。代替型 `g.TickGenerationModeString` を追加
 * `g.LocalTickMode` を廃止。代替型 `g.LocalTickModeString` を追加
 * `g.SceneState` を廃止。代替型 `g.SceneStateString` を追加
 * `ResourceFactory#createTrimmedSurface()` を廃止
 * `g.Event#priority` を `g.Event#eventFlags` に変更

非推奨機能の廃止
 * `g.game.random[0]` を廃止
 * `g.Scene#setTimeout()`, `g.Scene#setInterval()` の非推奨だった引数順を廃止

非推奨機能の追加
 * 以下のトリガー名を非推奨に
 * `g.RandomGenerator#get()` を非推奨に
 * `g.CompositeOperaiton` を非推奨に。代替型 `g.CompositeOperationModeString` を追加
 * `g.TextAlign` を非推奨に。代替型 `g.TextAlginString` を追加
 * `g.FontWeight` を非推奨に。代替型 `g.FontWeightString` を追加
 * `g.FontFamily` を非推奨に
 * `g.RandomGenerator#get()` を非推奨に
 * `g.NinePatchSurfaceEffector` を非推奨に

その他変更
 * 内部でしか使われない変数・メソッドを API リファレンスに出力しない (@ignore) ように
 * 内部構造を整理
   * 環境依存部分の型定義を interface として整理し、 `@akashic/pdi-types` として分離
   * 環境依存部分の共通実装を `@akashic/pdi-common-impls` として分離
 * @akashic/playlog@3.1.0 に依存するように


### ゲーム開発者への影響

仕様変更
 * `g.E` の `anchorX`, `anchorY` の初期値を (0, 0) (エンティティ左上端) に変更
    * 歴史的経緯のため、これまで未指定時は「移動 (`x`, `y`) の基準はエンティティ左上端、回転・拡縮の基準はエンティティ中央」という挙動でしたが、単純化されます。
    * 従来の挙動は `anchorX`, `anchorY` に `null` すると再現できますが、非推奨です。将来的にこの挙動は削除されます。
 * `g.Util` の一部メソッドを移動・廃止
    * `createSpriteFromE()`: `g.SpriteFactory.createSpriteFromE()` を利用してください。
    * `createSpriteFromScene()`: `g.SpriteFactory.createSpriteFromScene()` を利用してください。
    * `asSurface()`: `g.SurfaceUtil.asSurface()` を利用してください。
    * `createMatrix()`: 廃止されました。 `new g.PlainMatrix()` を利用してください。
 * `ResourceFactory#createTrimmedSurface()` を廃止
 * TypeScript 利用時の型定義ファイルを `lib/main.d.ts` から `index.runtime.d.ts` に変更
 * TypeScript 利用時、tsconfig.json に `allowUmdGlobalAccess: true` が必要に
 * `g.SystemLabel`, `g.TextBaseline` を廃止
 * enum `g.TickGenerationMode` を廃止
    * 利用している場合、代わりに `g.TickGenerationModeString` (`"by-clock" | "manual"`) を利用してください。
    * `g.Scene#tickGenerationMode` の型が `g.TickGenerationModeString` になります。
 * enum `g.LocalTickMode` を廃止
    * 利用している場合、代わりに `g.LocalTickModeString` (`"full-local" | "non-local" | "interpolate-local"`) を利用してください。
    * `g.Scene#local` の型が `g.LocalTickModeString` になります。
    * これにより、 `g.Scene#local` が boolean だった当時 (v1 系) のコードとは互換性がなくなります。
 * enum `g.SceneState` を廃止
    * `g.Scene#state` の型, `g.Scene#onStateChange` の通知する型が `g.SceneStateString` (`"destroyed" | "standby" | "active" | "deactive" | "before-destroyed"`) になります。
 * 非推奨機能 `g.game.random[0]` を廃止
    * `g.game.random` を利用してください。
 * `g.Scene#setTimeout()`, `g.Scene#setInterval()` の非推奨だった引数順を廃止
    * 第一引数に関数を渡す `window.setTimeout()` 互換の引数順を利用してください。

機能追加
 * `g.Scene` のコンストラクタ引数に `assetPaths` を追加
 * `g.Scene#asset` を追加
 * `g.E#localToGlobal()` と `g.E#globalToLocal()` を追加
    * 複雑な親子関係を持つエンティティの座標 (`x`, `y`) を、ゲーム画面の座標系に変換できます (`localToGlobal()`) 。
    * ゲーム画面の座標系を、特定のエンティティから見た座標系に変換できます (`globalToLocal()`) 。
 * `g.PlayerInfoEvent` と `g.Game#onPlayerInfo` を追加
    * 現時点では利用されていません。将来プレイヤー名情報を通知するために予約されます。
 * `g.AudioSystemManager#stopAll` を追加
    * ゲーム開発者は、`g.game.audio.stopAll()` を使うことで、全てのオーディオシステムを停止することができます。
 * `g.Game#localRandom` を追加
    * マルチプレイの各プレイヤー間で共有されない (異なるシードを持つ) 乱数生成器 `localRandom` が追加されます。
    * マルチプレイにおいて、プレイヤー全員で同じように使うための乱数生成器 `g.Game#random` と異なり、
      各プレイヤー固有の乱数が必要な場合に利用できます。
    * ローカル処理 (`local: true` を指定したエンティティのイベントハンドラ (`onPointDown` など) またはそこから呼び出された処理) の中でのみ利用してください。(ゲームのグローバルな実行状態を破壊しないため)
 * `g.Game#onSceneChange` を追加
    * ゲーム開発者は、これを利用することでシーンの変化時に通知を受けることができます。
    * (v2 系から存在する内部プロパティ `g.Game#_onSceneChange` とは動作が異なります。ゲーム開発者は `onSceneChange` を利用してください)
 * game.json の`defaultLoadingScene` に `compact` を追加
    * `"compact"` の場合、ローディング画面の背景は透過され、プログレスバーが (画面中央ではなく) 右下の方に小さく表示されます。
 * `g.SurfaceUtil.drawNinePatch()` を追加
    * ボタンやウィンドウなどの画像を 9 分割してスムーズに拡大描画する、いわゆる NinePatch を描画することができます。
 * `g.Game#popScene()`で pop する数を指定できるように
    * 複数のシーンを一括して pop できます。

#### 非推奨機能の追加

 * 一部トリガー名を非推奨に
    * 統一感がないネーミングを非推奨にして、 `on〜` で始まる名前を追加しました。
    * 新旧のトリガー名の対応は以下の表のとおりです。
 * `g.RandomGenerator#get()` を非推奨に
    * `g.RandomGenerator#generate()` を利用してください。
    * `get(min, max)` は `min` 以上 `max` 以下の整数を、 `generate()` は `0` 以上 `1` 未満の実数を返すので変換が必要です。
    * `min`, `max` が整数で `min < max` であれば、
      `g.game.random.get(min, max)` は `min + Math.floor(g.game.random.generate() * (max + 1 - min))` と等価です。
 * 各種 enum を非推奨に
    * `g.CompositeOperation.SourceOver` の代わりに `"source-over"` など、より簡潔な文字列定数を導入します。
      これに伴い `g.CompositeOperation`, `g.TextAlign`, `g.FontWeight`, `g.FontFamily` を非推奨にします。
    * `enum` と文字列定数の対応は以下の表のとおりです。
    * これに伴う互換性維持のため、一部の型が変化します。
       * `g.E#compositeOperation`: `g.CompositeOperation | g.CompositeOperationString` になります (指定値をそのまま反映)。将来的には `g.CompositeOperationString` に一本化します。
       * `g.Label#textAlign`: `g.TextAlign | g.TextAlignString` になります (指定値をそのまま反映)。将来的には `g.TextAlignString` に一本化します。
       * `g.Label#fontWeight`: g.FontWeight | g.FontWeightString になります (指定値をそのまま反映)。将来的には `g.FontWeightString` に一本化します。
       * `g.DynamicFont#fontFamily` の型は変化しません (`g.FontFamily` を含め、引き続き指定値をそのまま反映)。将来的には `string | string[]` に一本化します。

新旧トリガー名対応表

|v2のトリガー名 (v3 系で非推奨)|v3 のトリガー名|
|:---|:---|
|`g.Game#join`|`g.Game#onJoin`|
|`g.Game#leave`|`g.Game#onLeave`|
|N/A|`g.Game#onPlayerInfo`|
|`g.Game#skippingChanged`|`g.Game#onSkipChange`|
|`g.Scene#update`|`g.Scene#onUpdate`|
|`g.Scene#loaded`|`g.Scene#onLoad`|
|`g.Scene#assetLoaded`|`g.Scene#onAssetLoad`|
|`g.Scene#assetLoadFailed`|`g.Scene#onAssetLoadFailure`|
|`g.Scene#assetLoadCompleted`|`g.Scene#onAssetLoadComplete`|
|`g.Scene#stateChanged`|`g.Scene#onStateChange`|
|`g.Scene#message`|`g.Scene#onMessage`|
|`g.Scene#pointDownCapture`|`g.Scene#onPointDownCapture`|
|`g.Scene#pointMoveCapture`|`g.Scene#onPointMoveCapture`|
|`g.Scene#pointUpCapture`|`g.Scene#onPointUpCapture`|
|`g.Scene#operation`|`g.Scene#onOperation`|
|`g.E#pointDown`|`g.E#onPointDown`|
|`g.E#pointMove`|`g.E#onPointMove`|
|`g.E#pointUp`|`g.E#onPointUp`|

enum と文字列定数の対応表

|enum (v3 系で非推奨)|v３でサポートする文字列定数|
|:---|:---|
|`g.CompositeOperation`|`"source-over"`, `"source-atop"`, `"lighter"`, `"copy"`, `"experimental-source-in"`, `"experimental-source-out"`, `"experimental-destination-atop"`, `"experimental-destination-in"`, `"destination-out"`, `"destination-over"`, `"xor"`<br>(TypeScript での型名は `g.CompositeOperationString`)|
|`g.TextAlign`|`"left"`, `"center"`, `"right"`<br>(TypeScript での型名は `g.TextAlignString`)|
|`g.FontWeight`|`"normal"`, `"bold"`<br>(TypeScript での型名は `g.FontWeightString`)|
|`g.FontFamily`|`"serif"`, `"sans-serif"`, `"monospace"`<br>(`g.FontFamily` を指定できる箇所は、以前から任意のフォント名 (string) を動作保証なしで受け取っていたため、対応する型は追加されません)|

### エンジン開発者への影響

* `g.AssetLoadErrorType` を非推奨に
   * `g.ExceptionFactory.createAssertionError()` の引数の一つでしたが、事実上参照されていませんでした。代わりに `null` を渡してください
   * (そもそも `g.AssetErrorLike` など interface を整理したため、本当はもはや `g.ExceptionFactory` を参照する必要もありません)
* `g.Renderer#setCompositeOperation()` の引数を変更
   * enum `g.CompositeOperation` に代えて `g.CompositeOperationString` (`"source-over" | "destination-in" | ... | "xor"`) が渡されるようになります
   * 対応する変更:
      *  対応する interface `g.RendererLike` も同様に変わります。(利用されていないはずです)
* `g.ResourceFactory#createGlyphFactory()` の引数型を変更
   * 第一引数 `fontFamily` の型から `g.FontFamily` がなくなり `string | string[]` に単純化されます
      * ただしこの string において `"serif" | "sans-serif" | "monospace"` はサポートされる必要があります
   * 第八引数 `fontWeight` の型が `g.FontWeightString` (`"normal" | "bold"`) に変わります
   * 対応する変更:
      * `g.GlyphFactory` のコンストラクタ引数が同様に変更されます
      * プロパティ `g.GlyphFactory#fontFamily`, `fontWeight` が同様に変更されます
      *  対応する interface `g.GlyphFactoryLike` も同様に変わります。(利用されていないはずです)

## 3.0.0-beta.37

不具合修正
 * `g.DynamicFont` の文字が欠けることがある不具合を修正

## 3.0.0-beta.36

仕様変更
 * `g.Event#priority` を `g.Event#eventFlags` に変更

## 3.0.0-beta.35

機能追加
* `g.EventFilterController` を追加
* `g.EventFilter` の第2引数に `g.EventFilterController` を追加

## 3.0.0-beta.34

機能追加
 * `g.Game#localRandom` を追加

## 3.0.0-beta.33

不具合修正
 * `g.AssetLoadFailureInfo` を export するように修正

## 3.0.0-beta.32

不具合修正
 * クリアされた `g.Scene` のタイマが同タイミングにより実行されてしまう不具合の修正。

## 3.0.0-beta.31

機能追加
 * `g.AudioSystemManager#stopAll` を追加

### ゲーム開発者への影響

 * `g.AudioSystemManager#stopAll` を追加
    * ゲーム開発者は、`g.game.audio.stopAll()` を使うことで、全てのオーディオシステムを停止することができます。

## 3.0.0-beta.30

その他変更
 * @akashic/playlog@3.1.0 に追従

## 3.0.0-beta.29

機能追加
 * `g.Game#joinedPlayerIds` を追加

### ゲーム開発者への影響

 * `g.Game#joinedPlayerIds` を追加
    * ゲーム開発者は、このプロパティを参照することで、joinしているプレイヤーIDの一覧を取得することができます。


## 3.0.0-beta.28

その他変更
 * @akashic/pdi-types@1.0.1 に追従
    * `@akashic/pdi-common-impl` の `SurfaceAtlas`, `SurfaceAtlasSlot` を Akashic Engine で持つよう変更

## 3.0.0-beta.27

不具合修正
 * `getGameInAssetContext()` が機能していない問題の修正と廃止

## 3.0.0-beta.26

その他変更
 * `@akashic/pdi-common-impl` を使用するよう変更
 * 内部でしか使われていない変数・メソッドに @ignore を付与

## 3.0.0-beta.25

仕様変更
 * `g.TextBaseline` を廃止

## 3.0.0-beta.24

その他変更
 * `src/pdi-common-impls` に `PdiCommonUtil.ts` を追加
    * `src/engine/PathUtil` の一部関数を `PdiCommonUtil.ts` へ移動

## 3.0.0-beta.23

その他変更
 * `src/pdi-common-impls` の `AudioSystem`, `VideoSystem` を `src/engine` へ変更。
    * `pdi-common-impls` 内では `AudioSystemLike`, `VideoSystemLike` を使用するよう修正。

## 3.0.0-beta.22

機能追加
 * `GameParameterObject#mainFunc` を追加

## 3.0.0-beta.21

機能追加
 * `g.Game#onSceneChange` を追加

### ゲーム開発者への影響
 * `g.Game#onSceneChange` を追加

## 3.0.0-beta.20

不具合修正
 * `E` の生成時に `anchorX`, `anchorY` に `null` を指定できない問題を修正

## 3.0.0-beta.19

不具合修正
 * 3.0.0-beta.18 で `index.runtime.d.ts` が壊れていた問題を修正

## 3.0.0-beta.18

仕様変更
 * `g.TickGenerationMode` を廃止。代替型 `g.TickGenerationModeString` を追加
 * `g.LocalTickMode` を廃止。代替型 `g.LocalTickModeString` を追加
 * `g.SceneState` を廃止。代替型 `g.SceneStateString` を追加
 * `g.CompositeOperaiton` を非推奨に。代替型 `g.CompositeOperationModeString` を追加
その他
 * `g.TextAlign` を非推奨に。代替型 `g.TextAlginString` を追加
 * `g.FontWeight` を非推奨に。代替型 `g.FontWeightString` を追加
 * `g.FontFamily` を非推奨に
 * `g.RandomGenerator#get()` を非推奨に
 * 内部クラス `SceneAssetHolder` の依存関係を整理。 `AsssetHolder` に改名
 * リポジトリのディレクトリ構造を変更
 * eslint のルールを調整

### ゲーム開発者への影響

 * enum `g.TickGenerationMode` を廃止
    * 利用している場合、代わりに `g.TickGenerationModeString` (`"by-clock" | "manual"`) を利用してください。
    * `g.Scene#tickGenerationMode` の型が `g.TickGenerationModeString` になります。
 * enum `g.LocalTickMode` を廃止
    * 利用している場合、代わりに `g.LocalTickModeString` (`"full-local" | "non-local" | "interpolate-local"`) を利用してください。
    * `g.Scene#local` の型が `g.LocalTickModeString` になります。
    * これにより、 `g.Scene#local` が boolean だった当時 (v1 系) のコードとは互換性がなくなります。
 * enum `g.SceneState` を廃止
    * `g.Scene#state` の型, `g.Scene#onStateChange` の通知する型が `g.SceneStateString` (`"destroyed" | "standby" | "active" | "deactive" | "before-destroyed"`) になります。

### 非推奨機能の追加

 * `g.RandomGenerator#get()` を非推奨に
    * `g.RandomGenerator#generate()` を利用してください。
    * `get(min, max)` は `min` 以上 `max` 以下の整数を、 `generate()` は `0` 以上 `1` 未満の実数を返すので変換が必要です。
    * `min`, `max` が整数で `min < max` であれば、
      `g.game.random.get(min, max)` は `min + Math.floor(g.game.random.generate() * (max + 1 - min))` と等価です。
 * 各種 enum を非推奨に
    * `g.CompositeOperation`: 代わりに `g.CompositeOperationString` (`"source-over" | "destination-in" | ... | "xor"`) を利用してください
    * `g.TextAlign`: 代わりに `g.TextAlignString` (`"left" | "center" | "right"`) を利用してください。
    * `g.FontWeight`: 代わりに `g.FontWeightString` (`"normal" | "bold"`) を利用してください。
    * `g.FontFamily`: 代わりに `"serif" | "sans-serif" | "monospace"" を利用してください。
       (`g.FontFamily` を指定できる箇所は、以前から任意のフォント名 (string) を動作保証なしで受け取っていたため、型として `g.FontFamilyString` は追加されません。)
    * これに伴う互換性維持のため、一部の型が変化します。
       * `g.E#compositeOperation`: `g.CompositeOperation | g.CompositeOperationString` になります (指定値をそのまま反映)。将来的には `g.CompositeOperationString` に一本化します。
       * `g.Label#textAlign`: `g.TextAlign | g.TextAlignString` になります (指定値をそのまま反映)。将来的には `g.TextAlignString` に一本化します。
       * `g.Label#fontWeight`: g.FontWeight | g.FontWeightString になります (指定値をそのまま反映)。将来的には `g.FontWeightString` に一本化します。
       * `g.DynamicFont#fontFamily` の型は変化しません (`g.FontFamily` を含め、引き続き指定値をそのまま反映)。将来的には `string | string[]` に一本化します。

### エンジン開発者への影響

* `g.AssetLoadErrorType` を非推奨に
   * `g.ExceptionFactory.createAssertionError()` の引数の一つでしたが、事実上参照されていませんでした。代わりに `null` を渡してください
   * (そもそも `g.AssetErrorLike` など interface を整理したため、本当はもはや `g.ExceptionFactory` を参照する必要もありません)
* `g.Renderer#setCompositeOperation()` の引数を変更
   * enum `g.CompositeOperation` に代えて `g.CompositeOperationString` (`"source-over" | "destination-in" | ... | "xor"`) が渡されるようになります
   * 対応する変更:
      *  対応する interface `g.RendererLike` も同様に変わります。(利用されていないはずです)
* `g.ResourceFactory#createGlyphFactory()` の引数型を変更
   * 第一引数 `fontFamily` の型から `g.FontFamily` がなくなり `string | string[]` に単純化されます
      * ただしこの string において `"serif" | "sans-serif" | "monospace"` はサポートされる必要があります
   * 第八引数 `fontWeight` の型が `g.FontWeightString` (`"normal" | "bold"`) に変わります
   * 対応する変更:
      * `g.GlyphFactory` のコンストラクタ引数が同様に変更されます
      * プロパティ `g.GlyphFactory#fontFamily`, `fontWeight` が同様に変更されます
      *  対応する interface `g.GlyphFactoryLike` も同様に変わります。(利用されていないはずです)

## 3.0.0-beta.1 - 17 (一部)

機能追加
 * `g.Game#popScene()`で popする数を指定できるように
 * `g.E#localToGlobal()` と `g.E#globalToLocal()` を追加
 * game.json の`defaultLoadingScene` に `compact` を追加
    * `"compact"` を指定した時、ローディング画面が以下のように表示されます。
       * 背景が透過になる
       * プログレスバーが画面中央ではなく右下の方に小さく表示される

### ゲーム開発者への影響

 * `g.Util` の一部関数を移動しました。利用している場合、追従が必要です。
    * `createSpriteFromE()`: `g.SpriteFactory.createSpriteFromE()` を利用してください。
    * `createSpriteFromScene()`: `g.SpriteFactory.createSpriteFromScene()` を利用してください。
    * `asSurface()`: `g.SurfaceUtil.asSurface()` を利用してください。
    * `createMatrix()`: 廃止されました。 `new g.PlainMatrix()` を利用してください。

## 2.6.6

不具合修正
 * `g.DynamicFont` の文字が欠けることがある問題を修正

## 2.6.5

不具合修正
 * クリアされた `g.Scene` のタイマが同タイミングにより実行されてしまう不具合の修正。

## 2.6.4

機能追加
 * `g.Game#joinedPlayerIds` を追加

### ゲーム開発者への影響

 * `g.Game#joinedPlayerIds` を追加
    * ゲーム開発者は、このプロパティを参照することで、joinしているプレイヤーIDの一覧を取得することができます。


## 2.6.3

不具合修正
 * `g.Scene#requestAssets()` を利用するコンテンツで、リセット時に `g.SceenAssetHolder#callHandler()` が例外を起こすことがある問題を修正

## 2.6.2

機能追加
 * `g.Game#isSkipping` を追加

### ゲーム開発者への影響

 * `g.Game#isSkipping` を追加
    * ゲーム開発者は、このプロパティを参照することで、コンテンツのスキップ状態を取得することができます。

## 2.6.1

その他変更
 * TypeScript3.6でコンパイルするように修正

## 2.6.0

不具合修正
* `Game#terminateGame()` を直接呼ぶとエラーが発生する不具合の修正

### エンジン開発者への影響
* `Game#_terminateGame()` を `Game#_abortGame()` にリネームしたので、このメソッドに依存している箇所の修正が必要です。

## 2.5.4

機能追加
 * `g.Object2D#anchorX` と `g.Object2D#anchorY` を追加

### ゲーム開発者への影響

 * `g.Object2D#anchorX` と `g.Object2D#anchorY` を追加
    * ゲーム開発者は、これらのプロパティを指定することで、対象のオブジェクトのアンカーを設定することができます。

## 2.5.3

機能追加
 * `g.Font` をインタフェースから抽象クラスに変更
 * `g.Font#measureText()` を追加

### ゲーム開発者への影響

 * `g.Font` がインタフェースから抽象クラスに変更されました。
    * `g.Font` の実装クラスが存在する場合、 `g.Font` を継承する必要があります。
 * `g.Font#measureText()` が追加されました。
    * `g.Font` の実装クラスが存在する場合、 追加されたメソッドに対する処理を実装する必要があります。

## 2.5.2

機能追加

 * `g.Game#isActiveInstance()` を追加

### ゲーム開発者への影響

 * `g.Game#isActiveInstance()` を追加
    * ゲーム開発者は、このメソッドを使うことで、そのインスタンスがアクティブインスタンスか知ることができます。

## 2.5.1

機能追加
 * `g.Game#random#generate()` を追加

### ゲーム開発者への影響

 * `g.Game#random#generate()` を追加
    * `Math.random()` と同じように呼び出すことができる乱数生成メソッドです。
    * ゲーム開発者は、コンテンツ内で使用している `Math.random()` をこのメソッドに適切に置き換えることで、ロジックに変更を加えずにAkashic対応することができます。

## 2.5.0

その他変更
 * `g.game.getCurrentTime()` の戻り値が整数になるよう変更

## 2.4.15

その他変更
 * `g.E` を継承したクラスで無限ループが発生しないよう変更

## 2.4.14

 * `ImageAsset#hint: ImageAssetHint` `ImageAsset#initialize()` を追加

## 2.4.13

その他変更
 * 早送り中は効果音(g.SoundAudioSystem)をいっさい鳴らさないように修正。

## 2.4.12

* 内部で使用しているテストフレームワークの変更

## 2.4.11

不具合修正
 * 早送り中に `g.AudioAsset#stop` の実行により停止されたオーディオが早送り終了後に再生されてしまう問題を修正。

## 2.4.10

その他変更
 * `g.Logger` の各ログ出力メソッドを非推奨に

### ゲーム開発者への影響

 * `g.Logger` の各ログ出力メソッドを非推奨に
    * `g.Logger#error()` `g.Logger#warn()` `g.Logger#info()` `g.Logger#debug()` を利用している場合、呼び出し箇所を `console` の各メソッドに置き換えるか、 `Game` に紐づいた `Logger#logging.add()` に `console.log()` を出力する関数を登録してください。

### 非推奨機能の変更

 * `g.Logger` の各ログ出力メソッドを非推奨に

### エンジン開発者への影響

 * `g.Logger` の各ログ出力メソッドを非推奨に
    * `game.logger.logging` にハンドラを登録する必要はありません。


## 2.4.9

不具合修正
 * ラベルを右寄せした時に、表示が切れる問題を修正

## 2.4.8

不具合修正
 * `g.Trigger#_handlers` が存在しない場合でも `g.Trigger#fire()` が実行されてしまう問題を修正。

## 2.4.7

不具合修正
 * `g.Util.distanceBetweenAreas()` の処理が誤っていた問題を修正。

## 2.4.6

不具合修正
 * `Font`に `strokeWidth` が設定されていた場合、文字の描画が切れる問題を修正。

## 2.4.5
不具合修正
 * Paneの描画を再利用できない不具合を修正。

## 2.4.4

その他変更
 * Labelの描画タイミングで、`glyph.surface` が存在しない場合の対応
   - `drawImage` 前に、`glyph.isSurfaceValid` にてチェックを行い、破棄されていた場合、改めてglyphの作成を行うよう修正。

## 2.4.3

その他変更
 * DynamicFontのメモリ節減対応
    * `g.DynamicFont` で使用する `g.SurfaceAtlas` の `width`, `height` の初期値を2048から512へ変更。
    * `g.DynamicFont` で使用する `g.SurfaceAtlas` を共有化する機能を追加。

## 2.4.2

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

## 2.4.1

その他変更
 * g.SurfaceEffector#render() で 毎回 g.Surface の生成を行わず、g.Surfaceを持ち回るよう変更

## 2.4.0

機能追加
 * `g.Game#getCurrentTime(): number` を追加
 * 早回し状態を通知する `g.Game#skippingChanged` を追加

### ゲーム開発者への影響

 * 早回し状態を通知する `g.Game#skippingChanged` を追加
    * ゲーム開発者は、この通知を受けて「早回し中は演出を省略する」というようなチューニングを行うことができます。
    * この通知は高度なチューニングのために提供されます。ゲーム開発者がこの値を参照することは必須ではありません。
    * この通知はローカルです。マルチプレイヤーゲームの場合、他プレイヤーとは異なるタイミングで通知されることがあります。
      そのためこの通知でゲームのグローバルな実行状態を破壊しないように注意してください。
      現実的には、ローカルシーンまたはローカルティック補間シーンでのみこの通知を参照すべきです。
 * `g.Game#getCurrentTime(): number` を追加
   * 1970-01-01T00:00:00Zからのミリ秒での経過時刻(ただし現実装では小数点以下の値を含む)を返します。
   * `Date.now()` と異なり、この値は消化されたティックの数から算出される擬似的な時刻です。
   * 試験的な実装です。将来的に仕様を変更する可能性があります。

### エンジン開発者への影響

 * 早回し状態を通知する `g.Game#skippingChanged` を追加
    * 早回し状態の変化をこのTriggerで通知してください。
 * `g.Game#getCurrentTime(): number` を追加
   * エンジンユーザは実装を与える必要があります。

## 2.3.7

不具合修正
 * 明示的に `g.AudioSystem#createPlayer()` を利用し、音声が再生されていない状態でエンジンが `g.Game#_reset()` を行なった場合、環境によって例外が起きる問題を修正
 * 音声を再生せずに呼び出された `g.AudioAsset#stop()` が、環境によって `stopped` をfireする問題を修正

## 2.3.6

不具合修正
 * game.json に `virtualPath` を記述している場合に、 `require()` が失敗することがある問題を修正
 * `g.AudioAsset` の再生中にエンジンが `g.Game#_reset()` を行った場合、 `g.AudioAsset` がその後誤って破棄される問題を修正

## 2.3.5

* ドキュメント生成方法の変更

## 2.3.4

不具合修正
* `g.Renderer#draw()` で `save()` `restore()` するように

### ゲーム開発者への影響

* `g.Renderer#draw()` で `save()` `restore()` するように
  * 長時間ゲームを続行した時に描画位置がずれることがある問題を修正します。

## 2.3.3

* `g.Game#_destroy()` を追加

### エンジン開発者への影響

* `g.Game#_destroy()` を追加
  * エンジン開発者はこのメソッドを呼び出すことで、ゲームを破棄することができます。
  * この追加は v1.12.9 の変更を v2 系に取り込んだものです。

## 2.3.2

機能追加
* `g.E#shaderProgram` ,  `g.EParameterObject#shaderProgram` を追加

## 2.3.1

その他変更
* `g.ShaderProgram#_program` を追加

## 2.3.0

機能追加
* `g.Renderer#isSupportedShaderProgram()` を追加

### エンジン開発者への影響
  * 追加されたメソッドに対する処理を実装する必要があります。

## 2.2.1

機能追加
* `g.ResourceFactory.createTrimmedSurface()` を追加
  * 指定Surfaceを指定した範囲で切り出すことができます。
* g.FrameSpriteにアニメーションをループ再生するかどうか指定するパラメーターの追加

## 2.2.0

機能追加
* シェーダ機能を追加
* `g.Renderer#setShaderProgram()` を追加

### エンジン開発者への影響

* `g.Renderer#setShaderProgram()` を追加
  * 追加されたメソッドに対する処理を実装する必要があります。

## 2.1.2

機能追加
* `g.CacheableE#calculateCacheSize()` を追加

## 2.1.1

不具合修正
 * `moduleMainScripts` のファイルパスを `AssetManager#_liveAssetVirtualPathTable` から参照するように修正

## 2.1.0

機能追加
 * `g.Renderer#_getImageData()` , `g.Renderer#_putImageData()` を追加

### エンジン開発者への影響

 * `g.Renderer#_getImageData()` , `g.Renderer#_putImageData()` を追加
    * 追加された各メソッドに対する処理を実装する必要があります。

## 2.0.3

機能追加
 * `g.Game#addEventFilter()` に省略可能な引数 `handleEmpty` を追加

### エンジン開発者への影響

 * `g.Game#addEventFilter()` に省略可能な引数 `handleEmpty` を追加
    * 実装はこの値が真である場合、イベントがない場合でも定期的にそのイベントフィルタを(空配列で)呼び出す必要があります。
    * この追加は v1.12.6 の変更を v2 系に取り込んだものです。

## 2.0.2

機能追加
 * game.json に `moduleMainScripts` フィールドが存在した場合、そのキーと対応するパスのスクリプトアセットを `require()` 時に評価するように
    * `moduleMainScripts` フィールドが存在しない場合は既存の動作を行います。

## 2.0.1

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
    * 追加された各値に対する処理を実装する必要があります。

## 2.0.0

その他変更
 * v1.12.3での非推奨機能を削除
 * `g.Game#random` を配列でないように変更
 * `g.Scene#setTimeout()`, `setInterval()` の引数順を変更。旧仕様を非推奨に
 * `g.Trigger` のAPIを抜本的に見直し
 * 一部ライブラリ分離済みクラスを削除
 * ビルドツールからgulpを削除

### ゲーム開発者への影響

 * v1.12.3において非推奨だった機能を削除
   * `g.Label#bitmapFont`, `g.LabelParameterObject#bmpFont` を削除
     * 利用している場合、 `g.Label#font` を使うよう変更する必要があります
   * `g.Matrix#multplyPoint`, `g.PlainMatrix#multplyPoint` を削除
     * 利用している場合、 `g.Matrix#multiplyPoint`, `g.PlainMatrix#multiplyPoint` を使うよう変更する必要があります
   * `g.LoadingScene#_onTargetAssetLoad` を削除
     * 利用している場合、 `g.LoadingScene#targetAssetLoaded` を使うよう変更する必要があります
   * 一部クラスのコンストラクタのうち、引数がオブジェクト一つ (`g.〜ParameterObject`) でないものを削除
     * 対象クラス：
        * `g.BitmapFont`
        * `g.CacheableE`
        * `g.Camera2D`
        * `g.DynamicFont`
        * `g.E`
        * `g.FilledRect`
        * `g.FrameSprite`
        * `g.Label`
        * `g.MultiLineLabel`
        * `g.Pane`
        * `g.Scene`
        * `g.Sprite`
        * `g.Tile`
     * 利用している場合、引数がオブジェクト一つのコンストラクタを使うよう変更する必要があります
   * `PureVirtualError` と `ExceptionFactory#createPureVirtualError` を削除
     * `PureVirtualError` を返していた箇所はビルドエラーで検知されるようになります
 * `g.Game#random` を配列でないように変更
   * 型を `g.RandomGenerator[]` から `g.RandomGenerator` に変更しました。
   * 従来 `g.game.random[0]` で参照できた乱数生成器は、 `g.game.random` に置かれるようになりました。
     (`random` は歴史的経緯から配列として定義されていましたが、第0要素以外は利用されていませんでした。)
   * `g.game[0]` を非推奨機能にしました。
 * `g.Scene#setTimeout()`, `g.Scene#setInterval()` の引数順を変更。
   * DOM Level 0(Webブラウザの `window.setTimeout()` など)により近くなるよう、
     引数を `(handler: () => void, milliseconds: number, owner?: any)` の順で与えるよう変更しました。
   * なおDOMとの完全な互換性は意図していません。次の点で異なります。
     * 第三引数以降に引数を与えることはできません(代わりに `this` が指定可能)
     * 関数の代わりに文字列を与えることはできません
   * 従来は `(milliseconds, handler)` または `(millicseconds, owner, handler)` の順でした。これらは非推奨にしました。
 * `g.Trigger` を見直し
   * `g.Scene#update` や `g.E#pointDown` などで利用している `g.Trigger` のAPIを抜本的に見直し、主な操作を `add()`, `remove()`, `removeAll()` に集約しました。
   * 変更が大きいため、詳細は以下別項にまとめます。
   * v1 から移行するゲームでは複数の追従作業が必要です。後述の新旧仕様の対応表もご参考ください。
 * `g.ConditionalChainTrigger` を廃止
   * `g.Trigger` から `chain` 機能そのものを分離したため、 `ConditionalChainTrigger` は `g.ChainTrigger` に一般化されました。
   * 利用している場合、 `g.ChainTrigger` に変更してください。コンストラクタの引数順が変わっている (`this` が後になった) 点以外に違いはありません。
 * 外部ライブラリに切り出されたクラスを削除
   * `g.MultiLineLbel` と `g.Tile` を削除
     * 利用している場合、 [@akashic-extension/akashic-label](https://github.com/akashic-games/akashic-label)
       または [@akashic-extension/akashic-tile](https://github.com/akashic-games/akashic-tile) を利用してください。

`g.Trigger` の新旧記述の対応は概ね次のとおりです:

||旧仕様での記述|新仕様での記述|
|----|----|----|
|関数 `func` を登録|`trigger.handle(func)`|`trigger.add(func)`|
|関数 `func` を登録(`owner` を `this` に利用)|`trigger.handle(owner, func)`|`trigger.add(func, owner)`|
|関数 `f` を名前 `n` で登録|`trigger.handle(f, n)`|`trigger.add({ func: f, name: n })`|
|一度呼び出したら解除される関数 `f` を登録|N/A|`trigger.addOnce(f)`|
|`func` と `owner` の組み合わせが登録済みか確認|`trigger.isHandled(owner, func)`|`trigger.contains(func, owner)`|
|`func` と `owner` の組み合わせの登録を一つ解除|N/A|`trigger.remove(f, owner)`|
|全ハンドラを登録解除|N/A|`trigger.removeAll()`|
|`this` として `o` を使う全ハンドラを解除|`trigger.removeAll(o)`|`trigger.removeAll({ owner: o })`|
|関数 `f` を使う全ハンドラを解除|`trigger.removeAllByHandler(f)`|`trigger.removeAll({ func: f })`|
|ハンドラの有無を確認|`triger.hasHandler()`|`trigger.length > 0`|

#### `Trigger` の仕様変更詳細

##### `add()` を追加

従来の `Trigger#handle()` は、 `owner` (`this` として関数に渡される値) の有無によって引数順が変化する紛らわしい仕様になっていました。
引数順を変更して、常に関数を第一引数に取る `add()` を加えます。
`add()` はオブジェクト引数もとれるようにし、引数順に左右されない記述を可能にします。

##### `remove()` を「登録を一つ解除するメソッド」に変更

従来の `Trigger` には、 `handle()` と対になる「登録を一つ解除するメソッド」が存在しませんでした。
`remove()` は重複して登録されているハンドラを全部解除してしまうもので、 `handle()` と対称ではありませんでした。
"add" と "remove" で名前上対称になったことを鑑み、 `remove()` を「該当する登録を一つ解除する」メソッドに変更します。

##### 「登録を複数解除するメソッド」を `removeAll()` に統一

従来の `Trigger` には、 `removeAllByHandler()`, `removeByName()`, `removeAll()`, `remove()` が存在し、それぞれ登録解除の条件以外はほぼ同じ処理でした。
また「全ハンドラの登録を解除するメソッド」が存在しませんでした。
特に `removeAll()` は「特定のオーナーに紐づくハンドラすべて」が解除対象であり、名前と処理が一致していませんでした。

これらの「該当するハンドラをすべて登録解除するメソッド」を `removeAll()` に一本化します。
このメソッドは、解除の条件としてオブジェクト引数を一つとり、引数がない場合は全ハンドラを解除します。

##### `g.Trigger#isHandled()` 廃止、 `contains()` 追加

`handle` に代えて `add()` を導入した影響で名前を `contains()` に変更します。
引数順も `owner` が後になる(普通の省略引数になる)よう改めます。

##### `addOnce()` を追加

従来、一回だけ実行されるハンドラを明示的に登録することはできませんでした。
ハンドラ関数は自力で登録を解除するか、または `true` を戻り値として返す必要がありました。
`add()` と同じシグネチャの `addOnce()` を追加し、一度だけ実行されるハンドラを登録できるようにします。

### 非推奨機能の変更

 * `g.game.random[0]` を非推奨に
    * 利用している場合、 `g.game.random` を使うよう変更してください。
 * `g.Trigger#handle()` を非推奨に
    * 利用中のユーザは `add()` を使うようにしてください。
 * `g.Scene#setTimeout()`, `g.Scene#setInterval()` のうち、第一引数が `milliseconds: number` であるものを非推奨に。
    * 利用中のユーザは第一引数に関数を指定するものに移行してください。

### エンジン開発者への影響

 * `g.Trigger` のAPI見直し
    * ゲーム開発者同様に追従が必要です。

## 1.12.5

機能追加
 * `g.Asset#onDestroyed` を追加

### ゲーム開発者への影響

 * `g.Asset#onDestroyed` を追加
    * ゲーム開発者は、このトリガーによって、アセットが破棄されるタイミングの通知を受けることができます。

## 1.12.4

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

## 1.12.3

機能追加
 * `g.SceneState.BeforeDestroyed` を追加

その他変更
 * `DynamicFont#fontFamily`, `DynamicFontParameterObject#fontFamily`, `GlyphFactory#fontFamily` の型を`g.FontFamily|string|(g.FontFamily|string)[]`に変更

### ゲーム開発者への影響

 * `DynamicFont#fontFamily`, `DynamicFontParameterObject#fontFamily`, `GlyphFactory#fontFamily` の型を`g.FontFamily|string|(g.FontFamily|string)[]`に変更
    * `g.FontFamily`列挙型の定数以外にフォント名（文字列）でフォントを指定できるようになりました。使用できるフォント名は環境に依存します。配列を渡した時、配列の先頭から順に利用可能なフォントが選ばれます。利用可能なフォントが見つからない時、`g.FontFamily.SansSerif`が利用されます。

## 1.12.2

不具合修正
 * `DynamicFont` 生成時に `hint` が正しく指定できていなかった問題を修正

## 1.12.1

機能追加
 * `g.TimeStampEvent` を追加

その他変更
 * `g.Label` が `g.Font` からグリフを取得できなかった場合、エラーにせず警告の表示に留めるよう変更

### ゲーム開発者への影響

 * `g.Font` に存在しない文字を描画する場合に、エラーではなく警告を表示するように
    * これは後方互換性のための変更です。
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


## 1.12.0

機能追加
 * `GameMainParameterObject` に `globalArgs` を追加。
 * game.json でオーディオアセットに対しヒントを設定可能に
 * game.json でデフォルトのローディングシーンのについて設定可能に

不具合修正
 * Version 1.11.1 で導入した `GameMainParameterObject` の `localArgs` を削除。

文書
 * なし

その他変更
 * オーディオ再生のループフラグを `AudioPlayer` から `AudioAsset` に移動

### ゲーム開発者への影響

 * game.json でオーディオアセットに対しヒントを設定可能に
    * ゲーム開発者はオーディオ機能に対してヒント（パフォーマンスを最適化するための手がかり）を設定できるようになりました。 Akashic Engine は可能であればこの情報に基いてパフォーマンスを最適化します。
 * オーディオ再生のループフラグを `AudioPlayer` から `AudioAsset` に移動
    * `AudioPlayer#_loop` を参照しているコードはコンパイルエラーになります。

### 非推奨機能の変更

 * なし

### エンジン開発者への影響

 * Version 1.11.1 で導入した `GameMainParameterObject` の `localArgs` を削除。
     * Version 1.11.1 で行った追従対応の巻き戻しが必要です。
     * 同等の機能を `args` で行い、`args` の役割を `globalArgs` が担うようになります。
 * game.json でオーディオアセットに対しヒントを記述可能に
    * `AudioAsset` のコンストラクタと `ResourceFactory#createAudioAsset()` の引数に `hint: any` が追加されました。派生クラスはこれを追従する必要があります。
 * オーディオ再生のループフラグを `AudioPlayer` から `AudioAsset` に移動
    * `AudioAsset` のコンストラクタと `ResourceFactory#createAudioAsset()` の引数に `loop: boolean` が追加されました。派生クラスはこれを追従する必要があります。
    * `AudioPlayer` のコンストラクタと `ResourceFactory#createAudioPlayer()` から `loop: boolean` が除かれました。派生クラスはこれを追従する必要があります。
 * game.json でデフォルトのローディングシーンのについて設定可能に
    * game.json の `defaultLoadingScene` に "none" を指定すると、グローバルアセット読み込み中のローディングシーンを含むデフォルトのローディングシーンを非表示にできます。
    * 省略した場合や "default" を指定した場合は今までの挙動と同一となります。

## 1.11.1

機能追加
 * `GameMainParameterObject` に `localArgs` プロパティを追加。

不具合修正
 * DynamicAsset のダウンロードに失敗した場合にゲームを続行できるように修正。

### エンジン開発者への影響
 * `GameMainParameterObject` に `localArgs` プロパティを追加。
    * ゲームを再現可能にするために `args` の永続化が必要な場合があります。

## 1.11.0

機能追加
 * `g.DynamicFont` でフォントウェイトが指定可能に
 * `g.DynamicFontParameterObject` を追加
 * `g.BitmapFontParameterObject` を追加
 * `g.ResourceFactory#createGlyphFactory()` に引数を追加

不具合修正
 * BasePath が異なるアセットが混在している場合に、`require` が正しく動作しないことがある問題を修正。

その他変更
 * TypeScript2.1.6でコンパイルするように修正

### ゲーム開発者への影響

 * `g.DynamicFont` のコンストラクタ引数に `DynamicFontParameterObject` が渡せるように
 * `g.DynamicFont` でフォントウェイトが指定可能に
    * ゲーム開発者は `g.DynamicFontParameterObject#fontWeight` を指定することでフォントウェイトを変更することができます。
 * `g.BitmapFont` のコンストラクタ引数に `BitmapFontParameterObject` が渡せるように
 * TypeScript2.1.6でコンパイルするように修正
    * ゲーム開発者は2.1.6以降のバージョンのTypeScriptを利用する必要があります。

### 非推奨機能の変更

 * `g.DynamicFont` の既存のコンストラクタを非推奨に。
    * 利用中のユーザは `DynamicFontParameterObject` を渡すようにしてください。
 * `g.BitmapFont` の既存のコンストラクタを非推奨に。
    * 利用中のユーザは `BitmapFontParameterObject` を渡すようにしてください。

### 内部実装の変更

 * `g.ResourceFactory#createGlyphFactory()` の引数が追加
    * `g.ResourceFactory` の実装者は引数に応じた `g.GlyphFactory` の実装を返す必要があります。追加される引数は順に次のとおりです。
        * フォントウェイト(`fontWeight: FontWeight`)

### ゲーム開発者への影響

なし

### エンジン開発者への影響

* `GameConfiguration` の `globalScripts` を `asset` に変換する責務をエンジンユーザへ移動しました。
  * `globalScripts` を 通常のアッセット定義に変換したうえで `Game` オブジェクトを作成してください。
* `AssetConfiguration` に `virtualPath?: string` が追加されました。
  * スクリプトアセットで require の解決にこれまではアセットのパスを利用していましたが、
    本PRによりアセットのパスとは別に require 解決用のパスが追加されます。
    `Game` オブジェクト作成前にスクリプトアセットに  `assetBase` を基準とした相対パスを追加してください。

## 1.10.2

その他変更
* ビルド結果にミニファイされたファイルを追加

## 1.10.1


* 初期リリース。
