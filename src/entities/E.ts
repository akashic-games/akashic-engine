import { CommonArea, CommonOffset, CommonRect, Renderer } from "@akashic/pdi-types";
import { ChainTrigger, Trigger } from "@akashic/trigger";
import { Camera } from "../Camera";
import { EntityStateFlags } from "../EntityStateFlags";
import { MessageEvent, PointDownEventBase, PointEventBase, PointMoveEventBase, PointSourceBase, PointUpEventBase } from "../Event";
import { ExceptionFactory } from "../ExceptionFactory";
import { Game } from "../Game";
import { Matrix, PlainMatrix } from "../Matrix";
import { Object2D, Object2DParameterObject } from "../Object2D";
import { Scene } from "../Scene";
import { ShaderProgram } from "../ShaderProgram";
import { Util } from "../Util";

/**
 * ポインティングソースによって対象となるエンティティを表すインターフェース。
 * エンティティとエンティティから見た相対座標によって構成される。
 */
export interface PointSource extends PointSourceBase<E> {}

export type PointEvent = PointEventBase<E>;

/**
 * ポインティング操作の開始を表すイベント。
 */
export class PointDownEvent extends PointDownEventBase<E> {}

/**
 * ポインティング操作の終了を表すイベント。
 * PointDownEvent後にのみ発生する。
 *
 * PointUpEvent#startDeltaによってPointDownEvent時からの移動量が、
 * PointUpEvent#prevDeltaによって直近のPointMoveEventからの移動量が取得出来る。
 * PointUpEvent#pointにはPointDownEvent#pointと同じ値が格納される。
 */
export class PointUpEvent extends PointUpEventBase<E> {}

/**
 * ポインティング操作の移動を表すイベント。
 * PointDownEvent後にのみ発生するため、MouseMove相当のものが本イベントとして発生することはない。
 *
 * PointMoveEvent#startDeltaによってPointDownEvent時からの移動量が、
 * PointMoveEvent#prevDeltaによって直近のPointMoveEventからの移動量が取得出来る。
 * PointMoveEvent#pointにはPointMoveEvent#pointと同じ値が格納される。
 *
 * 本イベントは、プレイヤーがポインティングデバイスを移動していなくても、
 * カメラの移動等視覚的にポイントが変化している場合にも発生する。
 */
export class PointMoveEvent extends PointMoveEventBase<E> {}

/**
 * `E` のコンストラクタに渡すことができるパラメータ。
 * 各メンバの詳細は `E` の同名メンバの説明を参照すること。
 */
export interface EParameterObject extends Object2DParameterObject {
	/**
	 * このエンティティが属するシーン。
	 */
	scene: Scene;

	/**
	 * このエンティティがローカルであるか否か。
	 * コンストラクタで真が指定された時、または属するシーンがローカルシーンまたはローカルティック補間シーンである時、この値は真である。
	 *
	 * この値が真である場合、このエンティティに対する point イベントはこのゲームインスタンスにのみ通知され、
	 * 他の参加者・視聴者には通知されない。また真である場合、 `id` の値の一意性は保証されない。
	 * @default false
	 */
	local?: boolean;

	/**
	 * このエンティティの親
	 * @default undefined
	 */
	parent?: E | Scene;

	/**
	 * このエンティティの全子エンティティ。
	 * @default undefined
	 */
	children?: E[];

	/**
	 * プレイヤーにとって触れられるオブジェクトであるかを表す。
	 * この値が偽である場合、ポインティングイベントの対象にならない。
	 * @default false
	 */
	touchable?: boolean;

	/**
	 * このエンティティの表示状態。
	 * @default false
	 */
	hidden?: boolean;

	/**
	 * このエンティティに割り振られる `E#id` の値。
	 * エンジンが一意の ID を設定するため、通常指定する必要はない。
	 * この値は、スナップショットローダがエンティティを復元する際にのみ指定されるべきである。
	 * @default undefined
	 */
	id?: number;

	/**
	 * ゲーム開発者向けのタグ情報管理コンテナ。
	 * この値はゲームエンジンのロジックからは使用されず、ゲーム開発者は任意の目的に使用してよい。
	 * @default undefined
	 */
	tag?: any;

	/**
	 * このエンティティの描画時に利用されるシェーダプログラム。
	 * このエンティティの `renderer#isSupportedShaderProgram()` が偽を返した場合、
	 * `renderer#setShaderProgram()` は呼ばれないことに注意。
	 *
	 * また `g.FilledRect` やその親エンティティに本値を指定した場合、対象の `g.FilledRect` の描画結果は不定である。
	 * これは実装上の制限に基づく現バージョンの仕様である。
	 *
	 * この値に `undefined` を指定した場合、親のシェーダプログラムを利用する。
	 * この値に `null` を指定した場合、明示的にデフォルトのシェーダプログラムを利用する。
	 *
	 * @default undefined
	 */
	shaderProgram?: ShaderProgram;
}

/**
 * akashic-engineに描画される全てのエンティティを表す基底クラス。
 * 本クラス単体に描画処理にはなく、直接利用する場合はchildrenを利用したコンテナとして程度で利用される。
 */
export class E extends Object2D implements CommonArea {
	/**
	 * このエンティティに割り振られる `Game` 単位で一意のID。(ただし `local` が真である場合を除く)
	 */
	id: number;

	/**
	 * このエンティティがローカルであるか否か。
	 * コンストラクタで真が指定された時、または属するシーンがローカルシーンまたはローカルティック補間シーンである時、この値は真である。
	 *
	 * この値が真である場合、このエンティティに対する point イベントはこのゲームインスタンスにのみ通知され、
	 * 他の参加者・視聴者には通知されない。また真である場合、 `id` の値の一意性は保証されない。
	 *
	 * この値は参照のためにのみ公開されている。ゲーム開発者はこの値を直接変更してはならない。
	 */
	local: boolean;

	/**
	 * このエンティティの全子エンティティ。
	 * 子エンティティが存在しない場合、本フィールドの値は `undefined` または空配列である。
	 */
	children: E[] | undefined;

	/**
	 * 親。
	 */
	parent: E | Scene | undefined;

	/**
	 * このエンティティが属するシーン。
	 */
	// @ts-ignore 外部クラスにより直接書き換えられる
	scene: Scene;

	/**
	 * 様々な状態を表すビットフラグ。
	 */
	state: EntityStateFlags;

	/**
	 * ゲーム開発者向けのタグ情報管理コンテナ。
	 * この値はゲームエンジンのロジックからは使用されず、ゲーム開発者は任意の目的に使用してよい。
	 */
	tag: any;

	/**
	 * このエンティティの描画時に利用されるシェーダプログラム。
	 * `isSupportedShaderProgram()` が偽を返す `g.Rendere` で描画される時、 `g.Renderer#setShaderProgram()` は呼ばれないことに注意。
	 *
	 * また `g.FilledRect` やその親エンティティに本値を指定した場合、対象の `g.FilledRect` の描画結果は不定である。
	 * これは実装上の制限に基づく現バージョンの仕様である。
	 *
	 * この値が `undefined` である場合、親のシェーダプログラムが利用される。
	 * この値が `null` である場合、明示的にデフォルトのシェーダプログラムが利用される。
	 *
	 * この値を変更した場合、 `this.modified()` を呼び出す必要がある。
	 */
	shaderProgram: ShaderProgram | null | undefined;

	/**
	 * 子にtouchableなものが含まれているかどうかを表す。
	 * @private
	 */
	_hasTouchableChildren: boolean;

	/**
	 * グローバル座標系から見た変換行列のキャッシュ。
	 * @private
	 */
	_globalMatrix: Matrix | undefined;

	private _onUpdate: Trigger<void> | undefined;
	private _onMessage: Trigger<MessageEvent> | undefined;
	private _onPointDown: Trigger<PointDownEvent> | undefined;
	private _onPointUp: Trigger<PointUpEvent> | undefined;
	private _onPointMove: Trigger<PointMoveEvent> | undefined;
	private _touchable: boolean;

	/**
	 * 時間経過イベント。本イベントの一度のfireにつき、常に1フレーム分の時間経過が起こる。
	 */
	// Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
	get onUpdate(): Trigger<void> {
		if (!this._onUpdate) this._onUpdate = new ChainTrigger<void>(this.scene.onUpdate);
		return this._onUpdate;
	}
	// onUpdateは代入する必要がないのでsetterを定義しない

	/**
	 * このエンティティのmessageイベント。
	 */
	// Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
	get onMessage(): Trigger<MessageEvent> {
		if (!this._onMessage) this._onMessage = new ChainTrigger<MessageEvent>(this.scene.onMessage);
		return this._onMessage;
	}
	// onMessageは代入する必要がないのでsetterを定義しない

	/**
	 * このエンティティのpoint downイベント。
	 */
	// Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
	get onPointDown(): Trigger<PointDownEvent> {
		if (!this._onPointDown)
			this._onPointDown = new ChainTrigger<PointDownEvent>(this.scene.onPointDownCapture, this._isTargetOperation, this);
		return this._onPointDown;
	}
	// onPointDownは代入する必要がないのでsetterを定義しない

	/**
	 * このエンティティのpoint upイベント。
	 */
	// Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
	get onPointUp(): Trigger<PointUpEvent> {
		if (!this._onPointUp) this._onPointUp = new ChainTrigger<PointUpEvent>(this.scene.onPointUpCapture, this._isTargetOperation, this);
		return this._onPointUp;
	}
	// onPointUpは代入する必要がないのでsetterを定義しない

	/**
	 * このエンティティのpoint moveイベント。
	 */
	// Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
	get onPointMove(): Trigger<PointMoveEvent> {
		if (!this._onPointMove)
			this._onPointMove = new ChainTrigger<PointMoveEvent>(this.scene.onPointMoveCapture, this._isTargetOperation, this);
		return this._onPointMove;
	}
	// onPointMoveは代入する必要がないのでsetterを定義しない

	/**
	 * プレイヤーにとって触れられるオブジェクトであるかを表す。
	 *
	 * この値が偽である場合、ポインティングイベントの対象にならない。
	 * 初期値は `false` である。
	 *
	 * `E` の他のプロパティと異なり、この値の変更後に `this.modified()` を呼び出す必要はない。
	 */
	get touchable(): boolean {
		return this._touchable;
	}
	set touchable(v: boolean) {
		if (this._touchable === v) return;

		this._touchable = v;
		if (v) {
			this._enableTouchPropagation();
		} else {
			this._disableTouchPropagation();
		}
	}

	/**
	 * 時間経過イベント。本イベントの一度のfireにつき、常に1フレーム分の時間経過が起こる。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onUpdate` を利用すること。
	 */
	// Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
	get update(): Trigger<void> {
		return this.onUpdate;
	}
	// updateは代入する必要がないのでsetterを定義しない

	/**
	 * このエンティティのmessageイベント。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onMessage` を利用すること。
	 */
	// Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
	get message(): Trigger<MessageEvent> {
		return this.onMessage;
	}
	// messageは代入する必要がないのでsetterを定義しない

	/**
	 * このエンティティのpoint downイベント。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onPointDown` を利用すること。
	 */
	// Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
	get pointDown(): Trigger<PointDownEvent> {
		return this.onPointDown;
	}
	// pointDownは代入する必要がないのでsetterを定義しない

	/**
	 * このエンティティのpoint upイベント。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onPointUp` を利用すること。
	 */
	// Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
	get pointUp(): Trigger<PointUpEvent> {
		return this.onPointUp;
	}
	// pointUpは代入する必要がないのでsetterを定義しない

	/**
	 * このエンティティのpoint moveイベント。
	 * @deprecated 非推奨である。将来的に削除される。代わりに `onPointMove` を利用すること。
	 */
	// Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
	get pointMove(): Trigger<PointMoveEvent> {
		return this.onPointMove;
	}
	// pointMoveは代入する必要がないのでsetterを定義しない

	/**
	 * 各種パラメータを指定して `E` のインスタンスを生成する。
	 * @param param 初期化に用いるパラメータのオブジェクト
	 */
	constructor(param: EParameterObject) {
		super(param);
		this.children = undefined;
		this.parent = undefined;
		this._touchable = false;
		this.state = EntityStateFlags.None;
		this._hasTouchableChildren = false;
		this._onUpdate = undefined;
		this._onMessage = undefined;
		this._onPointDown = undefined;
		this._onPointMove = undefined;
		this._onPointUp = undefined;
		this.tag = param.tag;
		this.shaderProgram = param.shaderProgram;

		// local は Scene#register() や this.append() の呼び出しよりも先に立てなければならない
		// ローカルシーン・ローカルティック補間シーンのエンティティは強制的に local (ローカルティックが来て他プレイヤーとずれる可能性がある)
		this.local = param.scene.local !== "non-local" || !!param.local;

		if (param.children) {
			for (var i = 0; i < param.children.length; ++i) this.append(param.children[i]);
		}
		if (param.parent) {
			param.parent.append(this);
		}
		if (param.touchable != null) this.touchable = param.touchable;
		if (!!param.hidden) this.hide();

		// set id, scene
		// @ts-ignore NOTE: Game クラスで割り当てられるため、ここでは undefined を許容している
		this.id = param.id;
		param.scene.register(this);
	}

	/**
	 * 自分自身と子孫の内容を描画する。
	 *
	 * このメソッドは、 `Renderer#draw()` からエンティティのツリー構造をトラバースする過程で暗黙に呼び出される。
	 * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
	 * @param renderer 描画先に対するRenderer
	 * @param camera 対象のカメラ。省略された場合、undefined
	 */
	render(renderer: Renderer, camera?: Camera): void {
		this.state &= ~EntityStateFlags.Modified;

		if (this.state & EntityStateFlags.Hidden) return;

		if (this.state & EntityStateFlags.ContextLess) {
			renderer.translate(this.x, this.y);
			var goDown = this.renderSelf(renderer, camera);
			if (goDown && this.children) {
				var children = this.children;
				var len = children.length;
				for (var i = 0; i < len; ++i) children[i].render(renderer, camera);
			}
			renderer.translate(-this.x, -this.y);
			return;
		}

		renderer.save();
		renderer.setTransform(this.getGlobalMatrix()._matrix);

		if (this.opacity !== 1) renderer.opacity(this.opacity);

		let op = this.compositeOperation;
		if (op !== undefined) {
			renderer.setCompositeOperation(typeof op === "string" ? op : Util.compositeOperationStringTable[op]);
		}

		if (this.shaderProgram !== undefined && renderer.isSupportedShaderProgram()) renderer.setShaderProgram(this.shaderProgram);

		var goDown = this.renderSelf(renderer, camera);

		if (goDown && this.children) {
			// Note: concatしていないのでunsafeだが、render中に配列の中身が変わる事はない前提とする
			var children = this.children;
			for (var i = 0; i < children.length; ++i) children[i].render(renderer, camera);
		}
		renderer.restore();
	}

	/**
	 * 自分自身の内容を描画する。
	 *
	 * このメソッドは、 `Renderer#draw()` からエンティティのツリー構造をトラバースする過程で暗黙に呼び出される。
	 * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
	 *
	 * 戻り値は、このエンティティの子孫の描画をスキップすべきであれば偽、でなければ真である。
	 * (この値は、子孫の描画方法をカスタマイズする一部のサブクラスにおいて、通常の描画パスをスキップするために用いられる)
	 *
	 * @param renderer 描画先に対するRenderer
	 * @param camera 対象のカメラ
	 */
	renderSelf(_renderer: Renderer, _camera?: Camera): boolean {
		// nothing to do
		return true;
	}

	/**
	 * このエンティティが属する `Game` を返す。
	 */
	game(): Game {
		return this.scene.game;
	}

	/**
	 * 子を追加する。
	 *
	 * @param e 子エンティティとして追加するエンティティ
	 */
	append(e: E): void {
		this.insertBefore(e, undefined);
	}

	/**
	 * 子を挿入する。
	 *
	 * `target` が`this` の子でない場合、`append(e)` と同じ動作となる。
	 *
	 * @param e 子エンティティとして追加するエンティティ
	 * @param target 挿入位置にある子エンティティ
	 */
	insertBefore(e: E, target: E | undefined): void {
		if (e.parent) e.remove();
		if (!this.children) this.children = [];

		e.parent = this;

		var index = -1;
		if (target !== undefined && (index = this.children.indexOf(target)) > -1) {
			this.children.splice(index, 0, e);
		} else {
			this.children.push(e);
		}
		if (e._touchable || e._hasTouchableChildren) {
			this._hasTouchableChildren = true;
			this._enableTouchPropagation();
		}
		this.modified(true);
	}

	/**
	 * 子を削除する。
	 *
	 * `e` が `this` の子でない場合、 `AssertionError` がthrowされる。
	 * `e === undefined` であり親がない場合、 `AssertionError` がthrowされる。
	 *
	 * @param e 削除する子エンティティ。省略された場合、自身を親から削除する
	 */
	remove(e?: E): void {
		if (e === undefined) {
			this.parent!.remove(this);
			return;
		}

		var index = this.children ? this.children.indexOf(e) : -1;
		if (index < 0) throw ExceptionFactory.createAssertionError("E#remove: invalid child");
		this.children![index].parent = undefined;
		this.children!.splice(index, 1);

		if (e._touchable || e._hasTouchableChildren) {
			if (!this._findTouchableChildren(this)) {
				this._hasTouchableChildren = false;
				this._disableTouchPropagation();
			}
		}
		this.modified(true);
	}

	/**
	 * このエンティティを破棄する。
	 *
	 * 親がある場合、親からは `remove()` される。
	 * 子孫を持っている場合、子孫も破棄される。
	 */
	destroy(): void {
		if (this.parent) this.remove();

		if (this.children) {
			for (var i = this.children.length - 1; i >= 0; --i) {
				this.children[i].destroy();
			}
			if (this.children.length !== 0)
				throw ExceptionFactory.createAssertionError("E#destroy: can not destroy all children, " + this.children.length);

			this.children = undefined;
		}

		// この解放はstringとforeachを使って書きたいが、minifyする時は.アクセスの方がいいのでやむを得ない
		if (this._onUpdate) {
			this._onUpdate.destroy();
			this._onUpdate = undefined;
		}
		if (this._onMessage) {
			this._onMessage.destroy();
			this._onMessage = undefined;
		}
		if (this._onPointDown) {
			this._onPointDown.destroy();
			this._onPointDown = undefined;
		}
		if (this._onPointMove) {
			this._onPointMove.destroy();
			this._onPointMove = undefined;
		}
		if (this._onPointUp) {
			this._onPointUp.destroy();
			this._onPointUp = undefined;
		}

		this.scene.unregister(this);
	}

	/**
	 * このエンティティが破棄済みであるかを返す。
	 */
	destroyed(): boolean {
		return this.scene === undefined;
	}

	/**
	 * このエンティティに対する変更をエンジンに通知する。
	 *
	 * このメソッドの呼び出し後、 `this` に対する変更が各 `Renderer` の描画に反映される。
	 * ただし逆は真ではない。すなわち、再描画は他の要因によって行われることもある。
	 * ゲーム開発者は、このメソッドを呼び出していないことをもって再描画が行われていないことを仮定してはならない。
	 *
	 * 本メソッドは、このオブジェクトの `Object2D` 由来のプロパティ (`x`, `y`, `angle` など) を変更した場合にも呼びだす必要がある。
	 * 本メソッドは、描画キャッシュの無効化処理を含まない。描画キャッシュを持つエンティティは、このメソッドとは別に `invalidate()` を提供している。
	 * 描画キャッシュの無効化も必要な場合は、このメソッドではなくそちらを呼び出す必要がある。
	 * @param isBubbling 通常ゲーム開発者が指定する必要はない。この変更通知が、(このエンティティ自身のみならず)子孫の変更の通知を含む場合、真を渡さなければならない。省略された場合、偽。
	 */
	modified(_isBubbling?: boolean): void {
		// matrixの用途は描画に限らない(e.g. E#findPointSourceByPoint)ので、Modifiedフラグと無関係にクリアする必要がある
		if (this._matrix) this._matrix._modified = true;
		if (this._globalMatrix) this._globalMatrix._modified = true;

		if (
			this.angle ||
			this.scaleX !== 1 ||
			this.scaleY !== 1 ||
			this.anchorX !== 0 ||
			this.anchorY !== 0 ||
			this.opacity !== 1 ||
			this.compositeOperation !== undefined ||
			this.shaderProgram !== undefined
		) {
			this.state &= ~EntityStateFlags.ContextLess;
		} else {
			this.state |= EntityStateFlags.ContextLess;
		}

		if (this.state & EntityStateFlags.Modified) return;
		this.state |= EntityStateFlags.Modified;

		if (this.parent) this.parent.modified(true);
	}

	/**
	 * このメソッドは、 `E#findPointSourceByPoint()` 内で子孫の探索をスキップすべきか判断するために呼ばれる。
	 * 通常、子孫の描画方法をカスタマイズする一部のサブクラスにおいて、与えられた座標に対する子孫の探索を制御する場合に利用する。
	 * ゲーム開発者がこのメソッドを呼び出す必要はない。
	 *
	 * 戻り値は、子孫の探索をスキップすべきであれば偽、でなければ真である。
	 *
	 * @param point このエンティティ（`this`）の位置を基準とした相対座標
	 */
	shouldFindChildrenByPoint(_point: CommonOffset): boolean {
		// nothing to do
		return true;
	}

	/**
	 * 自身と自身の子孫の中で、その座標に反応する `PointSource` を返す。
	 *
	 * 戻り値は、対象が見つかった場合、 `target` に見つかったエンティティを持つ `PointSource` である。
	 * 対象が見つからなかった場合、 `undefined` である。戻り値が `undefined` でない場合、その `target` プロパティは次を満たす:
	 * - このエンティティ(`this`) またはその子孫である
	 * - `E#touchable` が真である
	 *
	 * @param point 対象の座標
	 * @param m `this` に適用する変換行列。省略された場合、単位行列
	 * @param force touchable指定を無視する場合真を指定する。省略された場合、偽
	 */
	findPointSourceByPoint(point: CommonOffset, m?: Matrix, force?: boolean): PointSource | undefined {
		if (this.state & EntityStateFlags.Hidden) return undefined;

		m = m ? m.multiplyNew(this.getMatrix()) : this.getMatrix().clone();
		const p = m.multiplyInverseForPoint(point);

		if (this._hasTouchableChildren || (force && this.children && this.children.length)) {
			const children = this.children!;
			if (this.shouldFindChildrenByPoint(p)) {
				for (let i = children.length - 1; i >= 0; --i) {
					const child = children[i];
					if (force || child._touchable || child._hasTouchableChildren) {
						const target = child.findPointSourceByPoint(point, m, force);
						if (target) return target;
					}
				}
			}
		}

		if (!(force || this._touchable)) return undefined;

		// 逆行列をポイントにかけた結果がEにヒットしているかを計算
		if (0 <= p.x && this.width > p.x && 0 <= p.y && this.height > p.y) {
			return {
				target: this,
				point: p
			};
		}

		return undefined;
	}

	/**
	 * このEが表示状態であるかどうかを返す。
	 */
	visible(): boolean {
		return (this.state & EntityStateFlags.Hidden) !== EntityStateFlags.Hidden;
	}

	/**
	 * このEを表示状態にする。
	 *
	 * `this.hide()` によって非表示状態にされたエンティティを表示状態に戻す。
	 * 生成直後のエンティティは表示状態であり、 `hide()` を呼び出さない限りこのメソッドを呼び出す必要はない。
	 */
	show(): void {
		if (!(this.state & EntityStateFlags.Hidden)) return;
		this.state &= ~EntityStateFlags.Hidden;
		if (this.parent) {
			this.parent.modified(true);
		}
	}

	/**
	 * このEを非表示状態にする。
	 *
	 * `this.show()` が呼ばれるまでの間、このエンティティは各 `Renderer` によって描画されない。
	 * また `Game#findPointSource()` で返されることもなくなる。
	 * `this#pointDown`, `pointMove`, `pointUp` なども通常の方法ではfireされなくなる。
	 */
	hide(): void {
		if (this.state & EntityStateFlags.Hidden) return;
		this.state |= EntityStateFlags.Hidden;
		if (this.parent) {
			this.parent.modified(true);
		}
	}

	/**
	 * このEの包含矩形を計算する。
	 */
	calculateBoundingRect(): CommonRect | undefined {
		return this._calculateBoundingRect(undefined);
	}

	/**
	 * このEの位置を基準とした相対座標をゲームの左上端を基準とした座標に変換する。
	 * @param offset Eの位置を基準とした相対座標
	 */
	localToGlobal(offset: CommonOffset): CommonOffset {
		let point = offset;
		for (let entity: E | Scene | undefined = this; entity instanceof E; entity = entity.parent) {
			point = entity.getMatrix().multiplyPoint(point);
		}
		return point;
	}

	/**
	 * ゲームの左上端を基準とした座標をこのEの位置を基準とした相対座標に変換する。
	 * @param offset ゲームの左上端を基準とした座標
	 */
	globalToLocal(offset: CommonOffset): CommonOffset {
		let matrix: Matrix = new PlainMatrix();
		for (let entity: E | Scene | undefined = this; entity instanceof E; entity = entity.parent) {
			matrix.multiplyLeft(entity.getMatrix());
		}
		return matrix.multiplyInverseForPoint(offset);
	}

	getGlobalMatrix(): Matrix {
		if (!this._globalMatrix) {
			this._globalMatrix = new PlainMatrix();
		} else if (!this._needsCalculateGlobalMatrix()) {
			return this._globalMatrix;
		}
		this._updateGlobalMatrix();
		this._globalMatrix._modified = false;
		return this._globalMatrix;
	}

	_updateGlobalMatrix(): void {
		const matrix = this._globalMatrix!;
		matrix.reset();
		for (let entity: E | Scene | undefined = this; entity instanceof E; entity = entity.parent) {
			matrix.multiplyLeft(entity.getMatrix());
		}
	}

	_needsCalculateGlobalMatrix(): boolean {
		for (let entity: E | Scene | undefined = this; entity instanceof E; entity = entity.parent) {
			if (entity._globalMatrix && entity._globalMatrix._modified) {
				return true;
			}
		}
		return false;
	}

	/**
	 * このエンティティの座標系を、指定された祖先エンティティ (またはシーン) の座標系に変換する行列を求める。
	 *
	 * 指定されたエンティティが、このエンティティの祖先でない時、その値は無視される。
	 * 指定されたシーンが、このエンティティの属するシーン出ない時、その値は無視される。
	 *
	 * @param target 座標系の変換先エンティティまたはシーン。省略した場合、このエンティティの属するシーン(グローバル座標系への変換行列になる)
	 * @private
	 */
	_calculateMatrixTo(target?: E | Scene): Matrix {
		let matrix: Matrix = new PlainMatrix();
		for (let entity: E | Scene | undefined = this; entity instanceof E && entity !== target; entity = entity.parent) {
			matrix.multiplyLeft(entity.getMatrix());
		}
		return matrix;
	}

	/**
	 * このエンティティと与えられたエンティティの共通祖先のうち、もっとも子孫側にあるものを探す。
	 * 共通祖先がない場合、 `undefined` を返す。
	 *
	 * @param target このエンティティとの共通祖先を探すエンティティ
	 * @private
	 */
	_findLowestCommonAncestorWith(target: E): E | Scene | undefined {
		const seen: { [id: number]: boolean } = {};
		for (let p: E | Scene | undefined = this; p instanceof E; p = p.parent) {
			seen[p.id] = true;
		}
		let ret: E | Scene | undefined = target;
		for (; ret instanceof E; ret = ret.parent) {
			if (seen.hasOwnProperty(ret.id)) break;
		}
		return ret;
	}

	/**
	 * @private
	 */
	_calculateBoundingRect(m?: Matrix): CommonRect | undefined {
		var matrix = this.getMatrix();
		if (m) {
			matrix = m.multiplyNew(matrix);
		}

		if (!this.visible()) {
			return undefined;
		}

		var thisBoundingRect: CommonRect = {
			left: 0,
			right: this.width,
			top: 0,
			bottom: this.height
		};

		var targetCoordinates: CommonOffset[] = [
			{ x: thisBoundingRect.left, y: thisBoundingRect.top },
			{ x: thisBoundingRect.left, y: thisBoundingRect.bottom },
			{ x: thisBoundingRect.right, y: thisBoundingRect.top },
			{ x: thisBoundingRect.right, y: thisBoundingRect.bottom }
		];

		var convertedPoint = matrix.multiplyPoint(targetCoordinates[0]);
		var result: CommonRect = {
			left: convertedPoint.x,
			right: convertedPoint.x,
			top: convertedPoint.y,
			bottom: convertedPoint.y
		};
		for (var i = 1; i < targetCoordinates.length; ++i) {
			convertedPoint = matrix.multiplyPoint(targetCoordinates[i]);
			if (result.left > convertedPoint.x) result.left = convertedPoint.x;
			if (result.right < convertedPoint.x) result.right = convertedPoint.x;
			if (result.top > convertedPoint.y) result.top = convertedPoint.y;
			if (result.bottom < convertedPoint.y) result.bottom = convertedPoint.y;
		}

		if (this.children !== undefined) {
			for (var i = 0; i < this.children.length; ++i) {
				var nowResult = this.children[i]._calculateBoundingRect(matrix);
				if (nowResult) {
					if (result.left > nowResult.left) result.left = nowResult.left;
					if (result.right < nowResult.right) result.right = nowResult.right;
					if (result.top > nowResult.top) result.top = nowResult.top;
					if (result.bottom < nowResult.bottom) result.bottom = nowResult.bottom;
				}
			}
		}
		return result;
	}

	/**
	 * @private
	 */
	_enableTouchPropagation(): void {
		var p: E = this.parent as E;
		while (p instanceof E && !p._hasTouchableChildren) {
			p._hasTouchableChildren = true;
			p = p.parent as E;
		}
	}

	/**
	 * @private
	 */
	_disableTouchPropagation(): void {
		var p: E = this.parent as E;
		while (p instanceof E && p._hasTouchableChildren) {
			if (this._findTouchableChildren(p)) break;
			p._hasTouchableChildren = false;
			p = p.parent as E;
		}
	}

	/**
	 * @private
	 */
	_isTargetOperation(e: PointEvent): boolean {
		if (this.state & EntityStateFlags.Hidden) return false;
		if (e instanceof PointEventBase) return this._touchable && e.target === this;

		return false;
	}

	private _findTouchableChildren(e: E): E | undefined {
		if (e.children) {
			for (var i = 0; i < e.children.length; ++i) {
				if (e.children[i].touchable) return e.children[i];
				var tmp = this._findTouchableChildren(e.children[i]);
				if (tmp) return tmp;
			}
		}
		return undefined;
	}
}
