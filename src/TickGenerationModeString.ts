/**
 * シーンにおいて、時間経過の契機 (ティック) をどのように生成するか。
 * ただしローカルティック (ローカルシーン中などの「各プレイヤー間で独立な時間経過処理」) はこのモードの影響を受けない。
 *
 * - `"by-clock"`: 実際の時間経過に従う。
 * - `"manual"`: コンテンツが生成する。
 *
 * `"manual"` を指定した `Scene` においては、 `Game#raiseTick()` を呼び出さない限り時間経過が起きない。
 */
export type TickGenerationModeString = "by-clock" | "manual";
