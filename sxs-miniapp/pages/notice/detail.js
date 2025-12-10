const { noticeApi } = require('../../utils/api');
const { BASE_URL } = require('../../utils/request');

Page({
  data: {
    id: null,
    detail: null,
    loading: true
  },

  onLoad(options) {
    const { id } = options;
    this.setData({ id });
    this.loadDetail(id);
  },

  // 加载详情
  async loadDetail(id) {
    try {
      const res = await noticeApi.getDetail(id);
      
      // 格式化数据
      const detail = {
        ...res,
        typeName: this.getTypeName(res.type),
        publishTime: res.publish_time || '',
        viewCount: res.view_count || 0,
        isCollected: res.isCollected || false,
        attachments: (res.attachments || []).map(att => ({
          ...att,
          name: att.file_name,
          size: this.formatFileSize(att.file_size),
          type: this.getFileType(att.file_name),
          url: att.file_url
        }))
      };
      
      this.setData({ detail, loading: false });
    } catch (err) {
      console.error('加载通知详情失败:', err);
      this.setData({ loading: false });
    }
  },

  // 获取类型名称
  getTypeName(type) {
    const map = { notice: '通知', policy: '政策', activity: '活动' };
    return map[type] || '通知';
  },

  // 格式化文件大小
  formatFileSize(bytes) {
    if (!bytes) return '0B';
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
    return (bytes / 1024 / 1024).toFixed(1) + 'MB';
  },

  // 获取文件类型
  getFileType(filename) {
    if (!filename) return 'other';
    const ext = filename.split('.').pop().toLowerCase();
    const map = {
      doc: 'word', docx: 'word',
      xls: 'excel', xlsx: 'excel',
      pdf: 'pdf'
    };
    return map[ext] || 'other';
  },

  // 下载附件
  downloadFile(e) {
    const file = e.currentTarget.dataset.file;
    const url = file.url.startsWith('http') ? file.url : BASE_URL.replace('/api', '') + file.url;
    
    wx.showLoading({ title: '下载中...' });
    wx.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.openDocument({
            filePath: res.tempFilePath,
            showMenu: true,
            success: () => wx.hideLoading(),
            fail: () => {
              wx.hideLoading();
              wx.showToast({ title: '打开失败', icon: 'none' });
            }
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '下载失败', icon: 'none' });
      }
    });
  },

  // 分享
  shareNotice() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 收藏/取消收藏
  async toggleCollect() {
    try {
      const res = await noticeApi.toggleFavorite(this.data.id);
      const detail = this.data.detail;
      detail.isCollected = res.isCollected;
      this.setData({ detail });
      wx.showToast({
        title: res.isCollected ? '已收藏' : '已取消收藏',
        icon: 'success'
      });
    } catch (err) {
      console.error('收藏操作失败:', err);
    }
  },

  // 分享配置
  onShareAppMessage() {
    return {
      title: this.data.detail?.title || '通知公告',
      path: `/pages/notice/detail?id=${this.data.id}`
    };
  }
});
