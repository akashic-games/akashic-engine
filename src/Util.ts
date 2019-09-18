namespace g {
	/**
	 * ユーティリティ。
	 */
	export module Util {
		/**
		 * 2点間(P1..P2)の距離(pixel)を返す。
		 * @param {number} p1x P1-X
		 * @param {number} p1y P1-Y
		 * @param {number} p2x P2-X
		 * @param {number} p2y P2-Y
		 */
		export function distance(p1x: number, p1y: number, p2x: number, p2y: number): number {
			return Math.sqrt(Math.pow(p1x - p2x, 2) + Math.pow(p1y - p2y, 2));
		}

		/**
		 * 2点間(P1..P2)の距離(pixel)を返す。
		 * @param {CommonOffset} p1 座標1
		 * @param {CommonOffset} p2 座標2
		 */
		export function distanceBetweenOffsets(p1: CommonOffset, p2: CommonOffset): number {
			return Util.distance(p1.x, p1.y, p2.x, p2.y);
		}

		/**
		 * 2つの矩形の中心座標(P1..P2)間の距離(pixel)を返す。
		 * @param {CommonArea} p1 矩形1
		 * @param {CommonArea} p2 矩形2
		 */
		export function distanceBetweenAreas(p1: CommonArea, p2: CommonArea): number {
			return Util.distance(
				p1.x + p1.width / 2, p1.y + p1.height / 2,
				p2.x + p2.width / 2, p2.y + p2.height / 2);
		}

		/**
		 * 単位行列を生成して返す。
		 * 戻り値は、実行しているプラットフォームにとって最適な単位行列型であることが保証される。
		 */
		export function createMatrix(): Matrix;

		/**
		 * 2D objectの一般的な値を基に新しい変換行列を生成して返す。
		 * 戻り値は、実行しているプラットフォームにとって最適な変換行列型であることが保証される。
		 * @param width 対象の横幅
		 * @param height 対象の縦幅
		 * @param scaleX 対象の横方向への拡大率
		 * @param scaleY 対象の縦方向への拡大率
		 * @param angle 角度。単位はdegreeでありradianではない
		 * @param anchorX アンカーのx座標。対象の横幅に対する割合を0～1の値域で指定する。
		 * @param anchorY アンカーのy座標。対象の縦幅に対する割合を0～1の値域で指定する。
		 */
		export function createMatrix(width: number, height: number,
		                             scaleX: number, scaleY: number, angle: number, anchorX?: number, anchorY?: number): Matrix;

		// Note: オーバーロードされているのでjsdoc省略
		export function createMatrix(width?: number, height?: number,
		                             scaleX?: number, scaleY?: number, angle?: number, anchorX?: number, anchorY?: number): Matrix {
			// Note: asm.js対応環境ではasm.js対応のMatrixを生成するなどしたいため、オーバーヘッドを許容する
			if (width === undefined)
				return new PlainMatrix();

			return new PlainMatrix(width, height, scaleX, scaleY, angle, anchorX, anchorY);
		}

		/**
		 * e の描画内容を持つ Sprite を生成する。
		 * @param scene 作成したSpriteを登録するScene
		 * @param e Sprite化したいE
		 * @param camera 使用カメラ
		 */
		export function createSpriteFromE(scene: Scene, e: E, camera?: Camera): Sprite {
			var oldX = e.x;
			var oldY = e.y;
			var x = 0;
			var y = 0;
			var width = e.width;
			var height = e.height;

			var boundingRect = e.calculateBoundingRect(camera);
			if (!boundingRect) {
				throw ExceptionFactory.createAssertionError("Util#createSpriteFromE: camera must look e");
			}

			width = boundingRect.right - boundingRect.left;
			height = boundingRect.bottom - boundingRect.top;

			if (boundingRect.left < e.x)
				x = e.x - boundingRect.left;
			if (boundingRect.top < e.y)
				y = e.y - boundingRect.top;

			e.moveTo(x, y);
			// 再描画フラグを立てたくないために e._matrix を直接触っている
			if (e._matrix)
				e._matrix._modified = true;

			var surface = scene.game.resourceFactory.createSurface(Math.ceil(width), Math.ceil(height));
			var renderer = surface.renderer();
			renderer.begin();
			e.render(renderer, camera);
			renderer.end();

			var s = new Sprite({
				scene: scene,
				src: surface,
				width: width,
				height: height
			});
			s.moveTo(boundingRect.left, boundingRect.top);

			e.moveTo(oldX, oldY);
			if (e._matrix)
				e._matrix._modified = true;

			return s;
		}

		/**
		 * scene の描画内容を持つ Sprite を生成する。
		 * @param toScene 作ったSpriteを登録するScene
		 * @param fromScene Sprite化したいScene
		 * @param camera 使用カメラ
		 */
		export function createSpriteFromScene(toScene: Scene, fromScene: Scene, camera?: Camera): Sprite {
			var surface = toScene.game.resourceFactory.createSurface(Math.ceil(fromScene.game.width), Math.ceil(fromScene.game.height));
			var renderer = surface.renderer();
			renderer.begin();

			var children = fromScene.children;
			for (var i = 0; i < children.length; ++i)
				children[i].render(renderer, camera);

			renderer.end();

			return new Sprite({
				scene: toScene,
				src: surface,
				width: fromScene.game.width,
				height: fromScene.game.height
			});
		}

		/**
		 * 引数 `src` が `undefined` または `Surface` でそのまま返す。
		 * そうでなくかつ `ImageAsset` であれば `Surface` に変換して返す。
		 *
		 * @param src
		 */
		export function asSurface(src: Asset|Surface): Surface {
			// Note: TypeScriptのtype guardを活用するため、あえて1つのifで1つの型しか判定していない
			if (!src)
				return <Surface>src;
			if (src instanceof Surface)
				return src;
			if (src instanceof ImageAsset)
				return src.asSurface();
			throw ExceptionFactory.createTypeMismatchError("Util#asSurface", "ImageAsset|Surface", src);
		}

		/**
		 * 与えられたパス文字列がファイルパスであると仮定して、対応するアセットを探す。
		 * 見つかった場合そのアセットを、そうでない場合 `undefined` を返す。
		 * 通常、ゲーム開発者がファイルパスを扱うことはなく、このメソッドを呼び出す必要はない。
		 *
		 * @param resolvedPath パス文字列
		 * @param liveAssetPathTable パス文字列のプロパティに対応するアセットを格納したオブジェクト
		 */
		export function findAssetByPathAsFile(resolvedPath: string, liveAssetPathTable: {[key: string]: Asset}): Asset {
			if (liveAssetPathTable.hasOwnProperty(resolvedPath))
				return liveAssetPathTable[resolvedPath];
			if (liveAssetPathTable.hasOwnProperty(resolvedPath + ".js"))
				return liveAssetPathTable[resolvedPath + ".js"];
			return undefined;
		}

		/**
		 * 与えられたパス文字列がディレクトリパスであると仮定して、対応するアセットを探す。
		 * 見つかった場合そのアセットを、そうでない場合 `undefined` を返す。
		 * 通常、ゲーム開発者がファイルパスを扱うことはなく、このメソッドを呼び出す必要はない。
		 * ディレクトリ内に package.json が存在する場合、package.json 自体もアセットとして
		 * `liveAssetPathTable` から参照可能でなければならないことに注意。
		 *
		 * @param resolvedPath パス文字列
		 * @param liveAssetPathTable パス文字列のプロパティに対応するアセットを格納したオブジェクト
		 */
		export function findAssetByPathAsDirectory(resolvedPath: string, liveAssetPathTable: {[key: string]: Asset}): Asset {
			var path: string;
			path = resolvedPath + "/package.json";
			if (liveAssetPathTable.hasOwnProperty(path) && liveAssetPathTable[path] instanceof TextAsset) {
				var pkg = JSON.parse((<TextAsset>liveAssetPathTable[path]).data);
				if (pkg && typeof pkg.main === "string") {
					var asset = Util.findAssetByPathAsFile(PathUtil.resolvePath(resolvedPath, pkg.main), liveAssetPathTable);
					if (asset)
						return asset;
				}
			}
			path = resolvedPath + "/index.js";
			if (liveAssetPathTable.hasOwnProperty(path))
				return liveAssetPathTable[path];
			return undefined;
		}

		/**
		 * idx文字目の文字のchar codeを返す。
		 *
		 * これはString#charCodeAt()と次の点で異なる。
		 * - idx文字目が上位サロゲートの時これを16bit左シフトし、idx+1文字目の下位サロゲートと論理和をとった値を返す。
		 * - idx文字目が下位サロゲートの時nullを返す。
		 *
		 * @param str 文字を取り出される文字列
		 * @param idx 取り出される文字の位置
		 */
		// highly based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
		export function charCodeAt(str: string, idx: number): number {
			var code = str.charCodeAt(idx);

			if (0xD800 <= code && code <= 0xDBFF) {
				var hi = code;
				var low = str.charCodeAt(idx + 1);
				return (hi << 16) | low;
			}

			if (0xDC00 <= code && code <= 0xDFFF) { // Low surrogate
				return null;
			}

			return code;
		}

		export type AnimatingHandler = {
			/**
			 * @private
			 */
			_onAnimatingStarted: () => void,

			/**
			 * @private
			 */
			_onAnimatingStopped: () => void
		};

		/**
		 * サーフェスのアニメーティングイベントへのハンドラ登録。
		 *
		 * これはゲームエンジンが利用するものであり、ゲーム開発者が呼び出す必要はない。
		 *
		 * @param animatingHandler アニメーティングハンドラ
		 * @param surface サーフェス
		 */
		export function setupAnimatingHandler(animatingHandler: AnimatingHandler,
		                                      surface: Surface): void {
			if (surface.isDynamic) {
				surface.animatingStarted.add(animatingHandler._onAnimatingStarted, animatingHandler);
				surface.animatingStopped.add(animatingHandler._onAnimatingStopped, animatingHandler);
				if (surface.isPlaying()) {
					animatingHandler._onAnimatingStarted();
				}
			}
		}

		/**
		 * アニメーティングハンドラを別のサーフェスへ移動する。
		 *
		 * これはゲームエンジンが利用するものであり、ゲーム開発者が呼び出す必要はない。
		 *
		 * @param animatingHandler アニメーティングハンドラ
		 * @param beforeSurface ハンドラ登録を解除するサーフェス
		 * @param afterSurface ハンドラを登録するサーフェス
		 */
		export function migrateAnimatingHandler(animatingHandler: AnimatingHandler, beforeSurface: Surface, afterSurface: Surface): void {
			animatingHandler._onAnimatingStopped();

			if (!beforeSurface.destroyed() && beforeSurface.isDynamic) {
				beforeSurface.animatingStarted.remove(animatingHandler._onAnimatingStarted, animatingHandler);
				beforeSurface.animatingStopped.remove(animatingHandler._onAnimatingStopped, animatingHandler);
			}

			if (afterSurface.isDynamic) {
				afterSurface.animatingStarted.add(animatingHandler._onAnimatingStarted, animatingHandler);
				afterSurface.animatingStopped.add(animatingHandler._onAnimatingStopped, animatingHandler);
				if (afterSurface.isPlaying()) {
					animatingHandler._onAnimatingStarted();
				}
			}
		}
	}
}
