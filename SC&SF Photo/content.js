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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "saveImage" && message.imageUrl) {
    // 创建图片数据对象
    const photoData = {
      id: Date.now(),
      name: message.imageUrl.split('/').pop() || `image_${Date.now()}`,
      album: "default",
      size: "未知大小",
      date: new Date().toISOString().split('T')[0],
      imageUrl: message.imageUrl
    };
    
    // 发送数据到后台
    chrome.runtime.sendMessage({
      action: "saveImageData",
      photoData: photoData
    });
    
    // 通知用户
    alert(`图片已保存到奶猹奶福图库！请放心冲！`);
  }
});