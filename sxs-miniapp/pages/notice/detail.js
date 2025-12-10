Page({
  data: {
    id: null,
    detail: null
  },

  onLoad(options) {
    const { id } = options;
    this.setData({ id });
    this.loadDetail(id);
  },

  // 加载详情
  loadDetail(id) {
    // TODO: 替换为实际接口调用
    const mockDetail = {
      id: '1',
      type: 'notice',
      typeName: '通知',
      title: '关于开展2025年暑期"三下乡"社会实践活动的通知',
      source: '校团委',
      publishTime: '2025-06-01 10:00',
      viewCount: 1256,
      isCollected: false,
      content: `<p style="text-indent: 2em; line-height: 2; margin-bottom: 16px;">各学院团委、各学生组织：</p>
<p style="text-indent: 2em; line-height: 2; margin-bottom: 16px;">为深入学习贯彻习近平新时代中国特色社会主义思想，引导广大青年学生在社会实践中受教育、长才干、作贡献，现就开展2025年暑期"三下乡"社会实践活动通知如下：</p>
<p style="font-weight: bold; margin: 20px 0 12px;">一、活动主题</p>
<p style="text-indent: 2em; line-height: 2; margin-bottom: 16px;">青春为中国式现代化挺膺担当</p>
<p style="font-weight: bold; margin: 20px 0 12px;">二、活动时间</p>
<p style="text-indent: 2em; line-height: 2; margin-bottom: 16px;">2025年7月1日至8月31日</p>
<p style="font-weight: bold; margin: 20px 0 12px;">三、活动内容</p>
<p style="text-indent: 2em; line-height: 2; margin-bottom: 16px;">1. 理论普及宣讲</p>
<p style="text-indent: 2em; line-height: 2; margin-bottom: 16px;">2. 乡村振兴促进</p>
<p style="text-indent: 2em; line-height: 2; margin-bottom: 16px;">3. 发展成就观察</p>
<p style="text-indent: 2em; line-height: 2; margin-bottom: 16px;">4. 民族团结实践</p>
<p style="font-weight: bold; margin: 20px 0 12px;">四、申报要求</p>
<p style="text-indent: 2em; line-height: 2; margin-bottom: 16px;">1. 每支团队人数为5-10人，须配备1名指导教师；</p>
<p style="text-indent: 2em; line-height: 2; margin-bottom: 16px;">2. 团队需于6月15日前完成网上申报；</p>
<p style="text-indent: 2em; line-height: 2; margin-bottom: 16px;">3. 活动结束后需提交调研报告、活动总结等材料。</p>
<p style="text-align: right; margin-top: 40px;">校团委</p>
<p style="text-align: right;">2025年6月1日</p>`,
      attachments: [
        { name: '2025年三下乡活动申报表.docx', size: '45KB', type: 'word' },
        { name: '活动经费预算模板.xlsx', size: '32KB', type: 'excel' },
        { name: '安全责任书.pdf', size: '128KB', type: 'pdf' }
      ]
    };
    this.setData({ detail: mockDetail });
  },

  // 下载附件
  downloadFile(e) {
    const file = e.currentTarget.dataset.file;
    wx.showToast({ title: '下载: ' + file.name, icon: 'none' });
    // TODO: 实际下载逻辑
  },

  // 分享
  shareNotice() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 收藏/取消收藏
  toggleCollect() {
    const detail = this.data.detail;
    detail.isCollected = !detail.isCollected;
    this.setData({ detail });
    wx.showToast({
      title: detail.isCollected ? '已收藏' : '已取消收藏',
      icon: 'success'
    });
  },

  // 分享配置
  onShareAppMessage() {
    return {
      title: this.data.detail.title,
      path: `/pages/notice/detail?id=${this.data.id}`
    };
  }
});
