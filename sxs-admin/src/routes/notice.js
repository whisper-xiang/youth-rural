/**
 * 通知公告路由
 */
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/auth');
const { success, paginate, error } = require('../utils/response');

// 获取通知列表
router.get('/list', verifyToken, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, type } = req.query;
    const userId = req.user.id;
    const offset = (page - 1) * pageSize;

    let whereClauses = ["n.status = 'published'"];
    let params = [];

    if (type && type !== 'all') {
      whereClauses.push('n.type = ?');
      params.push(type);
    }

    const whereSQL = whereClauses.join(' AND ');

    // 查询总数
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM notice n WHERE ${whereSQL}`,
      params
    );

    // 查询列表
    const [rows] = await db.query(
      `SELECT n.*, 
              u.real_name as publisher_name,
              CASE WHEN nr.id IS NOT NULL THEN 1 ELSE 0 END as is_read
       FROM notice n
       LEFT JOIN sys_user u ON n.publisher_id = u.id
       LEFT JOIN notice_read nr ON n.id = nr.notice_id AND nr.user_id = ?
       WHERE ${whereSQL}
       ORDER BY n.publish_time DESC
       LIMIT ? OFFSET ?`,
      [userId, ...params, parseInt(pageSize), offset]
    );

    paginate(res, rows, total, page, pageSize);

  } catch (err) {
    console.error('Get notice list error:', err);
    error(res, '获取通知列表失败', 500);
  }
});

// 获取通知详情
router.get('/detail/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [[notice]] = await db.query(
      `SELECT n.*, u.real_name as publisher_name
       FROM notice n
       LEFT JOIN sys_user u ON n.publisher_id = u.id
       WHERE n.id = ?`,
      [id]
    );

    if (!notice) {
      return error(res, '通知不存在');
    }

    // 更新浏览次数
    await db.query('UPDATE notice SET view_count = view_count + 1 WHERE id = ?', [id]);

    // 标记已读
    await db.query(
      'INSERT IGNORE INTO notice_read (notice_id, user_id) VALUES (?, ?)',
      [id, userId]
    );

    // 附件
    const [attachments] = await db.query(
      'SELECT * FROM notice_attachment WHERE notice_id = ?',
      [id]
    );
    notice.attachments = attachments;

    // 是否收藏
    const [[favorite]] = await db.query(
      "SELECT id FROM user_favorite WHERE user_id = ? AND target_type = 'notice' AND target_id = ?",
      [userId, id]
    );
    notice.isCollected = !!favorite;

    success(res, notice);

  } catch (err) {
    console.error('Get notice detail error:', err);
    error(res, '获取通知详情失败', 500);
  }
});

// 创建通知（管理员）
router.post('/create', verifyToken, checkRole('college_admin', 'school_admin'), async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { title, type, content, summary, source, isTop, attachments } = req.body;
    const userId = req.user.id;

    const [result] = await conn.query(
      `INSERT INTO notice (title, type, content, summary, source, publisher_id, is_top, status, publish_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'published', NOW())`,
      [title, type, content, summary, source, userId, isTop ? 1 : 0]
    );

    const noticeId = result.insertId;

    // 添加附件
    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        await conn.query(
          'INSERT INTO notice_attachment (notice_id, file_name, file_url, file_size, file_type) VALUES (?, ?, ?, ?, ?)',
          [noticeId, att.name, att.url, att.size, att.type]
        );
      }
    }

    await conn.commit();
    success(res, { id: noticeId }, '发布成功');

  } catch (err) {
    await conn.rollback();
    console.error('Create notice error:', err);
    error(res, '发布失败', 500);
  } finally {
    conn.release();
  }
});

// 更新通知
router.put('/update/:id', verifyToken, checkRole('college_admin', 'school_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, content, summary, source, isTop } = req.body;

    await db.query(
      `UPDATE notice SET title = ?, type = ?, content = ?, summary = ?, source = ?, is_top = ?
       WHERE id = ?`,
      [title, type, content, summary, source, isTop ? 1 : 0, id]
    );

    success(res, null, '更新成功');

  } catch (err) {
    console.error('Update notice error:', err);
    error(res, '更新失败', 500);
  }
});

// 删除通知
router.delete('/delete/:id', verifyToken, checkRole('college_admin', 'school_admin'), async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM notice WHERE id = ?', [id]);
    await db.query('DELETE FROM notice_attachment WHERE notice_id = ?', [id]);
    await db.query('DELETE FROM notice_read WHERE notice_id = ?', [id]);

    success(res, null, '删除成功');

  } catch (err) {
    console.error('Delete notice error:', err);
    error(res, '删除失败', 500);
  }
});

// 收藏/取消收藏
router.post('/favorite/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [[existing]] = await db.query(
      "SELECT id FROM user_favorite WHERE user_id = ? AND target_type = 'notice' AND target_id = ?",
      [userId, id]
    );

    if (existing) {
      await db.query('DELETE FROM user_favorite WHERE id = ?', [existing.id]);
      success(res, { isCollected: false }, '已取消收藏');
    } else {
      await db.query(
        "INSERT INTO user_favorite (user_id, target_type, target_id) VALUES (?, 'notice', ?)",
        [userId, id]
      );
      success(res, { isCollected: true }, '已收藏');
    }

  } catch (err) {
    console.error('Toggle favorite error:', err);
    error(res, '操作失败', 500);
  }
});

// 获取未读数量
router.get('/unread-count', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [[{ count }]] = await db.query(
      `SELECT COUNT(*) as count FROM notice n 
       WHERE n.status = 'published' 
       AND n.id NOT IN (SELECT notice_id FROM notice_read WHERE user_id = ?)`,
      [userId]
    );

    success(res, { count });

  } catch (err) {
    console.error('Get unread count error:', err);
    error(res, '获取未读数量失败', 500);
  }
});

module.exports = router;
