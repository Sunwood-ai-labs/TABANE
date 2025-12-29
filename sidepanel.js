// AI Chat Hub - Side Panel Script

class AIChatHub {
  constructor() {
    this.chatData = {
      chatgpt: [],
      gemini: [],
      claude: [],
      colab: []
    };
    this.searchQuery = '';
    this.init();
  }

  async init() {
    await this.loadCachedData();
    this.bindEvents();
    this.initDashboard(); // Dashboard logic (Clock/Greeting)
    this.render();
    this.fetchAllServices();
  }

  // キャッシュされたデータを読み込み
  async loadCachedData() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['chatHubData'], (result) => {
        if (result.chatHubData) {
          this.chatData = result.chatHubData;
        }
        resolve();
      });
    });
  }

  // データをキャッシュに保存
  async saveCachedData() {
    return new Promise((resolve) => {
      chrome.storage.local.set({ chatHubData: this.chatData }, resolve);
    });
  }

  // イベントバインド
  bindEvents() {
    // 検索
    document.getElementById('searchInput').addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase();
      this.render();
    });

    // 更新ボタン
    document.getElementById('refreshBtn')?.addEventListener('click', () => {
      this.fetchAllServices();
    });

    // 全画面表示ボタン
    document.getElementById('expandBtn')?.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('page.html') });
    });

    // カードヘッダークリックでサービスを開く
    document.querySelectorAll('.card-header').forEach(header => {
      header.addEventListener('click', () => {
        const service = header.closest('.service-card').dataset.service;
        this.openService(service);
      });
    });

    // ストレージ変更を監視
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.chatHubData) {
        this.chatData = changes.chatHubData.newValue || this.chatData;
        this.render();
      }
    });
  }

  // ダッシュボード固有の初期化 (時計・挨拶)
  initDashboard() {
    const clockEl = document.getElementById('clock');
    const greetingEl = document.getElementById('greeting');

    if (clockEl) {
      const updateClock = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        clockEl.textContent = `${hours}:${minutes}`;

        // 挨拶の更新
        if (greetingEl) {
          const h = now.getHours();
          let text = 'Hello';
          if (h >= 5 && h < 12) text = 'Good Morning';
          else if (h >= 12 && h < 18) text = 'Good Afternoon';
          else text = 'Good Evening';
          greetingEl.textContent = text;
        }
      };

      updateClock();
      setInterval(updateClock, 1000);
    }
  }

  // 全サービスからデータ取得を試みる
  async fetchAllServices() {
    const services = ['chatgpt', 'gemini', 'claude', 'colab'];

    for (const service of services) {
      this.setLoading(service, true);
    }

    // 開いているタブから取得を試みる
    try {
      const tabs = await chrome.tabs.query({});

      for (const tab of tabs) {
        const service = this.detectService(tab.url);
        if (service) {
          try {
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'getChatList' });
            if (response && response.success) {
              this.chatData[service] = response.data;
              this.render();
            }
          } catch (e) {
            // タブにContent Scriptがない場合はスキップ
          }
        }
      }

      await this.saveCachedData();
    } catch (error) {
      console.error('Fetch error:', error);
    }

    for (const service of services) {
      this.setLoading(service, false);
    }
  }

  // サービスを検出
  detectService(url) {
    if (!url) return null;
    if (url.includes('chat.openai.com') || url.includes('chatgpt.com')) return 'chatgpt';
    if (url.includes('gemini.google.com')) return 'gemini';
    if (url.includes('claude.ai')) return 'claude';
    if (url.includes('colab.research.google.com')) return 'colab';
    return null;
  }

  // サービスを開く
  openService(service) {
    const urls = {
      chatgpt: 'https://chatgpt.com/',
      gemini: 'https://gemini.google.com/',
      claude: 'https://claude.ai/',
      colab: 'https://colab.research.google.com/'
    };
    chrome.tabs.create({ url: urls[service] });
  }

  // ローディング状態を設定
  setLoading(service, isLoading) {
    const list = document.getElementById(`${service}-list`);
    if (isLoading && this.chatData[service].length === 0) {
      list.innerHTML = '<div class="loading">読み込み中...</div>';
    }
  }

  // 描画
  render() {
    ['chatgpt', 'gemini', 'claude', 'colab'].forEach(service => {
      this.renderServiceList(service);
    });
  }

  // サービス別リストを描画
  renderServiceList(service) {
    const list = document.getElementById(`${service}-list`);
    const countEl = document.getElementById(`${service}-count`);

    let chats = this.chatData[service] || [];

    // 検索フィルタ
    if (this.searchQuery) {
      chats = chats.filter(chat =>
        chat.title.toLowerCase().includes(this.searchQuery)
      );
    }

    countEl.textContent = chats.length;

    if (chats.length === 0) {
      const urls = {
        chatgpt: 'https://chatgpt.com/',
        gemini: 'https://gemini.google.com/',
        claude: 'https://claude.ai/',
        colab: 'https://colab.research.google.com/'
      };

      list.innerHTML = `
        <div class="empty">履歴がありません</div>
        <a href="#" class="open-service" data-url="${urls[service]}">
          ${this.getServiceName(service)}を開いて取得 →
        </a>
      `;

      list.querySelector('.open-service')?.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({ url: e.target.dataset.url });
      });
      return;
    }

    list.innerHTML = chats.slice(0, 20).map((chat, index) => `
      <a href="#" class="chat-item" data-url="${this.escapeHtml(chat.url)}" style="animation-delay: ${index * 0.03}s">
        <div class="chat-item-title">${this.highlightText(this.escapeHtml(chat.title))}</div>
        ${chat.date ? `<div class="chat-item-meta">${chat.date}</div>` : ''}
      </a>
    `).join('');

    // クリックイベント
    list.querySelectorAll('.chat-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const url = item.dataset.url;
        if (url) {
          chrome.tabs.create({ url });
        }
      });
    });
  }

  // サービス名を取得
  getServiceName(service) {
    const names = {
      chatgpt: 'ChatGPT',
      gemini: 'Gemini',
      claude: 'Claude',
      colab: 'Colab'
    };
    return names[service] || service;
  }

  // テキストをハイライト
  highlightText(text) {
    if (!this.searchQuery) return text;
    const regex = new RegExp(`(${this.escapeRegex(this.searchQuery)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  // HTMLエスケープ
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 正規表現エスケープ
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  new AIChatHub();
});
