#!/usr/bin/env node

/**
 * 完整演示数据一键初始化脚本
 * 包含基础数据和学生专项数据
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

    // 直接执行整个SQL文件
    await connection.query(sqlContent);

    log(`SQL脚本执行完成: ${sqlFile}`);
  } catch (error) {
    handleError(error, `执行SQL脚本失败: ${sqlFile}`);
  }
}

// 验证数据
async function validateData(connection) {
  try {
    log("开始验证演示数据...");

    const [stats] = await connection.execute(`
      SELECT 
        (SELECT COUNT(*) FROM project) as total_projects,
        (SELECT COUNT(*) FROM progress) as progress_count,
        (SELECT COUNT(*) FROM result) as result_count,
        (SELECT COUNT(*) FROM evaluation) as evaluation_count,
        (SELECT COUNT(*) FROM notice) as notice_count,
        (SELECT COUNT(*) FROM sys_message) as message_count,
        (SELECT COUNT(*) FROM project WHERE leader_id = 1 OR EXISTS (SELECT 1 FROM project_member pm WHERE pm.project_id = project.id AND pm.user_id = 1)) as student_project_count
    `);

    const [studentStats] = await connection.execute(`
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

    const data = stats[0];
    const student = studentStats[0];

    log("=== 完整演示数据验证结果 ===");
    log(`项目总数: ${data.total_projects}`);
    log(`进度记录数: ${data.progress_count}`);
    log(`成果材料数: ${data.result_count}`);
    log(`评优活动数: ${data.evaluation_count}`);
    log(`通知公告数: ${data.notice_count}`);
    log(`系统消息数: ${data.message_count}`);
    log("");
    log("=== 学生项目数据验证结果 ===");
    log(`学生项目总数: ${student.total}`);
    log(`  - 待审核: ${student.pending}`);
    log(`  - 学院已审: ${student.college_approved}`);
    log(`  - 已立项: ${student.approved}`);
    log(`  - 已驳回: ${student.rejected}`);
    log(`  - 已撤回: ${student.withdrawn}`);
    log(`  - 已结项: ${student.closed}`);

    // 验证关键数据
    const requiredStates = {
      pending: student.pending >= 1,
      college_approved: student.college_approved >= 1,
      approved: student.approved >= 1,
      rejected: student.rejected >= 1,
      withdrawn: student.withdrawn >= 1,
      closed: student.closed >= 1,
    };

    const allStatesPresent = Object.values(requiredStates).every(Boolean);
    const hasData = data.total_projects > 0;

    if (hasData && allStatesPresent) {
      log("✅ 所有演示数据初始化完成！");
      return true;
    } else {
      log("⚠️  数据验证发现问题：");
      if (!hasData) log("   - 缺少项目数据");
      Object.entries(requiredStates).forEach(([state, present]) => {
        if (!present) {
          log(`   - 缺少学生项目状态: ${state}`);
        }
      });
      return false;
    }
  } catch (error) {
    handleError(error, "验证数据失败");
  }
}

// 主函数
async function main() {
  let connection = null;

  try {
    log("🚀 开始初始化完整演示数据...");

    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    log("数据库连接成功");

    // 执行完整数据脚本
    const sqlFile = path.join(__dirname, "../database/complete_demo_data.sql");

    if (!fs.existsSync(sqlFile)) {
      throw new Error(`SQL文件不存在: ${sqlFile}`);
    }

    await executeSqlScript(connection, sqlFile);

    // 验证数据
    const isValid = await validateData(connection);

    if (isValid) {
      log("🎉 完整演示数据初始化成功！");
      log("");
      log("📱 现在可以使用以下账号登录系统：");
      log("");
      log("👨‍🎓 学生账号: 2021001 / 123456");
      log("   - 6个不同状态的项目（无草稿状态）");
      log("   - 完整的进度记录和成果材料");
      log("   - 丰富的系统消息");
      log("");
      log("👨‍🏫 教师账号: t_wang / 123456");
      log("🏢 学院管理员: ca_jg / 123456");
      log("🎓 校级管理员: admin / 123456");
      log("👨‍⚖️ 评审专家: e_chen / 123456");
      log("");
      log("🚀 启动后端服务: npm start");
      log("📱 启动小程序: 使用微信开发者工具打开 sxs-miniapp 目录");
    } else {
      log("⚠️  数据初始化完成，但验证发现问题，请检查数据完整性");
    }
  } catch (error) {
    handleError(error, "完整演示数据初始化失败");
  } finally {
    if (connection) {
      await connection.end();
      log("数据库连接已关闭");
    }
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { main, validateData };
