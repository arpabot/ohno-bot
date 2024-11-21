# ohno-bot
このリポジトリは [ohno-old](https://github.com/arpabot/ohno-old) を TypeScript で書き換えたものです

セルフホストが面倒なら [OHNO](https://discord.com/api/oauth2/authorize?client_id=1104217377840840724&permissions=3146752&scope=bot%20applications.commands) を導入すると幸せになれます

# コマンドのヘルプ

## /join
- ボイスチャンネルに参加します
- 権限がない場合は参加できません

## /leave
- ボイスチャンネルから退出します
- 同じボイスチャンネルにいない場合は実行できません

## /dict put <単語> <読み>
- 辞書を編集します
- 単語が重複している場合は追加できません

## /dict delete <単語>
- 辞書を削除します
- 単語が存在しない場合はエラーを返します

## /dict list
- 辞書のリストを CSV で送信します
- 一応 Excel で開くことができるはずです

## /user-settings speaker <話者>
- 話者を設定します
- 現在日本語ネイティブの話者しか対応していません

## /user-settings speed <数値>
- 読み上げるスピードを 0.5 から 2.0 の数値で指定します
- デフォルトは 1 です

## /help [コマンド名]
- 簡易的なヘルプを見られます

# 読み上げるコンテンツについて
この Bot は，メッセージのテキストだけではなく，そのテキスト以外のコンテンツやボイスチャンネルに関連する操作についても読み上げます．以下がそのリストです．

- 添付ファイルとその種類
- スタンプや絵文字の名前
- リンクのドメイン名やプロトコル
- ユーザー・チャンネルのメンション
- ユーザーの入退室・移動（移動先のチャンネル）
- 画面共有 (GoLive) とカメラ配信の開始・終了

また，`s` 単体で読み上げ対象のチャンネルにメッセージが投稿された場合，現在読み上げているコンテンツと読み上げのキューに入っているコンテンツを破棄し，読み上げを停止します．

# バグかなと思ったら

- Bot のメッセージが読み上げられる！
  - 仕様です．これは開発者である yuimaru の思想によってそうされていて，読み上げ対象のチャンネルに投稿されたコンテンツは全て読み上げられるべきなのでそうしています．もしそれが煩わしくて無効にしたい場合，近いうちに読み上げるコンテンツを細かく設定可能にしようと思っているので，その時までお待ちください．
- 人間が全員ボイスチャンネルからいなくなったのに OHNO が退出しない
  - 仕様です．これは開発者である yuimaru の思想によってそうされていて，読み上げ Bot がボイスチャンネルを退出するべきタイミングは，ボイスチャンネルを移動するタイミングのみだと思っているのでそうしています．これも近いうちに設定可能にしようと思っているので，その時までお待ちください．

# 思想とモチベーション

## 言語を Rust から TypeScript に変えた理由
誤字ではないです．普通逆だろと思いましたよね．

これには私自身のスキルに問題があって，もっと Rust のことを深く理解してから Rust を使って Bot を作成したいと思ったからです．

## モチベーション
なぜ TypeScript なのかというと，薄い Discord API Wrapper の @discordjs/next (@discordjs/{core, ws, rest, util}) を推したいからです．

これらのパッケージは（おそらく，動かそうと思えば）どのランタイムでも動くからです．

まあ Bot の用途によってどの情報が欲しいとか，どの情報が不要とかあるじゃないですか， discord.js 本体は全ての情報をキャッシュしたりとかするわけですよ．

これらのパッケージにはキャッシュとかいう概念もありませんから，自分で実装するとかそういうことをするわけで，これができるとパフォーマンスの面でも嬉しいです．
