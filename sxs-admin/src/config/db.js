/**
 * 数据库连接配置
 */
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "sxs_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 测试连接并自动迁移
pool
  .getConnection()
  .then(async (conn) => {
    console.log("Database connected successfully");

    try {
      // 检查并自动添加 project_member 表的字段
      const [columns] = await conn.query("SHOW COLUMNS FROM project_member");
      const columnNames = columns.map((c) => c.Field);

      // 1. 修改 user_id 为可空
      const userIdCol = columns.find((c) => c.Field === "user_id");
      if (userIdCol && userIdCol.Null === "NO") {
        await conn.query(
          "ALTER TABLE project_member MODIFY user_id BIGINT NULL",
        );
        console.log("Schema update: Modified user_id to be NULLABLE");
      }

      // 2. 添加新字段
      if (!columnNames.includes("member_name")) {
        await conn.query(
          "ALTER TABLE project_member ADD COLUMN member_name VARCHAR(50) AFTER user_id",
        );
        console.log("Schema update: Added column member_name");
      }

      if (!columnNames.includes("student_id")) {
        await conn.query(
          "ALTER TABLE project_member ADD COLUMN student_id VARCHAR(50) AFTER member_name",
        );
        console.log("Schema update: Added column student_id");
      }

      if (!columnNames.includes("phone")) {
        await conn.query(
          "ALTER TABLE project_member ADD COLUMN phone VARCHAR(20) AFTER student_id",
        );
        console.log("Schema update: Added column phone");
      }

      // 3. 检查并自动添加 project 表的字段
      const [projectColumns] = await conn.query("SHOW COLUMNS FROM project");
      const projectColumnNames = projectColumns.map((c) => c.Field);

      if (!projectColumnNames.includes("teacher_name")) {
        await conn.query(
          "ALTER TABLE project ADD COLUMN teacher_name VARCHAR(50) AFTER teacher_id",
        );
        console.log("Schema update: Added column teacher_name to project");
      }

      if (!projectColumnNames.includes("leader_phone")) {
        await conn.query(
          "ALTER TABLE project ADD COLUMN leader_phone VARCHAR(20) AFTER leader_id",
        );
        console.log("Schema update: Added column leader_phone to project");
      }

      if (!projectColumnNames.includes("plan")) {
        await conn.query(
          "ALTER TABLE project ADD COLUMN plan TEXT AFTER description",
        );
        console.log("Schema update: Added column plan to project");
      }

      if (!projectColumnNames.includes("expected_result")) {
        await conn.query(
          "ALTER TABLE project ADD COLUMN expected_result TEXT AFTER plan",
        );
        console.log("Schema update: Added column expected_result to project");
      }
    } catch (err) {
      console.error("Schema migration failed:", err.message);
    }

    conn.release();
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });

module.exports = pool;
