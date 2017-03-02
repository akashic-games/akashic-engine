
機能追加
 * `game.json`でオーディオアセットに対しヒントを設定可能に

その他変更
 * オーディオ再生のループフラグを`AudioPlayer`から`AudioAsset`に移動

### ゲーム開発者への影響
 * `game.json`でオーディオアセットに対しヒントを設定可能に
    * ゲーム開発者はPDI実装のオーディオ機能に対してヒント（パフォーマンスを最適化するための手がかり）を設定できるようになりました。PDI実装は可能であればこの情報に基いてパフォーマンスを最適化します。詳しくは各PDI実装のドキュメントを参照してください。
 * オーディオ再生のループフラグを`AudioPlayer`から`AudioAsset`に移動
    * `AudioPlayer#_loop`を参照しているコードはコンパイルエラーになります。

### エンジン開発者への影響
 * `game.json`でオーディオアセットに対しヒントを記述可能に
    * `AudioAsset`のコンストラクタと`ResourceFactory#createAudioAsset()`の引数に`hint: any`が追加されました。派生クラスはこれを追従する必要があります。
 * オーディオ再生のループフラグを`AudioPlayer`から`AudioAsset`に移動
    * `AudioAsset`のコンストラクタと`ResourceFactory#createAudioAsset()`の引数に`loop: boolean`が追加されました。派生クラスはこれを追従する必要があります。
    * `AudioPlayer`のコンストラクタと`ResourceFactory#createAudioPlayer()`から`loop: boolean`が除かれました。派生クラスはこれを追従する必要があります。
