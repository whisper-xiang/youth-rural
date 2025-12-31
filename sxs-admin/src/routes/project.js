/**
 * 项目申报路由
 */
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, checkRole } = require("../middleware/auth");
const { success, paginate, error } = require("../utils/response");

// 获取项目列表
router.get("/list", verifyToken, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status, category, keyword } = req.query;
    const userId = req.user.id;
    const role = req.user.role;
    const offset = (page - 1) * pageSize;

    let whereClauses = ["1=1"];
    let params = [];

    // 根据角色过滤
    if (role === "student") {
      whereClauses.push("p.leader_id = ?");
      params.push(userId);
    } else if (role === "teacher") {
      whereClauses.push("p.teacher_id = ?");
      params.push(userId);
    } else if (role === "college_admin") {
      const [[user]] = await db.query(
        "SELECT college_id FROM sys_user WHERE id = ?",
        [userId]
      );
      whereClauses.push("p.college_id = ?");
      params.push(user.college_id);
    }

    // 状态过滤
    if (status) {
      whereClauses.push("p.status = ?");
      params.push(status);
    }

    // 类别过滤
    if (category) {
      whereClauses.push("p.category = ?");
      params.push(category);
    }

    // 关键词搜索
    if (keyword) {
      whereClauses.push("(p.title LIKE ? OR p.project_no LIKE ?)");
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const whereSQL = whereClauses.join(" AND ");

    // 查询总数
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM project p WHERE ${whereSQL}`,
      params
    );

    // 查询列表
    const [rows] = await db.query(
      `SELECT p.*, 
              (SELECT COUNT(*) FROM progress pg WHERE pg.project_id = p.id) as progress_count,
              (SELECT COUNT(*) FROM result r WHERE r.project_id = p.id AND r.creator_id = ?) as my_result_count,
              u.real_name as leader_name,
              t.real_name as teacher_name,
              c.name as college_name
       FROM project p
       LEFT JOIN sys_user u ON p.leader_id = u.id
       LEFT JOIN sys_user t ON p.teacher_id = t.id
       LEFT JOIN sys_college c ON p.college_id = c.id
       WHERE ${whereSQL}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, ...params, parseInt(pageSize), offset]
    );

    paginate(res, rows, total, page, pageSize);
  } catch (err) {
    console.error("Get project list error:", err);
    error(res, "获取项目列表失败", 500);
  }
});

// 获取项目详情
router.get("/detail/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // 项目基本信息
    const [[project]] = await db.query(
      `SELECT p.*, 
              u.real_name as leader_name, u.phone as leader_phone,
              t.real_name as teacher_name, t.phone as teacher_phone,
              c.name as college_name
       FROM project p
       LEFT JOIN sys_user u ON p.leader_id = u.id
       LEFT JOIN sys_user t ON p.teacher_id = t.id
       LEFT JOIN sys_college c ON p.college_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (!project) {
      return error(res, "项目不存在");
    }

    // 团队成员
    const [members] = await db.query(
      `SELECT pm.*, u.real_name as name, u.phone
       FROM project_member pm
       LEFT JOIN sys_user u ON pm.user_id = u.id
       WHERE pm.project_id = ?`,
      [id]
    );

    // 附件
    const [attachments] = await db.query(
      "SELECT * FROM project_attachment WHERE project_id = ?",
      [id]
    );

    // 审批记录
    const [approvals] = await db.query(
      `SELECT ar.*, u.real_name as approver_name
       FROM approval_record ar
       LEFT JOIN sys_user u ON ar.approver_id = u.id
       WHERE ar.project_id = ?
       ORDER BY ar.created_at`,
      [id]
    );

    success(res, {
      ...project,
      members,
      attachments,
      approvals,
    });
  } catch (err) {
    console.error("Get project detail error:", err);
    error(res, "获取项目详情失败", 500);
  }
});

// 创建项目
router.post("/create", verifyToken, checkRole("student"), async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      title,
      category,
      description,
      targetArea,
      startDate,
      endDate,
      budget,
      teacherId,
      members,
    } = req.body;
    const userId = req.user.id;

    // 处理teacherId，空字符串转为null
    const processedTeacherId = teacherId && teacherId.trim() ? teacherId : null;

    // 获取用户学院
    const [[user]] = await conn.query(
      "SELECT college_id FROM sys_user WHERE id = ?",
      [userId]
    );

    // 生成项目编号
    const projectNo = `SXS${new Date().getFullYear()}${String(Date.now()).slice(
      -6
    )}`;

    // 创建项目
    const [result] = await conn.query(
      `INSERT INTO project (project_no, title, category, description, target_area, start_date, end_date, budget, leader_id, teacher_id, college_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [
        projectNo,
        title,
        category,
        description,
        targetArea,
        startDate,
        endDate,
        budget,
        userId,
        processedTeacherId,
        user.college_id,
      ]
    );

    const projectId = result.insertId;

    // 添加负责人为成员
    await conn.query(
      `INSERT INTO project_member (project_id, user_id, role) VALUES (?, ?, 'leader')`,
      [projectId, userId]
    );

    // 添加其他成员
    if (members && members.length > 0) {
      for (const member of members) {
        await conn.query(
          `INSERT INTO project_member (project_id, user_id, role, responsibility) VALUES (?, ?, 'member', ?)`,
          [projectId, member.userId, member.responsibility]
        );
      }
    }

    await conn.commit();
    success(res, { id: projectId, projectNo }, "创建成功");
  } catch (err) {
    await conn.rollback();
    console.error("Create project error:", err);
    error(res, "创建项目失败", 500);
  } finally {
    conn.release();
  }
});

// 更新项目
router.put("/update/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      description,
      targetArea,
      startDate,
      endDate,
      budget,
      teacherId,
    } = req.body;

    // 处理teacherId，空字符串转为null
    const processedTeacherId = teacherId && teacherId.trim() ? teacherId : null;

    // 检查权限
    const [[project]] = await db.query("SELECT * FROM project WHERE id = ?", [
      id,
    ]);
    if (!project) {
      return error(res, "项目不存在");
    }
    if (project.leader_id !== req.user.id && req.user.role !== "school_admin") {
      return error(res, "无权限修改");
    }
    if (!["draft", "rejected"].includes(project.status)) {
      return error(res, "当前状态不允许修改");
    }

    await db.query(
      `UPDATE project SET title = ?, category = ?, description = ?, target_area = ?, 
       start_date = ?, end_date = ?, budget = ?, teacher_id = ?
       WHERE id = ?`,
      [
        title,
        category,
        description,
        targetArea,
        startDate,
        endDate,
        budget,
        processedTeacherId,
        id,
      ]
    );

    success(res, null, "更新成功");
  } catch (err) {
    console.error("Update project error:", err);
    error(res, "更新项目失败", 500);
  }
});

// 提交审批
router.post("/submit/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [[project]] = await db.query("SELECT * FROM project WHERE id = ?", [
      id,
    ]);
    if (!project) {
      return error(res, "项目不存在");
    }
    if (project.leader_id !== req.user.id) {
      return error(res, "无权限操作");
    }
    if (!["draft", "rejected"].includes(project.status)) {
      return error(res, "当前状态不允许提交");
    }

    await db.query("UPDATE project SET status = ? WHERE id = ?", [
      "pending",
      id,
    ]);
    success(res, null, "提交成功");
  } catch (err) {
    console.error("Submit project error:", err);
    error(res, "提交失败", 500);
  }
});

// 删除项目
router.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [[project]] = await db.query("SELECT * FROM project WHERE id = ?", [
      id,
    ]);
    if (!project) {
      return error(res, "项目不存在");
    }
    if (project.leader_id !== req.user.id && req.user.role !== "school_admin") {
      return error(res, "无权限删除");
    }
    if (project.status !== "draft") {
      return error(res, "只能删除草稿状态的项目");
    }

    await db.query("DELETE FROM project WHERE id = ?", [id]);
    await db.query("DELETE FROM project_member WHERE project_id = ?", [id]);
    await db.query("DELETE FROM project_attachment WHERE project_id = ?", [id]);

    success(res, null, "删除成功");
  } catch (err) {
    console.error("Delete project error:", err);
    error(res, "删除失败", 500);
  }
});

module.exports = router;
