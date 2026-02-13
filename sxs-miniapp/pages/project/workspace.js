// 项目工作台页面
const app = getApp();

Page({
  data: {
    projectId: "",
    currentTab: 0,
    projectInfo: {},
    tabs: [
      { name: "项目详情", icon: "📄" },
      { name: "进度记录", icon: "📊" },
      { name: "成果材料", icon: "📎" },
      { name: "结项申请", icon: "🧾" },
      { name: "老师反馈", icon: "💬" },
    ],
    progressList: [],
    resultFiles: {
      images: [],
      documents: [],
      videos: [],
    },
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
    this.loadProjectInfo();
  },

  onShow() {
    // 页面显示时刷新数据
    if (this.data.projectId) {
      this.loadProjectInfo();
    }
  },

  // 加载项目信息
  async loadProjectInfo() {
    try {
      // 这里应该调用API获取项目详细信息
      // const projectInfo = await projectApi.getProjectDetail(this.data.projectId);

      // 模拟数据
      const mockProjectInfo = {
        id: this.data.projectId,
        name: "乡村振兴调研项目",
        type: "社会实践类",
        userRole: "leader", // leader | member
        userRoleText: "负责人",
        status: "APPROVED",
        statusText: "已立项，项目进行中",
        statusClass: "status-progress",
        statusIcon: "🚀",
        createTime: "2026-01-15",
        startDate: "2026-01-20",
        endDate: "2026-02-20",
        budget: "5000",
        team: [
          {
            id: 1,
            name: "张三",
            role: "负责人",
            phone: "13800138000",
          },
          {
            id: 2,
            name: "李四",
            role: "成员",
            phone: "13800138001",
          },
          {
            id: 3,
            name: "王五",
            role: "成员",
            phone: "",
          },
        ],
        teacher: {
          name: "刘教授",
          title: "副教授",
          department: "社会学学院",
          email: "liu@university.edu.cn",
        },
        timeline: [
          {
            title: "项目申报",
            description: "提交项目申报材料",
            status: "completed",
            time: "2026-01-15 10:30",
          },
          {
            title: "指导确认",
            description: "指导老师确认项目计划",
            status: "completed",
            time: "2026-01-16 14:20",
          },
          {
            title: "学院审核",
            description: "学院审核申报材料",
            status: "completed",
            time: "2026-01-17 09:15",
          },
          {
            title: "校级终审",
            description: "校级审核并立项",
            status: "completed",
            time: "2026-01-18 16:45",
          },
          {
            title: "项目实施",
            description: "按计划开展实践活动",
            status: "current",
            time: "",
          },
        ],
      };

      this.setData({ projectInfo: mockProjectInfo });

      // 加载其他数据
      this.loadProgressList();
      this.loadResultFiles();
      this.loadClosureInfo();
      this.loadFeedbackList();
    } catch (err) {
      console.error("加载项目信息失败:", err);
      wx.showToast({
        title: "加载失败",
        icon: "none",
      });
    }
  },

  // 加载进度列表
  async loadProgressList() {
    try {
      // 模拟数据
      const mockProgressList = [
        {
          id: 1,
          date: "2026-01-28",
          title: "完成前期调研",
          description: "完成了对当地农村的基本情况调研，收集了相关数据和资料",
          author: "张三",
          files: [
            { name: "调研报告.pdf", type: "document", url: "" },
            { name: "调研照片.jpg", type: "image", url: "" },
          ],
        },
        {
          id: 2,
          date: "2026-01-25",
          title: "制定实施计划",
          description: "根据调研结果制定了详细的项目实施计划和时间安排",
          author: "李四",
          files: [],
        },
      ];

      this.setData({ progressList: mockProgressList });
    } catch (err) {
      console.error("加载进度列表失败:", err);
    }
  },

  // 加载成果文件
  async loadResultFiles() {
    try {
      // 模拟数据
      const mockResultFiles = {
        images: [
          {
            id: 1,
            name: "活动照片1.jpg",
            url: "https://via.placeholder.com/200x150",
          },
          {
            id: 2,
            name: "活动照片2.jpg",
            url: "https://via.placeholder.com/200x150",
          },
        ],
        documents: [
          { id: 1, name: "项目总结报告.pdf", size: "2.3MB", url: "" },
          { id: 2, name: "调研数据.xlsx", size: "1.5MB", url: "" },
        ],
        videos: [
          { id: 1, name: "实践记录视频.mp4", duration: "05:30", url: "" },
        ],
      };

      this.setData({ resultFiles: mockResultFiles });
    } catch (err) {
      console.error("加载成果文件失败:", err);
    }
  },

  // 加载结项信息
  async loadClosureInfo() {
    try {
      // 模拟数据
      const mockClosureInfo = {
        summary: "",
        achievements: "",
        impact: "",
        status: "",
        statusText: "",
      };

      this.setData({ closureInfo: mockClosureInfo });
      this.updateSubmitStatus();
    } catch (err) {
      console.error("加载结项信息失败:", err);
    }
  },

  // 加载反馈列表
  async loadFeedbackList() {
    try {
      // 模拟数据
      const mockFeedbackList = [
        {
          id: 1,
          author: "刘教授",
          time: "2026-01-27 15:30",
          type: "progress",
          typeText: "进度反馈",
          content: "调研工作做得很好，建议在实施阶段注意与当地居民的沟通方式。",
          target: "完成前期调研",
        },
        {
          id: 2,
          author: "刘教授",
          time: "2026-01-26 10:15",
          type: "plan",
          typeText: "计划反馈",
          content: "实施计划比较详细，时间安排合理，可以考虑增加一些应急预案。",
          target: "制定实施计划",
        },
      ];

      this.setData({ feedbackList: mockFeedbackList });
    } catch (err) {
      console.error("加载反馈列表失败:", err);
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

      // const url = isEditing ? `/project/progress/${editingId}` : '/project/progress';
      // const method = isEditing ? 'PUT' : 'POST';

      // await request({
      //   url,
      //   method,
      //   data: {
      //     ...newProgress,
      //     projectId: this.data.projectId
      //   }
      // });

      // 模拟更新本地数据
      if (isEditing) {
        const progressList = this.data.progressList.map((item) => {
          if (item.id === editingId) {
            return {
              ...item,
              title: newProgress.title,
              description: newProgress.description,
              files: newProgress.files.map((file) => ({
                name: file.name,
                type: file.type || this.getFileType(file.name),
                url: file.path || file.url,
              })),
            };
          }
          return item;
        });
        this.setData({ progressList });
      } else {
        const newProgressItem = {
          id: Date.now(),
          date: new Date().toISOString().split("T")[0],
          title: newProgress.title,
          description: newProgress.description,
          author: app.globalData.userInfo?.name || "当前用户",
          files: newProgress.files.map((file) => ({
            name: file.name,
            type: this.getFileType(file.name),
            url: file.path,
          })),
        };
        this.setData({
          progressList: [newProgressItem, ...this.data.progressList],
        });
      }

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
  chooseImage() {
    wx.chooseImage({
      count: 9,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: (res) => {
        const images = res.tempFilePaths.map((path, index) => ({
          id: Date.now() + index,
          name: `图片${index + 1}.jpg`,
          url: path,
        }));

        const currentImages = this.data.resultFiles.images;
        this.setData({
          "resultFiles.images": [...currentImages, ...images],
        });

        this.hideUploadModal();
        wx.showToast({
          title: "上传成功",
          icon: "success",
        });
      },
    });
  },

  // 选择文档
  chooseDocument() {
    wx.chooseMessageFile({
      count: 10,
      type: "file",
      extension: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"],
      success: (res) => {
        const documents = res.tempFiles.map((file, index) => ({
          id: Date.now() + index,
          name: file.name,
          size: this.formatFileSize(file.size),
          url: file.path,
        }));

        const currentDocuments = this.data.resultFiles.documents;
        this.setData({
          "resultFiles.documents": [...currentDocuments, ...documents],
        });

        this.hideUploadModal();
        wx.showToast({
          title: "上传成功",
          icon: "success",
        });
      },
    });
  },

  // 选择视频
  chooseVideo() {
    wx.chooseVideo({
      sourceType: ["album", "camera"],
      maxDuration: 60,
      camera: "back",
      success: (res) => {
        const video = {
          id: Date.now(),
          name: `视频${Date.now()}.mp4`,
          duration: this.formatDuration(res.duration),
          url: res.tempFilePath,
        };

        const currentVideos = this.data.resultFiles.videos;
        this.setData({
          "resultFiles.videos": [...currentVideos, video],
        });

        this.hideUploadModal();
        wx.showToast({
          title: "上传成功",
          icon: "success",
        });
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
    const id = e.currentTarget.dataset.id;
    const type = e.currentTarget.dataset.type;

    wx.showModal({
      title: "确认删除",
      content: "确定要删除这个文件吗？",
      success: (res) => {
        if (res.confirm) {
          const files = this.data.resultFiles[type];
          const newFiles = files.filter((item) => item.id !== id);
          this.setData({
            [`resultFiles.${type}`]: newFiles,
          });

          wx.showToast({
            title: "删除成功",
            icon: "success",
          });
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
  submitClosure() {
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
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: "提交中...",
          });

          // 这里应该调用API提交结项申请
          setTimeout(() => {
            wx.hideLoading();
            this.setData({
              "closureInfo.status": "submitted",
              "closureInfo.statusText": "已提交，待导师确认",
            });
            this.updateSubmitStatus();

            wx.showToast({
              title: "提交成功",
              icon: "success",
            });
          }, 1500);
        }
      },
    });
  },

  // 计算是否有成果文件
  get hasResultFiles() {
    const { images, documents, videos } = this.data.resultFiles;
    return images.length > 0 || documents.length > 0 || videos.length > 0;
  },
});
