
その他変更
 * 非推奨機能を削除

### ゲーム開発者への影響

 * v1.12.3において非推奨だった機能を削除
	* `g.Label#bitmapFont`, `g.LabelParameterObject#bmpFont` を削除
		* 利用している場合、 `g.Label#font` を使うよう変更する必要があります
	* `g.Matrix#multplyPoint`, `g.PlainMatrix#multplyPoint` を削除
		* 利用している場合、 `g.Matrix#multiplyPoint`, `g.PlainMatrix#multiplyPoint` を使うよう変更する必要があります
	* `g.LoadingScene#_onTargetAssetLoad` を削除
		* 利用している場合、 `g.LoadingScene#targetAssetLoaded` を使うよう変更する必要があります
	* 一部クラスのコンストラクタのうち、引数がオブジェクト一つ (`g.〜ParameterObject`) でないものを削除
		* 対象クラス： `g.BitmapFont` `g.CacheableE` `g.Camera2D` `g.DynamicFont` `g.E` `g.FilledRect` `g.FrameSprite` `g.Label` `g.MultiLineLabel` `g.Pane` `gScene` `g.Sprite` `g.Tile`
		* 利用している場合、引数がオブジェクト一つのコンストラクタを使うよう変更する必要があります
	* `PureVirtualError` と `ExceptionFactory#createPureVirtualError` を削除
		* `PureVirtualError` を返していた箇所はビルドエラーで検知されるようになります
* 実装が不完全だった `g.TextInputMethod` を削除
