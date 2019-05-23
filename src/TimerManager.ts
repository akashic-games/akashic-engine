import { ExceptionFactory } from "./errors";
import { Timer } from "./Timer";
import { Trigger } from "./Trigger";
import { Destroyable } from "./Destroyable";

/**
 * `Scene#setTimeout` や `Scene#setInterval` の実行単位を表す。
 * ゲーム開発者が本クラスのインスタンスを直接生成することはなく、
 * 本クラスの機能を直接利用することはない。
 */
export class TimerIdentifier implements Destroyable {
	/**
	 * @private
	 */
	_timer: Timer;

	/**
	 * @private
	 */
	_handler: () => void;

	/**
	 * @private
	 */
	_handlerOwner: any;

	/**
	 * @private
	 */
	_fired: (c: TimerIdentifier) => void;

	/**
	 * @private
	 */
	_firedOwner: any;

	constructor(timer: Timer, handler: () => void, handlerOwner: any, fired?: (c: TimerIdentifier) => void, firedOwner?: any) {
		this._timer = timer;
		this._handler = handler;
		this._handlerOwner = handlerOwner;
		this._fired = fired;
		this._firedOwner = firedOwner;
		this._timer.elapsed.add(this._fire, this);
	}

	destroy(): void {
		this._timer.elapsed.remove(this._fire, this);
		this._timer = undefined;
		this._handler = undefined;
		this._handlerOwner = undefined;
		this._fired = undefined;
		this._firedOwner = undefined;
	}

	destroyed(): boolean {
		return this._timer === undefined;
	}

	/**
	 * @private
	 */
	_fire(): void {
		this._handler.call(this._handlerOwner);
		if (this._fired) {
			this._fired.call(this._firedOwner, this);
		}
	}
}

/**
 * Timerを管理する機構を提供する。
 * ゲーム開発者が本クラスを利用する事はない。
 */
export class TimerManager implements Destroyable {
	_timers: Timer[];
	_trigger: Trigger<void>;
	_identifiers: TimerIdentifier[];
	_fps: number;
	_registered: boolean;

	constructor(trigger: Trigger<void>, fps: number) {
		this._timers = [];
		this._trigger = trigger;
		this._identifiers = [];
		this._fps = fps;
		this._registered = false;
	}

	destroy(): void {
		for (var i = 0; i < this._identifiers.length; ++i) {
			this._identifiers[i].destroy();
		}

		for (var i = 0; i < this._timers.length; ++i) {
			this._timers[i].destroy();
		}

		this._timers = undefined;
		this._trigger = undefined;
		this._identifiers = undefined;
		this._fps = undefined;
	}

	destroyed(): boolean {
		return this._timers === undefined;
	}

	/**
	 * 定期間隔で処理を実行するTimerを作成する。
	 * 本Timerはフレーム経過によって動作する疑似タイマーであるため、実時間の影響は受けない
	 * @param interval Timerの実行間隔（ミリ秒）
	 * @returns 作成したTimer
	 */
	createTimer(interval: number): Timer {
		if (! this._registered) {
			this._trigger.add(this._tick, this);
			this._registered = true;
		}

		if (interval < 0)
			throw ExceptionFactory.createAssertionError("TimerManager#createTimer: invalid interval");
		// NODE: intervalが0の場合に、Timer#tick()で無限ループとなるためintervalの最小値を1とする。
		if (interval < 1)
			interval = 1;

		// NOTE: Timerの_scaledElapsedと比較するため、this.fps倍した値を用いる
		// Math.min(1000 / this._fps * this.fps, interval * this._fps);
		var acceptableMargin = Math.min(1000, interval * this._fps);
		for (var i = 0; i < this._timers.length; ++i) {
			if (this._timers[i].interval === interval) {
				if (this._timers[i]._scaledElapsed < acceptableMargin) {
					return this._timers[i];
				}
			}
		}

		var timer = new Timer(interval, this._fps);
		this._timers.push(timer);

		return timer;
	}

	/**
	 * Timerを削除する。
	 * @param timer 削除するTimer
	 */
	deleteTimer(timer: Timer): void {
		if (! timer.canDelete())
			return;

		var index = this._timers.indexOf(timer);
		if (index < 0)
			throw ExceptionFactory.createAssertionError("TimerManager#deleteTimer: can not find timer");

		this._timers.splice(index, 1);
		timer.destroy();

		if (! this._timers.length) {
			if (! this._registered)
				throw ExceptionFactory.createAssertionError("TimerManager#deleteTimer: handler is not handled");
			this._trigger.remove(this._tick, this);
			this._registered = false;
		}
	}

	setTimeout(handler: () => void, milliseconds: number, owner?: any): TimerIdentifier {
		var timer = this.createTimer(milliseconds);
		var identifier = new TimerIdentifier(timer, handler, owner, this._onTimeoutFired, this);
		this._identifiers.push(identifier);
		return identifier;
	}

	clearTimeout(identifier: TimerIdentifier): void {
		this._clear(identifier);
	}

	setInterval(handler: () => void, interval: number, owner?: any): TimerIdentifier {
		var timer = this.createTimer(interval);
		var identifier = new TimerIdentifier(timer, handler, owner);
		this._identifiers.push(identifier);
		return identifier;
	}

	clearInterval(identifier: TimerIdentifier): void {
		this._clear(identifier);
	}

	/**
	 * すべてのTimerを時間経過させる。
	 * @private
	 */
	_tick(): void {
		var timers = this._timers.concat();
		for (var i = 0; i < timers.length; ++i)
			timers[i].tick();
	}

	/**
	 * @private
	 */
	_onTimeoutFired(identifier: TimerIdentifier): void {
		var index = this._identifiers.indexOf(identifier);
		if (index < 0)
			throw ExceptionFactory.createAssertionError("TimerManager#_onTimeoutFired: can not find identifier");

		this._identifiers.splice(index, 1);

		var timer = identifier._timer;
		identifier.destroy();
		this.deleteTimer(timer);
	}

	/**
	 * @private
	 */
	_clear(identifier: TimerIdentifier): void {
		var index = this._identifiers.indexOf(identifier);
		if (index < 0)
			throw ExceptionFactory.createAssertionError("TimerManager#_clear: can not find identifier");

		if (identifier.destroyed())
			throw ExceptionFactory.createAssertionError("TimerManager#_clear: invalid identifier");

		this._identifiers.splice(index, 1);

		var timer = identifier._timer;
		identifier.destroy();
		this.deleteTimer(timer);
	}
}

