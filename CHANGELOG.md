# ChangeLog

## 1.11.0

不具合修正
 * BasePath が異なるアセットが混在している場合に、`require` が正しく動作しないことがある問題を修正。

### ゲーム開発者への影響
なし

### エンジン開発者への影響
* `GameConfiguration` の `globalScripts` を `asset` に変換する責務をエンジンユーザへ移動しました。
  * `globalScripts` を 通常のアッセット定義に変換したうえで `Game` オブジェクトを作成してください。
* `AssetConfiguration` に `virtualPath?: string` が追加されました。
  * スクリプトアセットで require の解決にこれまではアセットのパスを利用していましたが、
    本PRによりアセットのパスとは別に require 解決用のパスが追加されます。
    `Game` オブジェクト作成前にスクリプトアセットに  `assetBase` を基準とした相対パスを追加してください。

## 1.10.1

* 初期リリース。

