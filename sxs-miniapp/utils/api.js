/**
 * API 接口定义
 */
const { get, post, put, del } = require('./request');

// ==================== 认证模块 ====================
const authApi = {
  // 用户名密码登录
  login: (data) => post('/auth/login', data),
  // 微信登录
  wxLogin: (code) => post('/auth/wx-login', { code }),
  // 绑定微信
  bindWx: (data) => post('/auth/bind-wx', data)
};

// ==================== 用户模块 ====================
const userApi = {
  // 获取用户信息
  getInfo: () => get('/user/info'),
  // 更新用户信息
  updateInfo: (data) => put('/user/info', data),
  // 获取统计数据
  getStats: () => get('/user/stats'),
  // 获取学院列表
  getColleges: () => get('/user/colleges'),
  // 获取教师列表
  getTeachers: (collegeId) => get('/user/teachers', { collegeId })
};

// ==================== 项目申报模块 ====================
const projectApi = {
  // 获取项目列表
  getList: (params) => get('/project/list', params),
  // 获取项目详情
  getDetail: (id) => get(`/project/detail/${id}`),
  // 创建项目
  create: (data) => post('/project/create', data),
  // 更新项目
  update: (id, data) => put(`/project/update/${id}`, data),
  // 提交审批
  submit: (id) => post(`/project/submit/${id}`),
  // 删除项目
  delete: (id) => del(`/project/delete/${id}`)
};

// ==================== 审批管理模块 ====================
const approvalApi = {
  // 获取审批列表
  getList: (params) => get('/approval/list', params),
  // 审批通过
  approve: (id, opinion) => post(`/approval/approve/${id}`, { opinion }),
  // 审批驳回
  reject: (id, opinion) => post(`/approval/reject/${id}`, { opinion })
};

// ==================== 进度跟踪模块 ====================
const progressApi = {
  // 获取进度列表
  getList: (params) => get('/progress/list', params),
  // 获取进度详情
  getDetail: (id) => get(`/progress/detail/${id}`),
  // 创建进度
  create: (data) => post('/progress/create', data),
  // 添加评论
  addComment: (id, content) => post(`/progress/comment/${id}`, { content }),
  // 删除进度
  delete: (id) => del(`/progress/delete/${id}`)
};

// ==================== 成果管理模块 ====================
const resultApi = {
  // 获取成果列表
  getList: (params) => get('/result/list', params),
  // 获取我的成果
  getMyList: (params) => get('/result/my-list', params),
  // 获取成果详情
  getDetail: (id) => get(`/result/detail/${id}`),
  // 创建成果
  create: (data) => post('/result/create', data),
  // 发布成果
  publish: (id) => post(`/result/publish/${id}`),
  // 删除成果
  delete: (id) => del(`/result/delete/${id}`)
};

// ==================== 评优管理模块 ====================
const evaluationApi = {
  // 获取评优列表
  getList: (params) => get('/evaluation/list', params),
  // 获取评优详情
  getDetail: (projectId) => get(`/evaluation/detail/${projectId}`),
  // 提交评分
  submitScore: (projectId, data) => post(`/evaluation/score/${projectId}`, data),
  // 获取排名
  getRanking: (evaluationId) => get('/evaluation/ranking', { evaluationId }),
  // 设置获奖等级
  setAward: (projectId, awardLevel) => post(`/evaluation/award/${projectId}`, { awardLevel })
};

// ==================== 通知公告模块 ====================
const noticeApi = {
  // 获取通知列表
  getList: (params) => get('/notice/list', params),
  // 获取通知详情
  getDetail: (id) => get(`/notice/detail/${id}`),
  // 创建通知
  create: (data) => post('/notice/create', data),
  // 更新通知
  update: (id, data) => put(`/notice/update/${id}`, data),
  // 删除通知
  delete: (id) => del(`/notice/delete/${id}`),
  // 收藏/取消收藏
  toggleFavorite: (id) => post(`/notice/favorite/${id}`),
  // 获取未读数量
  getUnreadCount: () => get('/notice/unread-count')
};

module.exports = {
  authApi,
  userApi,
  projectApi,
  approvalApi,
  progressApi,
  resultApi,
  evaluationApi,
  noticeApi
};
