# ぱぱん式（papan-shiki）プロジェクト概要

## 1. サイト概要

- **正式名称**: ぱぱん式 まなびポータル
- **URL**: https://papan-shiki.com/
- **サイト種別**: 子ども向け学習ポータルサイト（無料・ダウンロード不要）
- **対象年齢**: 3歳〜12歳（幼児〜小学生）
- **コンセプト**: ブラウザだけで、好きなだけ学べるオンライン学習プラットフォーム
- **キャラクター**: エゾリスの「ヒー」、ハリネズミの「アン」、くまの「ピッピ」
- **画風**: 水彩＋色鉛筆風のやさしい絵本調イラスト

---

## 2. 技術構成

### フロントエンド
- **HTML / CSS / JavaScript** のみ（フレームワーク不使用）
- 各コンテンツは単一の `.html` ファイルに CSS・JS を内包（self-contained）
- フォント: `UD Digital Kyokasho-tai-R`（教育向けUDフォント）、Helvetica Neue, Arial, Meiryo 等

### 共通スクリプト
| ファイル | 役割 |
|---|---|
| `ranking.js` | ポイント・どんぐり・記録・目標・スタンプ・株・ガチャ・日替わりミッション管理 |
| `firebase-ranking.js` | Firebase連携（全国ランキング・マイルーム公開・全国ひつじレース） |
| `service-worker.js` | PWA対応（オフラインキャッシュ、ネットワーク優先戦略） |

### バックエンド
- **Firebase Firestore**: 全国ランキング、マイルーム公開データ、全国ひつじレースの保存
- **Google Sheets (CSV公開)**: リアル株価データ取得用
- **ExchangeRate API**: USD/JPY為替レートの取得（ぱぱん銀行で使用）

### データ保存
- **localStorage** がメイン（クライアントサイド保存）
- 各データは以下のキーで管理:

| キー | 用途 |
|---|---|
| `papan_records_v1` | ゲームの自己ベスト記録 |
| `papan_goals_v1` | 各ゲームの目標値 |
| `papan_points_v1` | ポイント残高（主通貨） |
| `papan_donguri_v1` | どんぐり残高（第2通貨） |
| `papan_stamps_v3` | まなびカレンダーのスタンプ |
| `papan_market_v1` | 株式市場データ（価格・ニュース等） |
| `papan_stocks_v1` | 各ユーザーの株保有データ |
| `papan_real_market_prev_v1` | 株の実データ（前回値保持用） |
| `papan_collection_v1` | ガチャコレクション（ずかん） |
| `papan_rewarded_goals_v1` | 目標達成報酬の履歴 |
| `papan_daily_mission_v1` | 日替わりミッションの達成状況 |
| `papan_avatar_v1` | アバター・マイルームの設定と所持品 |
| `papan_my_sheep_v3` | ひつじ牧場の飼育データ |
| `papan_play_log_v1` | 直近30日のプレイ履歴（分析用） |
| `papan_parent_picks_v1` | 保護者が推薦するおすすめコンテンツ設定 |
| `papan_parent_bonus_v1` | おすすめコンテンツのボーナス受取履歴 |
| `papan_exchange_rate_history` | 銀行の為替レート推移データ |
| `papan_labo_records_v1` | スポーツ能力ラボの測定記録 |
| `papan_labo2_records_v1` | 感覚測定ラボの測定記録 |
| `sugoroku_weekly_v1` | ミッションすごろくの週替わりミッションと達成状況 |
| `missionStock` | ミッション達成で得たすごろく用ストック数 |
| `currentPosition` | ミッションすごろくのユーザー別コマ位置 |
| `papan_dashboard_last_user` | ダッシュボードで最後に選択したユーザー |

### ホスティング・PWA
- **GitHub Pages** でホスティング（CNAMEファイルでカスタムドメイン設定）
- **PWA対応**: `manifest.json` + `service-worker.js` によりインストール＆オフライン利用可能
- 画像は **WebP形式** に統一（PNG/JPGからの移行済み）

---

## 3. ゲームタイプ（記録・報酬方式の分類）

ゲームは以下の4タイプに分類される。`新しいゲームを作成する際は、必ずどのタイプか確認すること。`

### タイプA: 記録保存型（`showSaveDialog` 使用）
- クリア時に `showSaveDialog(gameId, resultValue)` を呼ぶ
- タイムまたはスコアが自己ベストとして `localStorage` に保存される
- 参加賞として **30pt**（`rail.html`のみ100pt）が付与される
- 目標達成で追加 **150pt**、日替わりミッション対象なら更に **150pt**
- `ranking.js` の `GAME_LIST` にゲームIDが登録されている必要がある

### タイプB: 記録保存＋全国ランキング対応型（`showSaveDialog` + `firebase-ranking.js`）
- タイプAの機能に加え、`firebase-ranking.js` を読み込むことで全国ランキング送信が可能
- セーブダイアログに「ランキングに のせる？」欄が追加表示される
- 公開名（6文字以内）を入力するとFirestoreに送信される

### タイプC: 固定ポイント付与型（`showPointGetDialog(固定値, gameId)` 使用）
- タイム/スコアの記録は行わない
- クリアや1プレイ完了時に `showPointGetDialog(固定値, 'game_id')` を呼ぶ（※第2引数にゲームIDを必ず渡すこと。ダッシュボードの集計に必須）
- ユーザーを選んで固定ポイントを受け取る
- `GAME_LIST` への登録は不要

### タイプD: 成績連動ポイント付与型（`showPointGetDialog(変動値, gameId)` 使用）
- タイム/スコアの記録は行わない
- 正答数や到達度に応じてポイントが変動する
- 例: `science.html` → `showPointGetDialog(score * 5, 'science')`
- これも同じく第2引数にゲームIDを必ず渡すこと。ダッシュボードの集計に必須
- `GAME_LIST` への登録は不要

---

## 4. コンテンツ一覧

> **タイプ列の読み方**: A=記録型、B=記録+全国ランキング型、C=固定ポイント型、D=成績連動ポイント型

### 🔢 さんすう・けいさん
| ファイル | コンテンツ名 | 種別 | タイプ | 対象年齢 |
|---|---|---|---|---|
| `sansuu.html` | さんすうタイムアタック | タイムアタック | A | 5〜12歳 |
| `sansuu_bunsu.html` | 分数タイムアタック | タイムアタック | A | 8〜12歳 |
| `rain.html` | あめふりさんすう | シューティング型 | A | 6〜12歳 |
| `make10.html` | あわせて10（メイクテン） | クイズ | A | 4〜8歳 |
| `dungeon.html` | 計算ダンジョン | RPG型学習 | D (30/300/3000pt) | 6〜10歳 |
| `flash_anzan.html` | フラッシュあんざん | 暗算 | C (10pt) | 6〜12歳 |
| `99.html` | かけざん九九チャレンジ | クイズ | C (50pt) | 6〜8歳 |
| `whattime.html` | とけいの読み方 | クイズ | A | 6〜8歳 |
| `water.html` | 分数小数水槽パズル | パズル | A | 8〜12歳 |
| `triangle.html` | 三角形の内角 | クイズ | A | 8〜12歳 |

### 📖 こくご・ことば
| ファイル | コンテンツ名 | 種別 | タイプ | 対象年齢 |
|---|---|---|---|---|
| `bunsho.html` | バラバラぶんしょう | クイズ | C (30pt) | 5〜8歳 |
| `katakana.html` | カタカナへんかん | クイズ | A | 5〜8歳 |
| `1gradekanji.html` | 1年生のかんじクイズ | クイズ | C (30pt) | 6〜8歳 |
| `kanji_dungeon_2grade.html` | 漢字ダンジョン（2年生） | RPG型学習 | D (到達度連動) | 7〜10歳 |
| `alphabet.html` | AからZアルファベット | クイズ | A | 5〜9歳 |
| `alphabet_read.html` | ABCよみかたクイズ | クイズ | C (30pt) | 5〜8歳 |
| `romaji_quiz.html` | ローマ字 虫くい | クイズ | A | 8〜12歳 |
| `rain_romaji.html` | あめふりローマ字（子音） | ゲーム | A | 8〜12歳 |
| `rain_vowel.html` | あめふりローマ字（母音） | ゲーム | A | 8〜12歳 |
| `100home.html` | 五色百人一首クイズ | クイズ | C (50pt) | 7〜12歳 |
| `daily_english.html` | まいにちエイゴ | タイムアタック | A | 6〜12歳 |
| `english_talk.html` | アンと英語でおしゃべり | ロールプレイ | C (50pt) | 6〜12歳 |

### 🧠 脳トレ・パズル
| ファイル | コンテンツ名 | 種別 | タイプ | 対象年齢 |
|---|---|---|---|---|
| `memory.html` | どうぶつあわせ | 神経衰弱 | B | 4〜7歳 |
| `flash.html` | フラッシュえもじ | 記憶力 | C (20pt) | 全年齢 |
| `numbers.html` | 1から25までタッチ | スピード | B | 5〜12歳 |
| `youji.html` | えあわせパズル | マッチング | A | 3〜5歳 |
| `kyorokyoro.html` | どこにきえた？動体視力 | 追跡ゲーム | C (5pt) | 5〜12歳 |
| `search_count.html` | かぞえてさがして | 視覚探索 | C (30pt) | 5〜10歳 |
| `count30.html` | 30をいわせろ！ | 戦略ゲーム | C (30pt) | 6〜12歳 |
| `tsumitsumi.html` | 漢字つみつみ | 物理パズル | A | 6〜12歳 |
| `rail.html` | つなげて！トロッコ | パズル | B (参加賞100pt) | 5〜12歳 |
| `detective.html` | 名探偵ぱぱん | 推理パズル | C (30pt) | 6〜12歳 |
| `fingers_chess.html` | フィンガーチェス | 戦略ゲーム | C (変動) | 6〜12歳 |
| `passcode.html` | パスコードをあてよう！ | 記憶力 | D (成績連動) | 6〜12歳 |
| `ura/sheep_stable.html` | ひつじ牧場 | 育成・戦略ゲーム | ― | 7〜12歳 |

### 🎵 おんがく・アート
| ファイル | コンテンツ名 | 種別 | タイプ | 対象年齢 |
|---|---|---|---|---|
| `color_lab.html` | いろまぜ実験室 | 実験 | C (30pt) | 5〜8歳 |
| `pitch.html` | おとあてクイズ | クイズ | C (30pt) | 全年齢 |
| `rhythm.html` | アンのリズム教室 | リズムゲーム | C (30pt) | 全年齢 |
| `music_class.html` | アンのおんがく教室 | ピアノ演奏 | C (50pt) | 全年齢 |

### 🪙 おかねのべんきょう
| ファイル | コンテンツ名 | 種別 | タイプ | 対象年齢 |
|---|---|---|---|---|
| `shopping.html` | ピッピ商店 | 体験型 | A | 5〜9歳 |
| `bank.html` | ぱぱん銀行 | 為替体験 | ― | 9〜12歳 |
| `stock.html` | ぱぱん証券 | 株取引体験 | ― | 9〜12歳 |
| `interest.html` | 単利と複利 | シミュレーション | ― | 9〜12歳 |
| `about_stock.html` | お金にはたらいてもらう | 読みもの | ― | 9〜12歳 |

### 🔬 サイエンス
| ファイル | コンテンツ名 | 種別 | タイプ | 対象年齢 |
|---|---|---|---|---|
| `science.html` | ヒー先生のかがくクイズ | 〇×クイズ | D (正答数×5pt) | 7〜12歳 |
| `human_model.html` | ドキドキ人体模型 | ドラッグ＆ドロップ | C (50pt) | 6〜12歳 |
| `star_puzzle.html` | ほしぞらパズル | パズル | C (50pt) | 5〜9歳 |
| `programming.html` | ロボットゆうどう作戦 | プログラミング的思考 | C (50pt) | 7〜12歳 |
| `burger_shop.html` | バーガープログラミング | 条件分岐学習 | C (50pt) | 7〜12歳 |
| `addiction.html` | 依存症あるなし | クイズ | D (正答数×5pt) | 8〜12歳 |

### 🖨️ プリント教材（ポイント付与なし）
| ファイル | コンテンツ名 |
|---|---|
| `math100.html` | ひゃくますけいさん表 |
| `hissan.html` | ２けたのひっさん |
| `print_alphabet.html` | アルファベット表 |
| `print_kana.html` | あいうえお・カタカナ表 |
| `print_romaji.html` | ローマ字表（濁音つき） |

### 🔒 裏ページ（`ura/` ディレクトリ）
銀行の「秘密のカギ」から入れる隠しコンテンツ（ギャンブル的要素を含む教育コンテンツ）。

※ `ura/sheep_stable.html`（ひつじ牧場）だけは現在、トップページの「ひつじ」メニューから入れる表コンテンツとして扱う。ギャンブルではなく、ひつじの育成・契約・トレーニング・レース参加を通じて、戦略やコスト配分を考える知育ゲーム。

| ファイル | コンテンツ名 | 概要 |
|---|---|---|
| `ura/secret_home.html` | ひみつのへや | 裏ページのトップ |
| `ura/sheep_stable.html` | ひつじ牧場 | 表コンテンツ扱いの育成・戦略ゲーム（Firebase連携） |
| `ura/sheep_race.html` | ひつじレース | レース実行画面 |
| `ura/sheep_stable_race.html` | 牧場内レース | ローカルレース |
| `ura/chinchiro.html` | チンチロリン | サイコロ賭けゲーム |
| `ura/highlow.html` | ハイ＆ロー | カード賭けゲーム |

---

## 5. 共通システム詳細

### 5.1 ポイントシステム（主通貨）
- ゲームクリア時の **参加賞**: 通常30pt（`rail.html`のみ100pt）
- **目標達成報酬**: 150pt
- **日替わりミッション達成ボーナス**: 150pt
- 使い道: ガチャ（50pt/回）、アバター購入、インテリア購入、どんぐりへの交換、株の購入

### 5.2 どんぐり（第2通貨）
- ぱぱん銀行でポイントと交換して入手（USD/JPYレートに連動）
- 一部の株（ギャラクシーIT）の売買に使用
- 裏ページの隠しコンテンツ（チンチロリン・ハイ＆ロー等）での賭けに使用
- 安い時に買って高い時に売ることで利益を得られる（為替学習）

### 5.3 株式取引システム
`STOCK_MASTER` で定義された銘柄:

| ID | 名前 | 通貨 | 特徴 |
|---|---|---|---|
| `motor` | ぱぱん自動車 | ポイント | 安定型、微増バイアス |
| `food` | どんぐり食品 | ポイント | 高配当 |
| `tech` | ギャラクシーIT | どんぐり | ハイリスク・ハイリターン |
| `nikkei` | ぱぱんの森平均株価 | ポイント | 日経225連動 |
| `sp500` | とおくの山SP500 | ポイント | S&P500連動 |
| `wheat` | 小麦 (10kg) | ポイント | 商品先物連動 |
| `gold` | 金（ゴールド） | ポイント | 金価格連動 |
| `oil` | オイル | ポイント | WTI原油連動 |
| `nasdaq` | とおくの山NSD100 | ポイント | NASDAQ100連動 |

- 日次で価格変動（ランダム＋トレンド＋バイアス）
- 連動銘柄は Google Sheets 経由でリアルデータ取得
- 配当金が日次で自動支払い
- `motor` / `food` / `tech` はローカル乱数・バイアス型、`nikkei` / `sp500` / `wheat` / `gold` / `oil` / `nasdaq` は `linkage` と `divisor` を持つリアルデータ連動型
- `tech` のみ通貨がどんぐり。その他の銘柄はポイント建て

### 5.4 日替わりミッション
- 毎日3つのゲームがボーナス対象として自動選出
- Xorshiftアルゴリズム（日付シード）で全ユーザーに同じミッションが提示される
- 達成すると追加で150ptボーナス

### 5.5 ミッションすごろく
- 入口は `sugoroku/sugoroku.html`。トップページから「ミッションすごろく」ボタンで遷移する
- `sugoroku/mission.js` が週替わりミッションの選出・達成管理を担当し、`ranking.js` より後に読み込む（`SeededRandom` を共用するため）
- `MISSION_POOL` から週ごとに10個のミッションを選出する。週IDは日曜日の日付（`YYYY-MM-DD`）を使い、シード付き乱数で全ユーザー共通の内容になる
- 週が変わると `sugoroku_weekly_v1` を更新し、`missionStock` と `currentPosition` をリセットする
- ミッション達成時は `addMissionStock(userName, missionId)` を呼ぶ。今週の対象ミッションかつ未達成の場合だけ、対象ユーザーの `missionStock` が1増える
- すごろく本体では `missionStock` を1消費して1マス進む。位置は `currentPosition` にユーザー別で保存される
- 途中マスではサイコロ報酬でどんぐりを付与し、ゴール時はゴール用サイコロ報酬を付与する。ゴール後は翌週リセットまで待機する
- 現在のミッション種別は `game` / `visit` / `action`。達成判定は各ページ側から `addMissionStock()` を呼ぶ方式
- 主な達成呼び出し元: `gacha.html`（ガチャ）、`bank.html`（交換）、`stock.html`（株売買）、`record.html`（記録確認・目標おまかせ）、`dashboard.html`（ダッシュボード表示）、`avatar_shop.html`、`room_shop.html`、`ura/sheep_stable.html`、`rail.html`、`rhythm.html`、`math_strike.html`、`dokidoki_obstacle.html`、`passcode.html`、`kanji_card_battle.html`、`performance_labo/main.js`、`performance_labo/main2.js`

### 5.6 記録・目標管理
- 各ゲームのベスト記録を `localStorage` に保存
- `record.html` で一覧表示・目標設定・達成判定
- 「おまかせ設定」: 達成済みの目標を自動で1%上方修正
- ゲームのタイプ: `time`（タイム型：少ないほど良い）、`score`（スコア型：多いほど良い）

### 5.7 まなびカレンダー（スタンプ機能）
- `calendar.html` で月間のスタンプを表示
- ゲーム参加時に自動でスタンプが付く
- スタンプ画像: `hi-an-192.webp`（ヒー＆アン）

### 5.8 ガチャ・コレクション
- **コスト**: 50pt/回
- **アイテム一覧**: ヒー＆アン、水彩ヒー＆アン（★5レア）、くまのピッピ、ハリネズミのアン、エゾリスのヒー
- 図鑑機能で収集状況を確認

### 5.9 マイルーム・アバター
- アバターショップ（`avatar_shop.html`）でキャラクター画像を購入
- インテリアショップ（`room_shop.html`）で壁紙・家具・勲章を購入
- `room.html` で自分の部屋を飾り、Firebase経由でネットに公開可能
- 他のユーザーの部屋を訪問できる（`room_list.html`）

### 5.10 全国ランキング
- `firebase-ranking.js` の `uploadToWorldRanking()` で Firestore にスコアを送信
- セーブダイアログで公開名（6文字以内）を入力すると全国ランキングに登録
- 未入力の場合はローカルのみ（非公開）
- `open_record.html` でランキングを閲覧

### 5.11 全国ひつじレース
- 毎週土曜16時に開催
- Firebase経由でエントリー・結果表示
- `checkAndRunNationalRace()` でクライアントサイド計算

### 5.12 セーブダイアログ
- `showSaveDialog(gameId, resultValue)`: 全ゲーム共通の記録保存UI
- ユーザー選択 → 記録保存 → ポイント加算 → ミッション判定 → ランキング送信（任意）
- `showPointGetDialog(amount, gameId)`: ポイント付与のみのダイアログ。第2引数に `gameId` を渡すと `papan_play_log_v1` にプレイ履歴が残る

### 5.13 保護者ダッシュボード・プレイ履歴
- `ranking.js` の `savePlayLog(userName, gameId)` が直近30日分のプレイ履歴を `papan_play_log_v1` に保存する
- `showSaveDialog()` は記録保存時に自動で `savePlayLog()` を呼ぶ
- `showPointGetDialog(amount, gameId)` は `gameId` が渡された場合だけ `savePlayLog()` を呼ぶ。固定ポイント型・成績連動型では第2引数の指定が重要
- `dashboard.html` は `getPlayLog(userName)` で直近30日のログを取得し、`GAME_CATEGORIES` に基づいて「さんすう・計算」「こくご・ことば」「サイエンス」「脳トレ・パズル」「くらし・アート等」に分類してレーダーチャート表示する
- `dashboard.html` ではポイント、どんぐり、株評価額（ポイント建て/どんぐり建て）も表示する。株評価額は `getUserStocks()` と `getMarketData()`、`STOCK_MASTER` を参照する
- ユーザー選択は `papan_dashboard_last_user` に保存され、再訪時に復元される

---

## 6. ディレクトリ構造

```
e:\ぱぱん式\
├── index.html          # トップページ（全コンテンツへの入口）
├── index2.html         # サブページ
├── ranking.js          # 共通システム（ポイント・記録・株等）
├── firebase-ranking.js # Firebase連携
├── service-worker.js   # PWAサービスワーカー
├── manifest.json       # PWAマニフェスト
├── CNAME               # カスタムドメイン設定
├── .gitignore          # Git除外設定
│
├── [各種ゲーム・学習コンテンツ].html  # 約70+の単体HTMLファイル
│
├── record.html         # 記録・目標管理ページ
├── open_record.html    # 全国ランキング閲覧
├── dashboard.html      # 保護者向けダッシュボード（成績・成長記録）
├── calendar.html       # まなびカレンダー
├── bank.html           # ぱぱん銀行（為替）
├── stock.html          # ぱぱん証券（株取引）
├── gacha.html          # ガチャ
├── room.html           # マイルーム
├── room_shop.html      # インテリアショップ
├── room_list.html      # みんなのルーム一覧
├── avatar_shop.html    # アバターショップ
├── backup.html         # データバックアップ
├── privacy.html        # プライバシーポリシー
│
├── avatar/             # アバター画像（boy_01〜09, girl系, none）
├── room/               # 部屋背景・家具・勲章の画像
├── organ/              # 人体模型用臓器画像
├── image/              # バーガーショップSVG、モンスター画像等
├── se/                 # 効果音・音階MP3ファイル
├── css/                # CSS（human_model.css のみ）
├── js/                 # JS（human_model.js のみ）
├── sugoroku/           # ミッションすごろく（週替わりミッション、ボード、報酬）
├── blog/               # コラム記事（article001〜003）
└── ura/                # 裏ページ群（sheep_stable.htmlのみ表コンテンツ扱い）
```

---

## 7. 設計方針・ルール

### UIの統一ルール
- **タッチ操作最適化**: `touch-action: manipulation;` を使用、`-webkit-tap-highlight-color: transparent;` でタップ時のハイライトを除去
- **ボタンの押下感覚**: `box-shadow` + `:active` で `translateY(2px)` する「3D風」ボタン
- **丸みのあるデザイン**: `border-radius: 15px〜30px` を基調にした温かいUI
- **カラーパレット**: パステル系（水色 `#e0f7fa`、薄緑 `#e8f5e9`、薄紫 `#f3e5f5` 等）をベースとし、アクセントにオレンジ `#ff9800` を使用
- **子ども向けテキスト**: ひらがな・カタカナ中心で漢字にはふりがなを付ける

### 命名規則
- ゲームID: 英語のスネークケース（`make10`, `flash_anzan`, `math_add_easy` 等）
- ファイル名: 小文字英数字＋アンダースコア（`.html`）
- localStorage キー: `papan_` プレフィックス + 機能名 + バージョン

### 画像形式
- **WebP** を標準使用（PNG/JPGからの移行済み）
- アバター画像は `avatar/` に `boy_01.webp`, `girl_long_01.webp` 等のパターンで配置

### ブログ（コラム）
- `blog/` ディレクトリに記事を配置
- 記事テーマ: 学習法、お金の教育、裏コンテンツの設計意図など保護者向け

---

## 8. ユーザーフロー

### 基本的な学習フロー
1. トップページ（`index.html`）でゲームを選ぶ（年齢フィルター機能あり）
2. ゲームをプレイ
3. 終了時にセーブダイアログ（`showSaveDialog`）が表示
4. 名前を選んで記録を保存 → ポイント獲得
5. ポイントでガチャ・アバター・インテリアを購入
6. 銀行でどんぐりに交換 → 証券で株を購入

### 経済システムのフロー
```
ゲーム参加 → ポイント(30〜150pt)
  ├── ガチャ (50pt)
  ├── アバター/インテリア購入
  ├── ぱぱん銀行 → ポイント ⇔ どんぐり（USD/JPY連動レート）
  └── ぱぱん証券 → 株の売買（日次変動・配当あり）
```

---

## 9. Firebase構成

- **プロジェクトID**: `papan-shiki`
- **使用サービス**: Firestore
- **コレクション**:
  - 全国ランキングデータ
  - 公開マイルームデータ
  - 全国ひつじレースのエントリー・結果

---

## 10. 開発・更新時の注意点

1. **新しいゲームを追加する場合**:
   - **まずゲームタイプ（A/B/C/D）を決定する**（→ セクション3参照）
   - HTMLファイルを作成
   - **全タイプ共通の作業**:
     - `dashboard.html` の `GAME_CATEGORIES` にゲームIDを追加する（ダッシュボードでのジャンル別プレイ回数集計のため）
     - `service-worker.js` の `urlsToCache` にファイルを追加
     - `index.html` にカードを追加してホーム画面から遷移できるようにする
   - **タイプA/Bの場合の追加作業**:
     - `ranking.js` の `GAME_LIST` にゲームIDを追加（※保護者ダッシュボードの「おすすめコンテンツ」選択肢にも自動反映されます）
     - `record.html` の `DEFAULT_GOALS` に初期目標値を追加
     - ゲーム終了時に `showSaveDialog(gameId, resultValue)` を呼ぶ
     - タイプBの場合は `<script type="module" src="firebase-ranking.js"></script>` を追加
   - **タイプC/Dの場合の追加作業**:
     - ゲーム終了時に `showPointGetDialog(ポイント数, 'game_id')` を呼ぶ（ダッシュボードでプレイ回数を集計するため、必ず第2引数にゲームIDを指定すること）
     - `GAME_LIST` への登録は必須ではありませんが、保護者ダッシュボードの「おすすめコンテンツ」で選べるようにしたい場合は `ranking.js` の `GAME_LIST` にも追加してください。

2. **新しい株銘柄を追加する場合**:
   - `ranking.js` の `STOCK_MASTER` に定義を追加
   - リアルデータ連動銘柄の場合は `type: 'linked'`、`linkage`、`divisor` を設定し、Google Sheets CSV 側の項目名と対応させる
   - `getMarketData()` に自動マイグレーションが組み込まれているため、既存ユーザーも対応可

3. **ミッションすごろくのミッションを追加する場合**:
   - `sugoroku/mission.js` の `MISSION_POOL` に `id`、`name`、`type`、`emoji` を追加する
   - 実際に達成したタイミングのページで `addMissionStock(userName, 'mission_id')` を呼ぶ
   - `mission.js` は `ranking.js` の `SeededRandom` に依存するため、読み込み順は `ranking.js` → `sugoroku/mission.js` にする
   - 週替わりの対象に選ばれた未達成ミッションだけストックが増える。対象外または達成済みの場合は何もしない

4. **ダッシュボードのプレイ履歴集計に対応する場合**:
   - `showPointGetDialog()` を使うゲームは、必ず第2引数に `gameId` を渡す
   - 新しい `gameId` は `dashboard.html` の `GAME_CATEGORIES` に追加する
   - 記録保存型は `showSaveDialog()` が自動でプレイログを保存する

5. **画像を追加する場合**:
   - WebP形式で配置
   - `service-worker.js` のキャッシュリストに追加

6. **Service Workerのキャッシュ更新**:
   - `CACHE_NAME` のバージョン番号を変更すると、次回アクセス時に新キャッシュが作成される
