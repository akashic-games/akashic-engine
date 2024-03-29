<p align="center">
<img src="https://raw.githubusercontent.com/akashic-games/akashic-engine/main/img/akashic.png"/>
</p>

# Akashic Engine

JavaScriptゲームエンジン [Akashic Engine](https://akashic-games.github.io/) のコアライブラリです。
ゲーム開発者向けの環境非依存なクラス群を提供します。

## 利用方法

このリポジトリは、環境非依存なコードのみを含むライブラリです。そのため単体で利用することはできません。
ゲーム開発には [Akashic Sandbox](http://github.com/akashic-games/akashic-sandbox) と
[Akashic CLI](http://github.com/akashic-games/akashic-cli) をご利用ください。
Akashic Engineの詳細な利用方法については、 [公式ページ](https://akashic-games.github.io/) を参照してください。

API リファレンスは以下から参照できます。
- [akashic-engine v3.x](https://akashic-games.github.io/akashic-engine/v3/)
- [akashic-engine v2.x (旧版)](https://akashic-games.github.io/akashic-engine/v2/modules/_lib_main_d_.g.html)
- [akashic-engine v1.x (旧版)](https://akashic-games.github.io/akashic-engine/v1/modules/_lib_main_d_.g.html)

### TypeScript での型定義の利用

TypeScriptでゲームを開発する場合には、型定義ファイルとしてこのリポジトリの `index.runtime.d.ts` を使うことができます。
`npm install -D @akashic/akashic-engine` でインストールの上、
tsconfig.json で `node_modules/@akashic/akashic-engine/index.runtime.d.ts` を参照するなどの方法で、 `tsc` に与えてください。

## ビルド方法

Akashic EngineはTypeScriptで書かれたJSモジュールです。ビルドにはNode.jsが必要です。
リポジトリ直下で次を実行してください。

```
npm install
npm run build
```

## テスト方法

```
npm test
```

## ライセンス
本リポジトリは MIT License の元で公開されています。
詳しくは [LICENSE](./LICENSE) をご覧ください。

ただし、画像ファイルおよび音声ファイルは
[CC BY 2.1 JP](https://creativecommons.org/licenses/by/2.1/jp/) の元で公開されています。

