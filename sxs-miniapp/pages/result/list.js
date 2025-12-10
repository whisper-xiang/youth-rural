Page({
  data: {
    categories: ['乡村振兴', '支教助学', '红色文化', '科技支农', '医疗卫生'],
    currentCategory: '',
    list: [],
    filteredList: []
  },

  onLoad() {
    this.loadList();
  },

  onShow() {
    this.loadList();
  },

  // 加载成果列表
  loadList() {
    // TODO: 替换为实际接口调用
    const mockList = [
      {
        id: '1',
        title: '望城区乡村振兴调研报告',
        teamName: '青春筑梦队',
        college: '经济管理学院',
        category: '乡村振兴',
        cover: '/images/cover1.jpg',
        summary: '通过为期两周的实地调研，深入了解望城区乡村振兴战略实施情况，形成调研报告并提出发展建议。',
        submitDate: '2025-07-20',
        fileCount: 3,
        viewCount: 128
      },
      {
        id: '2',
        title: '山区支教实践纪实',
        teamName: '爱心支教团',
        college: '教育学院',
        category: '支教助学',
        cover: '/images/cover2.jpg',
        summary: '记录在贵州山区开展支教活动的全过程，包括教学设计、学生互动、成果展示等内容。',
        submitDate: '2025-07-18',
        fileCount: 5,
        viewCount: 256
      },
      {
        id: '3',
        title: '井冈山红色文化寻访记',
        teamName: '红色足迹队',
        college: '马克思主义学院',
        category: '红色文化',
        cover: '/images/cover3.jpg',
        summary: '追寻革命先辈足迹，探访井冈山革命根据地，传承红色基因，弘扬革命精神。',
        submitDate: '2025-07-15',
        fileCount: 4,
        viewCount: 189
      }
    ];
    this.setData({ list: mockList });
    this.filterList();
  },

  // 切换分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ currentCategory: category });
    this.filterList();
  },

  // 筛选列表
  filterList() {
    const { currentCategory, list } = this.data;
    let filteredList = list;
    if (currentCategory) {
      filteredList = list.filter(item => item.category === currentCategory);
    }
    this.setData({ filteredList });
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
