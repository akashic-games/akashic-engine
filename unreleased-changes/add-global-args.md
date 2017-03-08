
機能追加
 * `GameMainParameterObject` に `globalArgs` を追加。

不具合修正
 * Version 1.11.1 で導入した `GameMainParameterObject` の `localArgs` を削除。

文書
 * なし

その他変更
 * なし

### ゲーム開発者への影響

 * なし

### 非推奨機能の変更

 * なし

### エンジン開発者への影響

 * Version 1.11.1 で導入した `GameMainParameterObject` の `localArgs` を削除。
     * Version 1.11.1 で行った追従対応の巻き戻しが必要です。
     * 同等の機能を `args` で行い、`args` の役割を `globalArgs` が担うようになります。
