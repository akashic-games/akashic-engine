// このファイルにある定義をエンジン開発者及びエンジンユーザは利用してはならない。
// これらはスクリプトアセット実行環境におけるグローバル変数 `g` の型を定義したものである。

export * from "./index.common";

// FIXME: ここで `Game` クラスを import するとモジュール間循環参照が発生してしまうため、ランタイム動作時に `Game` クラスを直接与える。
export var Game: any;
export function setGame(gameClass: any): void {
	Game = gameClass;
}
