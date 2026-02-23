#!/usr/bin/env node

/**
 * 三下乡活动管理系统快速启动脚本
 * 一键初始化所有演示数据
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// 日志函数
function log(message, type = "INFO") {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type}] ${message}`);
}

// 执行命令
function runCommand(command, description) {
  try {
    log(`执行: ${description}`);
    log(`命令: ${command}`);
    const result = execSync(command, { encoding: "utf8", stdio: "inherit" });
    log(`✅ ${description} 完成`);
    return true;
  } catch (error) {
    log(`❌ ${description} 失败: ${error.message}`, "ERROR");
    return false;
  }
}

// 检查文件是否存在
function checkFile(filePath) {
  return fs.existsSync(filePath);
}

// 主函数
async function main() {
  log("🚀 开始三下乡活动管理系统快速启动...");
  log("");

  const projectDir = path.join(__dirname, "..");
  process.chdir(projectDir);

  // 检查必要文件
  const requiredFiles = [
    "database/demo_data_correct.sql",
    "database/student_demo_data.sql",
    "scripts/init_demo_data.js",
    "scripts/init_student_demo.js",
  ];

  log("📋 检查必要文件...");
  for (const file of requiredFiles) {
    if (!checkFile(file)) {
      log(`❌ 缺少必要文件: ${file}`, "ERROR");
      process.exit(1);
    }
  }
  log("✅ 所有必要文件存在");
  log("");

  // 执行初始化步骤
  const steps = [
    {
      command: "npm run init-complete",
      description: "初始化完整演示数据（包含基础数据和学生数据）",
    },
  ];

  let allSuccess = true;

  for (const step of steps) {
    const success = runCommand(step.command, step.description);
    if (!success) {
      allSuccess = false;
      log(`⚠️  ${step.description} 失败，但继续执行下一步...`);
    }
    log("");
  }

  // 输出结果
  if (allSuccess) {
    log("🎉 三下乡活动管理系统初始化完成！");
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
    log("");
    log("📖 详细文档请查看: DEMO_DATA_SUCCESS.md");
  } else {
    log("⚠️  初始化过程中遇到了一些问题，请检查错误信息");
    log("");
    log("🔧 手动执行命令：");
    log("   npm run init-demo    # 初始化基础数据");
    log("   npm run init-student # 初始化学生数据");
  }
}

// 运行主函数
if (require.main === module) {
  main().catch((error) => {
    log(`快速启动失败: ${error.message}`, "ERROR");
    process.exit(1);
  });
}

module.exports = { main };
