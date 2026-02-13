const { approvalApi } = require("../../utils/api");

Page({
  data: {
    currentTab: "all",
    list: [],
    filteredList: [],
    tabName: "全部",
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    userRole: "",
  },

  onLoad() {
    const app = getApp();
    const userInfo = app.globalData.userInfo;
    if (userInfo) {
      this.setData({ userRole: userInfo.role });
    }
  },

  onShow() {
    const app = getApp();
    const userInfo = app.globalData.userInfo;
    if (userInfo) {
      this.setData({ userRole: userInfo.role });
    }
    this.loadList(true);
  },

  onPullDownRefresh() {
    this.loadList(true);
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadList(false);
    }
  },

  // 加载审批列表
  async loadList(refresh = false) {
    if (this.data.loading) return;

    const { currentTab, pageSize } = this.data;
    const currentPage = refresh ? 1 : this.data.page;
    this.setData({ loading: true });

    try {
      const res = await approvalApi.getList({
        page: currentPage,
        pageSize,
        status: currentTab === "all" ? "" : currentTab,
      });

      const statusMap = {
        pending: "待学院审核",
        college_approved: "待校级审核",
        school_approved: "审核通过",
        approved: "审核通过",
        rejected: "已驳回",
        closed: "已结项",
        withdrawn: "已撤回",
      };

      const newList = res.list.map((item) => ({
        ...item,
        statusText: statusMap[item.status] || item.status,
        // 适配 WXML 展示字段
        teamName: item.team_name || item.teamName || "",
        leader: item.leader_name || item.leader || "",
        college: item.college_name || item.college || "",
        applyTime: item.submit_time ? item.submit_time.slice(0, 10) : "",
      }));

      const mergedList = refresh ? newList : [...this.data.list, ...newList];
      // 列表过滤交给后端，避免状态枚举不一致导致前端误过滤为空
      const filteredList = mergedList;

      this.setData({
        list: mergedList,
        filteredList,
        tabName: this.getTabName(currentTab),
        page: currentPage + 1,
        hasMore: newList.length === pageSize,
      });
    } catch (err) {
      console.error("加载审批列表失败:", err);

      const msg = (err && (err.message || err.msg)) || "";
      if (msg.includes("403") || msg.includes("无权限")) {
        wx.showToast({ title: "无权限查看审批列表", icon: "none" });
      } else {
        wx.showToast({ title: "加载审批列表失败", icon: "none" });
      }

      if (refresh) {
        this.setData({ list: [], filteredList: [], hasMore: false });
      }
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.currentTab) return;
    this.setData({
      currentTab: tab,
      list: [],
      filteredList: [],
      page: 1,
      hasMore: true,
      tabName: this.getTabName(tab),
    });
    this.loadList(true);
  },

  getTabName(tab) {
    const map = {
      all: "全部",
      pending: "待审核",
      approved: "已通过",
      college_approved: "已通过",
      school_approved: "已通过",
      rejected: "已驳回",
    };
    return map[tab] || "全部";
  },

  buildFilteredList(list, tab) {
    if (!Array.isArray(list)) return [];
    if (!tab || tab === "all") return list;
    return list.filter((i) => i && i.status === tab);
  },

  // 查看详情
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/approve/detail?id=${id}`,
    });
  },

  // 快捷通过
  quickApprove(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "确认通过",
      content: "确定通过该项目的申报吗？",
      success: async (res) => {
        if (res.confirm) {
          try {
            await approvalApi.approve(id, "同意");
            wx.showToast({ title: "审批通过", icon: "success" });
            this.loadList(true);
          } catch (err) {
            console.error("审批失败:", err);
          }
        }
      },
    });
  },

  // 快捷驳回
  quickReject(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "确认驳回",
      content: "确定驳回该项目的申报吗？",
      editable: true,
      placeholderText: "请输入驳回原因（选填）",
      success: async (res) => {
        if (res.confirm) {
          try {
            await approvalApi.reject(id, res.content || "不符合要求");
            wx.showToast({ title: "已驳回", icon: "success" });
            this.loadList(true);
          } catch (err) {
            console.error("驳回失败:", err);
          }
        }
      },
    });
  },
});
