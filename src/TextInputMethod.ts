namespace g {
	/**
	 * 文字列の入力方法を表すクラス。
	 * TextInputMethod#openによって、ユーザからの文字列入力をゲームで受け取ることが出来る。
	 *
	 * このクラスはobsoleteである。現バージョンのakashic-engineにおいて、このクラスを利用する方法はない。
	 * 将来のバージョンにおいて同等の機能が再実装される場合、これとは異なるインターフェースになる可能性がある。
	 */
	export class TextInputMethod {
		game: Game;

		constructor(game: Game) {
			this.game = game;
		}

		open(defaultText: string, callback: (text: string) => void): void {
			throw ExceptionFactory.createPureVirtualError("TextInputMethod#open");
		}
	}
}
