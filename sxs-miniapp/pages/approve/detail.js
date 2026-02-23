const { approvalApi } = require("../../utils/api");

Page({
  data: {
    id: null,
    detail: null,
    remark: "",
    loading: false,
  },

  onLoad(options) {
    const { id } = options;
    if (!id) {
      wx.showToast({ title: "项目ID不能为空", icon: "none" });
      wx.navigateBack();
      return;
    }
    this.setData({ id });
    this.loadDetail(id);
  },

  // 加载详情
  async loadDetail(id) {
    if (this.data.loading) return;

    this.setData({ loading: true });
    try {
      wx.showLoading({ title: "加载中..." });

      const detail = await approvalApi.getDetail(id);

      // 数据格式化处理
      const formattedDetail = {
        ...detail,
        statusText: this.getStatusText(detail.status),
        applyTime: detail.submit_time
          ? this.formatDateTime(detail.submit_time)
          : "",
        approveTime: detail.approve_time
          ? this.formatDateTime(detail.approve_time)
          : "",
        approveRecords: detail.approval_records || [],
      };

      this.setData({ detail: formattedDetail });
    } catch (err) {
      console.error("加载审批详情失败:", err);
      wx.showToast({
        title: err.message || "加载详情失败",
        icon: "none",
      });

      // 如果接口失败，使用模拟数据作为降级方案
      this.loadMockDetail();
    } finally {
      this.setData({ loading: false });
      wx.hideLoading();
    }
  },

  // 降级方案：加载模拟数据
  loadMockDetail() {
    const mockDetail = {
      id: this.data.id,
      title: "乡村振兴调研实践",
      theme: "乡村振兴",
      location: "湖南省长沙市望城区",
      startDate: "2025-07-01",
      endDate: "2025-07-15",
      teamName: "青春筑梦队",
      college: "经济管理学院",
      leader: "张三",
      phone: "13800138000",
      teacher: "李教授",
      members: "李四、王五、赵六、钱七",
      description:
        "深入农村基层，调研乡村振兴战略实施情况，了解农村发展现状与需求，为乡村振兴提供可行性建议。",
      plan: "第一周：实地走访调研，收集一手资料\n第二周：数据整理与分析，撰写调研报告",
      expectedResult: "完成调研报告一份，提出乡村振兴建议方案",
      status: "pending",
      statusText: "待审核",
      applyTime: "2025-06-01 10:30",
      approveTime: "",
      approveRecords: [],
    };
    this.setData({ detail: mockDetail });
  },

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      pending: "待审核",
      college_approved: "学院已审",
      school_approved: "校级已审",
      approved: "已通过",
      rejected: "已驳回",
      closed: "已结项",
      withdrawn: "已撤回",
    };
    return statusMap[status] || status;
  },

  // 格式化日期时间
  formatDateTime(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${d} ${h}:${min}`;
  },

  // 输入审批意见
  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  // 通过
  async doApprove() {
    if (this.data.loading) return;

    wx.showModal({
      title: "确认通过",
      content: "确定通过该项目的申报吗？",
      success: async (res) => {
        if (res.confirm) {
          try {
            this.setData({ loading: true });
            wx.showLoading({ title: "审批中..." });

            await approvalApi.approve(this.data.id, this.data.remark);

            wx.showToast({ title: "审批通过", icon: "success" });

            // 重新加载详情数据
            await this.loadDetail(this.data.id);
          } catch (err) {
            console.error("审批失败:", err);
            wx.showToast({
              title: err.message || "审批失败",
              icon: "none",
            });
          } finally {
            this.setData({ loading: false });
            wx.hideLoading();
          }
        }
      },
    });
  },

  // 驳回
  async doReject() {
    if (!this.data.remark.trim()) {
      wx.showToast({ title: "请填写驳回原因", icon: "none" });
      return;
    }

    if (this.data.loading) return;

    wx.showModal({
      title: "确认驳回",
      content: "确定驳回该项目的申报吗？",
      success: async (res) => {
        if (res.confirm) {
          try {
            this.setData({ loading: true });
            wx.showLoading({ title: "审批中..." });

            await approvalApi.reject(this.data.id, this.data.remark);

            wx.showToast({ title: "已驳回", icon: "success" });

            // 重新加载详情数据
            await this.loadDetail(this.data.id);
          } catch (err) {
            console.error("驳回失败:", err);
            wx.showToast({
              title: err.message || "驳回失败",
              icon: "none",
            });
          } finally {
            this.setData({ loading: false });
            wx.hideLoading();
          }
        }
      },
    });
  },
});
