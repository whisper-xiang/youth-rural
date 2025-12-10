Page({
  data: {
    mode: 'create',
    isView: false,
    id: null,
    detail: null,
    form: {
      title: '',
      date: '',
      content: '',
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
      title: mode === 'create' ? '上传进度' : '进度详情'
    });
  },

  // 加载详情
  loadDetail(id) {
    // TODO: 替换为实际接口调用
    const mockDetail = {
      id: '1',
      title: '第一周调研启动',
      date: '2025-07-03',
      uploader: '张三',
      teamName: '青春筑梦队',
      content: '团队于7月3日抵达湖南省长沙市望城区，与当地村委会进行了对接。\n\n主要工作内容：\n1. 与村委会主任座谈，了解村庄基本情况\n2. 实地考察村庄环境和基础设施\n3. 制定详细的调研计划和分工\n4. 安排住宿和后勤保障\n\n下一步计划：\n明天开始入户走访，进行问卷调查和深度访谈。',
      images: ['/images/demo1.jpg', '/images/demo2.jpg', '/images/demo3.jpg', '/images/demo4.jpg', '/images/demo5.jpg'],
      comments: [
        {
          user: '李教授',
          content: '调研计划安排合理，注意做好访谈记录。',
          time: '2025-07-03 18:30'
        }
      ]
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

  // 日期选择
  onDateChange(e) {
    this.setData({
      'form.date': e.detail.value
    });
  },

  // 选择图片
  chooseImage() {
    const count = 9 - this.data.form.images.length;
    wx.chooseMedia({
      count,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
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

  // 表单验证
  validateForm() {
    const { form } = this.data;
    if (!form.title.trim()) {
      wx.showToast({ title: '请输入标题', icon: 'none' });
      return false;
    }
    if (!form.date) {
      wx.showToast({ title: '请选择日期', icon: 'none' });
      return false;
    }
    if (!form.content.trim()) {
      wx.showToast({ title: '请输入进度内容', icon: 'none' });
      return false;
    }
    return true;
  },

  // 提交
  submitForm() {
    if (!this.validateForm()) return;

    // TODO: 调用接口上传
    wx.showToast({ title: '提交成功', icon: 'success' });
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  }
});
