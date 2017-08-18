var gulp = require("gulp");
var order = require("gulp-order");
var shell = require("gulp-shell");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var del = require("del");
var tslint = require("gulp-tslint");
var pkg = require("./package.json");
var rename = require("gulp-rename");
var fs = require('fs');
var execSync = require('child_process').execSync;


// test packages
var jasmine = require("gulp-jasmine");
var istanbul = require("gulp-istanbul");
var reporters = require("jasmine-reporters");
var Reporter = require("jasmine-terminal-reporter");

gulp.task('cleanTmp', function(cb) {
	del(["tmp"], cb);
});
gulp.task('cleanLib', function(cb) {
	del(["lib"], cb);
});
gulp.task('clean', ["cleanTmp", "cleanLib"], function(cb) {
});
gulp.task("tsc", ["cleanTmp"], shell.task(["tsc -p ./"]));
gulp.task('_compile', ["tsc"], function(cb) {
	return gulp.src("tmp/tmp.d.ts").pipe(concat("main.d.ts")).pipe(gulp.dest("lib"));
});
gulp.task("compile",["_compile"], function() {
	return gulp.src("tmp/tmp.js")
		.pipe(rename("main.js"))
		.pipe(gulp.dest("lib"));
});
gulp.task("compileDefineForNode", ["compile"], function(cb) {
	gulp.src(["scripts/conf/platforms/node/prefix.d.ts", "lib/main.d.ts", "scripts/conf/platforms/node/suffix.d.ts"])
		.pipe(order([
			"prefix.d.ts",
			"main.d.ts",
			"suffix.d.ts"
		]))
		.pipe(concat("main.node.d.ts"))
		.pipe(gulp.dest("lib"))
		.on("finish", function() {
			cb();
		});
});
gulp.task("compileForNode", ["_compile", "compileDefineForNode"], function() {
	return gulp.src(["scripts/conf/platforms/node/prefix.js", "tmp/tmp.js", "scripts/conf/platforms/node/suffix.js"])
		.pipe(order([
			"prefix.js",
			"tmp.js",
			"suffix.js"
		]))
		.pipe(concat("main.node.js"))
		.pipe(gulp.dest("lib"));
});
gulp.task("minifyForNode", ["compileAll"], function() {
	return gulp.src("lib/main.node.js")
		.pipe(uglify())
		.pipe(rename({extname: ".min.js"}))
		.pipe(gulp.dest("lib"));
});
gulp.task("minifyForBrowser", ["compileAll"], function() {
	return gulp.src("lib/main.js")
		.pipe(uglify())
		.pipe(rename({extname: ".min.js"}))
		.pipe(gulp.dest("lib"));
});
gulp.task("compileAll", ["compile", "compileDefineForNode", "compileForNode"], function() {
});
gulp.task("minify", ["minifyForNode", "minifyForBrowser"], function() {
});
gulp.task("deploy", ["minify"], function() {
});
gulp.task("lint", function() {
	return gulp.src(["src/**/*.ts", "spec/*.ts", "spec/helpers/**/*.ts"])
		.pipe(tslint())
		.pipe(tslint.report());
});
gulp.task("testCompile", ["compileAll"], shell.task("tsc -p ./", {cwd: "spec"}));
gulp.task("test", ["testCompile"], function(cb) {
	var jasmineReporters = [ new Reporter({
			isVerbose: false,
			showColors: true,
			includeStackTrace: true
		}),
		new reporters.JUnitXmlReporter()
	];
	gulp.src(["lib/main.node.js"])
		.pipe(istanbul())
		.pipe(istanbul.hookRequire())
		.on("finish", function() {
			gulp.src("spec/**/*[sS]pec.js")
				.pipe(jasmine({ reporter: jasmineReporters}))
				.on("error", cb)  // istanbul.writeReports()のpipeより先でないとエラーが握りつぶされる (TODO: gulp-plumber 導入検討)
				.pipe(istanbul.writeReports({ reporters: ["text", "cobertura", "lcov"] }))
				.on("end", cb);
		});
});

gulp.task("typedoc", function() {
	fs.rename("node_modules/@types", "node_modules/@types.bak", function (err) {
		if (err && err.code !== "ENOENT") {
			throw err;
		}

		var command = "typedoc --excludePrivate --out ../doc/html/ --includeDeclarations ../lib/main.d.ts ../typings/console.d.ts ../typings/lib.core.d.ts";
		var commandException;
		try {
			execSync(command, {cwd: "lib/"});
		} catch (e) {
			commandException = e;
		}

		fs.rename("node_modules/@types.bak", "node_modules/@types", function (err) {
			if (commandException) {
				throw commandException;
			}
			if (err && err.code !== "ENOENT") {
				throw err;
			}
		});
	});
});

gulp.task("default", ["compileAll"]);
