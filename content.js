// AI Chat Hub - Content Script
// 各AIサービスのサイドバーからチャット履歴を取得

class ChatListExtractor {
  constructor() {
    this.service = this.detectService();
    this.init();
  }

  init() {
    // メッセージリスナー
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'getChatList') {
        this.getChatList()
          .then(data => sendResponse({ success: true, data }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
      }
    });

    // ページ読み込み完了時に自動取得してキャッシュ
    this.autoFetch();
  }

  detectService() {
    const url = window.location.href;
    if (url.includes('chat.openai.com') || url.includes('chatgpt.com')) return 'chatgpt';
    if (url.includes('gemini.google.com')) return 'gemini';
    if (url.includes('claude.ai')) return 'claude';
    if (url.includes('colab.research.google.com')) return 'colab';
    return null;
  }

  // 自動取得
  async autoFetch() {
    // DOM が安定するまで少し待つ
    await this.wait(2000);
    
    try {
      const data = await this.getChatList();
      if (data.length > 0) {
        // バックグラウンドに送信してキャッシュ
        chrome.runtime.sendMessage({
          action: 'updateChatList',
          service: this.service,
          data: data
        });
      }
    } catch (e) {
      console.log('Auto fetch failed:', e);
    }
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // チャットリストを取得
  async getChatList() {
    if (!this.service) {
      throw new Error('サポートされていないサービスです');
    }

    let chats = [];

    switch (this.service) {
      case 'chatgpt':
        chats = this.extractChatGPT();
        break;
      case 'gemini':
        chats = this.extractGemini();
        break;
      case 'claude':
        chats = this.extractClaude();
        break;
      case 'colab':
        chats = this.extractColab();
        break;
    }

    return chats;
  }

  // ChatGPTのサイドバーからチャット一覧を取得
  extractChatGPT() {
    const chats = [];
    
    // サイドバーのチャットリンクを取得
    const selectors = [
      'nav a[href*="/c/"]',
      'nav a[href*="/g/"]',
      '[data-testid*="conversation"] a',
      'nav ol li a',
      'nav ul li a'
    ];

    for (const selector of selectors) {
      const links = document.querySelectorAll(selector);
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href.includes('/c/') || href.includes('/g/'))) {
          const title = link.textContent?.trim() || '無題のチャット';
          const url = href.startsWith('http') ? href : `https://chatgpt.com${href}`;
          
          // 重複チェック
          if (!chats.find(c => c.url === url) && title.length > 0) {
            chats.push({ title, url });
          }
        }
      });
      
      if (chats.length > 0) break;
    }

    return chats;
  }

  // Geminiのサイドバーからチャット一覧を取得
  extractGemini() {
    const chats = [];
    
    // サイドバーのチャットリンクを取得
    const selectors = [
      'a[href*="/app/"]',
      '[role="listitem"] a',
      'nav a',
      '.conversation-item a'
    ];

    for (const selector of selectors) {
      const links = document.querySelectorAll(selector);
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes('/app/')) {
          const title = link.textContent?.trim() || '無題のチャット';
          const url = href.startsWith('http') ? href : `https://gemini.google.com${href}`;
          
          if (!chats.find(c => c.url === url) && title.length > 0 && title.length < 200) {
            chats.push({ title, url });
          }
        }
      });
      
      if (chats.length > 0) break;
    }

    return chats;
  }

  // Claudeのサイドバーからチャット一覧を取得
  extractClaude() {
    const chats = [];
    
    // サイドバーのチャットリンクを取得
    const selectors = [
      'a[href*="/chat/"]',
      'nav a[href*="/chat/"]',
      '[data-testid*="conversation"] a',
      '[class*="conversation"] a[href*="/chat/"]'
    ];

    for (const selector of selectors) {
      const links = document.querySelectorAll(selector);
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes('/chat/')) {
          // タイトルを取得（直接テキストか、子要素から）
          let title = '';
          const titleEl = link.querySelector('[class*="title"], [class*="name"], span, div');
          if (titleEl) {
            title = titleEl.textContent?.trim();
          }
          if (!title) {
            title = link.textContent?.trim();
          }
          title = title || '無題のチャット';
          
          const url = href.startsWith('http') ? href : `https://claude.ai${href}`;
          
          // 重複チェックと長すぎるタイトルを除外
          if (!chats.find(c => c.url === url) && title.length > 0 && title.length < 200) {
            chats.push({ title: title.substring(0, 100), url });
          }
        }
      });
      
      if (chats.length > 0) break;
    }

    return chats;
  }

  // Colabの最近開いたノートブック一覧を取得
  extractColab() {
    const chats = [];
    
    // ノートブックリストを取得
    const selectors = [
      'a[href*="colab.research.google.com/drive"]',
      'a[href*="colab.research.google.com/notebook"]',
      '[role="listitem"] a',
      '.file-browser a'
    ];

    for (const selector of selectors) {
      const links = document.querySelectorAll(selector);
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes('colab')) {
          const title = link.textContent?.trim() || '無題のノートブック';
          const url = href.startsWith('http') ? href : `https://colab.research.google.com${href}`;
          
          if (!chats.find(c => c.url === url) && title.length > 0 && title.length < 200) {
            chats.push({ title, url });
          }
        }
      });
      
      if (chats.length > 0) break;
    }

    // 現在のノートブックも追加
    const currentTitle = document.querySelector('.notebook-name, [class*="notebook-name"]');
    if (currentTitle) {
      const title = currentTitle.textContent?.trim();
      const url = window.location.href;
      if (title && !chats.find(c => c.url === url)) {
        chats.unshift({ title, url });
      }
    }

    return chats;
  }
}

// 初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ChatListExtractor());
} else {
  new ChatListExtractor();
}
