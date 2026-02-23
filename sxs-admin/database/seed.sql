-- 三下乡活动管理系统测试数据 (全量增强版)
-- 执行前请先执行 schema.sql 创建表结构

-- 清空现有数据（按外键依赖顺序）
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE sys_log;
TRUNCATE TABLE sys_message;
TRUNCATE TABLE evaluation_score;
TRUNCATE TABLE evaluation_project;
TRUNCATE TABLE evaluation;
TRUNCATE TABLE notice_read;
TRUNCATE TABLE notice_attachment;
TRUNCATE TABLE notice;
TRUNCATE TABLE user_favorite;
TRUNCATE TABLE result_attachment;
TRUNCATE TABLE result_image;
TRUNCATE TABLE result;
TRUNCATE TABLE progress_comment;
TRUNCATE TABLE progress_image;
TRUNCATE TABLE progress;
TRUNCATE TABLE approval_record;
TRUNCATE TABLE project_attachment;
TRUNCATE TABLE project_member;
TRUNCATE TABLE project;
TRUNCATE TABLE sys_user;
TRUNCATE TABLE sys_college;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. 插入学院数据
INSERT INTO sys_college (id, name, code, sort) VALUES
(1, '经济管理学院', 'JG', 1),
(2, '教育学院', 'JY', 2),
(3, '马克思主义学院', 'MKS', 3),
(4, '农学院', 'NX', 4),
(5, '信息工程学院', 'XX', 5),
(6, '医学院', 'YX', 6),
(7, '艺术设计学院', 'YS', 7),
(8, '外国语学院', 'WY', 8);

-- 2. 插入用户数据 (密码: 123456 的 bcrypt hash: $2a$10$Kew/o4nig07fv7Uh1.3.LOdny5ho945jGH2RDPgKDn8A8LEH87EEi)
INSERT INTO sys_user (id, username, password, real_name, role, college_id, phone, email, status) VALUES
-- 校级管理员
(1, 'admin', '$2a$10$Kew/o4nig07fv7Uh1.3.LOdny5ho945jGH2RDPgKDn8A8LEH87EEi', '系统管理员', 'school_admin', NULL, '13800000001', 'admin@university.edu.cn', 1),
-- 学院管理员
(2, 'ca_jg', '$2a$10$Kew/o4nig07fv7Uh1.3.LOdny5ho945jGH2RDPgKDn8A8LEH87EEi', '经管学院管理员', 'college_admin', 1, '13800000002', 'jg_admin@university.edu.cn', 1),
(3, 'ca_jy', '$2a$10$Kew/o4nig07fv7Uh1.3.LOdny5ho945jGH2RDPgKDn8A8LEH87EEi', '教育学院管理员', 'college_admin', 2, '13800000003', 'jy_admin@university.edu.cn', 1),
-- 指导教师
(4, 't_wang', '$2a$10$Kew/o4nig07fv7Uh1.3.LOdny5ho945jGH2RDPgKDn8A8LEH87EEi', '王教授', 'teacher', 1, '13800000004', 'wang@university.edu.cn', 1),
(5, 't_li', '$2a$10$Kew/o4nig07fv7Uh1.3.LOdny5ho945jGH2RDPgKDn8A8LEH87EEi', '李老师', 'teacher', 2, '13800000005', 'li@university.edu.cn', 1),
(6, 't_zhang', '$2a$10$Kew/o4nig07fv7Uh1.3.LOdny5ho945jGH2RDPgKDn8A8LEH87EEi', '张老师', 'teacher', 5, '13800000006', 'zhang@university.edu.cn', 1),
-- 学生
(7, '2021001', '$2a$10$Kew/o4nig07fv7Uh1.3.LOdny5ho945jGH2RDPgKDn8A8LEH87EEi', '张三', 'student', 1, '13900000001', '2021001@student.edu.cn', 1),
(8, '2021002', '$2a$10$Kew/o4nig07fv7Uh1.3.LOdny5ho945jGH2RDPgKDn8A8LEH87EEi', '李四', 'student', 1, '13900000002', '2021002@student.edu.cn', 1),
(9, '2022001', '$2a$10$Kew/o4nig07fv7Uh1.3.LOdny5ho945jGH2RDPgKDn8A8LEH87EEi', '王五', 'student', 2, '13900000003', '2022001@student.edu.cn', 1),
(10, '2022002', '$2a$10$Kew/o4nig07fv7Uh1.3.LOdny5ho945jGH2RDPgKDn8A8LEH87EEi', '赵六', 'student', 2, '13900000004', '2022002@student.edu.cn', 1),
(11, '2023001', '$2a$10$Kew/o4nig07fv7Uh1.3.LOdny5ho945jGH2RDPgKDn8A8LEH87EEi', '钱七', 'student', 5, '13900000005', '2023001@student.edu.cn', 1),
(12, '2023002', '$2a$10$Kew/o4nig07fv7Uh1.3.LOdny5ho945jGH2RDPgKDn8A8LEH87EEi', '孙八', 'student', 5, '13900000006', '2023002@student.edu.cn', 1),
-- 评审专家
(13, 'e_chen', '$2a$10$Kew/o4nig07fv7Uh1.3.LOdny5ho945jGH2RDPgKDn8A8LEH87EEi', '陈专家', 'expert', NULL, '13700000001', 'chen_expert@sina.com', 1),
(14, 'e_zhou', '$2a$10$Kew/o4nig07fv7Uh1.3.LOdny5ho945jGH2RDPgKDn8A8LEH87EEi', '周专家', 'expert', NULL, '13700000002', 'zhou_expert@sina.com', 1);

-- 3. 插入项目数据
INSERT INTO project (id, project_no, title, category, description, target_area, start_date, end_date, leader_id, teacher_id, college_id, status) VALUES
-- 待审核项目
(1, 'P2026001', '智慧农业赋能乡村振兴调研', '乡村振兴', '通过实地走访，调研物联网技术在当地草莓种植中的应用现状。', '湖南省宁乡市', '2026-07-01', '2026-07-10', 7, 4, 1, 'pending'),
(2, 'P2026002', '留守儿童心理健康关爱计划', '教育关爱', '在山区学校开展心理团辅活动，建立长效关爱机制。', '贵州省大方县', '2026-07-05', '2026-07-20', 9, 5, 2, 'pending'),
-- 院审通过项目
(3, 'P2026003', '红色遗迹数字化保护行动', '文化传承', '利用3D扫描技术记录当地红色建筑，制作VR展示课件。', '江西省瑞金市', '2026-07-10', '2026-07-25', 7, 4, 1, 'college_approved'),
-- 已立项项目 (校审通过)
(4, 'P2026004', '非遗文化进课堂社会实践', '文化传承', '将苗族剪纸引入当地小学课堂，开展非遗体验课程。', '湖南省凤凰县', '2026-07-01', '2026-07-15', 10, 5, 2, 'approved'),
(5, 'P2026005', '普惠金融在农村的普及调研', '金融科技', '调研村民对电子支付及小额贷款的认知度和使用习惯。', '广东省梅州市', '2026-07-01', '2026-07-12', 7, 4, 1, 'approved'),
(6, 'P2026006', '社区环保意识提升宣传', '生态环保', '在乡镇集市开展垃圾分类知识竞赛及环保袋发放活动。', '江苏省句容市', '2026-07-15', '2026-07-25', 8, 4, 1, 'approved'),
-- 已驳回项目
(7, 'P2026007', '重复申报测试项目', '乡村振兴', '这是一个由于内容雷同被学院驳回的测试项目。', '测试地点', '2026-08-01', '2026-08-05', 7, 4, 1, 'rejected'),
(8, 'P2026008', '预算过高项目', '科技支农', '由于预算安排不合理被学校驳回的项目。', '测试地点', '2026-08-10', '2026-08-20', 11, 6, 5, 'rejected'),
-- 已结项项目
(9, 'P2025001', '2025年支教志愿服务队', '支教助学', '上一年度已完成的支教项目，成果丰硕。', '广西省百色市', '2025-07-01', '2025-07-30', 9, 5, 2, 'closed'),
(10, 'P2025002', '2025年农村电商发展调研', '乡村振兴', '上一年度已完成的调研项目，获得省级优秀。', '湖南省邵阳市', '2025-07-05', '2025-07-25', 7, 4, 1, 'closed');

-- 4. 插入项目成员
INSERT INTO project_member (project_id, user_id, role) VALUES
(1, 7, 'leader'), (1, 8, 'member'),
(2, 9, 'leader'), (2, 10, 'member'),
(3, 7, 'leader'), (3, 8, 'member'),
(4, 10, 'leader'), (4, 9, 'member'),
(5, 7, 'leader'), (5, 8, 'member'),
(6, 8, 'leader'), (6, 7, 'member'),
(7, 7, 'leader'), (8, 11, 'leader'),
(9, 9, 'leader'), (9, 10, 'member'),
(10, 7, 'leader'), (10, 8, 'member');

-- 5. 插入审批记录
INSERT INTO approval_record (project_id, approver_id, approval_level, action, opinion, created_at) VALUES
-- 项目3院审通过
(3, 2, 'college', 'approve', '选题新颖，技术方案可行。', '2026-06-05 10:00:00'),
-- 项目4已立项
(4, 3, 'college', 'approve', '教育学院重点支持项目。', '2026-06-01 09:00:00'),
(4, 1, 'school', 'approve', '同意立项。', '2026-06-03 14:00:00'),
-- 项目5已立项
(5, 2, 'college', 'approve', '经管学院重点推荐。', '2026-06-01 10:00:00'),
(5, 1, 'school', 'approve', '同意。', '2026-06-04 11:00:00'),
-- 项目6已立项
(6, 2, 'college', 'approve', '同意推荐。', '2026-06-10 15:00:00'),
(6, 1, 'school', 'approve', '批准。', '2026-06-12 16:00:00'),
-- 项目7学院驳回
(7, 2, 'college', 'reject', '申报书内容与去年某项目高度雷同，请修改后重新申报。', '2026-06-15 09:00:00'),
-- 项目8学校驳回
(8, 2, 'college', 'approve', '学院审核通过。', '2026-06-10 09:00:00'),
(8, 1, 'school', 'reject', '项目经费预算中餐费比例过高，不符合相关规定，建议调整。', '2026-06-12 10:00:00'),
-- 已结项项目9和10
(9, 3, 'college', 'approve', '同意。', '2025-06-01 09:00:00'), (9, 1, 'school', 'approve', '同意。', '2025-06-03 10:00:00'),
(10, 2, 'college', 'approve', '同意。', '2025-06-01 09:00:00'), (10, 1, 'school', 'approve', '同意。', '2025-06-03 10:00:00');

-- 6. 插入进度记录
INSERT INTO progress (id, project_id, title, content, progress_date, creator_id) VALUES
(1, 4, '支教第一周：教学大纲确定', '团队与大方县小学对接完成，确定了剪纸课程的教学大纲。', '2026-07-03', 10),
(2, 4, '支教第二周：首堂体验课成功', '学生对剪纸非常感兴趣，课堂互动积极。', '2026-07-10', 10),
(3, 5, '调研启动：发放问卷100份', '在梅州市各自然村发放纸质问卷，回收有效问卷92份。', '2026-07-05', 7),
(4, 9, '百色支教纪实一', '2025年支教记录一。', '2025-07-10', 9);

-- 7. 插入进度评论
INSERT INTO progress_comment (progress_id, user_id, content) VALUES
(1, 5, '大纲很细致，建议增加一些简单的互动小游戏。'),
(2, 5, '非常棒，注意收集学生的反馈意见。'),
(3, 4, '回收率不错，接下来可以开始数据预处理。');

-- 8. 插入成果数据
INSERT INTO result (id, project_id, title, category, content, cover_url, status, view_count, creator_id) VALUES
(1, 9, '广西百色支教结项报告', '支教助学', '历时一个月，为200余名留守儿童提供了暑期课程。', '/uploads/results/bs_cover.jpg', 'published', 150, 9),
(2, 10, '邵阳农村电商发展蓝皮书', '乡村振兴', '深入邵阳三个贫困村，撰写了详实的电商发展建议报告。', '/uploads/results/sy_cover.jpg', 'published', 320, 7);

-- 9. 插入评优活动及排名
INSERT INTO evaluation (id, title, year, description, start_time, end_time, status) VALUES
(1, '2025年度大学生暑期社会实践评优', 2025, '针对2025年度所有完成的项目进行综合评优。', '2025-09-01', '2025-10-30', 'finished');

INSERT INTO evaluation_project (evaluation_id, project_id, final_score, `rank`, award_level) VALUES
(1, 10, 95.50, 1, '一等奖'),
(1, 9, 88.00, 2, '二等奖');

INSERT INTO evaluation_score (evaluation_id, project_id, expert_id, total_score, comment) VALUES
(1, 10, 13, 96.00, '调研非常扎实，具有很强的政策参考价值。'),
(1, 10, 14, 95.00, '数据详实，逻辑严密。'),
(1, 9, 13, 89.00, '支教活动开展得很扎实。'),
(1, 9, 14, 87.00, '活动记录完整。');

-- 10. 插入通知公告
INSERT INTO notice (id, title, type, content, summary, publisher_id, status, publish_time, is_top) VALUES
(1, '关于启动2026年"三下乡"暑期实践申报的通知', 'activity', '2026年暑期实践正式启动，请各学院组织申报。', '2026年申报启动', 1, 'published', '2026-05-10 09:00:00', 1),
(2, '社会实践报销注意事项', 'notice', '请各团队保留好交通、保险等发票。', '报销指南', 1, 'published', '2026-06-20 14:00:00', 0);

-- 11. 插入系统消息
INSERT INTO sys_message (user_id, title, content, type, related_type, related_id) VALUES
(11, '项目审批提醒', '您的项目《智慧农业赋能乡村振兴调研》已提交，等待学院审核。', 'approval', 'project', 1),
(7, '项目驳回通知', '您的项目《重复申报测试项目》被学院驳回。', 'approval', 'project', 7),
(1, '新项目待审核', '有一项新的校级审批任务待处理。', 'approval', 'project', 3);

SELECT '测试数据插入完成！' AS message;
