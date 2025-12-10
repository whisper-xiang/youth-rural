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

  // 加载通知列表
  loadList() {
    // TODO: 替换为实际接口调用
    const mockList = [
      {
        id: '1',
        type: 'notice',
        typeName: '通知',
        title: '关于开展2025年暑期"三下乡"社会实践活动的通知',
        summary: '为深入学习贯彻习近平新时代中国特色社会主义思想，引导广大青年学生在社会实践中受教育、长才干、作贡献...',
        source: '校团委',
        publishTime: '2025-06-01',
        isTop: true,
        isRead: false
      },
      {
        id: '2',
        type: 'policy',
        typeName: '政策',
        title: '2025年"三下乡"活动经费报销管理办法',
        summary: '为规范"三下乡"活动经费使用和报销流程，提高资金使用效益，特制定本管理办法...',
        source: '财务处',
        publishTime: '2025-05-28',
        isTop: false,
        isRead: false
      },
      {
        id: '3',
        type: 'activity',
        typeName: '活动',
        title: '"三下乡"出征仪式将于6月15日举行',
        summary: '2025年暑期"三下乡"社会实践活动出征仪式定于6月15日上午9:00在学校大礼堂举行，请各团队负责人准时参加...',
        source: '校团委',
        publishTime: '2025-06-10',
        isTop: true,
        isRead: true
      },
      {
        id: '4',
        type: 'notice',
        typeName: '通知',
        title: '关于提交"三下乡"活动成果材料的通知',
        summary: '各实践团队请于8月31日前提交活动成果材料，包括调研报告、活动总结、照片视频等...',
        source: '校团委',
        publishTime: '2025-07-20',
        isTop: false,
        isRead: true
      },
      {
        id: '5',
        type: 'policy',
        typeName: '政策',
        title: '"三下乡"优秀团队评选标准',
        summary: '为做好2025年"三下乡"社会实践活动优秀团队评选工作，现将评选标准公布如下...',
        source: '校团委',
        publishTime: '2025-05-25',
        isTop: false,
        isRead: true
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
      filteredList = list.filter(item => item.type === currentTab);
    }

    // 置顶排序
    filteredList = filteredList.sort((a, b) => {
      if (a.isTop && !b.isTop) return -1;
      if (!a.isTop && b.isTop) return 1;
      return 0;
    });

    switch (currentTab) {
      case 'notice': tabName = '通知'; break;
      case 'policy': tabName = '政策'; break;
      case 'activity': tabName = '活动'; break;
      default: tabName = '';
    }

    this.setData({ filteredList, tabName });
  },

  // 查看详情
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    // 标记已读
    const list = this.data.list.map(item => {
      if (item.id === id) {
        return { ...item, isRead: true };
      }
      return item;
    });
    this.setData({ list });
    this.filterList();

    wx.navigateTo({
      url: `/pages/notice/detail?id=${id}`
    });
  }
});
