# ChangeLog

## 1.12.3

機能追加
 * `g.SceneState.BeforeDestroyed` を追加

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
