const { evaluationApi } = require('../../utils/api');

Page({
  data: {
    currentTab: 'all',
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

  // 加载评优列表
  async loadList(refresh = false) {
    if (this.data.loading) return;

    const { currentTab, pageSize } = this.data;
    const currentPage = refresh ? 1 : this.data.page;
    this.setData({ loading: true });

    try {
      const res = await evaluationApi.getList({
        page: currentPage,
        pageSize,
        status: currentTab === 'all' ? '' : currentTab
      });

      const newList = res.list.map(item => ({
        ...item,
        statusText: item.my_score ? '已评审' : '待评审',
        status: item.my_score ? 'evaluated' : 'pending',
        myScore: item.my_score
      }));

      this.setData({
        list: refresh ? newList : [...this.data.list, ...newList],
        page: currentPage + 1,
        hasMore: newList.length === pageSize
      });
    } catch (err) {
      console.error('加载评优列表失败:', err);
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.currentTab) return;
    this.setData({ currentTab: tab, list: [], page: 1, hasMore: true });
    this.loadList(true);
  },

  // 查看详情
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/evaluate/detail?id=${id}`
    });
  }
});
