/**
 * 用户路由
 */
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/auth');
const { success, paginate, error } = require('../utils/response');

// 获取当前用户信息
router.get('/info', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.*, c.name as college_name 
       FROM sys_user u 
       LEFT JOIN sys_college c ON u.college_id = c.id 
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return error(res, '用户不存在');
    }

    const user = rows[0];
    success(res, {
      id: user.id,
      username: user.username,
      name: user.real_name,
      phone: user.phone,
      email: user.email,
      avatar: user.avatar,
      gender: user.gender,
      role: user.role,
      college: user.college_name,
      collegeId: user.college_id
    });

  } catch (err) {
    console.error('Get user info error:', err);
    error(res, '获取用户信息失败', 500);
  }
});

// 更新用户信息
router.put('/info', verifyToken, async (req, res) => {
  try {
    const { phone, email, avatar } = req.body;
    
    await db.query(
      'UPDATE sys_user SET phone = ?, email = ?, avatar = ? WHERE id = ?',
      [phone, email, avatar, req.user.id]
    );

    success(res, null, '更新成功');

  } catch (err) {
    console.error('Update user info error:', err);
    error(res, '更新失败', 500);
  }
});

// 获取用户统计数据
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    let stats = {};

    if (role === 'student') {
      // 学生统计
      const [[projectCount]] = await db.query(
        'SELECT COUNT(*) as count FROM project WHERE leader_id = ?',
        [userId]
      );
      const [[progressCount]] = await db.query(
        'SELECT COUNT(*) as count FROM progress WHERE creator_id = ?',
        [userId]
      );
      const [[resultCount]] = await db.query(
        'SELECT COUNT(*) as count FROM result WHERE creator_id = ?',
        [userId]
      );
      stats = {
        projectCount: projectCount.count,
        progressCount: progressCount.count,
        resultCount: resultCount.count
      };
    } else if (role === 'college_admin' || role === 'school_admin') {
      // 管理员统计
      const [[pendingCount]] = await db.query(
        `SELECT COUNT(*) as count FROM project WHERE status = ?`,
        [role === 'college_admin' ? 'pending' : 'college_approved']
      );
      const [[totalCount]] = await db.query('SELECT COUNT(*) as count FROM project');
      stats = {
        projectCount: totalCount.count,
        pendingCount: pendingCount.count
      };
    } else if (role === 'expert') {
      // 专家统计
      const [[pendingCount]] = await db.query(
        `SELECT COUNT(DISTINCT ep.project_id) as count 
         FROM evaluation_project ep 
         LEFT JOIN evaluation_score es ON ep.project_id = es.project_id AND es.expert_id = ?
         WHERE es.id IS NULL`,
        [userId]
      );
      stats = { pendingCount: pendingCount.count };
    }

    // 未读通知数
    const [[unreadCount]] = await db.query(
      `SELECT COUNT(*) as count FROM notice n 
       WHERE n.status = 'published' 
       AND n.id NOT IN (SELECT notice_id FROM notice_read WHERE user_id = ?)`,
      [userId]
    );
    stats.noticeCount = unreadCount.count;

    success(res, stats);

  } catch (err) {
    console.error('Get stats error:', err);
    error(res, '获取统计数据失败', 500);
  }
});

// 获取学院列表
router.get('/colleges', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, code FROM sys_college WHERE status = 1 ORDER BY sort'
    );
    success(res, rows);
  } catch (err) {
    console.error('Get colleges error:', err);
    error(res, '获取学院列表失败', 500);
  }
});

// 获取教师列表（用于选择指导教师）
router.get('/teachers', verifyToken, async (req, res) => {
  try {
    const { collegeId } = req.query;
    let sql = `SELECT id, real_name as name, phone FROM sys_user WHERE role = 'teacher' AND status = 1`;
    const params = [];
    
    if (collegeId) {
      sql += ' AND college_id = ?';
      params.push(collegeId);
    }
    
    const [rows] = await db.query(sql, params);
    success(res, rows);
  } catch (err) {
    console.error('Get teachers error:', err);
    error(res, '获取教师列表失败', 500);
  }
});

module.exports = router;
