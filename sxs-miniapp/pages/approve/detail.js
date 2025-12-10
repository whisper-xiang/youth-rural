Page({
  data: {
    id: null,
    detail: null,
    remark: ''
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
      title: '乡村振兴调研实践',
      theme: '乡村振兴',
      location: '湖南省长沙市望城区',
      startDate: '2025-07-01',
      endDate: '2025-07-15',
      teamName: '青春筑梦队',
      college: '经济管理学院',
      leader: '张三',
      phone: '13800138000',
      teacher: '李教授',
      members: '李四、王五、赵六、钱七',
      description: '深入农村基层，调研乡村振兴战略实施情况，了解农村发展现状与需求，为乡村振兴提供可行性建议。',
      plan: '第一周：实地走访调研，收集一手资料\n第二周：数据整理与分析，撰写调研报告',
      expectedResult: '完成调研报告一份，提出乡村振兴建议方案',
      status: 'pending',
      statusText: '待审核',
      applyTime: '2025-06-01 10:30',
      approveTime: '',
      approveRecords: []
    };
    this.setData({ detail: mockDetail });
  },

  // 输入审批意见
  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  // 通过
  doApprove() {
    wx.showModal({
      title: '确认通过',
      content: '确定通过该项目的申报吗？',
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用接口
          const detail = this.data.detail;
          detail.status = 'approved';
          detail.statusText = '已通过';
          detail.approveTime = this.formatDate(new Date());
          detail.approveRecords.push({
            approver: '当前管理员',
            action: 'approved',
            actionText: '通过',
            time: detail.approveTime,
            remark: this.data.remark
          });
          this.setData({ detail });
          wx.showToast({ title: '审批通过', icon: 'success' });
        }
      }
    });
  },

  // 驳回
  doReject() {
    if (!this.data.remark.trim()) {
      wx.showToast({ title: '请填写驳回原因', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '确认驳回',
      content: '确定驳回该项目的申报吗？',
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用接口
          const detail = this.data.detail;
          detail.status = 'rejected';
          detail.statusText = '已驳回';
          detail.approveTime = this.formatDate(new Date());
          detail.approveRecords.push({
            approver: '当前管理员',
            action: 'rejected',
            actionText: '驳回',
            time: detail.approveTime,
            remark: this.data.remark
          });
          this.setData({ detail });
          wx.showToast({ title: '已驳回', icon: 'success' });
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
