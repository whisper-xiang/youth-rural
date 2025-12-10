/**
 * 进度跟踪路由
 */
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const { success, paginate, error } = require('../utils/response');

// 获取进度列表
router.get('/list', verifyToken, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, projectId } = req.query;
    const offset = (page - 1) * pageSize;

    let whereClauses = ['1=1'];
    let params = [];

    if (projectId) {
      whereClauses.push('pg.project_id = ?');
      params.push(projectId);
    }

    const whereSQL = whereClauses.join(' AND ');

    // 查询总数
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM progress pg WHERE ${whereSQL}`,
      params
    );

    // 查询列表
    const [rows] = await db.query(
      `SELECT pg.*, 
              p.title as project_title,
              u.real_name as creator_name
       FROM progress pg
       LEFT JOIN project p ON pg.project_id = p.id
       LEFT JOIN sys_user u ON pg.creator_id = u.id
       WHERE ${whereSQL}
       ORDER BY pg.progress_date DESC, pg.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset]
    );

    // 获取每条进度的图片
    for (let row of rows) {
      const [images] = await db.query(
        'SELECT image_url FROM progress_image WHERE progress_id = ? ORDER BY sort',
        [row.id]
      );
      row.images = images.map(img => img.image_url);
    }

    paginate(res, rows, total, page, pageSize);

  } catch (err) {
    console.error('Get progress list error:', err);
    error(res, '获取进度列表失败', 500);
  }
});

// 获取进度详情
router.get('/detail/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [[progress]] = await db.query(
      `SELECT pg.*, 
              p.title as project_title,
              u.real_name as creator_name
       FROM progress pg
       LEFT JOIN project p ON pg.project_id = p.id
       LEFT JOIN sys_user u ON pg.creator_id = u.id
       WHERE pg.id = ?`,
      [id]
    );

    if (!progress) {
      return error(res, '进度记录不存在');
    }

    // 图片
    const [images] = await db.query(
      'SELECT image_url FROM progress_image WHERE progress_id = ? ORDER BY sort',
      [id]
    );
    progress.images = images.map(img => img.image_url);

    // 评论
    const [comments] = await db.query(
      `SELECT pc.*, u.real_name as user_name, u.role as user_role
       FROM progress_comment pc
       LEFT JOIN sys_user u ON pc.user_id = u.id
       WHERE pc.progress_id = ?
       ORDER BY pc.created_at`,
      [id]
    );
    progress.comments = comments;

    success(res, progress);

  } catch (err) {
    console.error('Get progress detail error:', err);
    error(res, '获取进度详情失败', 500);
  }
});

// 创建进度
router.post('/create', verifyToken, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { projectId, title, content, progressDate, location, images } = req.body;
    const userId = req.user.id;

    // 检查项目权限
    const [[project]] = await conn.query(
      'SELECT * FROM project WHERE id = ? AND leader_id = ?',
      [projectId, userId]
    );
    if (!project) {
      return error(res, '无权限操作该项目');
    }

    // 创建进度
    const [result] = await conn.query(
      `INSERT INTO progress (project_id, title, content, progress_date, location, creator_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [projectId, title, content, progressDate, location, userId]
    );

    const progressId = result.insertId;

    // 添加图片
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await conn.query(
          'INSERT INTO progress_image (progress_id, image_url, sort) VALUES (?, ?, ?)',
          [progressId, images[i], i]
        );
      }
    }

    await conn.commit();
    success(res, { id: progressId }, '创建成功');

  } catch (err) {
    await conn.rollback();
    console.error('Create progress error:', err);
    error(res, '创建进度失败', 500);
  } finally {
    conn.release();
  }
});

// 添加评论
router.post('/comment/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return error(res, '评论内容不能为空');
    }

    // 检查进度是否存在
    const [[progress]] = await db.query('SELECT * FROM progress WHERE id = ?', [id]);
    if (!progress) {
      return error(res, '进度记录不存在');
    }

    await db.query(
      'INSERT INTO progress_comment (progress_id, user_id, content) VALUES (?, ?, ?)',
      [id, userId, content]
    );

    success(res, null, '评论成功');

  } catch (err) {
    console.error('Add comment error:', err);
    error(res, '评论失败', 500);
  }
});

// 删除进度
router.delete('/delete/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [[progress]] = await db.query('SELECT * FROM progress WHERE id = ?', [id]);
    if (!progress) {
      return error(res, '进度记录不存在');
    }
    if (progress.creator_id !== userId) {
      return error(res, '无权限删除');
    }

    await db.query('DELETE FROM progress WHERE id = ?', [id]);
    await db.query('DELETE FROM progress_image WHERE progress_id = ?', [id]);
    await db.query('DELETE FROM progress_comment WHERE progress_id = ?', [id]);

    success(res, null, '删除成功');

  } catch (err) {
    console.error('Delete progress error:', err);
    error(res, '删除失败', 500);
  }
});

module.exports = router;
