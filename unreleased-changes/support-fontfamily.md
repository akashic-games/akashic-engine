
その他変更
 * `DynamicFont#fontFamily`, `DynamicFontParameterObject#fontFamily`, `GlyphFactory#fontFamily` の型を`g.FontFamily|string|(g.FontFamily|string)[]`に変更

### ゲーム開発者への影響

 * `DynamicFont#fontFamily`, `DynamicFontParameterObject#fontFamily`, `GlyphFactory#fontFamily` の型を`g.FontFamily|string|(g.FontFamily|string)[]`に変更
    * `g.FontFamily`列挙型の定数以外にフォント名（文字列）でフォントを指定できるようになりました。使用できるフォント名は環境に依存します。配列を渡した時、配列の先頭から順に利用可能なフォントが選ばれます。利用可能なフォントが見つからない時、`g.FontFamily.SansSerif`が利用されます。
