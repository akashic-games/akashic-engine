/**
 * @akashic/playlog の各 interface に名前を与える const enum 群。
 *
 * playlog.Tick や playlog.Event は、実態としてはただのヘテロ配列である。
 * 各 interface にはインデックスと型名のみがあり、それぞれの値の意味内容は自然言語でしか記述されていない。
 * インデックスのハードコーディングを避けるため、ここで const enum で名前を与えることにする。
 *
 * 本当はこのファイルの内容は playlog に移管すべきだが、
 * playlog に存在しない `Local` のフィールドを使うため akashic-engine 側で扱う。
 *
 */
export module EventIndex {
	export const enum Tick {
		Age = 0,
		Events = 1,
		StorageData = 2
	}

	export const enum TickList {
		From = 0,
		To = 1,
		TicksWithEvents = 2
	}

	export const enum General {
		Code = 0,
		EventFlags = 1,
		PlayerId = 2
	}

	export const enum Join {
		Code = 0,
		EventFlags = 1,
		PlayerId = 2,
		PlayerName = 3,
		StorageData = 4,
		Local = 5
	}

	export const enum Leave {
		Code = 0,
		EventFlags = 1,
		PlayerId = 2,
		Local = 3
	}

	export const enum Timestamp {
		Code = 0,
		EventFlags = 1,
		PlayerId = 2,
		Timestamp = 3,
		Local = 4
	}

	export const enum PlayerInfo {
		Code = 0,
		EventFlags = 1,
		PlayerId = 2,
		PlayerName = 3,
		UserData = 4,
		Local = 5
	}

	export const enum Message {
		Code = 0,
		EventFlags = 1,
		PlayerId = 2,
		Message = 3,
		Local = 4
	}

	export const enum PointDown {
		Code = 0,
		EventFlags = 1,
		PlayerId = 2,
		PointerId = 3,
		X = 4,
		Y = 5,
		EntityId = 6,
		Button = 7,
		Local = 8
	}

	export const enum PointMove {
		Code = 0,
		EventFlags = 1,
		PlayerId = 2,
		PointerId = 3,
		X = 4,
		Y = 5,
		StartDeltaX = 6,
		StartDeltaY = 7,
		PrevDeltaX = 8,
		PrevDeltaY = 9,
		EntityId = 10,
		Button = 11,
		Local = 12
	}

	export const enum PointUp {
		Code = 0,
		EventFlags = 1,
		PlayerId = 2,
		PointerId = 3,
		X = 4,
		Y = 5,
		StartDeltaX = 6,
		StartDeltaY = 7,
		PrevDeltaX = 8,
		PrevDeltaY = 9,
		EntityId = 10,
		Button = 11,
		Local = 12
	}

	export const enum Operation {
		Code = 0,
		EventFlags = 1,
		PlayerId = 2,
		OperationCode = 3,
		OperationData = 4,
		Local = 5
	}
}
