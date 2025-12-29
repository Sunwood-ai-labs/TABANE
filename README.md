# 🏆 TABANE (束)

> **Tracking And Browsing AI Navigation Extension**  
> ChatGPT・Gemini・Claude・Colabという複数のAI対話履歴を「束ねる」Chrome拡張。

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📖 概要

**TABANE** は、散らばりがちな主要AIサービスのチャット履歴を一本に束ねて管理・閲覧できるChrome拡張機能です。
「束（TABANE）」という名の通り、複数のAIとの対話を単一のダッシュボードに集約し、すりガラス調のモダンな「雅」デザインのサイドパネルから、過去の対話へ瞬時にアクセスできます。

## ✨ 特徴

*   **⚡ 統合ダッシュボード**: ChatGPT, Gemini, Claude, Colabの履歴を「束ねて」表示。
*   **🎨 モダンUI**: 視認性が高く、美しいすりガラス風デザイン（Glassmorphism）を採用。
*   **🔍 リアルタイム検索**: キーワード入力で、全サービスの履歴から目的のチャットを即座にフィルタリング。
*   **🔄 自動同期**: 各サービスのページを開くだけで、バックグラウンドで履歴を自動取得・更新。
*   **🚀 ワンクリック遷移**: タイトルをクリックするだけで、該当するチャットページへ直接ジャンプ。

## 🤝 対応サービス

| サービス | URL |
| :--- | :--- |
| **OpenAI ChatGPT** | [chatgpt.com](https://chatgpt.com/) |
| **Google Gemini** | [gemini.google.com](https://gemini.google.com/) |
| **Anthropic Claude** | [claude.ai](https://claude.ai/) |
| **Google Colab** | [colab.research.google.com](https://colab.research.google.com/) |

## 📦 インストール方法

1.  **リポジトリをダウンロード**: ZIPファイルをダウンロードして解凍、または `git clone` します。
2.  **拡張機能管理ページへ**: Chromeブラウザで `chrome://extensions/` を開きます。
3.  **デベロッパーモード**: 右上の「デベロッパーモード」スイッチを **ON** にします。
4.  **パッケージの読み込み**: 「パッケージ化されていない拡張機能を読み込む」ボタンをクリックし、解凍したフォルダ（`manifest.json` があるフォルダ）を選択します。
5.  **完了**: ツールバーに **TABANE** のアイコンが追加されればインストール完了です。

## 🚀 使い方

1.  **サイドパネルを開く**: Chromeツールバーの「TABANE」アイコンをクリックします。
2.  **履歴の取得**: 各AIサービスのページ（例: ChatGPT）を一度開いてください。自動的に履歴が収集されます。
3.  **検索と移動**: サイドパネルのリストから、見たいチャットをクリックするか、検索ボックスでフィルタリングして探せます。

## 🛠️ 技術スタック

*   **Frontend**: HTML5, CSS3 (Variables, Flexbox/Grid), JavaScript (Vanilla)
*   **Platform**: Chrome Extension Manifest V3
*   **Storage**: Chrome Storage API

## 📂 プロジェクト構成

```text
ai-chat-aggregator/
├── manifest.json      # 拡張機能の設定ファイル (Manifest V3)
├── background.js      # バックグラウンド処理・イベントリスナー
├── content.js         # 各AIサービスページでのDOM解析・履歴取得
├── sidepanel.html     # サイドパネルの構造（HTML）
├── sidepanel.css      # サイドパネルのスタイル（CSS）
├── sidepanel.js       # サイドパネルのロジック・表示制御
├── page.html          # (Optional) フルページ表示用HTML
├── page.css           # (Optional) フルページ表示用CSS
├── icons/             # アイコン画像ディレクトリ
└── README.md          # ドキュメント (This file)
```

## ⚠️ 注意事項

*   各AIサービスのWebサイトの仕様変更（DOM構造の変更など）により、履歴が取得できなくなる可能性があります。
*   取得した履歴データは、お使いのブラウザのローカルストレージ（`chrome.storage.local`）にのみ保存され、外部サーバーへ送信されることはありません。

## 📜 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。
