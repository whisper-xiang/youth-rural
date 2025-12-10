/**
 * 统一响应格式
 */

// 成功响应
const success = (res, data = null, message = '操作成功') => {
  res.json({
    code: 0,
    message,
    data
  });
};

// 分页响应
const paginate = (res, list, total, page, pageSize) => {
  res.json({
    code: 0,
    message: '操作成功',
    data: {
      list,
      pagination: {
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(total / pageSize)
      }
    }
  });
};

// 错误响应
const error = (res, message = '操作失败', code = 400) => {
  res.status(code >= 500 ? code : 200).json({
    code,
    message,
    data: null
  });
};

module.exports = { success, paginate, error };
