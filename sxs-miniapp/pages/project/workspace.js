// 项目工作台页面
const {
  projectApi,
  progressApi,
  resultApi,
  evaluationApi,
} = require("../../utils/api");
const { upload, uploadImage } = require("../../utils/request");
const app = getApp();

Page({
  data: {
    projectId: "",
    currentTab: 0,
    projectInfo: {},
    evaluationInfo: null,
    tabs: [
      { name: "项目详情", icon: "📄" },
      { name: "进度记录", icon: "📊" },
      { name: "成果材料", icon: "📎" },
      { name: "结项申请", icon: "🧾" },
      { name: "老师反馈", icon: "💬" },
      { name: "评优情况", icon: "🏆" },
    ],
    progressList: [],
    resultFiles: {
      images: [],
      documents: [],
      videos: [],
    },
    hasResultFiles: false,
    closureInfo: {
      summary: "",
      achievements: "",
      impact: "",
      status: "",
      statusText: "",
    },
    feedbackList: [],
    showAddProgressModal: false,
    isEditing: false,
    editingId: null,
    showUploadModal: false,
    canSubmit: false,
    newProgress: {
      title: "",
      description: "",
      files: [],
    },
  },

  onLoad(options) {
    const projectId = options.id;
    if (!projectId) {
      wx.showToast({
        title: "项目ID不能为空",
        icon: "none",
      });
      wx.navigateBack();
      return;
    }

    this.setData({ projectId });
    this.loadAllData();
  },

  onShow() {
    // 页面显示时刷新数据
    if (this.data.projectId) {
      this.loadAllData();
    }
  },

  // 加载所有数据
  async loadAllData() {
    wx.showLoading({ title: "加载中..." });
    try {
      await Promise.all([
        this.loadProjectInfo(),
        this.loadProgressList(),
        this.loadResultFiles(),
        this.loadEvaluationInfo(),
      ]);
    } catch (err) {
      console.error("加载数据失败:", err);
    } finally {
      wx.hideLoading();
    }
  },

  // 加载项目信息
  async loadProjectInfo() {
    try {
      const detail = await projectApi.getDetail(this.data.projectId);

      // 映射状态文本和样式
      const statusMap = {
        pending: { text: "待审核", class: "status-pending", icon: "⏳" },
        college_approved: {
          text: "院审通过",
          class: "status-progress",
          icon: "🏛️",
        },
        school_approved: {
          text: "校审通过",
          class: "status-progress",
          icon: "🏫",
        },
        approved: { text: "已立项", class: "status-progress", icon: "🚀" },
        closed: { text: "已结项", class: "status-completed", icon: "✅" },
        rejected: { text: "已驳回", class: "status-rejected", icon: "❌" },
        withdrawn: { text: "已撤回", class: "status-withdrawn", icon: "↩️" },
      };

      const statusInfo = statusMap[detail.status] || {
        text: detail.status,
        class: "",
        icon: "",
      };

      const projectInfo = {
        id: detail.id,
        name: detail.title,
        type: detail.category,
        userRole:
          detail.leader_id == app.globalData.userInfo?.id ? "leader" : "member",
        userRoleText:
          detail.leader_id == app.globalData.userInfo?.id ? "负责人" : "成员",
        status: detail.status,
        statusText: statusInfo.text,
        statusClass: statusInfo.class,
        statusIcon: statusInfo.icon,
        is_excellent: detail.is_excellent || false,
        createTime: this.formatDate(detail.created_at),
        startDate: this.formatDate(detail.start_date),
        endDate: this.formatDate(detail.end_date),
        budget: detail.budget,
        team: detail.members.map((m) => ({
          id: m.id,
          name: m.name,
          role: m.user_id == detail.leader_id ? "负责人" : "成员",
          phone: m.phone,
        })),
        teacher: {
          name: detail.teacher_name,
          title: "指导教师",
        },
        timeline: (detail.approvals || []).map((a) => ({
          title: a.node_name || "审核环节",
          description: a.opinion || "已通过",
          status: "completed",
          time: this.formatDate(a.created_at),
        })),
      };

      this.setData({ projectInfo });

      // 设置结项申请信息（如果有的话，通常从 project 字段映射或单独接口）
      this.setData({
        "closureInfo.summary": detail.summary || "",
        "closureInfo.achievements": detail.achievements || "",
        "closureInfo.impact": detail.impact || "",
        "closureInfo.status": detail.status === "closed" ? "closed" : "",
      });
    } catch (err) {
      console.error("加载项目信息失败:", err);
      throw err;
    }
  },

  // 日期格式化辅助函数 YYYY-MM-DD
  formatDate(dateStr) {
    if (!dateStr) return "";
    // 如果是日期对象或ISO字符串，取前10位
    if (typeof dateStr === "string") {
      // 兼容 "2023-01-01T00:00:00.000Z" 和 "2023-01-01 00:00:00"
      return dateStr.substring(0, 10);
    }
    try {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (e) {
      return dateStr;
    }
  },

  // 加载进度列表
  async loadProgressList() {
    try {
      const res = await progressApi.getList({ projectId: this.data.projectId });
      const list = (res.list || res || []).map((item) => ({
        id: item.id,
        date: this.formatDate(item.created_at),
        title: item.title,
        description: item.content || item.description,
        author: item.creator_name || "成员",
        files: (item.images || []).map((img) => ({
          name: "图片",
          type: "image",
          url: img.url,
        })),
      }));
      this.setData({ progressList: list });
    } catch (err) {
      console.error("加载进度列表失败:", err);
    }
  },

  // 加载成果文件
  async loadResultFiles() {
    try {
      const res = await resultApi.getList({ projectId: this.data.projectId });
      const results = res.list || res || [];

      const images = [];
      const documents = [];
      const videos = [];

      results.forEach((item) => {
        const file = {
          id: item.id,
          name: item.title,
          url: item.url,
          size: item.file_size ? this.formatFileSize(item.file_size) : "",
        };

        const ext = item.url.split(".").pop().toLowerCase();
        if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
          images.push(file);
        } else if (["mp4", "mov", "avi"].includes(ext)) {
          videos.push(file);
        } else {
          documents.push(file);
        }
      });

      this.setData({
        resultFiles: { images, documents, videos },
        hasResultFiles:
          images.length > 0 || documents.length > 0 || videos.length > 0,
      });
    } catch (err) {
      console.error("加载成果文件失败:", err);
    }
  },

  // 加载评优信息
  async loadEvaluationInfo() {
    try {
      const info = await evaluationApi.getDetail(this.data.projectId);
      this.setData({ evaluationInfo: info });
    } catch (err) {
      console.error("加载评优信息失败:", err);
    }
  },

  // 切换Tab
  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ currentTab: index });
  },

  // 点击进度附件
  onFileTap(e) {
    const { file, files } = e.currentTarget.dataset;
    if (!file.url) {
      wx.showToast({
        title: "文件链接无效",
        icon: "none",
      });
      return;
    }

    if (file.type === "image") {
      const imageUrls = files
        .filter((f) => f.type === "image")
        .map((f) => f.url);

      wx.previewImage({
        current: file.url,
        urls: imageUrls,
      });
    } else if (file.type === "video") {
      // 视频文件通常建议跳转到视频播放页或使用视频组件预览
      // 这里简单处理，如果有预览需求可以增加视频弹窗
      wx.showToast({
        title: "暂不支持直接预览视频",
        icon: "none",
      });
    } else {
      // 其他文件（文档等）尝试下载并打开
      this.downloadFile({
        currentTarget: {
          dataset: { url: file.url },
        },
      });
    }
  },

  // 显示添加进度弹窗
  showAddProgress() {
    if (this.data.projectInfo.status === "closed") {
      wx.showToast({
        title: "项目已结项，不可添加进度",
        icon: "none",
      });
      return;
    }
    this.setData({
      showAddProgressModal: true,
      isEditing: false,
      editingId: null,
      newProgress: {
        type: "daily",
        title: "",
        description: "",
        files: [],
      },
    });
  },

  // 编辑进度
  editProgress(e) {
    if (this.data.projectInfo.status === "closed") return;
    const { item } = e.currentTarget.dataset;
    this.setData({
      showAddProgressModal: true,
      isEditing: true,
      editingId: item.id,
      newProgress: {
        type: item.type,
        title: item.title,
        description: item.description,
        files: item.files || [],
      },
    });
  },

  // 隐藏添加进度弹窗
  hideAddProgress() {
    this.setData({
      showAddProgressModal: false,
      isEditing: false,
      editingId: null,
    });
  },

  // 进度标题输入
  onProgressTitleInput(e) {
    this.setData({
      "newProgress.title": e.detail.value,
    });
  },

  // 进度描述输入
  onProgressDescInput(e) {
    this.setData({
      "newProgress.description": e.detail.value,
    });
  },

  // 选择文件
  chooseFiles() {
    wx.chooseMessageFile({
      count: 10,
      type: "all",
      success: (res) => {
        const files = res.tempFiles.map((file) => ({
          name: file.name,
          path: file.path,
          size: file.size,
        }));

        const currentFiles = this.data.newProgress.files;
        this.setData({
          "newProgress.files": [...currentFiles, ...files],
        });
      },
    });
  },

  // 移除文件
  removeFile(e) {
    const index = e.currentTarget.dataset.index;
    const files = this.data.newProgress.files;
    files.splice(index, 1);
    this.setData({
      "newProgress.files": files,
    });
  },

  // 确认添加/编辑进度
  async confirmAddProgress() {
    const { newProgress, isEditing, editingId } = this.data;
    if (!newProgress.title || !newProgress.description) {
      wx.showToast({
        title: "请填写完整信息",
        icon: "none",
      });
      return;
    }

    try {
      wx.showLoading({ title: isEditing ? "保存中..." : "提交中..." });

      // 上传尚未上传的文件
      const uploadedFiles = [];
      for (const file of newProgress.files) {
        if (
          file.url &&
          file.url.startsWith("http") &&
          !file.url.includes("localhost")
        ) {
          // 已经是服务器上的文件（虽然预览时可能是 localhost，这里简单判断）
          uploadedFiles.push(file);
        } else {
          // 需要上传
          const isImage = this.getFileType(file.name) === "image";
          if (isImage) {
            const url = await uploadImage(file.path || file.url);
            uploadedFiles.push({ name: file.name, url, type: "image" });
          } else {
            const res = await upload(file.path || file.url);
            uploadedFiles.push({
              name: file.name,
              url: res.url,
              type: res.type,
            });
          }
        }
      }

      const progressData = {
        projectId: this.data.projectId,
        title: newProgress.title,
        content: newProgress.description,
        images: uploadedFiles
          .filter((f) => f.type === "image")
          .map((f) => ({ url: f.url })),
      };

      if (isEditing) {
        // 如果有更新进度的接口可以使用，目前 api.js 中只有 create
        // 这里暂时只实现创建，或者如果后端支持 update 可以补充
        // await progressApi.update(editingId, progressData);
      } else {
        await progressApi.create(progressData);
      }

      await this.loadProgressList();

      wx.hideLoading();
      wx.showToast({
        title: isEditing ? "保存成功" : "添加成功",
        icon: "success",
      });

      this.hideAddProgress();
    } catch (err) {
      console.error("Submit progress error:", err);
      wx.hideLoading();
      wx.showToast({
        title: err.message || (isEditing ? "保存失败" : "添加失败"),
        icon: "none",
      });
    }
  },

  // 获取文件类型
  getFileType(fileName) {
    const ext = fileName.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) {
      return "image";
    } else if (["mp4", "avi", "mov", "wmv", "flv"].includes(ext)) {
      return "video";
    } else {
      return "document";
    }
  },

  // 显示上传弹窗
  showUploadModal() {
    this.setData({ showUploadModal: true });
  },

  // 隐藏上传弹窗
  hideUploadModal() {
    this.setData({ showUploadModal: false });
  },

  // 选择图片
  async chooseImage() {
    if (this.data.projectInfo.status === "closed") return;

    wx.chooseImage({
      count: 9,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: async (res) => {
        try {
          wx.showLoading({ title: "上传中..." });
          const uploadPromises = res.tempFilePaths.map((path) =>
            uploadImage(path),
          );
          const urls = await Promise.all(uploadPromises);

          // 为每张图片创建一个成果记录
          for (let i = 0; i < urls.length; i++) {
            await resultApi.create({
              projectId: this.data.projectId,
              title: `图片成果_${Date.now()}_${i + 1}`,
              category: "other",
              images: [urls[i]],
              status: "published",
            });
          }

          await this.loadResultFiles();
          this.hideUploadModal();
          wx.showToast({ title: "上传成功", icon: "success" });
        } catch (err) {
          console.error("Upload images error:", err);
          wx.showToast({ title: "上传失败", icon: "none" });
        } finally {
          wx.hideLoading();
        }
      },
    });
  },

  // 选择文档
  async chooseDocument() {
    if (this.data.projectInfo.status === "closed") return;

    wx.chooseMessageFile({
      count: 10,
      type: "file",
      extension: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"],
      success: async (res) => {
        try {
          wx.showLoading({ title: "上传中..." });
          for (const file of res.tempFiles) {
            const uploadedFile = await upload(file.path);
            await resultApi.create({
              projectId: this.data.projectId,
              title: file.name,
              category: "report",
              files: [
                {
                  name: file.name,
                  url: uploadedFile.url,
                  size: file.size,
                  type: uploadedFile.type,
                },
              ],
              status: "published",
            });
          }

          await this.loadResultFiles();
          this.hideUploadModal();
          wx.showToast({ title: "上传成功", icon: "success" });
        } catch (err) {
          console.error("Upload documents error:", err);
          wx.showToast({ title: "上传失败", icon: "none" });
        } finally {
          wx.hideLoading();
        }
      },
    });
  },

  // 选择视频
  async chooseVideo() {
    if (this.data.projectInfo.status === "closed") return;

    wx.chooseVideo({
      sourceType: ["album", "camera"],
      maxDuration: 60,
      camera: "back",
      success: async (res) => {
        try {
          wx.showLoading({ title: "上传中..." });
          const uploadedFile = await upload(res.tempFilePath);
          await resultApi.create({
            projectId: this.data.projectId,
            title: `视频成果_${Date.now()}`,
            category: "video",
            files: [
              {
                name: `视频_${Date.now()}.mp4`,
                url: uploadedFile.url,
                size: res.size,
                type: "video",
              },
            ],
            status: "published",
          });

          await this.loadResultFiles();
          this.hideUploadModal();
          wx.showToast({ title: "上传成功", icon: "success" });
        } catch (err) {
          console.error("Upload video error:", err);
          wx.showToast({ title: "上传失败", icon: "none" });
        } finally {
          wx.hideLoading();
        }
      },
    });
  },

  // 格式化文件大小
  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + "B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + "KB";
    return (bytes / (1024 * 1024)).toFixed(1) + "MB";
  },

  // 格式化时长
  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    const urls = e.currentTarget.dataset.urls.map((item) => item.url);

    wx.previewImage({
      current: url,
      urls: urls,
    });
  },

  // 下载文件
  downloadFile(e) {
    const url = e.currentTarget.dataset.url;
    wx.showLoading({
      title: "下载中...",
    });

    wx.downloadFile({
      url: url,
      success: (res) => {
        wx.hideLoading();
        wx.openDocument({
          filePath: res.tempFilePath,
          success: () => {
            console.log("打开文档成功");
          },
          fail: (err) => {
            console.error("打开文档失败:", err);
            wx.showToast({
              title: "打开失败",
              icon: "none",
            });
          },
        });
      },
      fail: (err) => {
        wx.hideLoading();
        console.error("下载失败:", err);
        wx.showToast({
          title: "下载失败",
          icon: "none",
        });
      },
    });
  },

  // 删除文件
  deleteFile(e) {
    if (this.data.projectInfo.status === "closed") return;

    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "确认删除",
      content: "确定要删除这个成果文件吗？",
      success: async (res) => {
        if (res.confirm) {
          try {
            await resultApi.delete(id);
            await this.loadResultFiles();
            wx.showToast({
              title: "删除成功",
              icon: "success",
            });
          } catch (err) {
            console.error("Delete result error:", err);
            wx.showToast({
              title: "删除失败",
              icon: "none",
            });
          }
        }
      },
    });
  },

  // 结项申请相关方法
  onSummaryInput(e) {
    this.setData({
      "closureInfo.summary": e.detail.value,
    });
    this.updateSubmitStatus();
  },

  onAchievementsInput(e) {
    this.setData({
      "closureInfo.achievements": e.detail.value,
    });
    this.updateSubmitStatus();
  },

  onImpactInput(e) {
    this.setData({
      "closureInfo.impact": e.detail.value,
    });
    this.updateSubmitStatus();
  },

  // 更新提交按钮状态
  updateSubmitStatus() {
    const { summary, achievements, impact } = this.data.closureInfo;
    const canSubmit = !!(
      summary &&
      summary.trim() &&
      achievements &&
      achievements.trim() &&
      impact &&
      impact.trim()
    );
    this.setData({ canSubmit });
  },

  // 提交结项申请
  async submitClosure() {
    if (this.data.projectInfo.status === "closed") {
      wx.showToast({ title: "项目已结项，不可重复提交", icon: "none" });
      return;
    }

    if (this.data.projectInfo.userRole !== "leader") {
      wx.showToast({ title: "只有负责人可以提交结项申请", icon: "none" });
      return;
    }

    const { summary, achievements, impact } = this.data.closureInfo;

    if (!summary.trim() || !achievements.trim() || !impact.trim()) {
      wx.showToast({
        title: "请填写完整信息",
        icon: "none",
      });
      return;
    }

    wx.showModal({
      title: "确认提交",
      content: "提交后将进入审核流程，确定要提交吗？",
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({
              title: "提交中...",
            });

            await projectApi.update(this.data.projectId, {
              summary,
              achievements,
              impact,
              // status: 'pending_closure' // 如果有特定的结项中状态，可以在此设置
            });

            await this.loadProjectInfo();

            wx.hideLoading();
            wx.showToast({
              title: "提交成功",
              icon: "success",
            });
          } catch (err) {
            console.error("Submit closure error:", err);
            wx.hideLoading();
            wx.showToast({
              title: "提交失败",
              icon: "none",
            });
          }
        }
      },
    });
  },
});
