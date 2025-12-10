/**
 * 文件上传路由
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/auth');
const { success, error } = require('../utils/response');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 按日期分目录
    const dateDir = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const dir = path.join(uploadDir, dateDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, filename);
  }
});

// 文件过滤
const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'video/mp4', 'video/quicktime'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 默认 10MB
  }
});

// 单文件上传
router.post('/file', verifyToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return error(res, '请选择文件');
    }

    const file = req.file;
    const dateDir = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileUrl = `/uploads/${dateDir}/${file.filename}`;

    success(res, {
      url: fileUrl,
      name: file.originalname,
      size: file.size,
      type: getFileType(file.originalname)
    }, '上传成功');

  } catch (err) {
    console.error('Upload file error:', err);
    error(res, '上传失败', 500);
  }
});

// 多文件上传
router.post('/files', verifyToken, upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return error(res, '请选择文件');
    }

    const dateDir = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const files = req.files.map(file => ({
      url: `/uploads/${dateDir}/${file.filename}`,
      name: file.originalname,
      size: file.size,
      type: getFileType(file.originalname)
    }));

    success(res, files, '上传成功');

  } catch (err) {
    console.error('Upload files error:', err);
    error(res, '上传失败', 500);
  }
});

// 图片上传
router.post('/image', verifyToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return error(res, '请选择图片');
    }

    // 验证是否为图片
    if (!req.file.mimetype.startsWith('image/')) {
      // 删除已上传的文件
      fs.unlinkSync(req.file.path);
      return error(res, '请上传图片文件');
    }

    const dateDir = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const imageUrl = `/uploads/${dateDir}/${req.file.filename}`;

    success(res, { url: imageUrl }, '上传成功');

  } catch (err) {
    console.error('Upload image error:', err);
    error(res, '上传失败', 500);
  }
});

// 多图片上传
router.post('/images', verifyToken, upload.array('images', 9), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return error(res, '请选择图片');
    }

    const dateDir = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const urls = req.files.map(file => `/uploads/${dateDir}/${file.filename}`);

    success(res, { urls }, '上传成功');

  } catch (err) {
    console.error('Upload images error:', err);
    error(res, '上传失败', 500);
  }
});

// 获取文件类型
function getFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const typeMap = {
    '.doc': 'word', '.docx': 'word',
    '.xls': 'excel', '.xlsx': 'excel',
    '.ppt': 'ppt', '.pptx': 'ppt',
    '.pdf': 'pdf',
    '.jpg': 'image', '.jpeg': 'image', '.png': 'image', '.gif': 'image', '.webp': 'image',
    '.mp4': 'video', '.mov': 'video'
  };
  return typeMap[ext] || 'other';
}

// 错误处理
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return error(res, '文件大小超出限制');
    }
    return error(res, err.message);
  }
  if (err) {
    return error(res, err.message);
  }
  next();
});

module.exports = router;
