const { approvalApi } = require('../../utils/api');

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

  // 加载审批列表
  async loadList(refresh = false) {
    if (this.data.loading) return;

    const { currentTab, pageSize } = this.data;
    const currentPage = refresh ? 1 : this.data.page;
    this.setData({ loading: true });

    try {
      const res = await approvalApi.getList({
        page: currentPage,
        pageSize,
        status: currentTab === 'all' ? '' : currentTab
      });

      const statusMap = {
        pending: '待审核', approved: '已通过', rejected: '已驳回'
      };

      const newList = res.list.map(item => ({
        ...item,
        statusText: statusMap[item.status] || item.status,
        applyTime: item.submit_time ? item.submit_time.slice(0, 10) : ''
      }));

      this.setData({
        list: refresh ? newList : [...this.data.list, ...newList],
        page: currentPage + 1,
        hasMore: newList.length === pageSize
      });
    } catch (err) {
      console.error('加载审批列表失败:', err);
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
      url: `/pages/approve/detail?id=${id}`
    });
  },

  // 快捷通过
  quickApprove(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认通过',
      content: '确定通过该项目的申报吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await approvalApi.approve(id, '同意');
            wx.showToast({ title: '审批通过', icon: 'success' });
            this.loadList(true);
          } catch (err) {
            console.error('审批失败:', err);
          }
        }
      }
    });
  },

  // 快捷驳回
  quickReject(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认驳回',
      content: '确定驳回该项目的申报吗？',
      editable: true,
      placeholderText: '请输入驳回原因（选填）',
      success: async (res) => {
        if (res.confirm) {
          try {
            await approvalApi.reject(id, res.content || '不符合要求');
            wx.showToast({ title: '已驳回', icon: 'success' });
            this.loadList(true);
          } catch (err) {
            console.error('驳回失败:', err);
          }
        }
      }
    });
  }
});
