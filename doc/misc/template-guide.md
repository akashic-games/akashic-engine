# akashic init テンプレート利用ガイド

`akashic init` コマンドで利用可能なカスタムテンプレートの
作成方法と、テンプレートをチームで共有する方法を説明します。

## 自分だけが利用するテンプレートを作る

作成したAkashicゲームをテンプレートにするときは、作成したゲームを
ディレクトリごとテンプレートディレクトリにコピーします。

テンプレートディレクトリの場所はWindowsの場合は `%USERPROFILE%\.akashic-templates`
Unix/Linuxの場合は `$HOME/.akashic-templates` です。

`akashic init` はテンプレートディレクトリから、テンプレート名と同じ名前のディレクトリを探し、
見つかった場合はその中身をディレクトリ構造を保ったままカレントディレクトリにコピーします。

コピー完了後 `width`, `height`, `fps` の値をユーザに問い合わせ、
カレントディレクトリにある `game.json` の該当する値を更新します。

例えば、

```
akashic init -t mytemplate
```

と入力した場合、`akashic init` は `.akashic-templates/mytemplate` 以下の
ファイルやディレクトリをコピーします。

### ゲームのルートディレクトリ以外の場所に `game.json` を配置する場合

ゲームのルートディレクトリ以外の場所に `game.json` を配置する場合、
テンプレートディレクトリ内にあるテンプレート名と同じ名前のディレクトリ直下に、
`template.json` という名前のファイルを置いて、`game.json` のパスを明示します。

例えば、以下の内容を `template.json` に書き込んだ場合、
ゲームのルートディレクトリ以下の `game` ディレクトリ内に
配置されている `game.json` を利用します。

```
{
    "gameJson": "game/game.json"
}
```

### カスタムテンプレートを akashic init のデフォルトにする

`$HOME/.akashicrc` に項目を追加すると `-t` オプションを
使用しない場合のテンプレートを指定できます。
例えばテンプレート名が `mytemplate` の場合は以下のようになります。

```
[init]
defaultTemplateType="mytemplate"
```

## チームでテンプレートを共有する

Webサーバを用意して、テンプレートをzipで固めたものを配置して
テンプレート配信サーバを用意することで、チームでテンプレートを共有できます。
テンプレート配信サーバが登録されていると、`akashic init` は指定した名前のテンプレートが
テンプレートディレクトリに存在しない場合に、サーバからテンプレートをダウンロードします。

### zipファイルの作り方

ゲームのコンテンツを `テンプレート名.zip` という名前でzip圧縮します。
トップレベルディレクトリは含まないように圧縮してください。

例えばzipコマンドを利用する場合、ゲームのディレクトリで以下の
コマンドを利用して作成できます。

```
zip -R mytemplate.zip *
```

### テンプレートリストの作り方

Webサーバには `template-list.json` という名前のファイルが必要です。
このファイルには以下のようにテンプレート名とzipファイルのパスの対応を記述します。

```
{
  "templates": {
    "javascript": "javascript.zip",
    "typescript": "typescript.zip",
    "mytemplate": "mytemplate.zip"
  }
}
```

### テンプレートサーバアドレスの設定

テンプレートサーバを利用するユーザの `$HOME/.akashicrc` に
以下のような項目を追加してサーバアドレスを指定します。

```
[init]
repository="http://example.com/templates/"
```

このように設定した場合、以下のアドレスでファイルを取得できる必要があります。

* `http://example.com/templates/template-list.json` でテンプレートリスト。
* `http://example.com/templates/mytemplate.zip` でテンプレートのzipファイル。

### 動作確認

テンプレートディレクトリに `mytemplate` が存在するばあいはディレクトリを削除して、
以下のコマンドを入力します。

```
akashic init -t mytemplate
```

サーバに接続された場合、コンソール画面に次のようなログが出力されます。

```
INFO: access to http://example.com/templates/template-list.json
```

ダウンロードされたテンプレートはローカルテンプレートディレクトリに保存され、
次回以降はローカルのテンプレートを利用するようになります。

テンプレートを再ダウンロードしたい場合(サーバのテンプレートが更新された場合など)は、
テンプレートディレクトリ以下の該当するディレクトリを削除して、
適当なディレクトリで `akashic init` を実行する必要があります。
