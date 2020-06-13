import { ExceptionFactory } from "./ExceptionFactory";
import { Game } from "./Game";

declare const g: { game: Game };

/**
 * g.game` を返すだけの関数。
 * この関数はスクリプトアセットの中でのみ動作し、スクリプトアセットの外の場合はエラーとなる。
 * ゲーム開発者が指定する必要がないパラメータ `game` を省略させるための特殊な関数である。
 */
export function getGameInAssetContext(): Game {
	if (typeof g === "undefined" || !g.game) {
		throw ExceptionFactory.createAssertionError("getGameInAssetContext(): Not in ScriptAsset.");
	}
	return g.game;
}
