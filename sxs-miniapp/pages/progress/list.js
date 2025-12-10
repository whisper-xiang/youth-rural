const { progressApi } = require('../../utils/api');
const { BASE_URL } = require('../../utils/request');

Page({
  data: {
    list: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false
  },

  onLoad() {
    this.loadList(true);
  },

  onShow() {
    this.loadList(true);
  },

  onPullDownRefresh() {
    this.loadList(true);
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadList(false);
    }
  },

  // 加载进度列表
  async loadList(refresh = false) {
    if (this.data.loading) return;

    const currentPage = refresh ? 1 : this.data.page;
    this.setData({ loading: true });

    try {
      const res = await progressApi.getList({
        page: currentPage,
        pageSize: this.data.pageSize
      });

      const baseUrl = BASE_URL.replace('/api', '');
      const newList = res.list.map(item => ({
        ...item,
        date: item.progress_date ? item.progress_date.slice(0, 10) : '',
        summary: item.content ? item.content.slice(0, 100) : '',
        images: (item.images || []).map(img => img.startsWith('http') ? img : baseUrl + img),
        imageCount: (item.images || []).length
      }));

      this.setData({
        list: refresh ? newList : [...this.data.list, ...newList],
        page: currentPage + 1,
        hasMore: newList.length === this.data.pageSize
      });
    } catch (err) {
      console.error('加载进度列表失败:', err);
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  // 上传进度
  addProgress() {
    wx.navigateTo({
      url: '/pages/progress/detail?mode=create'
    });
  },

  // 查看详情
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/progress/detail?id=${id}&mode=view`
    });
  }
});
