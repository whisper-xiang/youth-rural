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

  // 加载评优列表
  loadList() {
    // TODO: 替换为实际接口调用
    const mockList = [
      {
        id: '1',
        title: '望城区乡村振兴调研报告',
        teamName: '青春筑梦队',
        college: '经济管理学院',
        theme: '乡村振兴',
        status: 'pending',
        statusText: '待评审',
        myScore: null
      },
      {
        id: '2',
        title: '山区支教实践纪实',
        teamName: '爱心支教团',
        college: '教育学院',
        theme: '支教助学',
        status: 'evaluated',
        statusText: '已评审',
        myScore: 92
      },
      {
        id: '3',
        title: '井冈山红色文化寻访记',
        teamName: '红色足迹队',
        college: '马克思主义学院',
        theme: '红色文化',
        status: 'pending',
        statusText: '待评审',
        myScore: null
      },
      {
        id: '4',
        title: '农村电商助农实践',
        teamName: '科技兴农队',
        college: '农学院',
        theme: '科技支农',
        status: 'evaluated',
        statusText: '已评审',
        myScore: 88
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
      case 'pending': tabName = '待评审'; break;
      case 'evaluated': tabName = '已评审'; break;
      default: tabName = '';
    }

    this.setData({ filteredList, tabName });
  },

  // 查看详情
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/evaluate/detail?id=${id}`
    });
  }
});
