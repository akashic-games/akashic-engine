namespace g {
	/**
	 * `Game#audio` の管理クラス。
	 *
	 * 複数の `AudioSystem` に一括で必要な状態設定を行う。
	 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
	 */
	export class AudioSystemManager {
		_game: Game;
		_muted: boolean;
		_playbackRate: number;

		constructor(game: Game) {
			this._game = game;
			this._muted = false;
			this._playbackRate = 1.0;
		}

		_setMuted(muted: boolean): void {
			if (this._muted === muted)
				return;

			this._muted = muted;
			var systems = this._game.audio;
			for (var id in systems) {
				if (!systems.hasOwnProperty(id)) continue;
				systems[id]._setMuted(muted);
			}
		}

		_setPlaybackRate(rate: number): void {
			if (this._playbackRate === rate)
				return;

			this._playbackRate = rate;
			var systems = this._game.audio;
			for (var id in systems) {
				if (!systems.hasOwnProperty(id)) continue;
				systems[id]._setPlaybackRate(rate);
			}
		}
	}
}
