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
        const [[user]] = await db.query(
          "SELECT college_id FROM sys_user WHERE id = ?",
          [userId]
        );
        whereClauses.push("p.college_id = ?");
        params.push(user.college_id);

        if (status === "pending") {
          whereClauses.push("p.status = 'pending'");
        } else if (status === "approved") {
          whereClauses.push("p.status = 'college_approved'");
        } else if (status === "rejected") {
          whereClauses.push("p.status = 'rejected'");
        }
      } else if (role === "school_admin") {
        // 校级管理员：只能审批待校级审核的项目
        if (status === "pending") {
          whereClauses.push("p.status = 'college_approved'");
        } else if (status === "approved") {
          whereClauses.push("p.status = 'school_approved'");
        } else if (status === "rejected") {
          whereClauses.push("p.status = 'rejected'");
        }
      }

      const whereSQL =
        whereClauses.length > 0 ? whereClauses.join(" AND ") : "1=1";

      // 查询总数
      const [[{ total }]] = await db.query(
        `SELECT COUNT(*) as total FROM project p WHERE ${whereSQL}`,
        params
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
        [...params, parseInt(pageSize), offset]
      );

      paginate(res, rows, total, page, pageSize);
    } catch (err) {
      console.error("Get approval list error:", err);
      error(res, "获取审批列表失败", 500);
    }
  }
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
        [id]
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
        newStatus = "school_approved";
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
        [id, userId, approvalLevel, opinion]
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
        ]
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
  }
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
        [id]
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
        ["rejected", opinion, id]
      );

      // 记录审批
      await conn.query(
        `INSERT INTO approval_record (project_id, approver_id, approval_level, action, opinion)
       VALUES (?, ?, ?, 'reject', ?)`,
        [id, userId, approvalLevel, opinion]
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
        ]
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
  }
);

module.exports = router;
