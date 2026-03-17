# ぱぱん式 コラム（ブログ記事）作成ガイドライン

このドキュメントは、`blog` ディレクトリ内に新しいコラム記事を作成する際の仕様とテンプレートをまとめたものです。デザインの統一感を保つため、以下のルールに従って作成してください。

## 1. ファイルと基本設定

*   **ファイル名**: `article00X.html` のように連番で作成します。
*   **テンプレート**: 新規作成時は `blog/template.html` をベースにするか、既存の記事（`article001.html` 等）をコピーして作成します。
*   **メタタグ**: `<title>` と `<meta name="description">` は記事ごとに必ず設定してください。

## 2. 記事の構造

記事本文は `<div class="container">` の中に記述します。

### 見出し
*   `<h1>` : 記事のタイトル（ページ内に1つのみ）
*   `<h2>` : 大項目（水色の左線と薄い青背景のデザイン）
*   `<h3>` : 中項目

### パンくずリスト
記事の上部に以下のようなパンくずリストを配置します。
```html
<div class="breadcrumb">
    <a href="../index.html">トップ</a> &gt; <a href="index.html">コラム一覧</a> &gt; 記事のタイトル
</div>
```

## 3. コンテンツへの誘導（おすすめ枠）

記事の途中で、ぱぱん式の学習コンテンツ（ゲームなど）へ誘導する場合は、目立つように `.ad-box` クラスを使用した枠を設置します。

```html
<div class="ad-box">
    <p>💡 おすすめコンテンツ：<br><br><a href="../dungeon.html">⚔️ 計算ダンジョンに挑戦してみよう！</a></p>
</div>
```

## 4. 画面下部のナビゲーションボタン【重要】

記事の最後（`</div> <!-- containerの終わり -->` の直前）には、必ず「コラム一覧」に戻るボタンと「ぱぱん式ホーム」に戻るボタンを設置してください。

**以下のHTMLコードをそのままコピー＆ペーストして使用します。**

```html
<div style="text-align: center; margin-top: 50px; margin-bottom: 20px; display: flex; flex-wrap: wrap; justify-content: center; gap: 15px;">
    <a href="index.html" style="
        text-decoration: none;
        background: #fff;
        color: #ffad60;
        border: 2px solid #ffad60;
        padding: 12px 30px;
        border-radius: 30px;
        font-weight: bold;
        font-size: 1em;
        transition: 0.3s;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        display: inline-block;
    " onmouseover="this.style.background='#ffad60'; this.style.color='#fff';"
        onmouseout="this.style.background='#fff'; this.style.color='#ffad60';">
        📝 コラム一覧
    </a>
    <a href="../index.html" style="
        text-decoration: none;
        background: #88cdf6;
        color: #fff;
        border: 2px solid #88cdf6;
        padding: 12px 30px;
        border-radius: 30px;
        font-weight: bold;
        font-size: 1em;
        transition: 0.3s;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        display: inline-block;
    " onmouseover="this.style.background='#60a5d6'; this.style.borderColor='#60a5d6';"
        onmouseout="this.style.background='#88cdf6'; this.style.borderColor='#88cdf6';">
        🏠 ぱぱん式ホームへ
    </a>
</div>
```

## 5. 記事作成後の作業

新しい記事を作成した後は、必ず **`blog/index.html` (コラム一覧ページ)** を更新し、新しい記事へのリンク（カード）を一番上に追加してください。
