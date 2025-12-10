const { progressApi } = require('../../utils/api');
const { uploadImage, BASE_URL } = require('../../utils/request');

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
      images: [],
      projectId: ''
    },
    submitting: false
  },

  onLoad(options) {
    const { mode = 'create', id, projectId } = options;
    this.setData({
      mode,
      isView: mode === 'view',
      id,
      'form.projectId': projectId || ''
    });

    if (mode === 'view' && id) {
      this.loadDetail(id);
    }

    wx.setNavigationBarTitle({
      title: mode === 'create' ? '上传进度' : '进度详情'
    });
  },

  // 加载详情
  async loadDetail(id) {
    try {
      const res = await progressApi.getDetail(id);
      const baseUrl = BASE_URL.replace('/api', '');
      const detail = {
        ...res,
        date: res.progress_date ? res.progress_date.slice(0, 10) : '',
        images: (res.images || []).map(img => img.startsWith('http') ? img : baseUrl + img),
        comments: (res.comments || []).map(c => ({
          ...c,
          time: c.created_at ? c.created_at.slice(0, 16).replace('T', ' ') : ''
        }))
      };
      this.setData({ detail });
    } catch (err) {
      console.error('加载进度详情失败:', err);
    }
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
  async submitForm() {
    if (!this.validateForm()) return;
    if (this.data.submitting) return;

    this.setData({ submitting: true });

    try {
      const { form } = this.data;
      
      // 上传图片
      const imageUrls = [];
      for (const img of form.images) {
        if (img.startsWith('http')) {
          imageUrls.push(img);
        } else {
          const url = await uploadImage(img);
          imageUrls.push(url);
        }
      }

      await progressApi.create({
        project_id: form.projectId,
        title: form.title,
        progress_date: form.date,
        content: form.content,
        images: imageUrls
      });

      wx.showToast({ title: '提交成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      console.error('提交进度失败:', err);
    } finally {
      this.setData({ submitting: false });
    }
  }
});
