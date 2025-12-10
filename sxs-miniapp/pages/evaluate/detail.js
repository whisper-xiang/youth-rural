const { evaluationApi } = require('../../utils/api');
const { BASE_URL } = require('../../utils/request');

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
    comment: '',
    submitting: false
  },

  onLoad(options) {
    const { id } = options;
    this.setData({ id });
    this.loadDetail(id);
  },

  // 加载详情
  async loadDetail(id) {
    try {
      const res = await evaluationApi.getDetail(id);
      const baseUrl = BASE_URL.replace('/api', '');
      
      const detail = {
        ...res,
        materials: (res.materials || []).map(m => ({
          ...m,
          url: m.file_url ? (m.file_url.startsWith('http') ? m.file_url : baseUrl + m.file_url) : ''
        })),
        isEvaluated: !!res.my_score,
        myScore: res.my_score,
        myComment: res.my_comment || '',
        evaluateTime: res.evaluate_time || ''
      };

      // 如果已评审，设置分数
      if (res.score_detail) {
        const scoreItems = this.data.scoreItems.map(item => ({
          ...item,
          value: res.score_detail[item.key] || item.value
        }));
        this.setData({ scoreItems, comment: res.my_comment || '' });
      }

      this.setData({ detail });
      this.calculateTotal();
    } catch (err) {
      console.error('加载评优详情失败:', err);
    }
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
      success: async (res) => {
        if (res.confirm) {
          if (this.data.submitting) return;
          this.setData({ submitting: true });

          try {
            // 构建评分详情
            const scoreDetail = {};
            this.data.scoreItems.forEach(item => {
              scoreDetail[item.key] = item.value;
            });

            await evaluationApi.submitScore(this.data.id, {
              score: this.data.totalScore,
              score_detail: scoreDetail,
              comment: this.data.comment
            });

            const detail = this.data.detail;
            detail.isEvaluated = true;
            detail.myScore = this.data.totalScore;
            detail.myComment = this.data.comment;
            detail.evaluateTime = this.formatDate(new Date());
            this.setData({ detail });
            wx.showToast({ title: '评审成功', icon: 'success' });
          } catch (err) {
            console.error('提交评审失败:', err);
          } finally {
            this.setData({ submitting: false });
          }
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
