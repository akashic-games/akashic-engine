import * as pdi from "@akashic/akashic-pdi";

// akashic-pdi の大半の型名は akashic-engine によって再 export される (g の下につく) が、
// 一部の名前は akashic-engine が上書きするのでこれに含まれない。
// 念のためここでオリジナルの akashic-pdi の型を公開しておく。
// 通常必要になることはない。何らかの事情で避けられない場合を除き、利用すべきではない。
export { pdi };

// このファイルにある変数をエンジン開発者及びエンジンユーザは利用してはならない。
// これらはゲーム開発者がスクリプトアセット内で `g.game` 等を利用する場合の型解決のために利用される。
import { Game } from "./lib/engine/Game";


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
