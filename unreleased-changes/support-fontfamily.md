
その他変更
 * `DynamicFont#fontFamily`, `DynamicFontParameterObject#fontFamily`, `GlyphFactory#fontFamily` の型を`g.FontFamily|string|string[]`に変更

### ゲーム開発者への影響

 * `DynamicFont#fontFamily`, `DynamicFontParameterObject#fontFamily`, `GlyphFactory#fontFamily` の型を`g.FontFamily|string|string[]`に変更
    * `g.FontFamily`列挙型の定数以外にフォントファミリ名（文字列）でフォントを指定できるようになりました。指定したフォントが存在しない時、フォールバックします。フォントファミリ名の配列を渡した時、配列の先頭から順に利用可能なフォントが選ばれます。
