const { resultApi, projectApi } = require("../../utils/api");
const { uploadImage, upload, BASE_URL } = require("../../utils/request");

Page({
  data: {
    mode: "create",
    isView: false,
    id: null,
    categories: [
      "乡村振兴",
      "支教助学",
      "红色文化",
      "科技支农",
      "医疗卫生",
      "法律援助",
      "其他",
    ],
    detail: null,
    form: {
      title: "",
      category: "",
      content: "",
      cover: "",
      files: [],
      images: [],
      projectId: "",
    },
    projectStatus: "",
    submitting: false,
  },

  onLoad(options) {
    const { mode = "create", id, projectId } = options;
    this.setData({
      mode,
      isView: mode === "view",
      id,
      "form.projectId": projectId || "",
    });

    // 如果是创建模式且没有项目ID，显示提示
    if (mode === "create" && !projectId) {
      wx.showModal({
        title: "提示",
        content: "请先从项目详情页面进入成果创建，确保成果关联到正确的项目",
        showCancel: false,
        success: () => {
          wx.navigateBack();
        },
      });
      return;
    }

    if (mode === "create" && projectId) {
      this.loadProjectStatus(projectId);
    }

    if (mode === "view" && id) {
      this.loadDetail(id);
    }

    wx.setNavigationBarTitle({
      title: mode === "create" ? "提交成果" : "成果详情",
    });
  },

  async loadProjectStatus(projectId) {
    try {
      const res = await projectApi.getDetail(projectId);
      this.setData({ projectStatus: res.status || "" });
    } catch (err) {
      console.error("加载项目状态失败:", err);
    }
  },

  // 加载详情
  async loadDetail(id) {
    try {
      const res = await resultApi.getDetail(id);
      const baseUrl = BASE_URL.replace("/api", "");

      const detail = {
        ...res,
        cover: res.cover_url
          ? res.cover_url.startsWith("http")
            ? res.cover_url
            : baseUrl + res.cover_url
          : "",
        submitDate: res.created_at ? res.created_at.slice(0, 10) : "",
        files: (res.files || []).map((f) => ({
          ...f,
          url: f.file_url
            ? f.file_url.startsWith("http")
              ? f.file_url
              : baseUrl + f.file_url
            : "",
        })),
        images: (res.images || []).map((img) =>
          img.startsWith("http") ? img : baseUrl + img
        ),
      };
      this.setData({ detail });
    } catch (err) {
      console.error("加载成果详情失败:", err);
    }
  },

  // 输入框变化
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`form.${field}`]: e.detail.value,
    });
  },

  // 分类选择
  onCategoryChange(e) {
    const index = e.detail.value;
    this.setData({
      "form.category": this.data.categories[index],
    });
  },

  // 选择封面
  chooseCover() {
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      success: (res) => {
        this.setData({
          "form.cover": res.tempFiles[0].tempFilePath,
        });
      },
    });
  },

  // 选择附件
  chooseFile() {
    wx.chooseMessageFile({
      count: 5,
      type: "file",
      success: (res) => {
        const newFiles = res.tempFiles.map((f) => ({
          name: f.name,
          path: f.path,
          size: (f.size / 1024 / 1024).toFixed(2) + "MB",
        }));
        this.setData({
          "form.files": [...this.data.form.files, ...newFiles],
        });
      },
    });
  },

  // 删除附件
  deleteFile(e) {
    const index = e.currentTarget.dataset.index;
    const files = this.data.form.files;
    files.splice(index, 1);
    this.setData({ "form.files": files });
  },

  // 选择图片
  chooseImage() {
    const count = 9 - this.data.form.images.length;
    wx.chooseMedia({
      count,
      mediaType: ["image"],
      success: (res) => {
        const newImages = res.tempFiles.map((f) => f.tempFilePath);
        this.setData({
          "form.images": [...this.data.form.images, ...newImages],
        });
      },
    });
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.form.images;
    images.splice(index, 1);
    this.setData({ "form.images": images });
  },

  // 预览图片
  previewImage(e) {
    const src = e.currentTarget.dataset.src;
    wx.previewImage({
      current: src,
      urls: this.data.detail.images,
    });
  },

  // 预览文件
  previewFile(e) {
    const file = e.currentTarget.dataset.file;
    wx.showToast({ title: "查看: " + file.name, icon: "none" });
    // TODO: 实际文件预览逻辑
  },

  // 表单验证
  validateForm() {
    const { form } = this.data;
    if (!form.title.trim()) {
      wx.showToast({ title: "请输入成果标题", icon: "none" });
      return false;
    }
    if (!form.category) {
      wx.showToast({ title: "请选择成果分类", icon: "none" });
      return false;
    }
    if (!form.content.trim()) {
      wx.showToast({ title: "请输入成果简介", icon: "none" });
      return false;
    }
    if (!form.projectId) {
      wx.showToast({ title: "请先选择关联的项目", icon: "none" });
      return false;
    }
    return true;
  },

  // 提交
  submitForm() {
    if (!this.validateForm()) return;

    if (this.data.mode === "create" && this.data.projectStatus !== "approved") {
      wx.showToast({ title: "项目未通过审核，不能提交成果", icon: "none" });
      return;
    }

    wx.showModal({
      title: "确认提交",
      content: "提交后成果将进入审核流程，是否确认？",
      success: async (res) => {
        if (res.confirm) {
          if (this.data.submitting) return;
          this.setData({ submitting: true });

          try {
            const { form } = this.data;

            // 上传封面
            let coverUrl = form.cover;
            if (coverUrl && !coverUrl.startsWith("http")) {
              coverUrl = await uploadImage(coverUrl);
            }

            // 上传图片
            const imageUrls = [];
            for (const img of form.images) {
              if (img.startsWith("http")) {
                imageUrls.push(img);
              } else {
                const url = await uploadImage(img);
                imageUrls.push(url);
              }
            }

            // 上传附件
            const fileUrls = [];
            for (const file of form.files) {
              if (file.url) {
                fileUrls.push(file);
              } else {
                const uploaded = await upload(file.path);
                fileUrls.push({
                  name: file.name,
                  url: uploaded.url,
                  size: file.size,
                });
              }
            }

            await resultApi.create({
              projectId: form.projectId,
              title: form.title,
              category: form.category,
              content: form.content,
              coverUrl: coverUrl,
              images: imageUrls,
              files: fileUrls,
            });

            wx.showToast({ title: "提交成功", icon: "success" });
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          } catch (err) {
            console.error("提交成果失败:", err);
          } finally {
            this.setData({ submitting: false });
          }
        }
      },
    });
  },
});
