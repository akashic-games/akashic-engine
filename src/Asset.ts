namespace g {
	/**
	 * 各種リソースを表すクラス。
	 * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
	 * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
	 * Scene#assets、またはGame#assetsによって取得して利用する。
	 */
	export class Asset implements Destroyable {
		id: string;
		path: string;
		originalPath: string;

		constructor(id: string, path: string) {
			this.id = id;
			this.originalPath = path;
			this.path = this._assetPathFilter(path);
		}

		destroy(): void {
			this.id = undefined;
			this.originalPath = undefined;
			this.path = undefined;
		}

		destroyed(): boolean {
			return this.id === undefined;
		}

		/**
		 * 現在利用中で解放出来ない `Asset` かどうかを返す。
		 * 戻り値は、利用中である場合真、でなければ偽である。
		 *
		 * 本メソッドは通常 `false` が返るべきである。
		 * 例えば `Sprite` の元画像として使われているケース等では、その `Sprite` によって `Asset` は `Surface` に変換されているべきで、
		 * `Asset` が利用中で解放出来ない状態になっていない事を各プラットフォームで保障する必要がある。
		 *
		 * 唯一、例外的に本メソッドが `true` を返すことがあるのは音楽を表す `Asset` である。
		 * BGM等はシーンをまたいで演奏することもありえる上、
		 * 演奏中のリソースのコピーを常に各プラットフォームに強制するにはコストがかかりすぎるため、
		 * 本メソッドは `true` を返し、適切なタイミングで `Asset` が解放されるよう制御する必要がある。
		 */
		inUse(): boolean {
			return false;
		}

		/**
		 * アセットの読み込みを行う。
		 *
		 * ゲーム開発者がアセット読み込み失敗時の挙動をカスタマイズする際、読み込みを再試行する場合は、
		 * (このメソッドではなく) `AssetLoadFailureInfo#cancelRetry` に真を代入する必要がある。
		 *
		 * @param loader 読み込み結果の通知を受け取るハンドラ
		 */
		_load(loader: AssetLoadHandler): void {
			throw ExceptionFactory.createPureVirtualError("Asset#_load");
		}

		_assetPathFilter(path: string): string {
			// 拡張子の補完・読み替えが必要なassetはこれをオーバーライドすればよい。(対応形式が限定されるaudioなどの場合)
			return path;
		}
	}

	/**
	 * 画像リソースを表すクラス。
	 * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
	 * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
	 * Scene#assets、またはGame#assetsによって取得して利用する。
	 *
	 * width, heightでメタデータとして画像の大きさをとることは出来るが、
	 * ゲーム開発者はそれ以外の情報を本クラスから直接は取得せず、Sprite等に本リソースを指定して利用する。
	 */
	export class ImageAsset extends Asset {
		width: number;
		height: number;

		constructor(id: string, assetPath: string, width: number, height: number) {
			super(id, assetPath);
			this.width = width;
			this.height = height;
		}

		asSurface(): Surface {
			throw ExceptionFactory.createPureVirtualError("ImageAsset#asSurface");
		}
	}

	/**
	 * 動画リソースを表すクラス。
	 * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
	 * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
	 * Scene#assets、またはGame#assetsによって取得して利用する。
	 */
	export class VideoAsset extends ImageAsset {
		/**
		 * 動画の本来の幅。
		 *
		 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更してはならない。
		 */
		realWidth: number;

		/**
		 * 動画の本来の高さ。
		 *
		 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を変更してはならない。
		 */
		realHeight: number;

		_system: VideoSystem;
		_loop: boolean;
		_useRealSize: boolean;

		constructor(id: string, assetPath: string, width: number, height: number, system: VideoSystem, loop: boolean, useRealSize: boolean) {
			super(id, assetPath, width, height);
			this.realWidth = 0;
			this.realHeight = 0;
			this._system = system;
			this._loop = loop;
			this._useRealSize = useRealSize;
		}

		asSurface(): Surface {
			throw ExceptionFactory.createPureVirtualError("VideoAsset#asSurface");
		}

		play(loop?: boolean): VideoPlayer {
			this.getPlayer().play(this);
			return this.getPlayer();
		}

		stop(): void {
			this.getPlayer().stop();
		}

		getPlayer(): VideoPlayer {
			throw ExceptionFactory.createPureVirtualError("VideoAsset#getPlayer");
		}

		destroy(): void {
			this._system = undefined;
			super.destroy();
		}
	}

	/**
	 * 音リソースを表すクラス。
	 * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
	 * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
	 * Scene#assets、またはGame#assetsによって取得して利用する。
	 *
	 * AudioAsset#playを呼び出す事で、その音を再生することが出来る。
	 */
	export class AudioAsset extends Asset {
		data: any;
		duration: number;
		loop: boolean;
		hint: AudioAssetHint;
		_system: AudioSystem;

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
			return player;
		}

		stop(): void {
			var players = this._system.findPlayers(this);
			for (var i = 0; i < players.length; ++i)
				players[i].stop();
		}

		inUse(): boolean {
			return this._system.findPlayers(this).length > 0;
		}

		destroy(): void {
			if (this._system)
				this.stop();

			this.data = undefined;
			this._system = undefined;
			super.destroy();
		}
	}

	/**
	 * 文字列リソースを表すクラス。
	 * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
	 * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
	 * Scene#assets、またはGame#assetsによって取得して利用する。
	 *
	 * TextAsset#dataによって、本リソースが保持する文字列を取得することが出来る。
	 */
	export class TextAsset extends Asset {
		data: string;

		constructor(id: string, assetPath: string) {
			super(id, assetPath);
			this.data = undefined;
		}

		destroy(): void {
			this.data = undefined;
			super.destroy();
		}
	}

	/**
	 * スクリプトリソースを表すクラス。
	 * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
	 * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
	 * Scene#assets、またはGame#assetsによって取得して利用する。
	 *
	 * ScriptAsset#executeによって、本リソースが表すスクリプトを実行し、その結果を受け取る事が出来る。
	 * requireによる参照とは異なり、executeはキャッシュされないため、何度でも呼び出し違う結果を受け取ることが出来る。
	 */
	export class ScriptAsset extends Asset {
		script: string;

		execute(execEnv: ScriptAssetExecuteEnvironment): any {
			throw ExceptionFactory.createPureVirtualError("ScriptAsset#execute");
		}

		destroy(): void {
			this.script = undefined;
			super.destroy();
		}
	}
}
