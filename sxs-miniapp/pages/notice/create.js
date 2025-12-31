const { noticeApi } = require("../../utils/api");

Page({
  data: {
    canPublish: false,
    typeOptions: [
      { label: "通知", value: "notice" },
      { label: "政策", value: "policy" },
      { label: "活动", value: "activity" },
    ],
    typeIndex: 0,
    form: {
      title: "",
      type: "notice",
      source: "",
      summary: "",
      content: "",
      isTop: false,
    },
    submitting: false,
  },

  onLoad() {
    const app = getApp();
    const canPublish = !!(
      app &&
      app.hasPermission &&
      app.hasPermission("notice.publish")
    );
    this.setData({ canPublish });

    if (!canPublish) {
      wx.showToast({ title: "无权限发布通知", icon: "none" });
      setTimeout(() => wx.navigateBack(), 1200);
    }
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  onTypeChange(e) {
    const idx = Number(e.detail.value) || 0;
    const type = this.data.typeOptions[idx].value;
    this.setData({ typeIndex: idx, "form.type": type });
  },

  onTopChange(e) {
    this.setData({ "form.isTop": !!e.detail.value });
  },

  validate() {
    const { title, source, summary, content } = this.data.form;
    if (!title || !title.trim()) {
      wx.showToast({ title: "请输入标题", icon: "none" });
      return false;
    }
    if (!source || !source.trim()) {
      wx.showToast({ title: "请输入发布单位", icon: "none" });
      return false;
    }
    if (!summary || !summary.trim()) {
      wx.showToast({ title: "请输入摘要", icon: "none" });
      return false;
    }
    if (!content || !content.trim()) {
      wx.showToast({ title: "请输入正文", icon: "none" });
      return false;
    }
    return true;
  },

  async submit() {
    if (this.data.submitting) return;
    if (!this.data.canPublish) {
      wx.showToast({ title: "无权限发布通知", icon: "none" });
      return;
    }
    if (!this.validate()) return;

    this.setData({ submitting: true });
    try {
      const payload = {
        ...this.data.form,
        content: `<p>${this.data.form.content.replace(/\n/g, "<br/>")}</p>`,
      };

      await noticeApi.create(payload);
      wx.showToast({ title: "发布成功", icon: "success" });
      setTimeout(() => wx.navigateBack(), 1200);
    } catch (err) {
      console.error("发布失败:", err);
      wx.showToast({ title: "发布失败", icon: "none" });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
