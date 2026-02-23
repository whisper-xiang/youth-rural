-- ========================================
-- 学生用户演示数据脚本
-- 为学生用户(2021001, ID=1)创建丰富的项目数据
-- 移除草稿状态，增加更多状态的项目
-- ========================================

-- 清理学生用户(leader_id=1)的草稿状态项目
DELETE FROM project_member WHERE project_id IN (SELECT id FROM project WHERE leader_id = 1 AND status = 'draft');
DELETE FROM approval_record WHERE project_id IN (SELECT id FROM project WHERE leader_id = 1 AND status = 'draft');
DELETE FROM progress WHERE project_id IN (SELECT id FROM project WHERE leader_id = 1 AND status = 'draft');
DELETE FROM result WHERE project_id IN (SELECT id FROM project WHERE leader_id = 1 AND status = 'draft');
DELETE FROM project WHERE leader_id = 1 AND status = 'draft';

-- 为学生用户创建不同状态的项目
INSERT INTO project (project_no, title, category, description, plan, expected_result, target_area, start_date, end_date, budget, leader_id, leader_phone, teacher_id, teacher_name, college_id, status, reject_reason, is_excellent, created_at) VALUES
-- 待审核项目
('PRJ2026011', '社区志愿服务活动', '志愿服务', '深入社区开展志愿服务活动，关爱老人儿童，提升社区服务质量。', '第一周：社区调研，了解需求\n第二周：开展志愿服务活动\n第三周：总结反馈，建立长效机制', '完成社区志愿服务报告，建立志愿服务档案', '北京市朝阳区', '2026-07-05', '2026-07-20', 3000.00, 1, '13800138001', 8, '陈教授', 1, 'pending', NULL, 0, NOW() - INTERVAL 1 DAY),

-- 学院已审核项目
('PRJ2026012', '传统文化进校园', '文化传承', '将传统文化带入校园，开展传统文化教育活动，提升学生文化素养。', '第一周：策划活动方案\n第二周：开展传统文化讲座\n第三周：组织文化体验活动', '完成传统文化教育活动报告，制作宣传材料', '上海市浦东新区', '2026-06-25', '2026-07-10', 4000.00, 1, '13800138001', 9, '李教授', 2, 'college_approved', NULL, 0, NOW() - INTERVAL 3 DAY),

-- 已立项项目
('PRJ2026013', '环保意识调研', '环保宣传', '调研公众环保意识现状，开展环保宣传活动，提升环保意识。', '第一周：设计调研问卷\n第二周：开展实地调研\n第三周：分析数据，撰写报告', '完成环保意识调研报告，提出环保建议', '广州市天河区', '2026-08-05', '2026-08-20', 3500.00, 1, '13800138001', 10, '张教授', 3, 'approved', NULL, 0, NOW() - INTERVAL 5 DAY),

-- 已驳回项目
('PRJ2026014', '科技创新实践', '科技创新', '开展科技创新实践活动，培养学生的创新思维和实践能力。', '第一周：确定创新项目\n第二周：开展创新实践\n第三周：成果展示与总结', '完成科技创新项目报告，形成创新成果', '深圳市南山区', '2026-07-15', '2026-07-30', 6000.00, 1, '13800138001', 11, '王教授', 1, 'rejected', '项目创新性不足，需要进一步优化方案', 0, NOW() - INTERVAL 7 DAY),

-- 已撤回项目
('PRJ2026015', '健康生活推广', '健康宣传', '推广健康生活方式，开展健康知识宣传活动，提升公众健康意识。', '第一周：健康知识调研\n第二周：开展健康宣传活动\n第三周：效果评估与总结', '完成健康生活推广报告，建立健康档案', '成都市武侯区', '2026-06-10', '2026-06-25', 2500.00, 1, '13800138001', 12, '刘教授', 2, 'withdrawn', NULL, 0, NOW() - INTERVAL 10 DAY);

-- 为新项目添加成员
INSERT INTO project_member (project_id, user_id, role, responsibility, created_at) VALUES
-- 社区志愿服务活动成员
(11, 1, 'leader', '项目负责人，统筹协调', NOW()),
(11, 12, 'member', '活动组织员，负责活动策划', NOW()),
(11, 13, 'member', '宣传员，负责宣传工作', NOW()),

-- 传统文化进校园成员
(12, 1, 'leader', '项目负责人，统筹协调', NOW()),
(12, 14, 'member', '策划员，负责活动策划', NOW()),
(12, 15, 'member', '执行员，负责活动执行', NOW()),

-- 环保意识调研成员
(13, 1, 'leader', '项目负责人，统筹协调', NOW()),
(13, 16, 'member', '调研员，负责数据收集', NOW()),
(13, 17, 'member', '分析师，负责数据分析', NOW()),

-- 科技创新实践成员
(14, 1, 'leader', '项目负责人，统筹协调', NOW()),
(14, 18, 'member', '技术员，负责技术支持', NOW()),
(14, 19, 'member', '研究员，负责研究工作', NOW()),

-- 健康生活推广成员
(15, 1, 'leader', '项目负责人，统筹协调', NOW()),
(15, 20, 'member', '调研员，负责健康调研', NOW()),
(15, 21, 'member', '宣传员，负责健康宣传', NOW());

-- 为学院已审核和已立项项目添加审批记录
INSERT INTO approval_record (project_id, approver_id, approval_level, action, opinion, created_at) VALUES
-- 传统文化进校园审批记录
(12, 2, 'college', 'approve', '传统文化项目很有意义，方案详细，同意申报', NOW() - INTERVAL 2 DAY),

-- 环保意识调研审批记录
(13, 2, 'college', 'approve', '环保调研项目立意很好，实施方案可行', NOW() - INTERVAL 4 DAY),
(13, 1, 'school', 'approve', '环保意识调研具有重要意义，同意立项', NOW() - INTERVAL 3 DAY),

-- 科技创新实践驳回记录
(14, 2, 'college', 'reject', '项目创新性不足，需要进一步优化方案', NOW() - INTERVAL 6 DAY);

-- 为已立项项目添加进度记录
INSERT INTO progress (project_id, title, content, progress_date, location, creator_id, created_at) VALUES
-- 环保意识调研进度记录
(13, '项目启动会议', '召开环保意识调研项目启动会议，明确分工安排。', '2026-07-01', '学校会议室', 1, NOW() - INTERVAL 4 DAY),
(13, '调研问卷设计', '设计环保意识调研问卷，确定调研对象和方法。', '2026-07-05', '学校图书馆', 1, NOW() - INTERVAL 3 DAY),
(13, '实地调研开展', '在广州市天河区开展环保意识实地调研。', '2026-07-10', '广州市天河区', 1, NOW() - INTERVAL 2 DAY);

-- 为已立项项目添加成果材料
INSERT INTO result (project_id, title, category, description, cover_url, creator_id, status, created_at) VALUES
-- 环保意识调研成果
(13, '环保意识调研报告', 'report', '关于广州市天河区公众环保意识现状的详细调研报告。', '/uploads/covers/env_report.jpg', 1, 'published', NOW() - INTERVAL 1 DAY),
(13, '环保宣传手册', 'other', '环保知识宣传手册，包含环保小知识和实用建议。', '/uploads/covers/env_manual.jpg', 1, 'published', NOW() - INTERVAL 1 DAY);

-- 为成果添加附件和图片
INSERT INTO result_attachment (result_id, file_name, file_url, file_size, file_type, created_at) VALUES
(8, '环保意识调研报告.pdf', '/uploads/reports/environmental_report.pdf', 1536789, 'pdf', NOW() - INTERVAL 1 DAY);

INSERT INTO result_image (result_id, image_url, sort, created_at) VALUES
(9, '/uploads/images/env_activity_01.jpg', 1, NOW() - INTERVAL 1 DAY),
(9, '/uploads/images/env_activity_02.jpg', 2, NOW() - INTERVAL 1 DAY),
(9, '/uploads/images/env_activity_03.jpg', 3, NOW() - INTERVAL 1 DAY);

-- 为学生用户添加系统消息
INSERT INTO sys_message (user_id, title, content, type, related_type, related_id, is_read, created_at) VALUES
(1, '项目申报学院审核通过', '您的项目"传统文化进校园"已通过学院审核，请等待校级审核。', 'approval', 'project', 12, 0, NOW() - INTERVAL 2 DAY),
(1, '项目申报校级审核通过', '您的项目"环保意识调研"已通过校级审核，项目已立项。', 'approval', 'project', 13, 0, NOW() - INTERVAL 3 DAY),
(1, '项目申报被驳回', '您的项目"科技创新实践"被驳回，原因：项目创新性不足，需要进一步优化方案。', 'approval', 'project', 14, 0, NOW() - INTERVAL 6 DAY),
(1, '项目进度更新', '您参与的项目"环保意识调研"有新的进度更新。', 'progress', 'project', 13, 0, NOW() - INTERVAL 2 DAY),
(1, '项目成果发布', '您参与的项目"环保意识调研"发布了新的成果材料。', 'result', 'project', 13, 0, NOW() - INTERVAL 1 DAY);

-- ========================================
-- 数据统计
-- ========================================
SELECT '学生演示数据初始化完成' as status,
       (SELECT COUNT(*) FROM project WHERE leader_id = 1 OR EXISTS (SELECT 1 FROM project_member pm WHERE pm.project_id = p.id AND pm.user_id = 1)) as total_projects,
       (SELECT COUNT(*) FROM project WHERE leader_id = 1 AND status = 'pending') as pending_count,
       (SELECT COUNT(*) FROM project WHERE leader_id = 1 AND status = 'college_approved') as college_approved_count,
       (SELECT COUNT(*) FROM project WHERE leader_id = 1 AND status = 'approved') as approved_count,
       (SELECT COUNT(*) FROM project WHERE leader_id = 1 AND status = 'rejected') as rejected_count,
       (SELECT COUNT(*) FROM project WHERE leader_id = 1 AND status = 'withdrawn') as withdrawn_count,
       (SELECT COUNT(*) FROM project WHERE leader_id = 1 AND status = 'closed') as closed_count;
