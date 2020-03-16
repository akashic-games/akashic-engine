/**
 * アセット読み込み失敗時のエラーの種別。
 *
 * この値はあくまでもエラーメッセージ出力のための補助情報であり、
 * 網羅性・厳密性を追求したものではないことに注意。
 *
 * - "unspecified": 明示されていない(以下のいずれかかもしれないし、そうでないかもしれない)。
 * - "retry-limit-exceeded": エンジンの再試行回数上限設定値を超えた。
 * - "network-error": ネットワークエラー。タイムアウトなど。
 * - "client-error": リクエストに問題があるエラー。HTTP 4XX など。
 * - "server-error": サーバ側のエラー。HTTP 5XX など。
 *
 */
export type AssetLoadErrorTypeString = "unspecified" | "retry-limit-exceeded" | "network-error" | "client-error" | "server-error";
