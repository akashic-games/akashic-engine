import { ExceptionFactory } from "../commons/ExceptionFactory";
import { Game } from "../Game";

declare const g: { game: Game };

/**
 * インスタンスの生成等でパラメータ `game` が省略された場合に、`g.game` を返す。
 * この関数はスクリプトアセットの中でのみ動作し、スクリプトアセットの外の場合はエラーとなる。
 * ゲーム開発者が指定する必要がないパラメータ `game` を省略させるための特殊な関数である。
 */
export function getGameInAssetContext(): Game {
	if (typeof g === "undefined" || !g.game) {
		throw ExceptionFactory.createAssertionError("GameInAssetContexts#getGameInAssetContext: Not in ScriptAsset.");
	}
	return g.game;
}
