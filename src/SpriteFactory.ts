import { Scene } from "./Scene";
import { EParameterObject, E } from "./E";
import { Renderer } from "./Renderer";
import { Camera } from "./Camera";
import { Sprite } from "./Sprite";
import { ExceptionFactory } from "./errors";

export class SpriteFactory {
	/**
	 * e の描画内容を持つ Sprite を生成する。
	 * @param scene 作成したSpriteを登録するScene
	 * @param e Sprite化したいE
	 * @param camera 使用カメラ
	 */
	static createSpriteFromE(scene: Scene, e: E, camera?: Camera): Sprite {
		var oldX = e.x;
		var oldY = e.y;
		var x = 0;
		var y = 0;
		var width = e.width;
		var height = e.height;

		var boundingRect = e.calculateBoundingRect(camera);
		if (!boundingRect) {
			throw ExceptionFactory.createAssertionError("SpriteFactory.createSpriteFromE: camera must look e");
		}

		width = boundingRect.right - boundingRect.left;
		height = boundingRect.bottom - boundingRect.top;

		if (boundingRect.left < e.x)
			x = e.x - boundingRect.left;
		if (boundingRect.top < e.y)
			y = e.y - boundingRect.top;

		e.moveTo(x, y);
		// 再描画フラグを立てたくないために e._matrix を直接触っている
		if (e._matrix)
			e._matrix._modified = true;

		var surface = scene.game.resourceFactory.createSurface(Math.ceil(width), Math.ceil(height));
		var renderer = surface.renderer();
		renderer.begin();
		e.render(renderer, camera);
		renderer.end();

		var s = new Sprite({
			scene: scene,
			src: surface,
			width: width,
			height: height
		});
		s.moveTo(boundingRect.left, boundingRect.top);

		e.moveTo(oldX, oldY);
		if (e._matrix)
			e._matrix._modified = true;

		return s;
	}

	/**
	 * scene の描画内容を持つ Sprite を生成する。
	 * @param toScene 作ったSpriteを登録するScene
	 * @param fromScene Sprite化したいScene
	 * @param camera 使用カメラ
	 */
	static createSpriteFromScene(toScene: Scene, fromScene: Scene, camera?: Camera): Sprite {
		var surface = toScene.game.resourceFactory.createSurface(Math.ceil(fromScene.game.width), Math.ceil(fromScene.game.height));
		var renderer = surface.renderer();
		renderer.begin();

		var children = fromScene.children;
		for (var i = 0; i < children.length; ++i)
			children[i].render(renderer, camera);

		renderer.end();

		return new Sprite({
			scene: toScene,
			src: surface,
			width: fromScene.game.width,
			height: fromScene.game.height
		});
	}
}
