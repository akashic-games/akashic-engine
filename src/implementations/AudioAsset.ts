import { AudioAssetHint } from "../pdi-types/AudioAssetHint";
import { AudioAssetLike } from "../pdi-types/AudioAssetLike";
import { AudioPlayerLike } from "../pdi-types/AudioPlayerLike";
import { AudioSystemLike } from "../pdi-types/AudioSystemLike";
import { Asset } from "./Asset";

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
	data: any;
	duration: number;
	loop: boolean;
	hint: AudioAssetHint;

	/**
	 * @private
	 */
	_system: AudioSystemLike;

	/**
	 * @private
	 */
	_lastPlayedPlayer: AudioPlayerLike;

	constructor(id: string, assetPath: string, duration: number, system: AudioSystemLike, loop: boolean, hint: AudioAssetHint) {
		super(id, assetPath);
		this.duration = duration;
		this.loop = loop;
		this.hint = hint;
		this._system = system;
		this.data = undefined;
	}

	play(): AudioPlayerLike {
		var player = this._system.createPlayer();
		player.play(this);
		this._lastPlayedPlayer = player;
		return player;
	}

	stop(): void {
		var players = this._system.findPlayers(this);
		for (var i = 0; i < players.length; ++i) players[i].stop();
	}

	inUse(): boolean {
		return this._system.findPlayers(this).length > 0;
	}

	destroy(): void {
		if (this._system) this.stop();

		this.data = undefined;
		this._system = undefined;
		this._lastPlayedPlayer = undefined;
		super.destroy();
	}
}
