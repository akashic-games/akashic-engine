# ChangeLog

## 1.12.17

不具合修正
 * ラベルを右寄せした時に、表示が切れる問題を修正

## 1.12.16

不具合修正
 * 描画先座標が整数でない場合に、 `g.Label` の端が1px表示されないことがある問題を修正
 * `Font`に `strokeWidth` が設定されていた場合、文字の描画が切れる問題を修正。

## 1.12.15

不具合修正
 * 明示的に `g.AudioSystem#createPlayer()` を利用し、音声が再生されていない状態でエンジンが `g.Game#_reset()` を行なった場合、環境によって例外が起きる問題を修正
 * 音声を再生せずに呼び出された `g.AudioAsset#stop()` が、環境によって `stopped` をfireする問題を修正
 * `g.AudioAsset` の再生中に `g.Game#_reset()` されると、 `g.AudioAsset` がその後誤って破棄される問題を修正

(これに前後してv1.13.0がpublishされましたが、作業ミスによるものです。v1.13.xはスキップされます。対応するバージョンのakashic-sandboxはありません。)

## 1.12.14

* doc を publish 対象から除外

## 1.12.13

* 1.12.12が壊れていてインストールできなくなっていた問題を修正

## 1.12.12

* ドキュメント生成方法の変更
* ビルドツールからgulpを削除

## 1.12.11

不具合修正
* `g.Renderer#draw()` で `save()` `restore()` するように

### ゲーム開発者への影響
* `g.Renderer#draw()` で `save()` `restore()` するように
  * 長時間ゲームを続行した時に描画位置がずれることがある問題を修正します。

## 1.12.10

機能追加
 * `g.cacheableE#calculateCacheSize()` を追加

## 1.12.9
 * `g.Game#_destroy()` を追加

### エンジン開発者への影響

 * `g.Game#_destroy()` を追加
    * エンジン開発者はこのメソッドを呼び出すことで、ゲームを破棄することができます。

## 1.12.8
不具合修正
 * `moduleMainScripts` のファイルパスを `AssetManager#_liveAssetVirtualPathTable` から参照するように修正

## 1.12.7

機能追加
 * game.json に `moduleMainScripts` フィールドが存在した場合、そのキーと対応するパスのスクリプトアセットを `require()` 時に評価するように
    * `moduleMainScripts` フィールドが存在しない場合は既存の動作を行います。

## 1.12.6

機能追加
 * `g.Game#addEventFilter()` に省略可能な引数 `handleEmpty` を追加

### エンジン開発者への影響

 * `g.Game#addEventFilter() に省略可能な引数 `handleEmpty` を追加
    * 実装はこの値が真である場合、イベントがない場合でも定期的にそのイベントフィルタを(空配列で)呼び出す必要があります。

## (2.0.0)

(この時点で2.0.0がpublishされています。以降の変更は、原則v2系と互換性を持たせる予定ですが、完全に一致する保証はありません。)

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
