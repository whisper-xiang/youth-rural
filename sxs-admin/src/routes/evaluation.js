/**
 * 评优管理路由
 */
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, checkRole } = require("../middleware/auth");
const { success, paginate, error } = require("../utils/response");
const { safeCreateNotice } = require("../utils/noticeHelper");

// 获取评优项目列表（专家视角）
router.get(
  "/list",
  verifyToken,
  checkRole("expert", "school_admin"),
  async (req, res) => {
    try {
      const { page = 1, pageSize = 10, status } = req.query;
      const userId = req.user.id;
      const role = req.user.role;
      const offset = (page - 1) * pageSize;

      let sql = `
      SELECT ep.*, p.title, p.category, p.description,
             u.real_name as leader_name,
             c.name as college_name,
             es.total_score as my_score,
             CASE WHEN es.id IS NOT NULL THEN 1 ELSE 0 END as is_evaluated
      FROM evaluation_project ep
      LEFT JOIN project p ON ep.project_id = p.id
      LEFT JOIN sys_user u ON p.leader_id = u.id
      LEFT JOIN sys_college c ON p.college_id = c.id
      LEFT JOIN evaluation_score es ON ep.project_id = es.project_id AND es.expert_id = ?
      WHERE 1=1
    `;
      let params = [userId];

      if (status === "pending") {
        sql += " AND es.id IS NULL";
      } else if (status === "evaluated") {
        sql += " AND es.id IS NOT NULL";
      }

      sql += " ORDER BY ep.is_top DESC, ep.created_at DESC LIMIT ? OFFSET ?";
      params.push(parseInt(pageSize), offset);

      const [rows] = await db.query(sql, params);

      // 总数
      let countSql = `
      SELECT COUNT(*) as total
      FROM evaluation_project ep
      LEFT JOIN evaluation_score es ON ep.project_id = es.project_id AND es.expert_id = ?
      WHERE 1=1
    `;
      let countParams = [userId];
      if (status === "pending") {
        countSql += " AND es.id IS NULL";
      } else if (status === "evaluated") {
        countSql += " AND es.id IS NOT NULL";
      }
      const [[{ total }]] = await db.query(countSql, countParams);

      paginate(res, rows, total, page, pageSize);
    } catch (err) {
      console.error("Get evaluation list error:", err);
      error(res, "获取评优列表失败", 500);
    }
  },
);

// 获取评优项目详情
router.get("/detail/:projectId", verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // 项目信息
    const [[project]] = await db.query(
      `SELECT p.*, 
              u.real_name as leader_name,
              c.name as college_name
       FROM project p
       LEFT JOIN sys_user u ON p.leader_id = u.id
       LEFT JOIN sys_college c ON p.college_id = c.id
       WHERE p.id = ?`,
      [projectId],
    );

    if (!project) {
      return error(res, "项目不存在");
    }

    // 成果材料
    const [results] = await db.query(
      `SELECT id, title, category, cover_url, created_at
       FROM result WHERE project_id = ? AND status = 'published'`,
      [projectId],
    );

    // 我的评分
    const [[myScore]] = await db.query(
      "SELECT * FROM evaluation_score WHERE project_id = ? AND expert_id = ?",
      [projectId, userId],
    );

    success(res, {
      ...project,
      results,
      myScore: myScore || null,
      isEvaluated: !!myScore,
    });
  } catch (err) {
    console.error("Get evaluation detail error:", err);
    error(res, "获取详情失败", 500);
  }
});

// 提交评分
router.post(
  "/score/:projectId",
  verifyToken,
  checkRole("expert"),
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const {
        scoreInnovation,
        scorePractice,
        scoreEffect,
        scoreReport,
        comment,
      } = req.body;
      const userId = req.user.id;

      // 检查是否已评分
      const [[existing]] = await db.query(
        "SELECT id FROM evaluation_score WHERE project_id = ? AND expert_id = ?",
        [projectId, userId],
      );

      // 计算总分 (权重: 创新30%, 实践30%, 成效25%, 报告15%)
      const totalScore = (
        scoreInnovation * 0.3 +
        scorePractice * 0.3 +
        scoreEffect * 0.25 +
        scoreReport * 0.15
      ).toFixed(2);

      // 获取当前评优活动ID
      const [[ep]] = await db.query(
        "SELECT evaluation_id FROM evaluation_project WHERE project_id = ?",
        [projectId],
      );

      if (existing) {
        // 更新评分
        await db.query(
          `UPDATE evaluation_score SET 
         score_innovation = ?, score_practice = ?, score_effect = ?, score_report = ?,
         total_score = ?, comment = ?
         WHERE project_id = ? AND expert_id = ?`,
          [
            scoreInnovation,
            scorePractice,
            scoreEffect,
            scoreReport,
            totalScore,
            comment,
            projectId,
            userId,
          ],
        );
      } else {
        // 新增评分
        await db.query(
          `INSERT INTO evaluation_score 
         (evaluation_id, project_id, expert_id, score_innovation, score_practice, score_effect, score_report, total_score, comment)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            ep.evaluation_id,
            projectId,
            userId,
            scoreInnovation,
            scorePractice,
            scoreEffect,
            scoreReport,
            totalScore,
            comment,
          ],
        );
      }

      // 更新项目平均分
      const [[avgScore]] = await db.query(
        "SELECT AVG(total_score) as avg_score FROM evaluation_score WHERE project_id = ?",
        [projectId],
      );
      await db.query(
        "UPDATE evaluation_project SET final_score = ? WHERE project_id = ?",
        [avgScore.avg_score, projectId],
      );

      const [[projectInfo]] = await db.query(
        "SELECT id, title FROM project WHERE id = ?",
        [projectId],
      );
      await safeCreateNotice({
        publisherId: userId,
        type: "activity",
        title: `专家评分：${projectInfo ? projectInfo.title : projectId}`,
        summary: "评优项目已提交专家评分",
        content: `评优项目「${
          projectInfo ? projectInfo.title : projectId
        }」已提交专家评分，当前评分：${totalScore}。`,
        source: "评优管理",
      });

      success(res, { totalScore }, "评分成功");
    } catch (err) {
      console.error("Submit score error:", err);
      error(res, "评分失败", 500);
    }
  },
);

// 获取评优结果排名（所有角色可见）
router.get("/ranking", verifyToken, async (req, res) => {
  try {
    let { evaluationId } = req.query;

    // 如果未提供 evaluationId，则获取最近一次评优活动的 ID
    if (!evaluationId) {
      const [[latest]] = await db.query(
        "SELECT id FROM evaluation ORDER BY created_at DESC LIMIT 1",
      );
      if (latest) {
        evaluationId = latest.id;
      } else {
        return success(res, []); // 没有评优活动
      }
    }

    const [rows] = await db.query(
      `SELECT ep.*, p.title, p.category,
              u.real_name as leader_name,
              c.name as college_name,
              (SELECT COUNT(*) FROM evaluation_score WHERE project_id = ep.project_id) as score_count
       FROM evaluation_project ep
       LEFT JOIN project p ON ep.project_id = p.id
       LEFT JOIN sys_user u ON p.leader_id = u.id
       LEFT JOIN sys_college c ON p.college_id = c.id
       WHERE ep.evaluation_id = ?
       ORDER BY ep.final_score DESC`,
      [evaluationId],
    );

    success(res, rows);
  } catch (err) {
    console.error("Get ranking error:", err);
    error(res, "获取排名失败", 500);
  }
});

// 设置获奖等级
router.post(
  "/award/:projectId",
  verifyToken,
  checkRole("school_admin"),
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const { awardLevel } = req.body;

      await db.query(
        "UPDATE evaluation_project SET award_level = ? WHERE project_id = ?",
        [awardLevel, projectId],
      );

      // 更新项目为优秀项目
      if (awardLevel) {
        await db.query("UPDATE project SET is_excellent = 1 WHERE id = ?", [
          projectId,
        ]);
      }

      const [[projectInfo]] = await db.query(
        "SELECT id, title FROM project WHERE id = ?",
        [projectId],
      );
      await safeCreateNotice({
        publisherId: req.user.id,
        type: "activity",
        title: `设置获奖：${projectInfo ? projectInfo.title : projectId}`,
        summary: awardLevel
          ? `项目获奖等级：${awardLevel}`
          : "项目获奖等级已清空",
        content: awardLevel
          ? `项目「${
              projectInfo ? projectInfo.title : projectId
            }」已设置获奖等级：${awardLevel}`
          : `项目「${
              projectInfo ? projectInfo.title : projectId
            }」已取消获奖等级设置`,
        source: "评优管理",
      });

      success(res, null, "设置成功");
    } catch (err) {
      console.error("Set award error:", err);
      error(res, "设置失败", 500);
    }
  },
);

module.exports = router;
