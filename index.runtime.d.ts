// このファイルにある変数をエンジン開発者及びエンジンユーザは利用してはならない。
// これらはゲーム開発者がスクリプトアセット内で `g.game` 等を利用する場合の型解決のために利用される。
import { Game } from "./lib/Game";

/**
 * スクリプトアセット内で参照可能な値。
 * スクリプトアセットを実行した `Game` を表す。
 */
export const game: Game;

/**
 * スクリプトアセット内で参照可能な値。
 * スクリプトアセットのファイルパスのうち、ディレクトリ部分を表す。
 */
export const dirname: string;

/**
 * スクリプトアセット内で参照可能な値。
 * スクリプトアセットのファイルパス。
 */
export const filename: string;

export * from "./lib";

export as namespace g;
