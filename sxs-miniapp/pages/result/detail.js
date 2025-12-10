Page({
  data: {
    mode: 'create',
    isView: false,
    id: null,
    categories: ['乡村振兴', '支教助学', '红色文化', '科技支农', '医疗卫生', '法律援助', '其他'],
    detail: null,
    form: {
      title: '',
      category: '',
      content: '',
      cover: '',
      files: [],
      images: []
    }
  },

  onLoad(options) {
    const { mode = 'create', id } = options;
    this.setData({
      mode,
      isView: mode === 'view',
      id
    });

    if (mode === 'view' && id) {
      this.loadDetail(id);
    }

    wx.setNavigationBarTitle({
      title: mode === 'create' ? '提交成果' : '成果详情'
    });
  },

  // 加载详情
  loadDetail(id) {
    // TODO: 替换为实际接口调用
    const mockDetail = {
      id: '1',
      title: '望城区乡村振兴调研报告',
      teamName: '青春筑梦队',
      college: '经济管理学院',
      category: '乡村振兴',
      cover: '/images/cover1.jpg',
      submitDate: '2025-07-20',
      content: '本次调研历时两周，团队深入湖南省长沙市望城区多个乡村，通过问卷调查、入户访谈、座谈会等形式，全面了解当地乡村振兴战略实施情况。\n\n主要发现：\n1. 农村基础设施建设取得显著成效\n2. 特色农业产业发展势头良好\n3. 乡村旅游成为新的经济增长点\n4. 人才回流趋势初步显现\n\n存在问题：\n1. 部分村庄空心化现象仍较严重\n2. 农产品销售渠道有待拓展\n3. 乡村文化建设需要加强\n\n建议措施：\n1. 加大政策扶持力度\n2. 发展电商助农\n3. 挖掘乡村文化资源',
      files: [
        { name: '调研报告.pdf', size: '2.5MB', type: 'pdf', url: '' },
        { name: '数据分析.xlsx', size: '1.2MB', type: 'excel', url: '' },
        { name: '活动视频.mp4', size: '45MB', type: 'video', url: '' }
      ],
      images: ['/images/demo1.jpg', '/images/demo2.jpg', '/images/demo3.jpg', '/images/demo4.jpg']
    };
    this.setData({ detail: mockDetail });
  },

  // 输入框变化
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`form.${field}`]: e.detail.value
    });
  },

  // 分类选择
  onCategoryChange(e) {
    const index = e.detail.value;
    this.setData({
      'form.category': this.data.categories[index]
    });
  },

  // 选择封面
  chooseCover() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => {
        this.setData({
          'form.cover': res.tempFiles[0].tempFilePath
        });
      }
    });
  },

  // 选择附件
  chooseFile() {
    wx.chooseMessageFile({
      count: 5,
      type: 'file',
      success: (res) => {
        const newFiles = res.tempFiles.map(f => ({
          name: f.name,
          path: f.path,
          size: (f.size / 1024 / 1024).toFixed(2) + 'MB'
        }));
        this.setData({
          'form.files': [...this.data.form.files, ...newFiles]
        });
      }
    });
  },

  // 删除附件
  deleteFile(e) {
    const index = e.currentTarget.dataset.index;
    const files = this.data.form.files;
    files.splice(index, 1);
    this.setData({ 'form.files': files });
  },

  // 选择图片
  chooseImage() {
    const count = 9 - this.data.form.images.length;
    wx.chooseMedia({
      count,
      mediaType: ['image'],
      success: (res) => {
        const newImages = res.tempFiles.map(f => f.tempFilePath);
        this.setData({
          'form.images': [...this.data.form.images, ...newImages]
        });
      }
    });
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.form.images;
    images.splice(index, 1);
    this.setData({ 'form.images': images });
  },

  // 预览图片
  previewImage(e) {
    const src = e.currentTarget.dataset.src;
    wx.previewImage({
      current: src,
      urls: this.data.detail.images
    });
  },

  // 预览文件
  previewFile(e) {
    const file = e.currentTarget.dataset.file;
    wx.showToast({ title: '查看: ' + file.name, icon: 'none' });
    // TODO: 实际文件预览逻辑
  },

  // 表单验证
  validateForm() {
    const { form } = this.data;
    if (!form.title.trim()) {
      wx.showToast({ title: '请输入成果标题', icon: 'none' });
      return false;
    }
    if (!form.category) {
      wx.showToast({ title: '请选择成果分类', icon: 'none' });
      return false;
    }
    if (!form.content.trim()) {
      wx.showToast({ title: '请输入成果简介', icon: 'none' });
      return false;
    }
    return true;
  },

  // 提交
  submitForm() {
    if (!this.validateForm()) return;

    wx.showModal({
      title: '确认提交',
      content: '提交后成果将进入审核流程，是否确认？',
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用接口上传
          wx.showToast({ title: '提交成功', icon: 'success' });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      }
    });
  }
});
