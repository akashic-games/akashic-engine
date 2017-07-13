
その他変更
 * 非推奨機能を削除

### ゲーム開発者への影響

 * v1.12.3において非推奨だった機能を削除
	* `g.Label#bmpFont`, `g.LabelParameterObject#bmpFont` を削除
		* 利用している場合、 `g.Label#font` を使うよう変更が必要です
	* 一部クラスのコンストラクタのうち、引数がオブジェクト一つ (`g.〜ParameterObject`) でないものを削除
		* 対象クラス： `g.BitmapFont` `g.CacheableE` `g.Camera2D` `g.DynamicFont` `g.E` `g.FilledRect` `g.FrameSprite` `g.Label` `g.MultiLineLabel` `g.Pane` `gScene` `g.Sprite` `g.Tile`
		* 利用している場合、オブジェクト一つをとるコンストラクタを使うよう変更する必要があります
* 実装が不完全だった `g.TextInputMethod` を削除