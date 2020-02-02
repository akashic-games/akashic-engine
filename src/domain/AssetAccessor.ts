import { AudioAssetLike } from "../interfaces/AudioAssetLike";
import { ImageAssetLike } from "../interfaces/ImageAssetLike";
import { ScriptAssetLike } from "../interfaces/ScriptAssetLike";
import { TextAssetLike } from "../interfaces/TextAssetLike";
import { AssetManager } from "./AssetManager";

/**
 * アセットへのアクセスを提供するアクセッサ群。
 *
 * 実態は `AssetManager` のいくつかのメソッドに対するラッパーである。
 * このクラスを利用することで、パス文字列・アセットID・globから
 * 対応する読み込み済みのアセットまたはその配列を取得できる。
 *
 * 通常、ゲーム開発者はこのクラスのオブジェクトを直接生成する必要はない。
 * `g.Scene#asset` に代入されている値を利用すればよい。
 */
export class AssetAccessor {
	private _assetManager: AssetManager;

	/**
	 * `AssetAccessor` のインスタンスを生成する。
	 *
	 * @param ラップする `AssetManager`
	 */
	constructor(assetManager: AssetManager) {
		this._assetManager = assetManager;
	}

	/**
	 * パスから読み込み済みの画像アセットを取得する。
	 *
	 * パスはgame.jsonのあるディレクトリをルート (`/`) とする、 `/` 区切りの絶対パスでなければならない。
	 * 当該の画像アセットが読み込まれていない場合、エラー。
	 *
	 * @param path 取得する画像アセットのパス
	 */
	getImage(path: string): ImageAssetLike {
		return this._assetManager.peekLiveAssetByAccessorPath(path, "image") as ImageAssetLike;
	}

	/**
	 * パスから読み込み済みのオーディオアセットを取得する。
	 *
	 * パスはgame.jsonのあるディレクトリをルート (`/`) とする、 `/` 区切りの絶対パスでなければならない。
	 * 当該のオーディオアセットが読み込まれていない場合、エラー。
	 *
	 * @param path 取得するオーディオアセットのパス
	 */
	getAudio(path: string): AudioAssetLike {
		return this._assetManager.peekLiveAssetByAccessorPath(path, "audio") as AudioAssetLike;
	}

	/**
	 * パスから読み込み済みのスクリプトアセットを取得する。
	 *
	 * パスはgame.jsonのあるディレクトリをルート (`/`) とする、 `/` 区切りの絶対パスでなければならない。
	 * 当該のスクリプトアセットが読み込まれていない場合、エラー。
	 *
	 * @param path 取得するスクリプトアセットのパス
	 */
	getScript(path: string): ScriptAssetLike {
		return this._assetManager.peekLiveAssetByAccessorPath(path, "script") as ScriptAssetLike;
	}

	/**
	 * パスから読み込み済みのテキストアセットを取得する。
	 *
	 * パスはgame.jsonのあるディレクトリをルート (`/`) とする、 `/` 区切りの絶対パスでなければならない。
	 * 当該のテキストアセットが読み込まれていない場合、エラー。
	 *
	 * @param path 取得するテキストアセットのパス
	 */
	getText(path: string): TextAssetLike {
		return this._assetManager.peekLiveAssetByAccessorPath(path, "text") as TextAssetLike;
	}

	/**
	 * パスから読み込み済みのテキストアセットを取得し、その内容の文字列を返す。
	 *
	 * パスはgame.jsonのあるディレクトリをルート (`/`) とする、 `/` 区切りの絶対パスでなければならない。
	 * 当該のテキストアセットが読み込まれていない場合、エラー。
	 *
	 * @param path 内容の文字列を取得するテキストアセットのパス
	 */
	getTextContent(path: string): string {
		return this.getText(path).data;
	}

	/**
	 * パスから読み込み済みのテキストアセットを取得し、その内容をJSONとしてパースした値を返す。
	 *
	 * パスはgame.jsonのあるディレクトリをルート (`/`) とする、 `/` 区切りの絶対パスでなければならない。
	 * 当該のテキストアセットが読み込まれていない場合、エラー。
	 *
	 * @param path 内容のJSONを取得するテキストアセットのパス
	 */
	getJSONContent(path: string): any {
		return JSON.parse(this.getTextContent(path));
	}

	/**
	 * 与えられたパターンまたはフィルタにマッチするパスを持つ、読み込み済みの全画像アセットを取得する。
	 *
	 * ここでパスはgame.jsonのあるディレクトリをルート (`/`) とする、 `/` 区切りの絶対パスである。
	 *
	 * パターンは、パス文字列、またはパス中に0個以上の `**`, `*`, `?` を含む文字列である。
	 * ここで `**` は0個以上の任意のディレクトリを、 `*` は0個以上の `/` でない文字を、
	 * `?` は1個の `/` でない文字を表す。 (e.g. "/images/monsters??/*.png")
	 *
	 * フィルタは、パスを受け取ってbooleanを返す関数である。
	 * フィルタを与えた場合、読み込み済みの全アセットのうち、フィルタが偽でない値を返したものを返す。
	 *
	 * @param patternOrFilter 取得する画像アセットのパスパターンまたはフィルタ。省略した場合、読み込み済みの全て
	 */
	getAllImages(patternOrFilter?: string | ((path: string) => boolean)): ImageAssetLike[] {
		return this._assetManager.peekAllLiveAssetsByPattern(patternOrFilter ?? "**/*", "image") as ImageAssetLike[];
	}

	/**
	 * 与えられたパターンまたはフィルタにマッチするパスを持つ、読み込み済みの全オーディオアセットを取得する。
	 * 引数の仕様については `AssetAccessor#getAllImages()` の仕様を参照のこと。
	 *
	 * @param patternOrFilter 取得するオーディオアセットのパスパターンまたはフィルタ。省略した場合、読み込み済みの全て
	 */
	getAllAudios(patternOrFilter?: string | ((path: string) => boolean)): AudioAssetLike[] {
		return this._assetManager.peekAllLiveAssetsByPattern(patternOrFilter ?? "**/*", "audio") as AudioAssetLike[];
	}

	/**
	 * 与えられたパターンまたはフィルタにマッチするパスを持つ、読み込み済みの全スクリプトアセットを取得する。
	 * 引数の仕様については `AssetAccessor#getAllImages()` の仕様を参照のこと。
	 *
	 * @param patternOrFilter 取得するスクリプトアセットのパスパターンまたはフィルタ。省略した場合、読み込み済みの全て
	 */
	getAllScripts(patternOrFilter?: string | ((path: string) => boolean)): ScriptAssetLike[] {
		return this._assetManager.peekAllLiveAssetsByPattern(patternOrFilter ?? "**/*", "script") as ScriptAssetLike[];
	}

	/**
	 * 与えられたパターンまたはフィルタにマッチするパスを持つ、読み込み済みの全テキストアセットを取得する。
	 * 引数の仕様については `AssetAccessor#getAllImages()` の仕様を参照のこと。
	 *
	 * @param patternOrFilter 取得するテキストアセットのパスパターンまたはフィルタ。省略した場合、読み込み済みの全て
	 */
	getAllTexts(patternOrFilter?: string | ((path: string) => boolean)): TextAssetLike[] {
		return this._assetManager.peekAllLiveAssetsByPattern(patternOrFilter ?? "**/*", "text") as TextAssetLike[];
	}

	/**
	 * 与えられたパターンまたはフィルタにマッチするパスを持つ、読み込み済みの全テキストアセットの内容を取得する。
	 * 引数の仕様については `AssetAccessor#getAllImages()` の仕様を参照のこと。
	 *
	 * @param patternOrFilter 内容の文字列を取得するテキストアセットのパスパターンまたはフィルタ。省略した場合、読み込み済みの全て
	 */
	getAllTextContents(patternOrFilter?: string | ((path: string) => boolean)): string[] {
		const assets = this.getAllTexts(patternOrFilter);
		const ret: string[] = [];
		for (let i = 0; i < assets.length; ++i) ret.push(assets[i].data);
		return ret;
	}

	/**
	 * 与えられたパターンまたはフィルタにマッチするパスを持つ、読み込み済みの全テキストアセットの内容を取得し、JSONとしてパースして返す。
	 * 引数の仕様については `AssetAccessor#getAllImages()` の仕様を参照のこと。
	 *
	 * @param patternOrFilter 内容のJSONを取得するテキストアセットのパスパターンまたはフィルタ。省略した場合、読み込み済みの全て
	 */
	getAllJSONContents(patternOrFilter?: string | ((path: string) => boolean)): any[] {
		const assets = this.getAllTexts(patternOrFilter);
		const ret: string[] = [];
		for (let i = 0; i < assets.length; ++i) ret.push(JSON.parse(assets[i].data));
		return ret;
	}

	/**
	 * アセットIDから読み込み済みの画像アセットを取得する。
	 * 当該の画像アセットが読み込まれていない場合、エラー。
	 *
	 * @param assetId 取得する画像アセットのID
	 */
	getImageById(assetId: string): ImageAssetLike {
		return this._assetManager.peekLiveAssetById(assetId, "image") as ImageAssetLike;
	}

	/**
	 * アセットIDから読み込み済みのオーディオアセットを取得する。
	 * 当該のオーディオアセットが読み込まれていない場合、エラー。
	 *
	 * @param assetId 取得するオーディオアセットのID
	 */
	getAudioById(assetId: string): AudioAssetLike {
		return this._assetManager.peekLiveAssetById(assetId, "audio") as AudioAssetLike;
	}

	/**
	 * アセットIDから読み込み済みのスクリプトアセットを取得する。
	 * 当該のスクリプトアセットが読み込まれていない場合、エラー。
	 *
	 * @param assetId 取得するスクリプトアセットのID
	 */
	getScriptById(assetId: string): ScriptAssetLike {
		return this._assetManager.peekLiveAssetById(assetId, "script") as ScriptAssetLike;
	}

	/**
	 * アセットIDから読み込み済みのテキストアセットを取得する。
	 * 当該のテキストアセットが読み込まれていない場合、エラー。
	 *
	 * @param assetId 取得するテキストアセットのID
	 */
	getTextById(assetId: string): TextAssetLike {
		return this._assetManager.peekLiveAssetById(assetId, "text") as TextAssetLike;
	}

	/**
	 * アセットIDから読み込み済みのテキストアセットを取得し、その内容の文字列を返す。
	 * 当該のテキストアセットが読み込まれていない場合、エラー。
	 *
	 * @param assetId 内容の文字列を取得するテキストアセットのID
	 */
	getTextContentById(assetId: string): string {
		return this.getTextById(assetId).data;
	}

	/**
	 * アセットIDから読み込み済みのテキストアセットを取得し、その内容をJSONとしてパースして返す。
	 * 当該のテキストアセットが読み込まれていない場合、エラー。
	 *
	 * @param assetId 内容のJSONを取得するテキストアセットのID
	 */
	getJSONContentById(assetId: string): any {
		return JSON.parse(this.getTextById(assetId).data);
	}
}
