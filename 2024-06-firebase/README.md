# Flatt Security mini CTF #5

## 開催イベント

- https://flatt.connpass.com/event/320629/

## 出題した問題

| Challenge name | Difficulty | Category | Points | Author | Solves |
|:-:|:-:|:-:|:-:|:-:|:-:|
| Internal | Warmup | Firebase | 100 | Tsubasa | 32 |
| Posts | Easy | Firebase | 100 | Tsubasa | 17 |
| Flatt Clicker | Medium | Firebase | 100 | Tsubasa | 8 |
| NoteExporter | Hard | Firebase | 100 | Tsubasa | 1 |

## ルール・注意事項

### イベントのルール

- 今回のCTFは個人参加のみとなります。
- CTF・解説内容に関するSNS投稿や、Writeupは大歓迎です！ハッシュタグ #Flatt SecurityminiCTF をつけてぜひ盛り上げてください！
- 被写体の顔が判別できる状態の写真をSNSへ投稿される場合、被写体の許可を得てから投稿いただくようお願いいたします。

### 禁止事項

1. 競技中のflag及び回答の共有を禁止します。
1. 問題で指定されたサーバ以外への攻撃を禁止します。
1. サーバへの過度な連続アクセスを禁止します。
1. スコアサーバ及びインフラへの攻撃を禁止します。
1. 他参加者への妨害や悪意を持って問題が機能しないようにするなどの攻撃を禁止します。
1. スコアサーバ上にアカウントを複数作成することを禁止します。アカウントのログイン時に問題が生じた場合、運営に連絡してください。ただし、各問題においてアカウントを複数作成することは禁止しません。
1. flagの総当たりを禁止します。

以上のルールに違反した場合、CTFへの参加権を失います。

- すべての問題は固定スコアであり、first blood pointsはありません。
- 順位は合計獲得スコアと最後に問題を解いた時間で決定されます。
- フラグの形式は `flag{...}` です。
- 問題においてアカウント登録に利用するメールアドレスは 存在しない適当なアドレスを入力してください。
  - 例: `<your nickname>@example.test`
  - 問題によっては他ユーザから入力したメールアドレスが確認できる場合があります

### 配布ファイルの構成

配布ファイルの構成は以下のとおりです。

- `frontend/` ... フロントエンドアプリケーション
  - `frontend/src/firebase.ts` ... API key
  - フロントエンドアプリの実装は問題の対象ではありません
- `functions/` ... Cloud Functions 関連の実装
  - `functions/src/index.ts` ... 関数実装の本体
- `firestore.rules` ... Firestore のセキュリティルール
- `storage.rules` ... Cloud Storage のセキュリティルール
- `add-flag.js` ... フラグの追加方法を示す擬似コード
