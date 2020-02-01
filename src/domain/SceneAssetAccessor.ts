import { ExceptionFactory } from "../commons/ExceptionFactory";
import { AssetLike } from "../interfaces/AssetLike";
import { AudioAssetLike } from "../interfaces/AudioAssetLike";
import { ImageAssetLike } from "../interfaces/ImageAssetLike";
import { ScriptAssetLike } from "../interfaces/ScriptAssetLike";
import { TextAssetLike } from "../interfaces/TextAssetLike";
import { AssetManager } from "./AssetManager";

function patternToFilter(pattern: string): (path: string) => boolean {
	const patternSpecialsTable: { [pat: string]: string } = {
		"\\*": "\\*",
		"\\?": "\\?",
		"*": "[^/]*",
		"?": "[^/]",
		"**/": "(?:(?:[^/]+/)*[^/]+/)?",
		"": ""
	};
	const parserRe = /([^\*\\\?]*)(\\\*|\\\?|\?|\*(?!\*)|\*\*\/|$)/g;
	//                (--- A ----)(------------- B --------------)
	// A: パターンの特殊文字でない文字の塊。そのままマッチさせる(ためにエスケープして正規表現にする)
	// B: パターンの特殊文字一つ(*, ** など)(かそのエスケープ)。patternSpecialsTable で対応する正規表現に変換

	const regExpSpecialsRe = /[\\^$.*+?()[\]{}|]/g;
	function escapeRegExp(s: string): string {
		return s.replace(regExpSpecialsRe, "\\$&");
	}

	let code = "";
	for (let match = parserRe.exec(pattern); match && match[0] !== ""; match = parserRe.exec(pattern)) {
		code += escapeRegExp(match[1]) + patternSpecialsTable[match[2]];
	}
	const re = new RegExp("^" + code + "$");
	return path => re.test(path);
}

export class AssetAccessor {
	private _assetManager: AssetManager;

	constructor(assetManager: AssetManager) {
		this._assetManager = assetManager;
	}

	getImage(path: string): ImageAssetLike {
		return this._get(path, "image") as ImageAssetLike;
	}

	getAudio(path: string): AudioAssetLike {
		return this._get(path, "audio") as AudioAssetLike;
	}

	getScript(path: string): ScriptAssetLike {
		return this._get(path, "script") as ScriptAssetLike;
	}

	getText(path: string): TextAssetLike {
		return this._get(path, "text") as TextAssetLike;
	}

	getTextContent(path: string): string {
		return this.getText(path).data;
	}

	getJSONContent(path: string): any {
		return JSON.parse(this.getTextContent(path));
	}

	getAllImages(patternOrFilter?: string | ((path: string) => boolean)): ImageAssetLike[] {
		return this._getAll(patternOrFilter ?? "**/*", "image") as ImageAssetLike[];
	}

	getAllAudios(patternOrFilter?: string | ((path: string) => boolean)): AudioAssetLike[] {
		return this._getAll(patternOrFilter ?? "**/*", "audio") as AudioAssetLike[];
	}

	getAllScripts(patternOrFilter?: string | ((path: string) => boolean)): ScriptAssetLike[] {
		return this._getAll(patternOrFilter ?? "**/*", "script") as ScriptAssetLike[];
	}

	getAllTexts(patternOrFilter?: string | ((path: string) => boolean)): TextAssetLike[] {
		return this._getAll(patternOrFilter ?? "**/*", "Text") as TextAssetLike[];
	}

	getAllTextContents(patternOrFilter?: string | ((path: string) => boolean)): string[] {
		const assets = this.getAllTexts(patternOrFilter);
		const ret: string[] = [];
		for (let i = 0; i < assets.length; ++i) ret.push(assets[i].data);
		return ret;
	}

	getAllJSONContents(patternOrFilter?: string | ((path: string) => boolean)): any[] {
		const assets = this.getAllTexts(patternOrFilter);
		const ret: string[] = [];
		for (let i = 0; i < assets.length; ++i) ret.push(JSON.parse(assets[i].data));
		return ret;
	}

	getImageById(assetId: string): ImageAssetLike {
		return this._getById(assetId, "image") as ImageAssetLike;
	}

	getAudioById(assetId: string): AudioAssetLike {
		return this._getById(assetId, "audio") as AudioAssetLike;
	}

	getScriptById(assetId: string): ScriptAssetLike {
		return this._getById(assetId, "script") as ScriptAssetLike;
	}

	getTextById(assetId: string): TextAssetLike {
		return this._getById(assetId, "text") as TextAssetLike;
	}

	getTextContentById(assetId: string): string {
		return this.getTextById(assetId).data;
	}

	getJSONContentById(assetId: string): any {
		return JSON.parse(this.getTextById(assetId).data);
	}

	private _get(path: string, type: string): AssetLike {
		if (path[0] !== "/") throw ExceptionFactory.createAssertionError("SceneAssetManager#_get(): path must start with '/'");

		// AssetManager の virtualPath は "/" 始まりではなく "./" なしのコンテンツルート相対なので読み替え
		const vpath = path.slice(1);
		const asset = this._assetManager.peekLiveAssetByVirtualPath(vpath);
		if (!asset || type !== asset.type)
			throw ExceptionFactory.createAssertionError(`SceneAssetManager#_get(): No ${type} asset for ${path}`);
		return asset;
	}

	private _getById(assetId: string, type: string): AssetLike {
		const asset = this._assetManager.peekLiveAssetById(assetId);
		if (!asset || type !== asset.type)
			throw ExceptionFactory.createAssertionError(`SceneAssetManager#_getById(): No ${type} asset for id ${assetId}`);
		return asset;
	}

	private _getAll(patternOrFilter: string | ((path: string) => boolean), type: string | null): AssetLike[] {
		const mgr = this._assetManager;
		const vpaths = mgr.getAllLiveVirtualPaths();
		const filter = typeof patternOrFilter === "string" ? patternToFilter(patternOrFilter) : patternOrFilter;
		let ret: AssetLike[] = [];
		for (let i = 0; i < vpaths.length; ++i) {
			const vpath = vpaths[i];
			const asset = mgr.peekLiveAssetByVirtualPath(vpath);
			if (type && asset.type !== type) continue;
			// AssetManager の virtualPath は "/" 始まりではなく "./" なしのコンテンツルート相対なので読み替え
			const path = "/" + vpath;
			if (filter(path)) ret.push(asset);
		}
		return ret;
	}
}
