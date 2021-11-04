import { Camera } from "./Camera";
import { E } from "./entities/E";
import { Sprite } from "./entities/Sprite";
import { ExceptionFactory } from "./ExceptionFactory";
import { Scene } from "./Scene";

export class SpriteFactory {
	/**
	 * e の描画内容を持つ Sprite を生成する。
	 * @param scene 作成したSpriteを登録するScene
	 * @param e Sprite化したいE
	 * @param camera 使用カメラ
	 */
	static createSpriteFromE(scene: Scene, e: E, camera?: Camera): Sprite {
		const oldX = e.x;
		const oldY = e.y;
		let x = 0;
		let y = 0;
		let width = e.width;
		let height = e.height;

		const boundingRect = e.calculateBoundingRect();
		if (!boundingRect) {
			throw ExceptionFactory.createAssertionError("SpriteFactory.createSpriteFromE: camera must look e");
		}

		width = boundingRect.right - boundingRect.left;
		height = boundingRect.bottom - boundingRect.top;

		if (boundingRect.left < e.x) x = e.x - boundingRect.left;
		if (boundingRect.top < e.y) y = e.y - boundingRect.top;

		e.moveTo(x, y);
		// 再描画フラグを立てたくないために e._matrix を直接触っている
		if (e._matrix) e._matrix._modified = true;

		const surface = scene.game.resourceFactory.createSurface(Math.ceil(width), Math.ceil(height));
		const renderer = surface.renderer();
		renderer.begin();
		e.render(renderer, camera);
		renderer.end();

		const s = new Sprite({
			scene: scene,
			src: surface,
			width: width,
			height: height
		});
		s.moveTo(boundingRect.left, boundingRect.top);

		e.moveTo(oldX, oldY);
		if (e._matrix) e._matrix._modified = true;

		return s;
	}

	/**
	 * scene の描画内容を持つ Sprite を生成する。
	 * @param toScene 作ったSpriteを登録するScene
	 * @param fromScene Sprite化したいScene
	 * @param camera 使用カメラ
	 */
	static createSpriteFromScene(toScene: Scene, fromScene: Scene, camera?: Camera): Sprite {
		const surface = toScene.game.resourceFactory.createSurface(Math.ceil(fromScene.game.width), Math.ceil(fromScene.game.height));
		const renderer = surface.renderer();
		renderer.begin();

		const children = fromScene.children;
		for (let i = 0; i < children.length; ++i) children[i].render(renderer, camera);

		renderer.end();

		return new Sprite({
			scene: toScene,
			src: surface,
			width: fromScene.game.width,
			height: fromScene.game.height
		});
	}
}
