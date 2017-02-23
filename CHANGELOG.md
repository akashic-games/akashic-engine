# ChangeLog

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
