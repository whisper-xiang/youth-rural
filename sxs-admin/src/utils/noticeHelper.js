const db = require("../config/db");

function toHtml(content) {
  if (!content) return "";
  return content.includes("<")
    ? content
    : `<p>${String(content).replace(/\n/g, "<br/>")}</p>`;
}

async function createNotice(options) {
  const {
    title,
    type = "activity",
    content = "",
    summary = "",
    source = "系统自动通知",
    publisherId = null,
    isTop = 0,
    conn = null,
  } = options || {};

  if (!title) return null;

  const sql =
    "INSERT INTO notice (title, type, content, summary, source, publisher_id, is_top, status, publish_time) VALUES (?, ?, ?, ?, ?, ?, ?, 'published', NOW())";

  const params = [
    title,
    type,
    toHtml(content),
    summary || title,
    source,
    publisherId,
    isTop ? 1 : 0,
  ];

  const executor = conn || db;
  const [res] = await executor.query(sql, params);
  return res.insertId;
}

async function safeCreateNotice(options) {
  try {
    return await createNotice(options);
  } catch (e) {
    console.error("Create notice error:", e);
    return null;
  }
}

module.exports = {
  createNotice,
  safeCreateNotice,
};
