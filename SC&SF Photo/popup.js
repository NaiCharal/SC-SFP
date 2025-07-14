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

// 当前选中的图册
let currentAlbumId = "default";
let selectedImageId = null;
let selectedAlbumId = null;

// DOM 元素
const photoGrid = document.getElementById('photoGrid');
const albumList = document.getElementById('albumList');
const currentAlbum = document.getElementById('currentAlbum');
const themeToggle = document.getElementById('themeToggle');
const dragOverlay = document.getElementById('dragOverlay');
const addPhotoBtn = document.getElementById('addPhotoBtn');
const searchInput = document.getElementById('searchInput');
const addAlbumBtn = document.getElementById('addAlbumBtn');
const createAlbumModal = document.getElementById('createAlbumModal');
const cancelCreateAlbum = document.getElementById('cancelCreateAlbum');
const confirmCreateAlbum = document.getElementById('confirmCreateAlbum');
const albumNameInput = document.getElementById('albumName');
const albumDescriptionInput = document.getElementById('albumDescription');
const imagePreviewModal = document.getElementById('imagePreviewModal');
const previewTitle = document.getElementById('previewTitle');
const closePreview = document.getElementById('closePreview');
const deleteImageBtn = document.getElementById('deleteImageBtn');
const imageInfo = document.getElementById('imageInfo');
const renameImageBtn = document.getElementById('renameImageBtn');
const moveImageBtn = document.getElementById('moveImageBtn');
const renameImageModal = document.getElementById('renameImageModal');
const newImageName = document.getElementById('newImageName');
const cancelRenameImage = document.getElementById('cancelRenameImage');
const confirmRenameImage = document.getElementById('confirmRenameImage');
const moveImageModal = document.getElementById('moveImageModal');
const moveAlbumList = document.getElementById('moveAlbumList');
const cancelMoveImage = document.getElementById('cancelMoveImage');
const confirmMoveImage = document.getElementById('confirmMoveImage');
const manageAlbumsBtn = document.getElementById('manageAlbumsBtn');
const manageAlbumsModal = document.getElementById('manageAlbumsModal');
const manageAlbumList = document.getElementById('manageAlbumList');
const renameAlbumBtn = document.getElementById('renameAlbumBtn');
const deleteAlbumBtn = document.getElementById('deleteAlbumBtn');
const closeManageAlbums = document.getElementById('closeManageAlbums');
const renameAlbumModal = document.getElementById('renameAlbumModal');
const newAlbumName = document.getElementById('newAlbumName');
const cancelRenameAlbum = document.getElementById('cancelRenameAlbum');
const confirmRenameAlbum = document.getElementById('confirmRenameAlbum');

// 从存储中加载数据
function loadData() {
  chrome.storage.local.get(['albums', 'photos', 'theme'], (result) => {
    renderAlbumList(result.albums || []);
    renderGallery(result.photos || []);
    
    // 应用主题
    if (result.theme === 'dark') {
      document.body.classList.add('dark');
      themeToggle.textContent = '☀☀';
    }
  });
}

// 渲染图册列表
function renderAlbumList(albums) {
  albumList.innerHTML = '';
  
  // 确保默认图库存在
  if (!albums.some(a => a.id === "default")) {
    albums.unshift({ 
      id: "default", 
      name: "默认图库", 
      type: "folder", 
      photos: [] 
    });
  }
  
  albums.forEach(album => {
    const albumItem = document.createElement('li');
    albumItem.className = album.type === 'folder' ? 'folder-icon' : 'album-icon';
    albumItem.innerHTML = `
      <span class="album-icon">📁📁</span>
      <span class="album-name">${album.name}</span>
      <span class="photo-count">(${album.photos?.length || 0})</span>
    `;
    albumItem.dataset.id = album.id;
    
    if (album.id === currentAlbumId) {
      albumItem.classList.add('active');
    }
    
    albumItem.addEventListener('click', () => {
      // 移除所有active
      document.querySelectorAll('#albumList li').forEach(li => {
        li.classList.remove('active');
      });
      
      // 设置当前active
      albumItem.classList.add('active');
      
      // 更新当前图册
      currentAlbumId = album.id;
      currentAlbum.textContent = album.name;
      renderGallery();
    });
    
    albumList.appendChild(albumItem);
  });
}

// 渲染图库
function renderGallery() {
  showLoading();
  
  chrome.runtime.sendMessage({ action: "requestPhotos" }, (response) => {
    const photos = response.photos || [];
    photoGrid.innerHTML = '';
    
    // 获取当前图册的图片
    const filteredPhotos = photos.filter(photo => {
      return photo.album === currentAlbumId && 
             (photo.name.toLowerCase().includes(searchInput.value.toLowerCase()) || 
              photo.size.toLowerCase().includes(searchInput.value.toLowerCase()));
    });
    
    // 如果没有图片，显示空状态
    if (filteredPhotos.length === 0) {
      photoGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🖼🖼🖼️</div>
          <h3>当前图库为空</h3>
          <p>点击"添加图片"按钮或拖放图片到此处</p>
        </div>
      `;
      return;
    }
    
    // 添加图片卡片
    filteredPhotos.forEach(photo => {
      const photoCard = document.createElement('div');
      photoCard.className = 'photo-card';
      photoCard.dataset.id = photo.id;
      
      // 获取图片URL
      const imageUrl = chrome.runtime.getURL(photo.imageUrl);
      
      photoCard.innerHTML = `
        <div class="photo-image-container">
          
        </div>
        <div class="photo-info">
          <div class="photo-name">${photo.name}</div>
          <div class="photo-details">
            <span>${photo.size}</span>
            <span>${photo.date}</span>
          </div>
        </div>
      `;
      
      // 添加点击事件
      photoCard.addEventListener('click', () => {
        showImagePreview(photo);
      });
      
      photoGrid.appendChild(photoCard);
    });
  });
}

// 显示图片预览
function showImagePreview(photo) {
  const imageUrl = chrome.runtime.getURL(photo.imageUrl);
  
  // 创建预览元素
  const previewContainer = document.createElement('div');
  previewContainer.className = 'image-preview-container';
  previewContainer.innerHTML = `
    
  `;
  
  // 清空模态框内容并添加预览
  const modalBody = imagePreviewModal.querySelector('.modal-body');
  modalBody.innerHTML = '';
  modalBody.appendChild(previewContainer);
  
  previewTitle.textContent = photo.name;
  imageInfo.innerHTML = `
    <div>大小: ${photo.size}</div>
    <div>添加日期: ${photo.date}</div>
    <div>所属图册: ${photo.album}</div>
  `;
  
  selectedImageId = photo.id;
  imagePreviewModal.style.display = 'flex';
}

// 显示加载状态
function showLoading() {
  photoGrid.innerHTML = `
    <div class="empty-state">
      <div class="loading-spinner"></div>
      <h3>加载中...</h3>
    </div>
  `;
}

// 切换主题
function toggleTheme() {
  document.body.classList.toggle('dark');
  themeToggle.textContent = document.body.classList.contains('dark') ? '☀☀' : '🌙🌙';
  chrome.storage.local.set({ theme: document.body.classList.contains('dark') ? 'dark' : 'light' });
}

// 添加图片
function addPhotos(files) {
  if (!files || files.length === 0) return;
  
  showLoading();
  
  chrome.runtime.sendMessage({ action: "requestPhotos" }, (response) => {
    const photos = response.photos || [];
    
    Array.from(files).forEach(file => {
      if (!file.type.match('image.*')) return;
      
      const reader = new FileReader();
      reader.onload = function(e) {
        // 生成唯一文件名
        const fileName = `image_${Date.now()}_${Math.floor(Math.random() * 1000)}.${file.type.split('/')[1]}`;
        
        const photoData = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          name: file.name,
          album: currentAlbumId,
          size: formatFileSize(file.size),
          date: new Date().toISOString().split('T')[0],
          imageUrl: `assets/images/${fileName}`
        };
        
        // 保存图片数据
        photos.push(photoData);
        
        // 保存图片文件
        chrome.runtime.sendMessage({
          action: "saveImageFile",
          fileName: fileName,
          fileData: e.target.result
        });
        
        // 保存到存储
        chrome.storage.local.set({ photos }, () => {
          renderGallery();
          showToast(`"${file.name}" 已添加到图库`);
        });
      };
      
      reader.readAsDataURL(file);
    });
  });
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 显示提示信息
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// 重命名图片
function renameImage() {
  if (!selectedImageId) return;
  
  chrome.runtime.sendMessage({ action: "requestPhotos" }, (response) => {
    const photos = response.photos || [];
    const photo = photos.find(p => p.id === selectedImageId);
    
    if (photo) {
      newImageName.value = photo.name;
      renameImageModal.style.display = 'flex';
    }
  });
}

// 移动图片
function moveImage() {
  if (!selectedImageId) return;
  
  // 获取所有图册
  chrome.runtime.sendMessage({ action: "requestAlbums" }, (response) => {
    const albums = response.albums || [];
    moveAlbumList.innerHTML = '';
    
    albums.forEach(album => {
      if (album.id !== currentAlbumId) {
        const albumItem = document.createElement('li');
        albumItem.className = 'move-album-item';
        albumItem.textContent = album.name;
        albumItem.dataset.id = album.id;
        
        albumItem.addEventListener('click', () => {
          // 移除所有active
          document.querySelectorAll('.move-album-item').forEach(item => {
            item.classList.remove('active');
          });
          
          // 设置当前active
          albumItem.classList.add('active');
          selectedAlbumId = album.id;
        });
        
        moveAlbumList.appendChild(albumItem);
      }
    });
    
    if (moveAlbumList.children.length === 0) {
      moveAlbumList.innerHTML = '<li>没有其他图册可用</li>';
    }
    
    moveImageModal.style.display = 'flex';
  });
}

// 渲染图册管理列表
function renderManageAlbumList() {
  chrome.runtime.sendMessage({ action: "requestAlbums" }, (response) => {
    const albums = response.albums || [];
    manageAlbumList.innerHTML = '';
    selectedAlbumId = null;
    
    albums.forEach(album => {
      if (album.id !== "default") { // 不允许管理默认图册
        const albumItem = document.createElement('li');
        albumItem.className = 'move-album-item';
        albumItem.innerHTML = `
          <input type="checkbox" id="album_${album.id}" data-id="${album.id}">
          <label for="album_${album.id}">${album.name}</label>
        `;
        
        albumItem.addEventListener('click', (e) => {
          if (e.target.tagName !== 'INPUT') {
            const checkbox = albumItem.querySelector('input');
            checkbox.checked = !checkbox.checked;
          }
        });
        
        manageAlbumList.appendChild(albumItem);
      }
    });
    
    if (manageAlbumList.children.length === 0) {
      manageAlbumList.innerHTML = '<li>没有可管理的图册</li>';
    }
    
    manageAlbumsModal.style.display = 'flex';
  });
}

// 获取选中的图册ID
function getSelectedAlbums() {
  const selected = [];
  document.querySelectorAll('#manageAlbumList input:checked').forEach(checkbox => {
    selected.push(checkbox.dataset.id);
  });
  return selected;
}

// 重命名图册
function renameSelectedAlbum() {
  const selected = getSelectedAlbums();
  if (selected.length !== 1) {
    showToast('请选择一个图册进行重命名');
    return;
  }
  
  chrome.runtime.sendMessage({ action: "requestAlbums" }, (response) => {
    const albums = response.albums || [];
    const album = albums.find(a => a.id === selected[0]);
    
    if (album) {
      newAlbumName.value = album.name;
      renameAlbumModal.style.display = 'flex';
    }
  });
}

// 删除选中的图册
function deleteSelectedAlbums() {
  const selected = getSelectedAlbums();
  if (selected.length === 0) {
    showToast('请选择要删除的图册');
    return;
  }
  
  if (confirm(`确定要删除 ${selected.length} 个图册吗？所有图片将被移动到默认图库`)) {
    chrome.runtime.sendMessage({ 
      action: "requestAllData" 
    }, (response) => {
      let albums = response.albums || [];
      let photos = response.photos || [];
      
      // 移动图片到默认图库
      photos = photos.map(photo => {
        if (selected.includes(photo.album)) {
          return { ...photo, album: "default" };
        }
        return photo;
      });
      
      // 删除图册
      albums = albums.filter(album => !selected.includes(album.id));
      
      // 保存更改
      chrome.storage.local.set({ albums, photos }, () => {
        renderAlbumList(albums);
        renderGallery();
        showToast(`已删除 ${selected.length} 个图册`);
        manageAlbumsModal.style.display = 'none';
      });
    });
  }
}

// 初始化图库
function initGallery() {
  loadData();
  
  // 拖放功能
  document.addEventListener('dragover', e => {
    e.preventDefault();
    dragOverlay.style.display = 'flex';
  });
  
  document.addEventListener('dragleave', () => {
    dragOverlay.style.display = 'none';
  });
  
  document.addEventListener('drop', e => {
    e.preventDefault();
    dragOverlay.style.display = 'none';
    
    if (e.dataTransfer.files.length) {
      addPhotos(e.dataTransfer.files);
    }
  });
  
  // 添加图片按钮
  addPhotoBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    input.onchange = (e) => {
      addPhotos(e.target.files);
    };
    input.click();
  });
  
  // 新建图册按钮
  addAlbumBtn.addEventListener('click', () => {
    createAlbumModal.style.display = 'flex';
    albumNameInput.value = '';
    albumDescriptionInput.value = '';
  });
  
  // 取消创建图册
  cancelCreateAlbum.addEventListener('click', () => {
    createAlbumModal.style.display = 'none';
  });
  
  // 确认创建图册
  confirmCreateAlbum.addEventListener('click', () => {
    const name = albumNameInput.value.trim();
    if (!name) {
      showToast('请输入图册名称');
      return;
    }
    
    chrome.storage.local.get('albums', (result) => {
      const albums = result.albums || [];
      const newAlbum = {
        id: `album-${Date.now()}`,
        name: name,
        description: albumDescriptionInput.value,
        type: "album",
        photos: []
      };
      
      albums.push(newAlbum);
      chrome.storage.local.set({ albums }, () => {
        renderAlbumList(albums);
        createAlbumModal.style.display = 'none';
        showToast(`图册 "${name}" 创建成功`);
      });
    });
  });
  
  // 关闭预览
  closePreview.addEventListener('click', () => {
    imagePreviewModal.style.display = 'none';
    selectedImageId = null;
  });
  
  // 删除图片
  deleteImageBtn.addEventListener('click', () => {
    if (!selectedImageId) return;
    
    chrome.runtime.sendMessage({ action: "requestPhotos" }, (response) => {
      const photos = response.photos || [];
      const updatedPhotos = photos.filter(p => p.id !== selectedImageId);
      
      chrome.storage.local.set({ photos: updatedPhotos }, () => {
        imagePreviewModal.style.display = 'none';
        renderGallery();
        showToast('图片已删除');
      });
    });
  });
  
  // 重命名图片
  renameImageBtn.addEventListener('click', renameImage);
  
  // 取消重命名图片
  cancelRenameImage.addEventListener('click', () => {
    renameImageModal.style.display = 'none';
  });
  
  // 确认重命名图片
  confirmRenameImage.addEventListener('click', () => {
    const newName = newImageName.value.trim();
    if (!newName) {
      showToast('请输入新名称');
      return;
    }
    
    chrome.runtime.sendMessage({ action: "requestPhotos" }, (response) => {
      const photos = response.photos || [];
      const updatedPhotos = photos.map(p => {
        if (p.id === selectedImageId) {
          return { ...p, name: newName };
        }
        return p;
      });
      
      chrome.storage.local.set({ photos: updatedPhotos }, () => {
        renameImageModal.style.display = 'none';
        imagePreviewModal.style.display = 'none';
        renderGallery();
        showToast('图片已重命名');
      });
    });
  });
  
  // 移动图片按钮
  moveImageBtn.addEventListener('click', moveImage);
  
  // 取消移动图片
  cancelMoveImage.addEventListener('click', () => {
    moveImageModal.style.display = 'none';
    selectedAlbumId = null;
  });
  
  // 确认移动图片
  confirmMoveImage.addEventListener('click', () => {
    if (!selectedAlbumId) {
      showToast('请选择目标图册');
      return;
    }
    
    chrome.runtime.sendMessage({ action: "requestAllData" }, (response) => {
      const albums = response.albums || [];
      const photos = response.photos || [];
      const targetAlbum = albums.find(a => a.id === selectedAlbumId);
      
      if (!targetAlbum) {
        showToast('目标图册不存在');
        return;
      }
      
      const updatedPhotos = photos.map(p => {
        if (p.id === selectedImageId) {
          return { ...p, album: selectedAlbumId };
        }
        return p;
      });
      
      chrome.storage.local.set({ photos: updatedPhotos }, () => {
        moveImageModal.style.display = 'none';
        imagePreviewModal.style.display = 'none';
        renderGallery();
        showToast(`图片已移动到 ${targetAlbum.name}`);
      });
    });
  });
  
  // 搜索功能
  searchInput.addEventListener('input', renderGallery);
  
  // 主题切换
  themeToggle.addEventListener('click', toggleTheme);
  
  // 图册管理
  manageAlbumsBtn.addEventListener('click', renderManageAlbumList);
  
  // 关闭图册管理
  closeManageAlbums.addEventListener('click', () => {
    manageAlbumsModal.style.display = 'none';
  });
  
  // 重命名图册
  renameAlbumBtn.addEventListener('click', renameSelectedAlbum);
  
  // 删除图册
  deleteAlbumBtn.addEventListener('click', deleteSelectedAlbums);
  
  // 取消重命名图册
  cancelRenameAlbum.addEventListener('click', () => {
    renameAlbumModal.style.display = 'none';
  });
  
  // 确认重命名图册
  confirmRenameAlbum.addEventListener('click', () => {
    const newName = newAlbumName.value.trim();
    if (!newName) {
      showToast('请输入新名称');
      return;
    }
    
    const selected = getSelectedAlbums();
    if (selected.length !== 1) return;
    
    chrome.runtime.sendMessage({ action: "requestAlbums" }, (response) => {
      const albums = response.albums || [];
      const updatedAlbums = albums.map(a => {
        if (a.id === selected[0]) {
          return { ...a, name: newName };
        }
        return a;
      });
      
      chrome.storage.local.set({ albums: updatedAlbums }, () => {
        renameAlbumModal.style.display = 'none';
        renderAlbumList(updatedAlbums);
        showToast('图册已重命名');
      });
    });
  });
}

// 初始化
initGallery();