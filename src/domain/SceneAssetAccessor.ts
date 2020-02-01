import { AudioAssetLike } from "../interfaces/AudioAssetLike";
import { ImageAssetLike } from "../interfaces/ImageAssetLike";
import { ScriptAssetLike } from "../interfaces/ScriptAssetLike";
import { TextAssetLike } from "../interfaces/TextAssetLike";
import { AssetManager } from "./AssetManager";

export class AssetAccessor {
	private _assetManager: AssetManager;

	constructor(assetManager: AssetManager) {
		this._assetManager = assetManager;
	}

	getImage(path: string): ImageAssetLike {
		return this._assetManager.peekLiveAssetByAccessorPath(path, "image") as ImageAssetLike;
	}

	getAudio(path: string): AudioAssetLike {
		return this._assetManager.peekLiveAssetByAccessorPath(path, "audio") as AudioAssetLike;
	}

	getScript(path: string): ScriptAssetLike {
		return this._assetManager.peekLiveAssetByAccessorPath(path, "script") as ScriptAssetLike;
	}

	getText(path: string): TextAssetLike {
		return this._assetManager.peekLiveAssetByAccessorPath(path, "text") as TextAssetLike;
	}

	getTextContent(path: string): string {
		return this.getText(path).data;
	}

	getJSONContent(path: string): any {
		return JSON.parse(this.getTextContent(path));
	}

	getAllImages(patternOrFilter?: string | ((path: string) => boolean)): ImageAssetLike[] {
		return this._assetManager.peekAllLiveAssetsByPattern(patternOrFilter ?? "**/*", "image") as ImageAssetLike[];
	}

	getAllAudios(patternOrFilter?: string | ((path: string) => boolean)): AudioAssetLike[] {
		return this._assetManager.peekAllLiveAssetsByPattern(patternOrFilter ?? "**/*", "audio") as AudioAssetLike[];
	}

	getAllScripts(patternOrFilter?: string | ((path: string) => boolean)): ScriptAssetLike[] {
		return this._assetManager.peekAllLiveAssetsByPattern(patternOrFilter ?? "**/*", "script") as ScriptAssetLike[];
	}

	getAllTexts(patternOrFilter?: string | ((path: string) => boolean)): TextAssetLike[] {
		return this._assetManager.peekAllLiveAssetsByPattern(patternOrFilter ?? "**/*", "Text") as TextAssetLike[];
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
		return this._assetManager.peekLiveAssetById(assetId, "image") as ImageAssetLike;
	}

	getAudioById(assetId: string): AudioAssetLike {
		return this._assetManager.peekLiveAssetById(assetId, "audio") as AudioAssetLike;
	}

	getScriptById(assetId: string): ScriptAssetLike {
		return this._assetManager.peekLiveAssetById(assetId, "script") as ScriptAssetLike;
	}

	getTextById(assetId: string): TextAssetLike {
		return this._assetManager.peekLiveAssetById(assetId, "text") as TextAssetLike;
	}

	getTextContentById(assetId: string): string {
		return this.getTextById(assetId).data;
	}

	getJSONContentById(assetId: string): any {
		return JSON.parse(this.getTextById(assetId).data);
	}
}
