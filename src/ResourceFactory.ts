namespace g {
	/**
	 * リソースの生成を行うクラス。
	 *
	 * このクラス (の実装クラス) のインスタンスはエンジンによって生成される。ゲーム開発者が生成する必要はない。
	 * またこのクラスの各種アセット生成メソッドは、エンジンによって暗黙に呼び出されるものである。
	 * 通常ゲーム開発者が呼び出す必要はない。
	 */
	export class ResourceFactory {
		createImageAsset(id: string, assetPath: string, width: number, height: number): ImageAsset {
			throw ExceptionFactory.createPureVirtualError("ResourceFactory#createImageAsset");
		}

		createVideoAsset(id: string, assetPath: string, width: number, height: number, system: VideoSystem,
		                 loop: boolean, useRealSize: boolean): VideoAsset {
			throw ExceptionFactory.createPureVirtualError("ResourceFactory#createVideoAsset");
		}

		createAudioAsset(id: string, assetPath: string, duration: number, system: AudioSystem): AudioAsset {
			throw ExceptionFactory.createPureVirtualError("ResourceFactory#createAudioAsset");
		}

		createTextAsset(id: string, assetPath: string): TextAsset {
			throw ExceptionFactory.createPureVirtualError("ResourceFactory#createTextAsset");
		}

		createAudioPlayer(system: AudioSystem, loop?: boolean): AudioPlayer {
			throw ExceptionFactory.createPureVirtualError("ResourceFactory#createAudioPlayer");
		}

		createScriptAsset(id: string, assetPath: string): ScriptAsset {
			throw ExceptionFactory.createPureVirtualError("ResourceFactory#createScriptAsset");
		}

		/**
		 * Surface を作成する。
		 * 与えられたサイズで、ゲーム開発者が利用できる描画領域 (`Surface`) を作成して返す。
		 * 作成された直後のSurfaceは `Renderer#clear` 後の状態と同様であることが保証される。
		 * @param width 幅(ピクセル、整数値)
		 * @param height 高さ(ピクセル、整数値)
		 */
		createSurface(width: number, height: number): Surface {
			throw ExceptionFactory.createPureVirtualError("ResourceFactory#createSurface");
		}

		/**
		 * GlyphFactory を作成する。
		 *
		 * @param fontFamily フォントファミリ
		 * @param fontSize フォントサイズ
		 * @param baselineHeight 描画原点からベースラインまでの距離。生成する `g.Glyph` は
		 *                       描画原点からこの値分下がったところにベースラインがあるかのように描かれる。省略された場合、 `fontSize` と同じ値として扱われる
		 * @param fontColor フォントの色。省略された場合、 `"black"` として扱われる
		 * @param strokeWidth ストローク(縁取り線)の幅。省略された場合、 `0` として扱われる
		 * @param strokeColor ストロークの色。省略された場合、 `"black"` として扱われる
		 * @param strokeOnly ストロークのみを描画するか否か。省略された場合、偽として扱われる
		 * @param fontWeight フォントウェイト。省略された場合、 `FontWeight.Normal` として扱われる
		 */
		createGlyphFactory(fontFamily: FontFamily, fontSize: number, baselineHeight?: number,
		                   fontColor?: string, strokeWidth?: number, strokeColor?: string, strokeOnly?: boolean,
		                   fontWeight?: FontWeight): GlyphFactory {
			throw ExceptionFactory.createPureVirtualError("ResourceFactory#createGlphFactory");
		}

		createSurfaceAtlas(width: number, height: number): SurfaceAtlas {
			return new SurfaceAtlas(this.createSurface(width, height));
		}
	}
}
