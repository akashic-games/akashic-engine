import { AudioAssetLike } from "../interfaces/AudioAssetLike";
import { PlaingContextLike } from "../interfaces/PlaingContextLike";

import { PlaingContextManagerLike } from "../interfaces/PlaingContextManagerLike";
import { ResourceFactoryLike } from "../interfaces/ResourceFactoryLike";
import { AudioAssetHint } from "../types/AssetConfiguration";
import { Asset } from "./Asset";
import { ContextFactory } from "./PlaingContextFactory";
import { PlayableData } from "./PlayableData";

export interface AudioAssetParameterObject {
	id: string;
	assetPath: string;
	duration: number;
	ctxMgr: PlaingContextManagerLike;
	loop: boolean;
	hint: AudioAssetHint;
	_resourceFactory: ResourceFactoryLike;
}

/**
 * 音リソースを表すクラス。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
 * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
 * Scene#assets、またはGame#assetsによって取得して利用する。
 *
 * AudioAsset#playを呼び出す事で、その音を再生することが出来る。
 */
export abstract class AudioAsset extends Asset implements AudioAssetLike {
	type: "audio" = "audio";
	playableData: PlayableData;

	/**
	 * @private
	 */
	_contextMgr: PlaingContextManagerLike;

	/**
	 * @private
	 */
	_lastPlayedCtx: PlaingContextLike;

	_resourceFactory: ResourceFactoryLike;

	constructor(params: AudioAssetParameterObject) {
		super(params.id, params.assetPath);
		this._contextMgr = params.ctxMgr;
		this._resourceFactory = params._resourceFactory;
		this.playableData = new PlayableData({
			id: params.id,
			duration: params.duration,
			loop: params.loop,
			hint: params.hint,
			volume: 100
		});
		this.playableData.destroyed.add(this.destroy, this);
		this.playableData.playStart.add(this.playStart, this);
		this.playableData.playStop.add(this.stop, this);
	}

	createPlaingContext(): PlaingContextLike {
		return ContextFactory.create(this.id, {
			id: this.id,
			// plaingContextManager: this._contextMgr,
			resourceFactory: this._resourceFactory
		});
	}

	playStart(): void {
		this.play();
	}

	play(): PlaingContextLike {
		const ctx = this.createPlaingContext();
		// this.playableData.play(ctx);
		ctx.play(this.playableData);
		this._lastPlayedCtx = ctx;
		this._contextMgr.addContext(ctx);
		return ctx;
	}

	stop(): void {
		const ctxs = this._contextMgr.findContext(this.playableData);
		for (var i = 0; i < ctxs.length; ++i) ctxs[i].stop();
	}

	inUse(): boolean {
		return this._contextMgr.findContext(this.playableData).length > 0;
	}

	destroy(): void {
		if (this._contextMgr) this.stop();

		this._contextMgr = undefined;
		this._lastPlayedCtx = undefined;
		super.destroy();
	}
}
