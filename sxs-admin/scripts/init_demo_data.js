#!/usr/bin/env node

/**
 * 三下乡活动管理系统演示数据初始化脚本
 * 用于确保前端每个页面每种状态都有完整数据
 */

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "123456", // 设置默认密码
  database: process.env.DB_NAME || "sxs_db",
  multipleStatements: true,
};

// 日志函数
function log(message, type = "INFO") {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type}] ${message}`);
}

// 错误处理
function handleError(error, message) {
  log(`${message}: ${error.message}`, "ERROR");
  process.exit(1);
}

// 执行SQL脚本
async function executeSqlScript(connection, sqlFile) {
  try {
    const sqlContent = fs.readFileSync(sqlFile, "utf8");
    log(`开始执行SQL脚本: ${sqlFile}`);

    // 分割SQL语句（简单分割，假设语句以分号结尾）
    const statements = sqlContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt && !stmt.startsWith("--"));

    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }

    log(`SQL脚本执行完成: ${sqlFile}`);
  } catch (error) {
    handleError(error, `执行SQL脚本失败: ${sqlFile}`);
  }
}

// 验证数据初始化结果
async function validateData(connection) {
  try {
    log("开始验证数据初始化结果...");

    const [projectStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'college_approved' THEN 1 ELSE 0 END) as college_approved,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'withdrawn' THEN 1 ELSE 0 END) as withdrawn,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed
      FROM project
    `);

    const [progressCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM progress",
    );
    const [resultCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM result",
    );
    const [evaluationCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM evaluation",
    );
    const [noticeCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM notice",
    );
    const [messageCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM sys_message",
    );

    const stats = projectStats[0];

    log("=== 数据初始化验证结果 ===");
    log(`项目总数: ${stats.total}`);
    log(`  - 草稿状态: ${stats.draft}`);
    log(`  - 待审核: ${stats.pending}`);
    log(`  - 学院已审: ${stats.college_approved}`);
    log(`  - 已立项: ${stats.approved}`);
    log(`  - 已驳回: ${stats.rejected}`);
    log(`  - 已撤回: ${stats.withdrawn}`);
    log(`  - 已结项: ${stats.closed}`);
    log(`进度记录数: ${progressCount[0].count}`);
    log(`成果材料数: ${resultCount[0].count}`);
    log(`评优活动数: ${evaluationCount[0].count}`);
    log(`通知公告数: ${noticeCount[0].count}`);
    log(`系统消息数: ${messageCount[0].count}`);

    // 验证关键数据是否存在
    const requiredStates = {
      draft: stats.draft >= 1,
      pending: stats.pending >= 2,
      college_approved: stats.college_approved >= 1,
      approved: stats.approved >= 2,
      rejected: stats.rejected >= 2,
      withdrawn: stats.withdrawn >= 1,
      closed: stats.closed >= 1,
    };

    const allStatesPresent = Object.values(requiredStates).every(Boolean);

    if (allStatesPresent) {
      log("✅ 所有项目状态数据初始化完成！");
    } else {
      log("⚠️  部分项目状态数据缺失：");
      Object.entries(requiredStates).forEach(([state, present]) => {
        if (!present) {
          log(`   - 缺少状态: ${state}`);
        }
      });
    }

    return allStatesPresent;
  } catch (error) {
    handleError(error, "验证数据失败");
  }
}

// 主函数
async function main() {
  let connection = null;

  try {
    log("开始初始化三下乡管理系统演示数据...");

    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    log("数据库连接成功");

    // 执行数据初始化脚本
    const sqlFile = path.join(__dirname, "../database/demo_data_correct.sql");

    if (!fs.existsSync(sqlFile)) {
      throw new Error(`SQL文件不存在: ${sqlFile}`);
    }

    await executeSqlScript(connection, sqlFile);

    // 验证数据
    const isValid = await validateData(connection);

    if (isValid) {
      log("🎉 演示数据初始化完成！");
      log("");
      log("现在可以使用以下账号登录系统进行演示：");
      log("");
      log("学生账号: 2021001 / 123456");
      log("教师账号: t_wang / 123456");
      log("学院管理员: ca_jg / 123456");
      log("校级管理员: admin / 123456");
      log("评审专家: e_chen / 123456");
      log("");
      log("各页面数据覆盖情况：");
      log("- 项目申报页面: 草稿、待审核、已立项、已驳回、已撤回、已结项");
      log("- 审批管理页面: 待审核、学院已审、校级已审、已驳回");
      log("- 项目工作台: 进度记录、成果材料、评优情况");
      log("- 评优管理页面: 进行中、已完成的评优活动");
      log("- 通知公告页面: 活动通知、指南、表彰、提醒");
      log("- 消息中心: 审批通知、进度更新、成果发布");
    } else {
      log("⚠️  数据初始化完成，但验证发现问题，请检查数据完整性");
    }
  } catch (error) {
    handleError(error, "数据初始化失败");
  } finally {
    if (connection) {
      await connection.end();
      log("数据库连接已关闭");
    }
  }
}

// 处理未捕获的异常
process.on("unhandledRejection", (reason, promise) => {
  log(`未处理的Promise拒绝: ${reason}`, "ERROR");
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  handleError(error, "未捕获的异常");
});

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { main, validateData, executeSqlScript };
