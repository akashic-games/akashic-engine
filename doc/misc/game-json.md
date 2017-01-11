# game.jsonの仕様

## <a name="これは"></a> これは

Akashic のゲームにおいてメタ情報などを取り扱う設定ファイル、game.json の仕様をまとめます。
対象バージョンは akashic-engine@0.6.1 以降です。

## <a name="game.jsonとは"></a> game.jsonとは

game.json は、Akashic のゲームのメタ情報などを取り扱う JSON 形式の設定ファイルです。
主に以下のような情報を取り扱います。

 * ゲーム画面のサイズ
 * ゲームのFPS
 * ゲーム内で利用する各種素材のファイルパスやID

これらに加えて、画像素材のサイズのような補助的な情報も取り扱います。

各種素材(アセット)のファイルパスや画像のサイズなどは、手動で記述・維持しにくいので、
game.json を生成・管理するツールとして akashic-cli が提供されています。
akashic-cli の詳細は [akashic-cli利用ガイド](akashic-cli.html) を参照してください。

## <a name="形式"></a> 形式

妥当な game.json の内容は一つのオブジェクトです。
それは以下の名前のプロパティと、対応する値を持ちます。

 * width (必須)
    * 数値
    * 画面の幅 (ピクセル)
 * heigth (必須)
    * 数値
    * 画面の高さ (ピクセル)
 * fps (必須)
    * 数値
    * ゲームのFPS (秒間フレーム数)
 * assets (必須)
    * オブジェクト (詳細は後述)
    * ゲーム内で利用するアセットの定義
 * main (指定推奨)
    * 文字列
    * エントリポイントのスクリプトへのパス
 * globalScripts
    * 配列 (詳細は後述)
    * ゲーム内で利用するスクリプトアセット定義の短縮表記
 * renderers
    * 配列（詳細は後述）
    * ゲームが利用するレンダラーを定義

次のJSONは、妥当なgame.jsonの一例です:

```
{
  "width": 320,
  "height": 240,
  "fps": 30,
  "assets": {
    "main": {
      "type": "script",
      "path": "script/main.js",
      "global": true
    }
  },
  "main": "./script/main.js"
}
```

このgame.jsonは、画面サイズが320x240でFPSが30の、
"script/main.js" というゲームスクリプト一つだけを使うゲームであること、
またエントリポイントはその "./script/main.js" であることを定義しています。

### assets (アセット定義)

game.json のオブジェクト中、 **assets** の値は、オブジェクトでなければなりません。
そのオブジェクトの各キーはアセットID、値はそのIDのアセット定義です。

**アセットID** は、ゲーム開発者が任意に設定できる文字列です。
アセットIDは「半角英数字、アンダースコア "\_"、ドル記号 "$"」のみで構成され、
かつ「英字で始まっている」必要があります。
ゲームスクリプト内で、Akashic エンジンが読み込んだ各アセットは
`g.Scene#assets` オブジェクトから参照できます (グローバルアセットを除く。後述)。
アセットID はこのオブジェクトのキーとして利用されます。すなわち、
アセットIDが "foo" のアセットは、`scene.assets.foo` のような形で参照することができます。

**アセット定義** は、オブジェクトであり、少なくとも以下の値を持つことができます:

 * type (必須)
    * 次の文字列のいずれか: "image", "audio", "text", "script"
    * アセットの種類
 * path (必須)
    * 文字列
    * game.json のあるディレクトリからの相対パス (スラッシュ区切り)
    * アセットを表すファイル
 * global
    * 真理値
    * グローバルアセットであるか否か (省略された場合、偽)

global の値が真に設定されたアセットは、**グローバルアセット** になります。
通常のアセットは、シーン単位で管理されます。
アセットを利用する場合、`g.Scene` のコンストラクタでそのアセットIDを指定する必要があります。
しかしグローバルアセットは、シーン単位ではなく、ゲーム内において常に利用可能なアセットになります。
通常のアセットが `g.Scene#assets` から参照できるのに対して、グローバルアセットは `g.Game#assets` から参照できます。

type の値によっては、アセット定義にさらに追加の制約や必須プロパティが存在します。

 * "image"
    * プロパティ: width (必須)
       * 数値
       * 画像の幅(ピクセル)
    * プロパティ: height (必須)
       * 数値
       * 画像の高さ(ピクセル)
    * 制約: path の拡張子は ".png"、".jpg" または ".jpeg" でなければならない
 * "audio"
    * プロパティ: systemId
       * 文字列
       * このアセットの system (本文書では詳細割愛)
       * 省略された場合、 `g.Game#defaultAudioSystemId` の値 (`defaultAudioSystemId` の初期値は "sound")
    * 制約: path はファイルのパス文字列から拡張子を取り除いたものでなければならない
    * 制約: 対応するファイルの拡張子は ".ogg"、".aac" または ".wav" でなければならない
 * "script"
    * 制約: path の拡張子は ".js" でなければならない

オーディオアセット (type が "audio" であるアセット) は他と異なり、ファイルパスに拡張子を書かないことに気をつけて下さい。
音素材に関して、拡張子以外の部分が同名のファイル (e.g. "audio/foo.ogg" と
"audio/foo.aac" など) は、それぞれ同じ内容であることが期待されます。
これらはエンジンが、ゲームの各実行環境で再生可能な形式のファイルを自動的に選択して再生するためです。

### main

akashic-engine@1.2.0 で導入。

**main** は、ゲームのエントリポイントとなるスクリプト( **mainスクリプト** )を指定する値です。

指定されたスクリプトは、アセット定義 (assets) でグローバルなスクリプトアセットとして定義されていなければなりません。
エンジンはグローバルアセットの読み込み後、この値で require() を呼び出し、その戻り値をエントリポイントとみなして実行します。
(require() する関係上、アセット定義の path と異なり、相対パスは "./" で始める必要がある点に気をつけて下さい。)

mainスクリプトは、次の仕様を満たす関数をエクスポートする必要があります。

* 引数 `param: g.GameMainParameterObject` を受け取り、値を返さない (`(param: g.GameMainParameterObject) => void`)
* 呼び出された時、 `g.Game#pushScene()` によるシーンの追加など、ゲームの初期化処理を行う

akashic-engine@1.1.2 以前では、このフィールドは存在しませんでした。
エンジンは後方互換性のため、 `main` が指定されていない場合には、以下のような内容のmainスクリプトが与えられたかのように振る舞います。

```js
module.exports = function (param) {
  if (!param.snapshot) {
    var mainSceneFun = require("mainScene");
    g.game.pushScene(mainSceneFun());
  } else {
    var snapshotLoader = require("snapshotLoader");
    snapshotLoader(param.snapshot);
  }
}
```

この場合、assets は少なくとも "mainScene" という名前のキーを持つ必要があります。
アセットID "mainScene" を持つアセットは、type が "script"  で global は true、
すなわちグローバルなスクリプトアセットでなければなりません。

(上の例ではrequire()にアセットIDを渡していることに気をつけてください。
akashic-engineの提供するrequire()は、Node.jsなどのそれと異なり、game.jsonに存在するアセットIDを(優先的に)解決します。
これは歴史的経緯によるものです。上の例では説明のために使っていますが、この動作の利用は非推奨です。)

### globalScripts

akashic-engine@0.1.0 で導入。

**globalScripts** は、スクリプトアセットの短縮記法です。
これは akashic install/uninstall のために用意された値です。
通常ゲーム開発者が編集する必要はありません。

存在する場合、globalScripts はファイルパスの配列でなければなりません。
ファイルパスは game.json のあるディレクトリからの相対パスで、拡張子が ".js" または ".json" である必要があります。

ここに書かれたファイルパスは、アセットIDを持たないグローバルなスクリプトアセット (".js" の場合)
またはテキストアセット (".json" の場合) として読み込まれます。
(アセットIDを持たないアセットは通常、定義も利用もできませんが、
スクリプトアセットおよびJSONであるテキストアセットに限っては
`require()` によってファイルパスで参照することができます)

### renderers

akashic-engine@1.0.3で導入。

**renderers** は、ゲームで利用するレンダラーを指定するためのリストであり、
レンダラーを識別する文字列であるレンダラー識別子の配列である必要があります。

レンダラー識別子はサービスや実行環境により異なります。

Akashicエンジンは、レンダラー識別子に該当するレンダラーをリストの先頭から順に探索します。
利用可能なレンダラーが見つかると、そのレンダラーを利用して描画を行います。

例えば、 `canvas` と `webgl` という2つのレンダラー識別子が利用可能な環境において、
`webgl` を優先して使いたい場合は、`"renderers": ["webgl", "canvas"]` と記述します。

レンダラー識別子として`"auto"` を指定した場合は、Akashicエンジンが自動的にレンダラーを決定します。
また、game.jsonに renderers を定義しなかった場合の挙動は `"renderers": ["auto"]` を指定した場合と等価になります。

## <a name="game.jsonの例"></a> game.jsonの例

妥当な game.json の一例を示します。

```
{
  "width": 320,
  "height": 320,
  "fps": 30,
  "main": "./script/main.js",
  "assets": {
    "main": {
      "type": "script",
      "path": "script/main.js",
      "global": true
    },
    "character": {
      "type": "image",
      "path": "image/character.png",
      "width": 32,
      "height": 32
    },
    "background": {
      "type": "image",
      "path": "image/background.jpg",
      "width": 320,
      "height": 320
    },
    "bgm": {
      "type": "audio",
      "path": "audio/bgm"
    }
  },
  "globalScripts": [
    "node_modules/@akashic-extension/akashic-timeline/lib/Easing.js",
    "node_modules/@akashic-extension/akashic-timeline/lib/Timeline.js",
    "node_modules/@akashic-extension/akashic-timeline/lib/Tween.js",
    "node_modules/@akashic-extension/akashic-timeline/lib/index.js",
    "node_modules/@akashic-extension/akashic-timeline/package.json"
  ]
}
```
