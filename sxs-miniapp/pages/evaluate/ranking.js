const { evaluationApi } = require("../../utils/api");

Page({
  data: {
    rankingList: [],
    loading: false,
  },

  onLoad() {
    this.loadRanking();
  },

  onPullDownRefresh() {
    this.loadRanking().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadRanking() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    try {
      // 不传 ID，后端默认获取最近一次评优结果
      const res = await evaluationApi.getRanking();
      this.setData({
        rankingList: res || [],
      });
    } catch (err) {
      console.error("Load ranking error:", err);
      wx.showToast({
        title: "加载结果失败",
        icon: "none",
      });
    } finally {
      this.setData({ loading: false });
    }
  },
});
