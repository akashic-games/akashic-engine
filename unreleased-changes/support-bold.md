
機能追加
 * `g.DynamicFont` でフォントウェイトが指定可能に
 * `g.DynamicFontParameterObject` を追加
 * `g.ResourceFactory#createGlyphFactory()` に引数を追加

### ゲーム開発者への影響
 * `g.DynamicFont` のコンストラクタ引数に `DynamicFontParameterObject` が渡せるように
 * `g.DynamicFont` でフォントウェイトが指定可能に
    * ゲーム開発者は `g.DynamicFontParameterObject#fontWeight` を指定することでフォントウェイトを変更することができます。

### 非推奨機能の変更
 * `g.DynamicFont` の既存のコンストラクタを非推奨に。
    * 利用中のユーザは `DynamicFontParameterObject` を渡すようにしてください。

### 内部実装の変更
 * `g.ResourceFactory#createGlyphFactory()` の引数が追加
    * `g.ResourceFactory` の実装者は引数に応じた `g.GlyphFactory` の実装を返す必要があります。追加される引数は順に次のとおりです。
      * フォントウェイト(`fontWeight: FontWeight`)
