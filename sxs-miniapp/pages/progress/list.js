Page({
  data: {
    list: []
  },

  onLoad() {
    this.loadList();
  },

  onShow() {
    this.loadList();
  },

  // 加载进度列表
  loadList() {
    // TODO: 替换为实际接口调用
    const mockList = [
      {
        id: '1',
        title: '第一周调研启动',
        date: '2025-07-03',
        summary: '团队抵达望城区，与当地村委会对接，了解基本情况，制定详细调研计划。',
        images: ['/images/demo1.jpg', '/images/demo2.jpg', '/images/demo3.jpg'],
        imageCount: 5,
        uploader: '张三',
        teamName: '青春筑梦队'
      },
      {
        id: '2',
        title: '入户走访调研',
        date: '2025-07-05',
        summary: '深入农户家中进行问卷调查和访谈，收集一手资料，了解村民实际需求。',
        images: ['/images/demo1.jpg', '/images/demo2.jpg'],
        imageCount: 2,
        uploader: '李四',
        teamName: '青春筑梦队'
      },
      {
        id: '3',
        title: '数据整理与分析',
        date: '2025-07-10',
        summary: '对收集的问卷和访谈资料进行整理分析，初步形成调研报告框架。',
        images: [],
        imageCount: 0,
        uploader: '王五',
        teamName: '青春筑梦队'
      }
    ];
    this.setData({ list: mockList });
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
