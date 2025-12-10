Page({
  data: {
    currentTab: 'all',
    tabName: '',
    list: [],
    filteredList: []
  },

  onLoad() {
    this.loadList();
  },

  onShow() {
    this.loadList();
  },

  // 加载审批列表
  loadList() {
    // TODO: 替换为实际接口调用
    const mockList = [
      {
        id: '1',
        title: '乡村振兴调研实践',
        teamName: '青春筑梦队',
        leader: '张三',
        college: '经济管理学院',
        applyTime: '2025-06-01',
        status: 'pending',
        statusText: '待审核'
      },
      {
        id: '2',
        title: '支教助学志愿服务',
        teamName: '爱心支教团',
        leader: '李四',
        college: '教育学院',
        applyTime: '2025-05-28',
        status: 'approved',
        statusText: '已通过'
      },
      {
        id: '3',
        title: '红色文化寻访',
        teamName: '红色足迹队',
        leader: '王五',
        college: '马克思主义学院',
        applyTime: '2025-05-20',
        status: 'rejected',
        statusText: '已驳回'
      },
      {
        id: '4',
        title: '科技支农服务',
        teamName: '科技兴农队',
        leader: '赵六',
        college: '农学院',
        applyTime: '2025-06-02',
        status: 'pending',
        statusText: '待审核'
      }
    ];
    this.setData({ list: mockList });
    this.filterList();
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    this.filterList();
  },

  // 筛选列表
  filterList() {
    const { currentTab, list } = this.data;
    let filteredList = list;
    let tabName = '';

    if (currentTab !== 'all') {
      filteredList = list.filter(item => item.status === currentTab);
    }

    switch (currentTab) {
      case 'pending': tabName = '待审核'; break;
      case 'approved': tabName = '已通过'; break;
      case 'rejected': tabName = '已驳回'; break;
      default: tabName = '';
    }

    this.setData({ filteredList, tabName });
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
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用接口
          this.updateStatus(id, 'approved', '已通过');
          wx.showToast({ title: '审批通过', icon: 'success' });
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
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用接口，res.content 为驳回原因
          this.updateStatus(id, 'rejected', '已驳回');
          wx.showToast({ title: '已驳回', icon: 'success' });
        }
      }
    });
  },

  // 更新状态（本地模拟）
  updateStatus(id, status, statusText) {
    const list = this.data.list.map(item => {
      if (item.id === id) {
        return { ...item, status, statusText };
      }
      return item;
    });
    this.setData({ list });
    this.filterList();
  }
});
