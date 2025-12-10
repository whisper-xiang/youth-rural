/**
 * 成果管理路由
 */
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const { success, paginate, error } = require('../utils/response');

// 获取成果列表
router.get('/list', verifyToken, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, category, keyword, projectId } = req.query;
    const offset = (page - 1) * pageSize;

    let whereClauses = ["r.status = 'published'"];
    let params = [];

    if (category && category !== 'all') {
      whereClauses.push('r.category = ?');
      params.push(category);
    }

    if (projectId) {
      whereClauses.push('r.project_id = ?');
      params.push(projectId);
    }

    if (keyword) {
      whereClauses.push('(r.title LIKE ? OR r.description LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const whereSQL = whereClauses.join(' AND ');

    // 查询总数
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM result r WHERE ${whereSQL}`,
      params
    );

    // 查询列表
    const [rows] = await db.query(
      `SELECT r.*, 
              p.title as project_title,
              u.real_name as creator_name
       FROM result r
       LEFT JOIN project p ON r.project_id = p.id
       LEFT JOIN sys_user u ON r.creator_id = u.id
       WHERE ${whereSQL}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset]
    );

    paginate(res, rows, total, page, pageSize);

  } catch (err) {
    console.error('Get result list error:', err);
    error(res, '获取成果列表失败', 500);
  }
});

// 获取我的成果列表
router.get('/my-list', verifyToken, async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const userId = req.user.id;
    const offset = (page - 1) * pageSize;

    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) as total FROM result WHERE creator_id = ?',
      [userId]
    );

    const [rows] = await db.query(
      `SELECT r.*, p.title as project_title
       FROM result r
       LEFT JOIN project p ON r.project_id = p.id
       WHERE r.creator_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(pageSize), offset]
    );

    paginate(res, rows, total, page, pageSize);

  } catch (err) {
    console.error('Get my result list error:', err);
    error(res, '获取成果列表失败', 500);
  }
});

// 获取成果详情
router.get('/detail/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [[result]] = await db.query(
      `SELECT r.*, 
              p.title as project_title,
              u.real_name as creator_name
       FROM result r
       LEFT JOIN project p ON r.project_id = p.id
       LEFT JOIN sys_user u ON r.creator_id = u.id
       WHERE r.id = ?`,
      [id]
    );

    if (!result) {
      return error(res, '成果不存在');
    }

    // 更新浏览次数
    await db.query('UPDATE result SET view_count = view_count + 1 WHERE id = ?', [id]);

    // 附件
    const [attachments] = await db.query(
      'SELECT * FROM result_attachment WHERE result_id = ?',
      [id]
    );
    result.attachments = attachments;

    // 图片
    const [images] = await db.query(
      'SELECT image_url FROM result_image WHERE result_id = ? ORDER BY sort',
      [id]
    );
    result.images = images.map(img => img.image_url);

    success(res, result);

  } catch (err) {
    console.error('Get result detail error:', err);
    error(res, '获取成果详情失败', 500);
  }
});

// 创建成果
router.post('/create', verifyToken, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { projectId, title, category, description, coverUrl, content, images, attachments } = req.body;
    const userId = req.user.id;

    // 创建成果
    const [result] = await conn.query(
      `INSERT INTO result (project_id, title, category, description, cover_url, content, creator_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [projectId, title, category, description, coverUrl, content, userId]
    );

    const resultId = result.insertId;

    // 添加图片
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await conn.query(
          'INSERT INTO result_image (result_id, image_url, sort) VALUES (?, ?, ?)',
          [resultId, images[i], i]
        );
      }
    }

    // 添加附件
    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        await conn.query(
          'INSERT INTO result_attachment (result_id, file_name, file_url, file_size, file_type) VALUES (?, ?, ?, ?, ?)',
          [resultId, att.name, att.url, att.size, att.type]
        );
      }
    }

    await conn.commit();
    success(res, { id: resultId }, '创建成功');

  } catch (err) {
    await conn.rollback();
    console.error('Create result error:', err);
    error(res, '创建成果失败', 500);
  } finally {
    conn.release();
  }
});

// 发布成果
router.post('/publish/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [[result]] = await db.query('SELECT * FROM result WHERE id = ?', [id]);
    if (!result) {
      return error(res, '成果不存在');
    }
    if (result.creator_id !== userId) {
      return error(res, '无权限操作');
    }

    await db.query("UPDATE result SET status = 'published' WHERE id = ?", [id]);
    success(res, null, '发布成功');

  } catch (err) {
    console.error('Publish result error:', err);
    error(res, '发布失败', 500);
  }
});

// 删除成果
router.delete('/delete/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [[result]] = await db.query('SELECT * FROM result WHERE id = ?', [id]);
    if (!result) {
      return error(res, '成果不存在');
    }
    if (result.creator_id !== userId && req.user.role !== 'school_admin') {
      return error(res, '无权限删除');
    }

    await db.query('DELETE FROM result WHERE id = ?', [id]);
    await db.query('DELETE FROM result_image WHERE result_id = ?', [id]);
    await db.query('DELETE FROM result_attachment WHERE result_id = ?', [id]);

    success(res, null, '删除成功');

  } catch (err) {
    console.error('Delete result error:', err);
    error(res, '删除失败', 500);
  }
});

module.exports = router;
