/**
 * 项目申报路由
 */
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, checkRole } = require("../middleware/auth");
const { success, paginate, error } = require("../utils/response");
const { safeCreateNotice } = require("../utils/noticeHelper");

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
      whereClauses.push(
        "(p.leader_id = ? OR EXISTS (SELECT 1 FROM project_member pm WHERE pm.project_id = p.id AND pm.user_id = ?))",
      );
      params.push(userId, userId);
    } else if (role === "teacher") {
      whereClauses.push("p.teacher_id = ?");
      params.push(userId);
    } else if (role === "college_admin") {
      const [[user]] = await db.query(
        "SELECT college_id FROM sys_user WHERE id = ?",
        [userId],
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
      params,
    );

    // 查询列表
    const [rows] = await db.query(
      `SELECT p.*, 
              p.target_area as location,
              (SELECT COUNT(*) FROM project_member pm WHERE pm.project_id = p.id) as memberCount,
              (SELECT COUNT(*) FROM progress pg WHERE pg.project_id = p.id) as progress_count,
              (SELECT COUNT(*) FROM result r WHERE r.project_id = p.id AND r.creator_id = ?) as my_result_count,
              u.real_name as leader,
              t.real_name as teacher_name,
              c.name as college_name
       FROM project p
       LEFT JOIN sys_user u ON p.leader_id = u.id
       LEFT JOIN sys_user t ON p.teacher_id = t.id
       LEFT JOIN sys_college c ON p.college_id = c.id
       WHERE ${whereSQL}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, ...params, parseInt(pageSize), offset],
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
              u.real_name as leader_name, IFNULL(p.leader_phone, u.phone) as leader_phone,
              IFNULL(p.teacher_name, t.real_name) as teacher_name, t.phone as teacher_phone,
              c.name as college_name
       FROM project p
       LEFT JOIN sys_user u ON p.leader_id = u.id
       LEFT JOIN sys_user t ON p.teacher_id = t.id
       LEFT JOIN sys_college c ON p.college_id = c.id
       WHERE p.id = ?`,
      [id],
    );

    if (!project) {
      return error(res, "项目不存在");
    }

    // 团队成员
    const [members] = await db.query(
      `SELECT pm.*, 
              IFNULL(u.real_name, pm.member_name) as name, 
              IFNULL(u.phone, pm.phone) as phone,
              IFNULL(u.username, pm.student_id) as student_id
       FROM project_member pm
       LEFT JOIN sys_user u ON pm.user_id = u.id
       WHERE pm.project_id = ?`,
      [id],
    );

    // 附件
    const [attachments] = await db.query(
      "SELECT * FROM project_attachment WHERE project_id = ?",
      [id],
    );

    // 评优信息
    const [[evaluation]] = await db.query(
      `SELECT ep.*, e.title as evaluation_title 
       FROM evaluation_project ep 
       LEFT JOIN evaluation e ON ep.evaluation_id = e.id
       WHERE ep.project_id = ?`,
      [id],
    );

    // 审批记录
    const [approvals] = await db.query(
      `SELECT ar.*, u.real_name as approver_name
       FROM approval_record ar
       LEFT JOIN sys_user u ON ar.approver_id = u.id
       WHERE ar.project_id = ?
       ORDER BY ar.created_at`,
      [id],
    );

    success(res, {
      ...project,
      members,
      attachments,
      evaluation: evaluation || null,
      approvals,
    });
  } catch (err) {
    console.error("Get project detail error:", err);
    error(res, "获取项目详情失败", 500);
  }
});

// 教师结项：项目状态改为 closed，并加入评优项目池
router.post(
  "/close/:id",
  verifyToken,
  checkRole("teacher"),
  async (req, res) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const { id } = req.params;
      const teacherId = req.user.id;

      const [[project]] = await conn.query(
        "SELECT id, title, status, teacher_id FROM project WHERE id = ?",
        [id],
      );
      if (!project) {
        await conn.rollback();
        return error(res, "项目不存在");
      }

      if (Number(project.teacher_id) !== Number(teacherId)) {
        await conn.rollback();
        return error(res, "无权限结项该项目");
      }

      if (project.status !== "approved") {
        await conn.rollback();
        return error(res, "仅已通过项目可结项");
      }

      // 确定当前评优活动（进行中），没有则创建本年度一条
      let evaluationId;
      const [[ongoing]] = await conn.query(
        "SELECT id FROM evaluation WHERE status = 'ongoing' ORDER BY year DESC, id DESC LIMIT 1",
      );

      if (ongoing && ongoing.id) {
        evaluationId = ongoing.id;
      } else {
        const year = new Date().getFullYear();
        const [createEvalRes] = await conn.query(
          "INSERT INTO evaluation (title, year, description, start_time, status) VALUES (?, ?, ?, NOW(), 'ongoing')",
          [`${year}年度三下乡评优`, year, "项目结项后自动进入评优"],
        );
        evaluationId = createEvalRes.insertId;
      }

      // 更新项目状态
      await conn.query("UPDATE project SET status = ? WHERE id = ?", [
        "closed",
        id,
      ]);

      // 加入评优项目池（已存在则忽略）
      await conn.query(
        "INSERT IGNORE INTO evaluation_project (evaluation_id, project_id, is_top) VALUES (?, ?, 0)",
        [evaluationId, id],
      );

      await safeCreateNotice({
        conn,
        publisherId: teacherId,
        type: "activity",
        title: `项目结项：${project.title}`,
        summary: `指导教师已结项，项目进入评优列表`,
        content: `指导教师对项目「${project.title}」执行结项操作，项目状态变更为结项并进入评优。`,
        source: "项目管理",
      });

      await conn.commit();
      success(res, { evaluationId }, "结项成功，已进入评优列表");
    } catch (err) {
      await conn.rollback();
      console.error("Close project error:", err);
      error(res, "结项失败", 500);
    } finally {
      conn.release();
    }
  },
);

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
      teacherName,
      leaderPhone,
      members,
      plan,
      expected_result,
    } = req.body;
    const userId = req.user.id;

    // 处理teacherId，空字符串转为null
    const processedTeacherId =
      teacherId && (typeof teacherId === "number" || teacherId.trim())
        ? teacherId
        : null;

    // 获取用户学院
    const [[user]] = await conn.query(
      "SELECT college_id FROM sys_user WHERE id = ?",
      [userId],
    );

    // 生成项目编号
    const projectNo = `SXS${new Date().getFullYear()}${String(Date.now()).slice(
      -6,
    )}`;

    // 创建项目
    const [result] = await conn.query(
      `INSERT INTO project (project_no, title, category, description, plan, expected_result, target_area, start_date, end_date, budget, leader_id, leader_phone, teacher_id, teacher_name, college_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        projectNo,
        title,
        category,
        description,
        plan || null,
        expected_result || null,
        targetArea,
        startDate,
        endDate,
        budget,
        userId,
        leaderPhone || null,
        processedTeacherId,
        teacherName || null,
        user.college_id,
      ],
    );

    const projectId = result.insertId;

    // 添加负责人为成员
    await conn.query(
      `INSERT INTO project_member (project_id, user_id, role) VALUES (?, ?, 'leader')`,
      [projectId, userId],
    );

    // 添加其他成员
    if (members) {
      const memberList =
        typeof members === "string"
          ? members.split(/[\n;；,，]/).filter((s) => s.trim())
          : Array.isArray(members)
            ? members
            : [];

      for (const mStr of memberList) {
        if (typeof mStr === "string") {
          const [name, studentId, phone] = mStr.split("-").map((s) => s.trim());
          if (name) {
            // 尝试查找系统内用户，若不存在则仅存基本信息
            let memberUserId = null;
            if (studentId) {
              const [[u]] = await conn.query(
                "SELECT id FROM sys_user WHERE username = ?",
                [studentId],
              );
              if (u) memberUserId = u.id;
            }

            await conn.query(
              `INSERT INTO project_member (project_id, user_id, role, member_name, student_id, phone) 
               VALUES (?, ?, 'member', ?, ?, ?)`,
              [projectId, memberUserId, name, studentId || null, phone || null],
            );
          }
        } else if (mStr.userId) {
          // 兼容旧格式
          await conn.query(
            `INSERT INTO project_member (project_id, user_id, role, responsibility) VALUES (?, ?, 'member', ?)`,
            [projectId, mStr.userId, mStr.responsibility],
          );
        }
      }
    }

    // 创建通知
    await safeCreateNotice({
      conn,
      publisherId: userId,
      type: "activity",
      title: `提交审批：${title}`,
      summary: "项目已提交，进入审核流程",
      content: `项目「${title}」已由学生提交审批，状态变更为待审核。`,
      source: "项目管理",
    });

    await conn.commit();
    success(res, { id: projectId }, "申报提交成功");
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Create project error:", err);
    error(res, "申报提交失败", 500);
  } finally {
    if (conn) conn.release();
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
      teacherName,
      leaderPhone,
      members,
      plan,
      expected_result,
    } = req.body;

    // 处理teacherId，空字符串转为null
    const processedTeacherId =
      teacherId && (typeof teacherId === "number" || teacherId.trim())
        ? teacherId
        : null;

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
    if (
      project.status !== "rejected" &&
      project.status !== "withdrawn" &&
      project.status !== "pending" &&
      req.user.role !== "school_admin"
    ) {
      return error(res, "当前状态不允许修改");
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(
        `UPDATE project SET title = ?, category = ?, description = ?, plan = ?, expected_result = ?, target_area = ?, 
         start_date = ?, end_date = ?, budget = ?, teacher_id = ?, teacher_name = ?, leader_phone = ?
         WHERE id = ?`,
        [
          title,
          category,
          description,
          plan || null,
          expected_result || null,
          targetArea,
          startDate,
          endDate,
          budget,
          processedTeacherId,
          teacherName || null,
          leaderPhone || null,
          id,
        ],
      );

      // 更新成员
      if (members) {
        // 先删除旧的普通成员（保留负责人）
        await conn.query(
          "DELETE FROM project_member WHERE project_id = ? AND role = 'member'",
          [id],
        );

        const memberList =
          typeof members === "string"
            ? members.split(/[\n;；,，]/).filter((s) => s.trim())
            : Array.isArray(members)
              ? members
              : [];

        for (const mStr of memberList) {
          if (typeof mStr === "string") {
            const [name, studentId, phone] = mStr
              .split("-")
              .map((s) => s.trim());
            if (name) {
              let memberUserId = null;
              if (studentId) {
                const [[u]] = await conn.query(
                  "SELECT id FROM sys_user WHERE username = ?",
                  [studentId],
                );
                if (u) memberUserId = u.id;
              }

              await conn.query(
                `INSERT INTO project_member (project_id, user_id, role, member_name, student_id, phone) 
                 VALUES (?, ?, 'member', ?, ?, ?)`,
                [id, memberUserId, name, studentId || null, phone || null],
              );
            }
          }
        }
      }

      await safeCreateNotice({
        conn,
        publisherId: req.user.id,
        type: "activity",
        title: `更新项目：${project.title}`,
        summary: "项目信息已更新",
        content: `用户更新了项目「${project.title}」的基本信息及成员。`,
        source: "项目管理",
      });

      await conn.commit();
      success(res, null, "更新成功");
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
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
    if (!["rejected", "withdrawn"].includes(project.status)) {
      return error(res, "当前状态不允许提交");
    }

    await db.query("UPDATE project SET status = ? WHERE id = ?", [
      "pending",
      id,
    ]);

    await safeCreateNotice({
      publisherId: req.user.id,
      type: "activity",
      title: `提交审批：${project.title}`,
      summary: "项目已提交，进入审核流程",
      content: `项目「${project.title}」已由学生提交审批，状态变更为待审核。`,
      source: "项目管理",
    });

    success(res, null, "提交成功");
  } catch (err) {
    console.error("Submit project error:", err);
    error(res, "提交失败", 500);
  }
});

// 撤销审批
router.post("/revoke/:id", verifyToken, async (req, res) => {
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
    if (project.status !== "pending") {
      return error(res, "仅待审核的项目可以撤销");
    }

    await db.query("UPDATE project SET status = ? WHERE id = ?", [
      "withdrawn",
      id,
    ]);

    await safeCreateNotice({
      publisherId: req.user.id,
      type: "activity",
      title: `撤销申请：${project.title}`,
      summary: "项目申请已撤回",
      content: `用户撤回了项目「${project.title}」的审批申请，状态变更为已撤回。`,
      source: "项目管理",
    });

    success(res, null, "撤销成功");
  } catch (err) {
    console.error("Revoke project error:", err);
    error(res, "撤销失败", 500);
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
    if (project.status !== "rejected") {
      return error(res, "只能删除已驳回的项目");
    }

    await db.query("DELETE FROM project WHERE id = ?", [id]);
    await db.query("DELETE FROM project_member WHERE project_id = ?", [id]);
    await db.query("DELETE FROM project_attachment WHERE project_id = ?", [id]);

    await safeCreateNotice({
      publisherId: req.user.id,
      type: "activity",
      title: `删除项目：${project.title}`,
      summary: "申报项目已删除",
      content: `用户删除了申报项目「${project.title}」。`,
      source: "项目管理",
    });

    success(res, null, "删除成功");
  } catch (err) {
    console.error("Delete project error:", err);
    error(res, "删除失败", 500);
  }
});

module.exports = router;
