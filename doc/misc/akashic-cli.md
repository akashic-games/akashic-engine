# akashic-cli利用ガイド

## <a name="これは"></a> これは

Akashicでのゲーム開発を補助するコマンドラインツール、akashicコマンドの仕様と利用法を解説します。
akashicコマンドはakashic-cliをインストールして使用することができます。
akashic の対象バージョンは 1.0.1 以降です。

斜体は検討中の箇所です。

## <a name="インストール方法"></a> インストール方法

akashicコマンド は、Node.js v0.12.0 以降で動作します。
各プラットフォームで、適当な方法で Node.js をインストールしてください。

WindowsやMacのユーザであれば、[Node.jsの公式Webサイト](https://nodejs.org/download/) から
適切なパッケージをダウンロードし、インストールすることができます。

```sh
npm install -g @akashic/akashic-cli
```

## <a name="使い方"></a> 使い方

無事にインストールができていれば、以下のコマンドが実行できるようになっています。
実行すると、akashicコマンドの簡単なヘルプが表示されます。

```
$ akashic
```

akashicコマンド は以下の 7 つのコマンドを持ちます。

 * akashic init
    * Akashic のゲームとして最低限動作するスクリプトやディレクトリを生成します。
 * akashic modify
    * game.json に記述されている、ゲームの各種メタ情報を更新します。
 * akashic scan
    * game.json に記述されている、ゲームのアセットや各種ライブラリ情報を更新します。
 * akashic install
    * npm install を行い、追加されたファイルのリストを game.json に加えます。
 * akashic uninstall
    * npm uninstall を行い、削除されたファイルを game.json のリストから取り除きます。
 * akashic update
    * npm update を行い、 node_modules 以下のnpmパッケージを更新し、ファイルに変更があれば game.json に加えます。
 * akashic export
    * ゲームを任意のフォーマットに変換して出力します。
 * akashic stat
    * ゲームに関する情報を収集して出力します。

init 以外のコマンドは、init によって生成される game.json を操作・出力します。
したがって通常、ゲーム開発時にはまず akashic init を実行し、
その後必要に応じて他コマンドを実行することになります。

## <a name="init"></a> init

```sh
akashic init [--type <type>]
```

新しくAkashicで動作するゲームをカレントディレクトリに生成します。

このコマンドを実行すると、以下のような対話型のインターフェースが表示され、
ゲーム画面の幅・高さおよびゲームのFPSを入力できます。

```sh
$ npm install -g @akashic/akashic-cli
$ cd GAME_HOME
$ akashic init
width: (320)
height: (320)
fps: (30)
```

入力後、カレントディレクトリには--typeオプションに指定した値に応じてディレクトリ・ファイルが生成されます。

また、本コマンドは、カレントディレクトリの内容が空の状態で実行することを推奨します。

### --typeオプション

&lt;type&gt; に指定できる値は、 `JavaScript` または `TypeScript` です。指定しない場合、 `JavaScript` が指定されたものとして扱われます。

#### JavaScript

下記のディレクトリ、ファイルが生成されます。
これらはこの時点で最低限Akashicで動作するゲームになっています。

```
GAME_HOME
 +- image/
 +- text/
 +- audio/
 +- script/
  +- main.js
 +- game.json
 +- package.json
```

これらのファイルの詳細は [initで作られるファイル](#initで作られるファイル) の節を参照してください。

#### TypeScript

TypeScriptで書かれたゲームと、ビルドに必要なディレクトリ・ファイルが生成されます。
これらをビルドすることで、gameディレクトリ以下に最低限Akashicで動作するゲームを生成します。
ゲームの内容は、--typeオプションにJavaScriptを指定した場合に生成されるゲームと同一です。

ビルドの方法は、生成されるREADME.mdを参照してください。

## <a name="modify"></a> modify

```
akashic modify <target>
```

game.json に記述されている各種メタ情報を更新します。
&lt;target&gt; に指定できる文字列は以下のとおりです:

 * width &lt;new_width&gt;
    * game.json に記述されたゲーム画面の幅を &lt;new_width&gt; の値(数値)で更新します。
 * height &lt;new_height&gt;
    * game.json に記述されたゲーム画面の高さを &lt;new_height&gt; の値(数値)で更新します。
 * fps &lt;new_fps&gt;
    * game.json に記述されたゲーム画面のFPSを &lt;new_fps&gt; の値(数値)で更新します。

## <a name="scan"></a> scan

```
akashic scan <target>
```

game.json に記述されているゲームのアセットや各種ライブラリ情報を更新します。
&lt;target&gt; に指定できる文字列は以下のとおりです:

 * asset &lt;subtarget&gt;
    * game.json に記述されたアセット情報を更新します。(&lt;subtarget&gt; の内容は後述)
 * globalScripts
    * カレントディレクトリの node_modules/ 以下のファイル一覧を game.json に加えます。
    * 通常使用する必要はありません。akashic install や uninstall を利用してください。

game.json のアセット情報を更新する scan asset コマンドは、
もう一つの引数 &lt;subtarget&gt; によって更新する情報を制御することができます。

```
akashic scan asset <subtarget>
```

&lt;subtarget&gt; に指定できる文字列とそれぞれの動作は次のとおりです:

 * image
    * image/ ディレクトリ以下の画像素材を列挙し、アセット情報を更新します。
 * text
    * text/ ディレクトリ以下のテキスト素材を列挙し、アセット情報を更新します。
 * audio
    * audio/ ディレクトリ以下の音素材を列挙し、アセット情報を更新します。
 * script
    * script/ ディレクトリ以下のスクリプト素材を列挙し、アセット情報を更新します。
 * (なし)
    * 上記すべてを行います。

game.json の管理しているアセット情報には、ファイルパスだけでなく以下のような情報も含まれます。
素材の増減時だけでなく、これらの変更時にも scan asset コマンドを実行してください。

 * 画像素材の幅・高さ
 * (将来のバージョンにおいて) 音素材の再生時間

また scan asset コマンドは新たに追加するアセット定義に対し、type に応じて以下の初期値を与えます。
(値の詳細は[game.jsonの仕様](game-json.html)を参照してください)

 * "type": "script"
    * "global": true
 * "type": "audio"
    * "systemId": "sound"

scan asset コマンドによる素材の列挙は、ディレクトリを再帰的に検索します。
つまり、image/ のサブディレクトリに置かれた画像素材なども、列挙されアセット情報に登録されます。

各素材をアセットとして使用するには、アセットを識別するID (アセットID) が必要になります。
scan asset コマンドは、アセットIDとして「ファイル名から拡張子を取り除いたもの」を設定します。
(このため、audio/title.ogg と script/title.js は、同じ "title" という ID となって衝突し、エラーになります。)
また、ファイル名は以下の条件を全て満たす必要があります。

- 半角英数字、アンダースコア "\_"、ドル記号 "$" のみで構成されている
- 英字で始まっている

ユーザは game.json を直接編集して、アセットIDを任意に変更することができます。
akashic コマンドはファイルパスを基準に操作を行うため、たとえば画像素材のIDを変更した後に
その画像のサイズを変更しても、適切にgame.jsonの幅・高さ情報を更新します。

## <a name="install"></a> install

```
akashic install <module>
```

このコマンドは `npm install` を行うため、game.json と同じディレクトリに
package.json という名前のファイルが存在する必要があります。
事前に `npm init` を行うなどの方法で作成してください。

@akashic-extension/ で提供されるAkashic向けの拡張機能の他、任意のnpmパッケージを導入することができます。

ただし、AkashicはNode.jsのコアモジュールをサポートしていません。
コアモジュールに依存しているパッケージを install した場合、エラーメッセージが表示されます。
この場合、`npm install` は行われ、game.json も更新されますが、ゲームとして実行しようとするとエラーになります。

またブラウザ固有の機能や、ECMAScriptの一部機能 (`Math.random()` のような内部状態を持つ機能など) は、
Akashicのゲームとしてはサポートされていません。それらの機能を用いるnpmパッケージを導入しないでください。
(akashicコマンド はこれにエラーを出すことはできません。

### 引数ありでの実行

`npm install --save <module>` を行い、追加されたファイルの一覧をgame.jsonに加えます。

このコマンドはモジュールのバージョンを固定するため内部的に `npm shrinkwrap` を実行し、npm-shrinkwrap.jsonというファイルを出力します。

### 引数なしでの実行

package.jsonのdependenciesに記述されているモジュールを全てインストールします。

この機能は、ゲームの円滑な初期化を実現するために存在しています。
npm-shrinkwrap.jsonがディレクトリに存在しない場合、開発者の想定していないバージョンのモジュールが適用される恐れがあります。

## <a name="uninstall"></a> uninstall

```
akashic uninstall <module>
```

npm uninstall --save &lt;module&gt; を行い、削除されたファイルをgame.jsonから取り除きます。

(install コマンド同様、game.json と同じディレクトリに package.json という名前のファイルが存在する必要があります)

## <a name="update"></a> update

```
akashic update <module>
```

npm update &lt;module&gt; を行い、node_modules 以下のnpmパッケージを更新します。
ファイルの変更はgame.jsonに反映されます。

(install コマンド同様、game.json と同じディレクトリに package.json という名前のファイルが存在する必要があります)

 &lt;module&gt; を指定しなかった場合、全てのnpmパッケージを更新します。npm update の詳細は [npmのドキュメント](https://docs.npmjs.com/cli/update) を参照してください。

## <a name="export"></a> export

```
akashic export [--output <fileName>] [--exclude <fileName>] <format>
```

ゲームを指定されたフォーマット &lt;format&gt; に変換して出力します。

--outputオプションが指定された場合、変換した結果を &lt;fileName&gt; に保存します。
省略された場合はフォーマットごとのデフォルトの名前で保存されます。

--excludeオプションが指定された場合、ファイル &lt;fileName&gt; を出力から除外します。

複数のファイルを除外したい場合は

```
akashic export <format> --exclude foo --exclude bar
```

のように複数回--excludeを指定してください。

### 現在対応しているフォーマット

フォーマット毎にデフォルトの出力ファイル名と、除外されるファイルを併記します。

* zip
    * デフォルトの出力ファイル名
        * game.zip
    * デフォルトで除外されるファイル
        * ./npm-shrinkwrap.json
        * ./package.json

## <a name="stat"></a> stat
```
akashic stat <target> [options...]
```

`<target>` で指定された内容に関して情報を収集して出力します。 
`<target>` として現在以下を指定可能です。

### ゲームの容量計算 (size)
`<target>` に `size` を指定すると、ゲームの容量を計算します。
ゲームの容量とはゲームを配信する際にネットワーク通信が必要なコンテンツのファイルサイズの合計のことです。

何もオプションを付けずに実行した場合、以下のように表示されます。
```
$ akashic stat size
INFO: image: 602KB (37%)
INFO: text: 120KB (7%)
INFO: aac audio: 393KB (24%) (ogg audio: 354KB)
INFO: script: 134KB (8%)
INFO: other: 369KB (23%)
INFO: total size (audio = ogg): 1.54MB (1617355B)
INFO: total size (audio = aac): 1.58MB (1657274B)
```

オーディオはaacとoggのうち合計容量が大きいものを利用して計算します。
結果表示の `(37%)` の部分は全体用量に占めるそのカテゴリのファイルの割合を示しています。
`game.json`, `node_moduels/` 以下のスクリプトは `other` に分類されます。

`--limit` オプションが指定されると、ゲームの容量が指定された値を超えた場合にエラーと表示され、
コマンド自体の戻り値が正常終了時の `0` ではなく `1` になります。

容量は `--limit 100KB` のように指定します。`1KB` は `1024B` として計算されます。
単位として、`B`, `KB`, `MB`, `GB` が利用でき、末尾の `B` は省略できます。

`--raw` オプションが指定されると、以下のように合計容量のバイト数のみを表示して終了します。

```
$ akashic stat size --raw
1657274
```

## <a name="initで作られるファイル"></a> initで作られるファイル

### <a name="imageディレクトリ"></a> imageディレクトリ

画像素材を配置するディレクトリ。

サポートされる拡張子はpng/jpgであり、拡張子と画像フォーマットは一致している必要があります。
それ以外の拡張子のファイル、または "." から始まるファイルは無視されます。

### <a name="textディレクトリ"></a> textディレクトリ

テキスト素材を配置するディレクトリ。

サポートされる拡張子は特に指定がないため、 "." から始まるファイル以外はすべて取り込まれます。
*取り込まれないファイルを指定する方法は検討中。*

### <a name="audioディレクトリ"></a> audioディレクトリ

音楽、効果音など、音素材を配置するディレクトリ。

サポートされる拡張子はogg/aac/wavであり、拡張子とファイルフォーマットは一致している必要があります。
それ以外の拡張子のファイル、または "." から始まるファイルは無視されます。

他の素材と異なり、音素材は、ファイル名の拡張子部分のみが異なる複数のファイルをまとめて取り扱います。
それら (audio/foo.ogg と audio/foo.aac など) は同一の内容であることが期待されます。
これはゲームの実行環境に応じて適切な形式を選択し利用するためです。

### <a name="scriptディレクトリ"></a> scriptディレクトリ

スクリプト素材を配置するディレクトリ。

サポートされる拡張子は.jsと.jsonであり、拡張子とファイルフォーマットは一致している必要があります。
それ以外の拡張子のファイル、または "." から始まるファイルは無視されます。

慣習として、各 Scene を実装するファイルは、このディレクトリ内に
"Scene.js" という接尾辞をつけて配置される事が推奨されます（例: titleScene.js, battleScene.js）。
 
### <a name="node_modulesディレクトリ"></a> node_modulesディレクトリ

各種ライブラリを配置するディレクトリ。

このディレクトリにはakashic installで追加されたnpmパッケージが配置されます。
パッケージファイルはinstall や uninstall コマンドによって管理され、通常はゲーム開発者が操作する必要はありません。

### <a name="game.jsonファイル"></a> game.jsonファイル

ゲームの各種情報を記述するファイル。

akashic initを実行した直後は以下のような内容になっています。
(ただし width, height, fps, main は init で指定した値)

```
{
    "width": 480,
    "height": 480,
    "fps": 30,
    "main": "./script/main.js",
    "assets": {
        "main": {
            "type": "script",
            "path": "script/main.js",
            "global": true
        }
    }
}
```

詳細な仕様は[game.jsonの仕様](game-json.html)を参照してください。

## <a name="Node.js 開発者向けの追加情報"></a> Node.js 開発者向けの追加情報

akashicは、install, uninstall コマンドを除き、package.json に関知しません。

ゲーム開発者は、npm install --save-dev jasmine して spec ディレクトリにテストを配置するなど、
任意の開発フローを(Akashic のディレクトリ構成と衝突するなどの問題がない限り)とることができます。
