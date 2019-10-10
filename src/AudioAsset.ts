import { Asset } from "./Asset";
import { AudioAssetHint } from "./GameConfiguration";
import { AudioSystem } from "./AudioSystem";
import { AudioPlayer } from "./AudioPlayer";

/**
 * 音リソースを表すクラス。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
 * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
 * Scene#assets、またはGame#assetsによって取得して利用する。
 *
 * AudioAsset#playを呼び出す事で、その音を再生することが出来る。
 */
export abstract class AudioAsset extends Asset {
	data: any;
	duration: number;
	loop: boolean;
	hint: AudioAssetHint;

	/**
	 * @private
	 */
	_system: AudioSystem;

	/**
	 * @private
	 */
	_lastPlayedPlayer: AudioPlayer;

	constructor(id: string, assetPath: string, duration: number, system: AudioSystem, loop: boolean, hint: AudioAssetHint) {
		super(id, assetPath);
		this.duration = duration;
		this.loop = loop;
		this.hint = hint;
		this._system = system;
		this.data = undefined;
	}

	play(): AudioPlayer {
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
