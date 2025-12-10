Page({
  data: {
    id: null,
    detail: null,
    scoreItems: [
      { key: 'theme', name: '主题契合度', weight: 20, max: 20, value: 15 },
      { key: 'content', name: '内容完整性', weight: 25, max: 25, value: 20 },
      { key: 'innovation', name: '创新性', weight: 20, max: 20, value: 15 },
      { key: 'effect', name: '实践效果', weight: 20, max: 20, value: 15 },
      { key: 'presentation', name: '材料规范性', weight: 15, max: 15, value: 10 }
    ],
    totalScore: 75,
    comment: ''
  },

  onLoad(options) {
    const { id } = options;
    this.setData({ id });
    this.loadDetail(id);
  },

  // 加载详情
  loadDetail(id) {
    // TODO: 替换为实际接口调用
    const mockDetail = {
      id: '1',
      title: '望城区乡村振兴调研报告',
      teamName: '青春筑梦队',
      college: '经济管理学院',
      theme: '乡村振兴',
      leader: '张三',
      description: '本项目深入湖南省长沙市望城区多个乡村，通过问卷调查、入户访谈、座谈会等形式，全面了解当地乡村振兴战略实施情况，形成调研报告并提出发展建议。项目团队由5名学生和1名指导教师组成，历时两周完成实地调研。',
      materials: [
        { name: '调研报告.pdf', size: '2.5MB', type: 'pdf' },
        { name: '数据分析.xlsx', size: '1.2MB', type: 'excel' },
        { name: '活动视频.mp4', size: '45MB', type: 'video' },
        { name: '活动照片集.zip', size: '28MB', type: 'zip' }
      ],
      isEvaluated: false,
      myScore: null,
      myComment: '',
      evaluateTime: ''
    };
    this.setData({ detail: mockDetail });
    this.calculateTotal();
  },

  // 评分变化
  onScoreChange(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value;
    const scoreItems = this.data.scoreItems.map(item => {
      if (item.key === key) {
        return { ...item, value };
      }
      return item;
    });
    this.setData({ scoreItems });
    this.calculateTotal();
  },

  // 计算总分
  calculateTotal() {
    const total = this.data.scoreItems.reduce((sum, item) => sum + item.value, 0);
    this.setData({ totalScore: total });
  },

  // 评语输入
  onCommentInput(e) {
    this.setData({ comment: e.detail.value });
  },

  // 查看材料
  viewMaterial(e) {
    const item = e.currentTarget.dataset.item;
    wx.showToast({ title: '查看: ' + item.name, icon: 'none' });
    // TODO: 实际文件预览逻辑
  },

  // 提交评审
  submitEvaluate() {
    if (!this.data.comment.trim()) {
      wx.showToast({ title: '请填写评审意见', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认提交',
      content: `确定提交评审吗？\n评分：${this.data.totalScore}分`,
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用接口
          const detail = this.data.detail;
          detail.isEvaluated = true;
          detail.myScore = this.data.totalScore;
          detail.myComment = this.data.comment;
          detail.evaluateTime = this.formatDate(new Date());
          this.setData({ detail });
          wx.showToast({ title: '评审成功', icon: 'success' });
        }
      }
    });
  },

  // 格式化日期
  formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${min}`;
  }
});
