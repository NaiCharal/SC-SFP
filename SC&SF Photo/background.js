// ==============================================================================
// Copyright (c) 2025 NaiCharal (南奈岭)
// 
// Licensed under MIT License with Personal Information Protection Appendix
// Full license available at: https://github.com/NaiCharal/SC-SFP/LICENSE
// 
// Author's Profile:
// • Bilibili: https://space.bilibili.com/1869914379
// • GitHub: https://github.com/NaiCharal
// 
// Personal Introduction: 
// "I believe that everyone can be innovative. / 我相信每个人都可以创新"
// ==============================================================================

// 初始化存储
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['albums', 'photos', 'theme'], (result) => {
    if (!result.albums) {
      chrome.storage.local.set({
        albums: [
          { id: "default", name: "默认图库", type: "folder", photos: [] }
        ]
      });
    }
    
    if (!result.photos) {
      chrome.storage.local.set({ photos: [] });
    }
    
    if (!result.theme) {
      chrome.storage.local.set({ theme: "light" });
    }
  });
  
  // 创建上下文菜单
  chrome.contextMenus.create({
    id: "save-image-to-gallery",
    title: "保存到奶猹奶福图库",
    contexts: ["image"]
  });
});

// 处理上下文菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "save-image-to-gallery" && info.srcUrl) {
    // 通知内容脚本保存图片
    chrome.tabs.sendMessage(tab.id, { 
      action: "saveImage", 
      imageUrl: info.srcUrl 
    });
  }
});

// 处理消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "saveImageData") {
    chrome.storage.local.get('photos', (result) => {
      const photos = result.photos || [];
      photos.push(message.photoData);
      chrome.storage.local.set({ photos });
      
      // 通知popup更新UI
      chrome.runtime.sendMessage({ 
        action: "photoAdded", 
        photo: message.photoData 
      });
    });
  } else if (message.action === "requestPhotos") {
    chrome.storage.local.get('photos', (result) => {
      sendResponse({ photos: result.photos || [] });
    });
    return true;
  } else if (message.action === "requestAlbums") {
    chrome.storage.local.get('albums', (result) => {
      sendResponse({ albums: result.albums || [] });
    });
    return true;
  } else if (message.action === "requestAllData") {
    chrome.storage.local.get(['albums', 'photos'], (result) => {
      sendResponse({ 
        albums: result.albums || [],
        photos: result.photos || [] 
      });
    });
    return true;
  } else if (message.action === "saveImageFile") {
    // 将Base64数据转换为Blob
    const byteString = atob(message.fileData.split(',')[1]);
    const mimeString = message.fileData.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], { type: mimeString });
    
    // 创建URL并下载文件
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
      url: url,
      filename: `assets/images/${message.fileName}`,
      conflictAction: 'uniquify',
      saveAs: false
    });
  }
});