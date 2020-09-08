# ChangeLog

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

### ゲーム開発者への影

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
