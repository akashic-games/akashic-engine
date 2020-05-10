import { VideoSystemLike } from "../pdi-types/VideoSystemLike";

/**
 * 将来 VideoPlayerインスタンスの一元管理（ボリューム設定などAudioSystemと似た役割）
 * を担うインターフェース。VideoAssetはVideoSystemを持つという体裁を整えるために(中身が空であるが)
 * 定義されている。
 * TODO: 実装
 */
export class VideoSystem implements VideoSystemLike {}
