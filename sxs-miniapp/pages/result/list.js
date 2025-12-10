const { resultApi } = require('../../utils/api');
const { BASE_URL } = require('../../utils/request');

Page({
  data: {
    categories: ['乡村振兴', '支教助学', '红色文化', '科技支农', '医疗卫生'],
    currentCategory: '',
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

  // 加载成果列表
  async loadList(refresh = false) {
    if (this.data.loading) return;

    const { currentCategory, pageSize } = this.data;
    const currentPage = refresh ? 1 : this.data.page;
    this.setData({ loading: true });

    try {
      const res = await resultApi.getList({
        page: currentPage,
        pageSize,
        category: currentCategory
      });

      const baseUrl = BASE_URL.replace('/api', '');
      const newList = res.list.map(item => ({
        ...item,
        cover: item.cover_url ? (item.cover_url.startsWith('http') ? item.cover_url : baseUrl + item.cover_url) : '',
        submitDate: item.created_at ? item.created_at.slice(0, 10) : '',
        fileCount: item.file_count || 0,
        viewCount: item.view_count || 0
      }));

      this.setData({
        list: refresh ? newList : [...this.data.list, ...newList],
        page: currentPage + 1,
        hasMore: newList.length === pageSize
      });
    } catch (err) {
      console.error('加载成果列表失败:', err);
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  // 切换分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    if (category === this.data.currentCategory) {
      this.setData({ currentCategory: '' });
    } else {
      this.setData({ currentCategory: category });
    }
    this.setData({ list: [], page: 1, hasMore: true });
    this.loadList(true);
  },

  // 提交成果
  addResult() {
    wx.navigateTo({
      url: '/pages/result/detail?mode=create'
    });
  },

  // 查看详情
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/result/detail?id=${id}&mode=view`
    });
  }
});
