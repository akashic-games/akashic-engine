/**
 * シーンがローカルティックを受け取る方法。
 *
 * - `"non-local"`: ローカルティックを受け取らない。通常の (非ローカルの) シーン。
 * - `"full-local"`: ローカルティックのみを受け取る。ローカルシーン。
 * - `"interpolate-local"` 消化すべき非ローカルティックがない間、ローカルティックを受け取る。ローカルティック補間シーン。
 */
export type LocalTickModeString = "non-local" | "full-local" | "interpolate-local";
