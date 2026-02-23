/**
 * 审批管理路由
 */
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, checkRole } = require("../middleware/auth");
const { success, paginate, error } = require("../utils/response");
const { safeCreateNotice } = require("../utils/noticeHelper");

// 获取待审批列表
router.get(
  "/list",
  verifyToken,
  checkRole("college_admin", "school_admin"),
  async (req, res) => {
    try {
      const { page = 1, pageSize = 10, status } = req.query;
      const userId = req.user.id;
      const role = req.user.role;
      const offset = (page - 1) * pageSize;

      let whereClauses = [];
      let params = [];

      // 根据角色确定审批范围
      if (role === "college_admin") {
        // 学院管理员：只能审批本学院待学院审核的项目
        const [users] = await db.query(
          "SELECT college_id FROM sys_user WHERE id = ?",
          [userId],
        );
        if (users.length === 0) {
          return error(res, "用户不存在", 404);
        }
        const user = users[0];
        whereClauses.push("p.college_id = ?");
        params.push(user.college_id);

        if (status === "pending") {
          whereClauses.push("p.status = 'pending'");
        } else if (status === "college_approved" || status === "approved") {
          whereClauses.push(
            "p.status IN ('college_approved', 'school_approved', 'approved', 'closed')",
          );
        } else if (status === "rejected") {
          whereClauses.push("p.status = 'rejected'");
        }
      } else if (role === "school_admin") {
        // 校级管理员：只能审批待校级审核的项目
        if (status === "pending" || status === "college_approved") {
          whereClauses.push("p.status = 'college_approved'");
        } else if (status === "school_approved" || status === "approved") {
          whereClauses.push(
            "p.status IN ('school_approved', 'approved', 'closed')",
          );
        } else if (status === "rejected") {
          whereClauses.push("p.status = 'rejected'");
        }
      }

      const whereSQL =
        whereClauses.length > 0 ? whereClauses.join(" AND ") : "1=1";

      // 查询总数
      const [[{ total }]] = await db.query(
        `SELECT COUNT(*) as total FROM project p WHERE ${whereSQL}`,
        params,
      );

      // 查询列表
      const [rows] = await db.query(
        `SELECT p.*, 
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
        [...params, parseInt(pageSize), offset],
      );

      paginate(res, rows, total, page, pageSize);
    } catch (err) {
      console.error("Get approval list error:", err);
      error(res, "获取审批列表失败", 500);
    }
  },
);

// 获取审批详情
router.get(
  "/detail/:id",
  verifyToken,
  checkRole("college_admin", "school_admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const role = req.user.role;

      // 查询项目基本信息
      const [[project]] = await db.query(
        `SELECT p.*, 
                u.real_name as leader_name,
                u.phone as leader_phone,
                t.real_name as teacher_name,
                c.name as college_name
         FROM project p
         LEFT JOIN sys_user u ON p.leader_id = u.id
         LEFT JOIN sys_user t ON p.teacher_id = t.id
         LEFT JOIN sys_college c ON p.college_id = c.id
         WHERE p.id = ?`,
        [id],
      );

      if (!project) {
        return error(res, "项目不存在", 404);
      }

      // 权限检查：学院管理员只能查看本学院项目
      if (role === "college_admin") {
        const [users] = await db.query(
          "SELECT college_id FROM sys_user WHERE id = ?",
          [userId],
        );
        if (users.length === 0 || users[0].college_id !== project.college_id) {
          return error(res, "无权限查看该项目", 403);
        }
      }

      // 查询项目成员
      const [members] = await db.query(
        `SELECT m.*, u.real_name, u.phone
         FROM project_member m
         LEFT JOIN sys_user u ON m.user_id = u.id
         WHERE m.project_id = ?
         ORDER BY m.role DESC`,
        [id],
      );

      // 查询审批记录
      const [approvalRecords] = await db.query(
        `SELECT ar.*, u.real_name as approver_name
         FROM approval_record ar
         LEFT JOIN sys_user u ON ar.approver_id = u.id
         WHERE ar.project_id = ?
         ORDER BY ar.created_at ASC`,
        [id],
      );

      // 格式化成员信息
      const memberNames = members
        .map((m) => m.real_name)
        .filter((name) => name)
        .join("、");

      // 格式化审批记录
      const formattedRecords = approvalRecords.map((record) => ({
        approver: record.approver_name || "未知",
        action: record.action,
        actionText: record.action === "approve" ? "通过" : "驳回",
        time: record.created_at,
        remark: record.opinion,
      }));

      // 构造返回数据
      const detail = {
        id: project.id,
        title: project.title,
        theme: project.category, // 使用category作为主题
        location: project.target_area,
        startDate: project.start_date,
        endDate: project.end_date,
        teamName: project.team_name || `${project.leader_name}团队`,
        college: project.college_name,
        leader: project.leader_name,
        phone: project.leader_phone,
        teacher: project.teacher_name,
        members: memberNames,
        description: project.description,
        plan: project.plan || "",
        expectedResult: project.expected_result || "",
        status: project.status,
        submit_time: project.created_at,
        approve_time: project.approved_at,
        reject_reason: project.reject_reason,
        approval_records: formattedRecords,
      };

      success(res, detail);
    } catch (err) {
      console.error("Get approval detail error:", err);
      error(res, "获取审批详情失败", 500);
    }
  },
);

// 审批通过
router.post(
  "/approve/:id",
  verifyToken,
  checkRole("college_admin", "school_admin"),
  async (req, res) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const { id } = req.params;
      const { opinion } = req.body;
      const userId = req.user.id;
      const role = req.user.role;

      // 检查项目状态
      const [[project]] = await conn.query(
        "SELECT * FROM project WHERE id = ?",
        [id],
      );
      if (!project) {
        return error(res, "项目不存在");
      }

      let newStatus;
      let approvalLevel;

      if (role === "college_admin") {
        if (project.status !== "pending") {
          return error(res, "项目状态不正确");
        }
        newStatus = "college_approved";
        approvalLevel = "college";
      } else if (role === "school_admin") {
        if (project.status !== "college_approved") {
          return error(res, "项目状态不正确");
        }
        newStatus = "approved";
        approvalLevel = "school";
      }

      // 更新项目状态
      await conn.query("UPDATE project SET status = ? WHERE id = ?", [
        newStatus,
        id,
      ]);

      // 记录审批
      await conn.query(
        `INSERT INTO approval_record (project_id, approver_id, approval_level, action, opinion)
       VALUES (?, ?, ?, 'approve', ?)`,
        [id, userId, approvalLevel, opinion],
      );

      // 发送消息通知
      await conn.query(
        `INSERT INTO sys_message (user_id, title, content, type, related_type, related_id)
       VALUES (?, ?, ?, 'approval', 'project', ?)`,
        [
          project.leader_id,
          "项目审批通过",
          `您的项目「${project.title}」已通过${
            role === "college_admin" ? "学院" : "学校"
          }审批`,
          id,
        ],
      );

      await safeCreateNotice({
        conn,
        publisherId: userId,
        type: "activity",
        title: `项目审批通过：${project.title}`,
        summary: `项目已通过${role === "college_admin" ? "学院" : "学校"}审批`,
        content: `项目「${project.title}」已通过${
          role === "college_admin" ? "学院" : "学校"
        }审批，状态已更新。`,
        source: "审批管理",
      });

      await conn.commit();
      success(res, null, "审批通过");
    } catch (err) {
      await conn.rollback();
      console.error("Approve error:", err);
      error(res, "审批失败", 500);
    } finally {
      conn.release();
    }
  },
);

// 审批驳回
router.post(
  "/reject/:id",
  verifyToken,
  checkRole("college_admin", "school_admin"),
  async (req, res) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const { id } = req.params;
      const { opinion } = req.body;
      const userId = req.user.id;
      const role = req.user.role;

      if (!opinion) {
        return error(res, "请填写驳回原因");
      }

      const [[project]] = await conn.query(
        "SELECT * FROM project WHERE id = ?",
        [id],
      );
      if (!project) {
        return error(res, "项目不存在");
      }

      // 检查项目状态和权限
      if (role === "college_admin") {
        if (project.status !== "pending") {
          return error(res, "只能驳回待学院审核的项目");
        }
      } else if (role === "school_admin") {
        if (project.status !== "college_approved") {
          return error(res, "只能驳回待校级审核的项目");
        }
      }

      const approvalLevel = role === "college_admin" ? "college" : "school";

      // 更新项目状态
      await conn.query(
        "UPDATE project SET status = ?, reject_reason = ? WHERE id = ?",
        ["rejected", opinion, id],
      );

      // 记录审批
      await conn.query(
        `INSERT INTO approval_record (project_id, approver_id, approval_level, action, opinion)
       VALUES (?, ?, ?, 'reject', ?)`,
        [id, userId, approvalLevel, opinion],
      );

      // 发送消息通知
      await conn.query(
        `INSERT INTO sys_message (user_id, title, content, type, related_type, related_id)
       VALUES (?, ?, ?, 'approval', 'project', ?)`,
        [
          project.leader_id,
          "项目审批被驳回",
          `您的项目「${project.title}」审批未通过，原因：${opinion}`,
          id,
        ],
      );

      await safeCreateNotice({
        conn,
        publisherId: userId,
        type: "activity",
        title: `项目审批驳回：${project.title}`,
        summary: `项目被${role === "college_admin" ? "学院" : "学校"}驳回`,
        content: `项目「${project.title}」被${
          role === "college_admin" ? "学院" : "学校"
        }驳回，原因：${opinion}`,
        source: "审批管理",
      });

      await conn.commit();
      success(res, null, "已驳回");
    } catch (err) {
      await conn.rollback();
      console.error("Reject error:", err);
      error(res, "操作失败", 500);
    } finally {
      conn.release();
    }
  },
);

module.exports = router;
