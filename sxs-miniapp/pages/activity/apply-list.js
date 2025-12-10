Page({
  data: {
    list: []
  },

  onLoad() {
    this.loadList();
  },

  onShow() {
    // 每次显示时刷新列表
    this.loadList();
  },

  // 加载申报列表
  loadList() {
    // TODO: 替换为实际接口调用
    // 模拟数据
    const mockList = [
      {
        id: '1',
        title: '乡村振兴调研实践',
        leader: '张三',
        memberCount: 5,
        location: '湖南省长沙市',
        status: 'pending',
        statusText: '待审核',
        createTime: '2025-06-01'
      },
      {
        id: '2',
        title: '支教助学志愿服务',
        leader: '李四',
        memberCount: 8,
        location: '贵州省遵义市',
        status: 'approved',
        statusText: '已通过',
        createTime: '2025-05-28'
      },
      {
        id: '3',
        title: '红色文化寻访',
        leader: '王五',
        memberCount: 6,
        location: '江西省井冈山',
        status: 'rejected',
        statusText: '已驳回',
        createTime: '2025-05-20'
      }
    ];
    this.setData({ list: mockList });
  },

  // 新建申报
  createNew() {
    wx.navigateTo({
      url: '/pages/activity/apply-detail?mode=create'
    });
  },

  // 查看详情
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/activity/apply-detail?id=${id}&mode=view`
    });
  }
});
