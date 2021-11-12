/**
 * ゲームのエントリポイントに渡される引数。
 */
export interface GameMainParameterObject {
	/**
	 * スナップショット。
	 *
	 * 以前にこのゲームが `Game#reqestSaveSnapshot()` で保存を要求したスナップショットのいずれかが渡される。
	 * 指定された場合、ゲーム開発者はスナップショット生成時のゲームの実行状態を再現せねばならない。
	 * 指定されなかった場合は、新規にゲーム実行を開始せねばならない。
	 * `requestSaveSnapshot()` を利用しないゲームにおいては、常に指定されない。
	 */
	snapshot?: any;

	/**
	 * 起動引数。
	 */
	args?: any;

	/**
	 * グローバル起動引数。
	 * `snapshot` が指定される場合は常に指定されない。
	 * この値は現在使用されていない。
	 */
	globalArgs?: any;
}
