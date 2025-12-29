// AI Chat Hub - Background Service Worker

// サイドパネルの設定
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// 拡張機能アイコンクリック時にサイドパネルを開く
chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ tabId: tab.id });
});

// Content Scriptからのメッセージを処理
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateChatList') {
    updateChatList(request.service, request.data)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// チャットリストを更新
async function updateChatList(service, data) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['chatHubData'], (result) => {
      const chatHubData = result.chatHubData || {
        chatgpt: [],
        gemini: [],
        claude: [],
        colab: []
      };
      
      chatHubData[service] = data;
      
      chrome.storage.local.set({ chatHubData }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  });
}

// タブ更新時にバッジを表示
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const service = detectServiceFromUrl(tab.url);
    if (service) {
      chrome.action.setBadgeText({ text: '●', tabId });
      chrome.action.setBadgeBackgroundColor({ color: getServiceColor(service), tabId });
    } else {
      chrome.action.setBadgeText({ text: '', tabId });
    }
  }
});

// URLからサービスを検出
function detectServiceFromUrl(url) {
  if (url.includes('chat.openai.com') || url.includes('chatgpt.com')) return 'chatgpt';
  if (url.includes('gemini.google.com')) return 'gemini';
  if (url.includes('claude.ai')) return 'claude';
  if (url.includes('colab.research.google.com')) return 'colab';
  return null;
}

// サービスカラーを取得
function getServiceColor(service) {
  const colors = {
    chatgpt: '#10a37f',
    gemini: '#4285f4',
    claude: '#d97706',
    colab: '#f9ab00'
  };
  return colors[service] || '#667eea';
}
