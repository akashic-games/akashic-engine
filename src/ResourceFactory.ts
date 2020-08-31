namespace g {
	/**
	 * リソースの生成を行うクラス。
	 *
	 * このクラス (の実装クラス) のインスタンスはエンジンによって生成される。ゲーム開発者が生成する必要はない。
	 * またこのクラスの各種アセット生成メソッドは、エンジンによって暗黙に呼び出されるものである。
	 * 通常ゲーム開発者が呼び出す必要はない。
	 */
	export abstract class ResourceFactory {
		abstract createImageAsset(id: string, assetPath: string, width: number, height: number): ImageAsset;

		abstract createVideoAsset(
			id: string,
			assetPath: string,
			width: number,
			height: number,
			system: VideoSystem,
			loop: boolean,
			useRealSize: boolean
		): VideoAsset;

		abstract createAudioAsset(
			id: string,
			assetPath: string,
			duration: number,
			system: AudioSystem,
			loop: boolean,
			hint: AudioAssetHint
		): AudioAsset;

		abstract createTextAsset(id: string, assetPath: string): TextAsset;

		abstract createAudioPlayer(system: AudioSystem): AudioPlayer;

		abstract createScriptAsset(id: string, assetPath: string): ScriptAsset;

		/**
		 * Surface を作成する。
		 * 与えられたサイズで、ゲーム開発者が利用できる描画領域 (`Surface`) を作成して返す。
		 * 作成された直後のSurfaceは `Renderer#clear` 後の状態と同様であることが保証される。
		 * @param width 幅(ピクセル、整数値)
		 * @param height 高さ(ピクセル、整数値)
		 */
		abstract createSurface(width: number, height: number): Surface;

		/**
		 * GlyphFactory を作成する。
		 *
		 * @param fontFamily フォントファミリ。g.FontFamilyの定義する定数、フォント名、またはそれらの配列で指定する。
		 * @param fontSize フォントサイズ
		 * @param baselineHeight 描画原点からベースラインまでの距離。生成する `g.Glyph` は
		 *                       描画原点からこの値分下がったところにベースラインがあるかのように描かれる。省略された場合、 `fontSize` と同じ値として扱われる
		 * @param fontColor フォントの色。省略された場合、 `"black"` として扱われる
		 * @param strokeWidth ストローク(縁取り線)の幅。省略された場合、 `0` として扱われる
		 * @param strokeColor ストロークの色。省略された場合、 `"black"` として扱われる
		 * @param strokeOnly ストロークのみを描画するか否か。省略された場合、偽として扱われる
		 * @param fontWeight フォントウェイト。省略された場合、 `FontWeight.Normal` として扱われる
		 */
		abstract createGlyphFactory(
			fontFamily: FontFamily | string | (g.FontFamily | string)[],
			fontSize: number,
			baselineHeight?: number,
			fontColor?: string,
			strokeWidth?: number,
			strokeColor?: string,
			strokeOnly?: boolean,
			fontWeight?: FontWeight
		): GlyphFactory;

		createSurfaceAtlas(width: number, height: number): SurfaceAtlas {
			return new SurfaceAtlas(this.createSurface(width, height));
		}

		/**
		 * 指定Surfaceから指定範囲を切り取ったSurfaceを返す。
		 * 範囲を指定しない場合は、指定SurfaceをコピーしたSurfaceを返す。
		 */
		createTrimmedSurface(targetSurface: Surface, targetArea?: CommonArea): Surface {
			const area = targetArea || { x: 0, y: 0, width: targetSurface.width, height: targetSurface.height };
			const surface = this.createSurface(area.width, area.height);
			const renderer = surface.renderer();
			renderer.begin();
			renderer.drawImage(targetSurface, area.x, area.y, area.width, area.height, 0, 0);
			renderer.end();
			return surface;
		}
	}
}
