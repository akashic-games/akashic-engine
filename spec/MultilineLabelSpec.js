describe("test MultiLineLabel", function() {
	var runtime;
	var bmpfont;
	var g = require('../lib/main.node.js');
	var mock = require("./helpers/mock");
	var skeletonRuntime = require("./helpers/skeleton");

	beforeEach(function() {
		jasmine.addMatchers(require("./helpers/customMatchers"));
		runtime = skeletonRuntime();
		var width = 512;
		var height = 350;
		var map = {"37564": {"x": 0, "y": 1}};
		var missingGlyph = {"x": 2, "y": 3};
		bmpfont = new g.BitmapFont(new mock.ResourceFactory().createImageAsset("testId", "testAssetPath", width, height), map, 50, 50, missingGlyph);
	});

	afterEach(function() {
	});

	it("初期化", function() {
		// deprecatedなコンストラクタの動作確認を行う
		runtime.game.suppressedLogLevel = g.LogLevel.Debug;
		var mlabel = new g.MultiLineLabel(runtime.scene, "foo", bmpfont, 10, 200);
		expect(mlabel.text).toBe("foo");
		expect(mlabel.bitmapFont).toBe(bmpfont);
		expect(mlabel.width).toBe(200);
		expect(mlabel.textAlign).toBe(g.TextAlign.Left);
		expect(mlabel.fontSize).toBe(10);
		expect(mlabel.lineGap).toBe(0);
		expect(mlabel.lineBreak).toBe(true);
		expect(mlabel.textColor).toBeUndefined();
		runtime.game.suppressedLogLevel = undefined;
	});

	it("初期化 - ParameterObject", function() {
		var mlabel = new g.MultiLineLabel({
			scene: runtime.scene,
			text: "foo",
			bitmapFont: bmpfont,
			fontSize: 10,
			width: 200,
			lineBreak: false,
			lineGap: 2,
			textAlign: g.TextAlign.Right,
			textColor: "blue"
		});
		expect(mlabel.text).toBe("foo");
		expect(mlabel.bitmapFont).toBe(bmpfont);
		expect(mlabel.width).toBe(200);
		expect(mlabel.textAlign).toBe(g.TextAlign.Right);
		expect(mlabel.fontSize).toBe(10);
		expect(mlabel.lineGap).toBe(2);
		expect(mlabel.lineBreak).toBe(false);
		expect(mlabel.textColor).toBe("blue");
	});

	it("初期化 - fontSize < 0", function() {
		expect( function() {
			new g.MultiLineLabel({
				scene: runtime.scene,
				text: "foo",
				bitmapFont: bmpfont,
				fontSize: -10,
				width: 200,
				lineBreak: false,
				lineGap: 2,
				textAlign: g.TextAlign.Center
			});
		}).toThrowError("AssertionError");
	});

	it("初期化 - lineGap < -1 * fontSize", function() {
		expect( function() {
			new g.MultiLineLabel({
				scene: runtime.scene,
				text: "foo",
				bitmapFont: bmpfont,
				fontSize: 10,
				width: 200,
				lineBreak: false,
				lineGap: -11,
				textAlign: g.TextAlign.Right
			});
		}).toThrowError("AssertionError");
	});

	it("render", function(){
		var mlabel = new g.MultiLineLabel({
			scene: runtime.scene,
			text: "hoge\nfoo\rbar\r\n\nhogehogehogehoge", // line:5 will break (lineWidth: 16 * 10 = 160 > 100)
			bitmapFont: bmpfont,
			fontSize: 10,
			width: 100,
			lineBreak: true,
			lineGap: 2
		});

		var r = new mock.Renderer();
		mlabel.render(r);
		var params = mlabel._renderer.methodCallParamsHistory("drawImage");

		expect(params[0].offsetX).toBe(0);
		expect(params[0].offsetY).toBe(0);
		expect(params[0].width).toBe(40);  // fontSize * fontLength
		expect(params[0].height).toBe(10); // fontSize
		expect(params[0].canvasOffsetX).toBe(0);
		expect(params[0].canvasOffsetY).toBe(0);

		expect(params[1].offsetX).toBe(0);
		expect(params[1].offsetY).toBe(0);
		expect(params[1].width).toBe(30);
		expect(params[1].height).toBe(10);
		expect(params[1].canvasOffsetX).toBe(0);
		expect(params[1].canvasOffsetY).toBe(12); // fontSize + lineGap = 10 + 2

		expect(params[2].offsetX).toBe(0);
		expect(params[2].offsetY).toBe(0);
		expect(params[2].width).toBe(30);
		expect(params[2].height).toBe(10);
		expect(params[2].canvasOffsetX).toBe(0);
		expect(params[2].canvasOffsetY).toBe(24); // (10 + 2) * 2

		// line:4 is empty -> param[3] is line:5
		expect(params[3].offsetX).toBe(0);
		expect(params[3].offsetY).toBe(0);
		expect(params[3].width).toBe(100);
		expect(params[3].height).toBe(10);
		expect(params[3].canvasOffsetX).toBe(0);
		expect(params[3].canvasOffsetY).toBe(48); // (10 + 2) * 4

		expect(params[4].offsetX).toBe(0);
		expect(params[4].offsetY).toBe(0);
		expect(params[4].width).toBe(60);
		expect(params[4].height).toBe(10);
		expect(params[4].canvasOffsetX).toBe(0);
		expect(params[4].canvasOffsetY).toBe(60); // (10 + 2) * 5
	});

	it("render - textColor", function(){
		var mlabel = new g.MultiLineLabel({
			scene: runtime.scene,
			text: "hoge",
			bitmapFont: bmpfont,
			fontSize: 10,
			width: 100,
			lineBreak: true,
			lineGap: 2,
			textColor: "blue"
		});

		var r = new mock.Renderer();
		mlabel.render(r);

		var cr = mlabel._cache.createdRenderer;
		expect(cr.methodCallParamsHistory("setCompositeOperation").length).toBe(1);
		expect(cr.methodCallParamsHistory("setCompositeOperation")[0])
			.toEqual({operation: g.CompositeOperation.SourceAtop});

		expect(cr.methodCallParamsHistory("fillRect").length).toBe(1);
		expect(cr.methodCallParamsHistory("fillRect")[0])
			.toEqual({x: 0, y:0, width: mlabel.width, height: mlabel.height, cssColor: "blue"});
	});

	it("_offsetX", function(){
		var fontSize = 10;
		var mlabel = new g.MultiLineLabel({
			scene: runtime.scene,
			text: "a", // width: 10px
			bitmapFont: bmpfont,
			fontSize: fontSize,
			width: 100,
			lineBreak: true,
			lineGap: 2
		});

		expect(mlabel._offsetX(fontSize)).toBe(0);
		mlabel.textAlign = g.TextAlign.Center;
		expect(mlabel._offsetX(fontSize)).toBe(45); // (100 - 10) / 2
		mlabel.textAlign = g.TextAlign.Right;
		expect(mlabel._offsetX(fontSize)).toBe(90); // 100 - 10
	});

	it("_lineBrokenText", function(){
		var mlabel = new g.MultiLineLabel({
			scene: runtime.scene,
			text: "a\nb\rc\r\n\nddddddddddddddd",
			bitmapFont: bmpfont,
			fontSize: 10,
			width: 100,
			lineBreak: false,
			lineGap: 2
		});

		var line = mlabel._lineBrokenText();
		expect(line.length).toBe(5);
		expect(line[0]).toBe("a");
		expect(line[1]).toBe("b");
		expect(line[2]).toBe("c");
		expect(line[3]).toBe("");
		expect(line[4]).toBe("ddddddddddddddd");

		mlabel.lineBreak = true;
		line = mlabel._lineBrokenText();
		expect(line.length).toBe(6);
		expect(line[0]).toBe("a");
		expect(line[1]).toBe("b");
		expect(line[2]).toBe("c");
		expect(line[3]).toBe("");
		expect(line[4]).toBe("dddddddddd"); // 100 / 10 = 10
		expect(line[5]).toBe("ddddd");
	});

	it("_createLineInfo", function(){
		var mlabel = new g.MultiLineLabel({
			scene: runtime.scene,
			text: "a\nb\rc",
			bitmapFont: bmpfont,
			fontSize: 10,
			width: 100,
			lineBreak: false,
			lineGap: 2
		});

		var lineInfo = mlabel._createLineInfo("aa");
		expect(lineInfo.text).toBe("aa");
		expect(lineInfo.width).toBe(20);
		var drawImageParams = lineInfo.surface.createdRenderer.methodCallParamsHistory("drawImage");
		expect(drawImageParams[0].offsetX).toBe(2); //missingGlyph.x
		expect(drawImageParams[0].offsetY).toBe(3); //missingGlyph.y
		expect(drawImageParams[0].width).toBe(50);
		expect(drawImageParams[0].height).toBe(50);
		expect(drawImageParams[0].canvasOffsetX).toBe(0);
		expect(drawImageParams[0].canvasOffsetY).toBe(0);
		expect(drawImageParams[1].offsetX).toBe(2); //missingGlyph.x
		expect(drawImageParams[1].offsetY).toBe(3); //missingGlyph.y
		expect(drawImageParams[1].width).toBe(50);
		expect(drawImageParams[1].height).toBe(50);
		expect(drawImageParams[1].canvasOffsetX).toBe(0);
		expect(drawImageParams[1].canvasOffsetY).toBe(0);

		var transformParams = lineInfo.surface.createdRenderer.methodCallParamsHistory("transform");
		var matrix = transformParams[0].matrix;
		expect(matrix[0]).toBe(0.2); // glyphScale 10 / 50 = 0.2
		expect(matrix[1]).toBe(0);
		expect(matrix[2]).toBe(0);
		expect(matrix[3]).toBe(0.2); // glyphScale 10 / 50 = 0.2
		expect(matrix[4]).toBe(0);
		expect(matrix[5]).toBe(0);

		var translateParams = lineInfo.surface.createdRenderer.methodCallParamsHistory("translate");
		expect(translateParams[0].x).toBe(10);
		expect(translateParams[0].y).toBe(0);
		expect(translateParams[1].x).toBe(10);
		expect(translateParams[1].y).toBe(0);

		mlabel.fontSize = 0;
		lineInfo = mlabel._createLineInfo("a");
		expect(lineInfo.text).toBe("a");
		expect(lineInfo.width).toBe(0);
		expect(lineInfo.surface).toBeUndefined();
	});

	it("_createLines", function(){
		var mlabel = new g.MultiLineLabel({
			scene: runtime.scene,
			text: "a\nbb\rccc",
			bitmapFont: bmpfont,
			fontSize: 10,
			width: 100,
			lineBreak: false,
			lineGap: 2
		});

		mlabel._createLines();
		var beforeLines = mlabel._lines;
		expect(beforeLines.length).toBe(3);
		mlabel.text = "a\nbbb\rccc\ndd"; // line:2 is changed, line:4 is added
		mlabel._createLines();
		var afterLines = mlabel._lines;
		expect(afterLines.length).toBe(4);
		expect(beforeLines[0]).toBe(afterLines[0]);
		expect(beforeLines[1]).not.toBe(afterLines[1]);
		expect(beforeLines[1].surface.destroyed()).toBe(true);
		expect(beforeLines[2]).toBe(afterLines[2]);
		afterLines.forEach(function(l) {
			expect(l.surface.destroyed()).toBe(false);
		});

		mlabel.text = "a\nbbb\rccc"; // line:4 is removed
		beforeLines = mlabel._lines;
		mlabel._createLines();
		afterLines = mlabel._lines;
		expect(afterLines.length).toBe(3);
		expect(beforeLines[0]).toBe(afterLines[0]);
		expect(beforeLines[1]).toBe(afterLines[1]);
		expect(beforeLines[2]).toBe(afterLines[2]);
		expect(beforeLines[3].surface.destroyed()).toBe(true);
		afterLines.forEach(function(l) {
			expect(l.surface.destroyed()).toBe(false);
		});
	});
});
