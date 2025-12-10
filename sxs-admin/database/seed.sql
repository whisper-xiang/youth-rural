-- 三下乡活动管理系统测试数据
-- 执行前请先执行 schema.sql 创建表结构

-- 清空现有数据（按外键依赖顺序）
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE evaluation_scores;
TRUNCATE TABLE notice_favorites;
TRUNCATE TABLE notice_read;
TRUNCATE TABLE notice_attachments;
TRUNCATE TABLE notices;
TRUNCATE TABLE result_files;
TRUNCATE TABLE results;
TRUNCATE TABLE progress_comments;
TRUNCATE TABLE progress_images;
TRUNCATE TABLE progress_records;
TRUNCATE TABLE approval_records;
TRUNCATE TABLE project_members;
TRUNCATE TABLE projects;
TRUNCATE TABLE users;
TRUNCATE TABLE colleges;
SET FOREIGN_KEY_CHECKS = 1;

-- 插入学院数据
INSERT INTO colleges (id, name, code) VALUES
(1, '经济管理学院', 'JG'),
(2, '教育学院', 'JY'),
(3, '马克思主义学院', 'MKS'),
(4, '农学院', 'NX'),
(5, '信息工程学院', 'XX'),
(6, '医学院', 'YX');

-- 插入用户数据（密码都是 123456，使用 bcrypt 加密）
-- 密码 123456 的 bcrypt hash: $2b$10$rQZ8K.5z5z5z5z5z5z5z5OeJz5z5z5z5z5z5z5z5z5z5z5z5z5z5z
-- 为简化测试，这里使用明文存储，实际应用中应使用加密

INSERT INTO users (id, username, password, name, role, college_id, phone, email) VALUES
-- 学生账号
(1, '2021001', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MqrqgBrSLmyJk8R9HvGqNPvCwGSVm6y', '张三', 'student', 1, '13800000001', 'zhangsan@example.com'),
(2, '2021002', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MqrqgBrSLmyJk8R9HvGqNPvCwGSVm6y', '李四', 'student', 2, '13800000002', 'lisi@example.com'),
(3, '2021003', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MqrqgBrSLmyJk8R9HvGqNPvCwGSVm6y', '王五', 'student', 3, '13800000003', 'wangwu@example.com'),
-- 指导教师
(4, 'T001', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MqrqgBrSLmyJk8R9HvGqNPvCwGSVm6y', '李教授', 'teacher', 1, '13800000004', 'liprof@example.com'),
(5, 'T002', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MqrqgBrSLmyJk8R9HvGqNPvCwGSVm6y', '王教授', 'teacher', 2, '13800000005', 'wangprof@example.com'),
-- 学院管理员
(6, 'CA001', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MqrqgBrSLmyJk8R9HvGqNPvCwGSVm6y', '经管学院管理员', 'college_admin', 1, '13800000006', 'ca001@example.com'),
(7, 'CA002', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MqrqgBrSLmyJk8R9HvGqNPvCwGSVm6y', '教育学院管理员', 'college_admin', 2, '13800000007', 'ca002@example.com'),
-- 校级管理员
(8, 'admin', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MqrqgBrSLmyJk8R9HvGqNPvCwGSVm6y', '系统管理员', 'school_admin', NULL, '13800000008', 'admin@example.com'),
-- 评审专家
(9, 'E001', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MqrqgBrSLmyJk8R9HvGqNPvCwGSVm6y', '张专家', 'expert', NULL, '13800000009', 'expert1@example.com'),
(10, 'E002', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MqrqgBrSLmyJk8R9HvGqNPvCwGSVm6y', '李专家', 'expert', NULL, '13800000010', 'expert2@example.com');

-- 插入项目数据
INSERT INTO projects (id, title, theme, description, location, start_date, end_date, leader_id, teacher_id, college_id, status, members, plan, expected_result) VALUES
(1, '乡村振兴调研实践', '乡村振兴', '深入农村基层，调研乡村振兴战略实施情况，了解农村发展现状与需求。', '湖南省长沙市望城区', '2025-07-01', '2025-07-15', 1, 4, 1, 'approved', '李四, 王五, 赵六, 钱七', '第一周：走访调研\n第二周：数据整理与分析', '完成调研报告一份，提出建议方案'),
(2, '支教助学志愿服务', '支教助学', '前往贵州山区开展为期两周的支教活动，为当地儿童提供教育帮助。', '贵州省遵义市', '2025-07-10', '2025-07-24', 2, 5, 2, 'approved', '张三, 王五, 周八', '第一周：基础教学\n第二周：兴趣培养', '完成支教日志，建立长期帮扶关系'),
(3, '红色文化寻访', '红色文化', '追寻革命先辈足迹，探访井冈山革命根据地，传承红色基因。', '江西省井冈山', '2025-07-05', '2025-07-12', 3, 4, 3, 'pending', '张三, 李四', '参观革命遗址，采访老党员', '完成红色文化调研报告'),
(4, '科技支农服务', '科技支农', '运用所学农业知识，帮助农民解决生产中的技术问题。', '湖南省衡阳市', '2025-07-15', '2025-07-25', 1, 4, 4, 'draft', '李四, 王五', '技术培训，现场指导', '推广农业新技术');

-- 插入项目成员
INSERT INTO project_members (project_id, user_id, role) VALUES
(1, 1, 'leader'),
(1, 2, 'member'),
(1, 3, 'member'),
(2, 2, 'leader'),
(2, 1, 'member'),
(2, 3, 'member'),
(3, 3, 'leader'),
(3, 1, 'member'),
(3, 2, 'member');

-- 插入审批记录
INSERT INTO approval_records (project_id, approver_id, level, status, comment, approved_at) VALUES
(1, 6, 'college', 'approved', '项目计划详实，同意推荐', '2025-06-15 10:00:00'),
(1, 8, 'school', 'approved', '同意立项', '2025-06-16 14:00:00'),
(2, 7, 'college', 'approved', '支教计划合理，同意', '2025-06-18 09:00:00'),
(2, 8, 'school', 'approved', '批准立项', '2025-06-19 11:00:00');

-- 插入进度记录
INSERT INTO progress_records (id, project_id, title, content, progress_date, uploader_id) VALUES
(1, 1, '第一周调研启动', '团队抵达望城区，与当地村委会对接，了解基本情况，制定详细调研计划。', '2025-07-03', 1),
(2, 1, '入户走访调研', '深入农户家中进行问卷调查和访谈，收集一手资料，了解村民实际需求。', '2025-07-05', 1),
(3, 2, '支教活动启动', '抵达支教点，与当地学校对接，了解学生情况，制定教学计划。', '2025-07-11', 2);

-- 插入进度图片
INSERT INTO progress_images (progress_id, image_url, sort_order) VALUES
(1, '/uploads/progress/demo1.jpg', 1),
(1, '/uploads/progress/demo2.jpg', 2),
(2, '/uploads/progress/demo3.jpg', 1);

-- 插入进度评论
INSERT INTO progress_comments (progress_id, user_id, content) VALUES
(1, 4, '调研计划安排合理，注意做好访谈记录。'),
(2, 4, '数据收集很全面，继续保持。');

-- 插入成果数据
INSERT INTO results (id, project_id, title, category, content, cover_url, status, view_count) VALUES
(1, 1, '望城区乡村振兴调研报告', '乡村振兴', '通过为期两周的实地调研，深入了解望城区乡村振兴战略实施情况，形成调研报告并提出发展建议。\n\n主要发现：\n1. 农村基础设施建设取得显著成效\n2. 特色农业产业发展势头良好\n3. 乡村旅游成为新的经济增长点', '/uploads/results/cover1.jpg', 'published', 128),
(2, 2, '山区支教实践纪实', '支教助学', '记录在贵州山区开展支教活动的全过程，包括教学设计、学生互动、成果展示等内容。', '/uploads/results/cover2.jpg', 'published', 256);

-- 插入成果文件
INSERT INTO result_files (result_id, file_name, file_url, file_size, file_type) VALUES
(1, '调研报告.pdf', '/uploads/results/report1.pdf', 2621440, 'pdf'),
(1, '数据分析.xlsx', '/uploads/results/data1.xlsx', 1258291, 'excel'),
(2, '支教日志.pdf', '/uploads/results/report2.pdf', 3145728, 'pdf');

-- 插入通知公告
INSERT INTO notices (id, title, content, type, publisher_id, status, publish_time) VALUES
(1, '关于开展2025年暑期"三下乡"社会实践活动的通知', '各学院：\n\n为深入学习贯彻习近平新时代中国特色社会主义思想，引导和帮助广大青年学生在社会实践中受教育、长才干、作贡献，现就2025年暑期"三下乡"社会实践活动有关事项通知如下：\n\n一、活动主题\n青春为中国式现代化挺膺担当\n\n二、活动时间\n2025年7月-8月\n\n三、申报要求\n1. 每支团队5-10人\n2. 必须有1名指导教师\n3. 活动时间不少于7天', 'activity', 8, 'published', '2025-06-01 09:00:00'),
(2, '项目申报截止时间延长通知', '各位同学：\n\n根据实际情况，2025年暑期"三下乡"项目申报截止时间延长至6月20日，请尚未提交的团队抓紧时间完成申报。', 'activity', 8, 'published', '2025-06-10 14:00:00'),
(3, '关于提交活动成果材料的通知', '各实践团队：\n\n请于活动结束后一周内提交以下材料：\n1. 实践报告\n2. 活动照片（不少于20张）\n3. 活动视频（3-5分钟）\n4. 其他支撑材料', 'result', 8, 'published', '2025-06-15 10:00:00');

-- 插入通知附件
INSERT INTO notice_attachments (notice_id, file_name, file_url, file_size) VALUES
(1, '2025年三下乡活动方案.pdf', '/uploads/notices/plan2025.pdf', 1048576),
(1, '申报表模板.docx', '/uploads/notices/template.docx', 52428);

-- 插入通知已读记录
INSERT INTO notice_read (notice_id, user_id) VALUES
(1, 1),
(1, 2),
(2, 1);

-- 插入评优评分
INSERT INTO evaluation_scores (result_id, expert_id, score, score_detail, comment) VALUES
(1, 9, 92, '{"theme": 18, "content": 23, "innovation": 18, "effect": 18, "presentation": 15}', '调研深入，报告质量高，建议优秀。'),
(1, 10, 88, '{"theme": 17, "content": 22, "innovation": 16, "effect": 18, "presentation": 15}', '整体不错，创新性可以再加强。');

SELECT '测试数据插入完成！' AS message;
SELECT '可用测试账号：' AS message;
SELECT '学生: 2021001/123456, 2021002/123456, 2021003/123456' AS accounts;
SELECT '教师: T001/123456, T002/123456' AS accounts;
SELECT '学院管理员: CA001/123456, CA002/123456' AS accounts;
SELECT '校级管理员: admin/123456' AS accounts;
SELECT '评审专家: E001/123456, E002/123456' AS accounts;
