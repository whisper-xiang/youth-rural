#!/usr/bin/env node

/**
 * 学生用户演示数据一键初始化脚本
 * 为学生用户(2021001)创建丰富的项目数据
 * 移除草稿状态，增加更多状态的项目
 */

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "123456",
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

    // 分割SQL语句
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

// 验证学生数据
async function validateStudentData(connection) {
  try {
    log("开始验证学生演示数据...");

    const [projectStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'college_approved' THEN 1 ELSE 0 END) as college_approved,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'withdrawn' THEN 1 ELSE 0 END) as withdrawn,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed
      FROM project 
      WHERE leader_id = 1 OR EXISTS (SELECT 1 FROM project_member pm WHERE pm.project_id = project.id AND pm.user_id = 1)
    `);

    const [progressCount] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM progress pg 
      WHERE pg.project_id IN (
        SELECT id FROM project 
        WHERE leader_id = 1 OR EXISTS (SELECT 1 FROM project_member pm WHERE pm.project_id = project.id AND pm.user_id = 1)
      )
    `);

    const [resultCount] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM result r 
      WHERE r.project_id IN (
        SELECT id FROM project 
        WHERE leader_id = 1 OR EXISTS (SELECT 1 FROM project_member pm WHERE pm.project_id = project.id AND pm.user_id = 1)
      )
    `);

    const [messageCount] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM sys_message 
      WHERE user_id = 1
    `);

    const stats = projectStats[0];

    log("=== 学生演示数据验证结果 ===");
    log(`学生项目总数: ${stats.total}`);
    log(`  - 待审核: ${stats.pending}`);
    log(`  - 学院已审: ${stats.college_approved}`);
    log(`  - 已立项: ${stats.approved}`);
    log(`  - 已驳回: ${stats.rejected}`);
    log(`  - 已撤回: ${stats.withdrawn}`);
    log(`  - 已结项: ${stats.closed}`);
    log(`进度记录数: ${progressCount[0].count}`);
    log(`成果材料数: ${resultCount[0].count}`);
    log(`系统消息数: ${messageCount[0].count}`);

    // 验证关键数据是否存在
    const requiredStates = {
      pending: stats.pending >= 1,
      college_approved: stats.college_approved >= 1,
      approved: stats.approved >= 1,
      rejected: stats.rejected >= 1,
      withdrawn: stats.withdrawn >= 1,
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
    handleError(error, "验证学生数据失败");
  }
}

// 主函数
async function main() {
  let connection = null;

  try {
    log("开始初始化学生演示数据...");

    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    log("数据库连接成功");

    // 执行学生数据初始化脚本
    const sqlFile = path.join(__dirname, "../database/student_demo_data.sql");

    if (!fs.existsSync(sqlFile)) {
      throw new Error(`SQL文件不存在: ${sqlFile}`);
    }

    await executeSqlScript(connection, sqlFile);

    // 验证数据
    const isValid = await validateStudentData(connection);

    if (isValid) {
      log("🎉 学生演示数据初始化完成！");
      log("");
      log("现在可以使用学生账号登录查看丰富的项目数据：");
      log("");
      log("学生账号: 2021001 / 123456");
      log("");
      log("项目数据覆盖情况：");
      log("- 待审核项目: 1个（社区志愿服务活动）");
      log("- 学院已审项目: 1个（传统文化进校园）");
      log("- 已立项项目: 1个（环保意识调研，含进度和成果）");
      log("- 已驳回项目: 1个（科技创新实践，含驳回原因）");
      log("- 已撤回项目: 1个（健康生活推广）");
      log("- 已结项项目: 1个（乡村振兴调研实践）");
      log("");
      log("每个项目都有：");
      log("- 完整的项目信息");
      log("- 3名项目成员");
      log("- 相应的审批记录");
      log("- 已立项项目还有进度记录和成果材料");
      log("- 相关的系统消息通知");
    } else {
      log("⚠️  学生数据初始化完成，但验证发现问题，请检查数据完整性");
    }
  } catch (error) {
    handleError(error, "学生数据初始化失败");
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

module.exports = { main, validateStudentData, executeSqlScript };
