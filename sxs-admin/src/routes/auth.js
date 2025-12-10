/**
 * 认证路由
 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { success, error } = require('../utils/response');

// 用户名密码登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return error(res, '用户名和密码不能为空', 400);
    }

    // 查询用户
    const [users] = await db.query(
      'SELECT * FROM sys_user WHERE username = ? AND status = 1',
      [username]
    );

    if (users.length === 0) {
      return error(res, '用户名或密码错误', 400);
    }

    const user = users[0];

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return error(res, '用户名或密码错误');
    }

    // 更新最后登录时间
    await db.query('UPDATE sys_user SET last_login_time = NOW() WHERE id = ?', [user.id]);

    // 生成 Token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 返回用户信息
    success(res, {
      token,
      userInfo: {
        id: user.id,
        username: user.username,
        name: user.real_name,
        role: user.role,
        roleName: getRoleName(user.role),
        phone: user.phone,
        email: user.email,
        avatar: user.avatar,
        college: user.college_name,
        collegeId: user.college_id
      }
    }, '登录成功');

  } catch (err) {
    console.error('Login error:', err);
    error(res, '登录失败，请稍后重试', 500);
  }
});

// 微信小程序登录
router.post('/wx-login', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return error(res, 'code 不能为空');
    }

    // TODO: 调用微信接口获取 openid
    // const wxRes = await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${SECRET}&js_code=${code}&grant_type=authorization_code`);
    // const { openid, session_key } = wxRes.data;

    // 模拟 openid
    const openid = 'mock_openid_' + Date.now();

    // 查询用户是否存在
    const [rows] = await db.query(
      'SELECT * FROM sys_user WHERE openid = ?',
      [openid]
    );

    if (rows.length === 0) {
      // 用户不存在，返回需要绑定
      return success(res, { needBind: true, openid }, '需要绑定账号');
    }

    const user = rows[0];

    // 生成 Token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    success(res, {
      needBind: false,
      token,
      userInfo: {
        id: user.id,
        name: user.real_name,
        role: user.role,
        roleName: getRoleName(user.role)
      }
    }, '登录成功');

  } catch (err) {
    console.error('WX login error:', err);
    error(res, '登录失败', 500);
  }
});

// 绑定微信账号
router.post('/bind-wx', async (req, res) => {
  try {
    const { username, password, openid } = req.body;

    // 验证用户
    const [rows] = await db.query(
      'SELECT * FROM sys_user WHERE username = ? AND status = 1',
      [username]
    );

    if (rows.length === 0) {
      return error(res, '用户名或密码错误');
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return error(res, '用户名或密码错误');
    }

    // 绑定 openid
    await db.query('UPDATE sys_user SET openid = ? WHERE id = ?', [openid, user.id]);

    // 生成 Token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    success(res, {
      token,
      userInfo: {
        id: user.id,
        name: user.real_name,
        role: user.role,
        roleName: getRoleName(user.role)
      }
    }, '绑定成功');

  } catch (err) {
    console.error('Bind WX error:', err);
    error(res, '绑定失败', 500);
  }
});

// 获取角色名称
function getRoleName(role) {
  const roleMap = {
    student: '学生/团队负责人',
    teacher: '指导教师',
    college_admin: '学院管理员',
    school_admin: '校级管理员',
    expert: '评审专家'
  };
  return roleMap[role] || '未知角色';
}

module.exports = router;
