-- ========================================
-- 三下乡活动管理系统完整演示数据脚本
-- 包含基础数据和学生专项数据
-- 移除草稿状态，增加更多状态的项目
-- ========================================

-- 清理现有数据（保留用户表）
DELETE FROM approval_record;
DELETE FROM project_member;
DELETE FROM project;
DELETE FROM progress;
DELETE FROM progress_comment;
DELETE FROM result;
DELETE FROM result_attachment;
DELETE FROM result_image;
DELETE FROM evaluation;
DELETE FROM evaluation_score;
DELETE FROM notice;
DELETE FROM notice_attachment;
DELETE FROM sys_message;

-- 重置自增ID
ALTER TABLE project AUTO_INCREMENT = 1;
ALTER TABLE progress AUTO_INCREMENT = 1;
ALTER TABLE result AUTO_INCREMENT = 1;
ALTER TABLE evaluation AUTO_INCREMENT = 1;
ALTER TABLE notice AUTO_INCREMENT = 1;

-- ========================================
-- 1. 基础项目数据（其他用户的项目）
-- ========================================

INSERT INTO project (project_no, title, category, description, plan, expected_result, target_area, start_date, end_date, budget, leader_id, leader_phone, teacher_id, teacher_name, college_id, status, reject_reason, is_excellent, created_at) VALUES
-- 其他用户的项目（保持数据多样性）
('PRJ2026002', '红色文化传承实践', '文化传承', '探访革命老区，传承红色基因，开展红色文化教育活动。', '第一周：参观革命遗址，收集历史资料\n第二周：开展红色教育活动，撰写实践报告', '完成红色文化调研报告，制作宣传视频', '江西省井冈山市', '2026-07-10', '2026-07-25', 6000.00, 2, '13800138002', 9, '李教授', 2, 'pending', NULL, 0, NOW() - INTERVAL 2 DAY),
('PRJ2026004', '科技支农助振兴', '科技支农', '运用现代科技手段帮助农业生产，推广农业新技术，提高农业生产效率。', '第一周：调研当地农业现状\n第二周：推广农业技术，开展培训活动', '完成科技支农报告，建立技术指导档案', '四川省成都市郫都区', '2026-07-05', '2026-07-20', 8000.00, 6, '13800138004', 11, '王教授', 1, 'college_approved', NULL, 0, NOW() - INTERVAL 3 DAY),
('PRJ2026005', '教育帮扶暖童心', '教育帮扶', '赴偏远地区开展教育帮扶活动，为当地儿童提供教育支持和关爱。', '第一周：开展教学活动，了解教育现状\n第二周：组织文体活动，进行家访调研', '完成教育帮扶报告，建立长期帮扶机制', '贵州省黔东南州', '2026-06-20', '2026-07-10', 7000.00, 7, '13800138005', 12, '刘教授', 2, 'approved', NULL, 0, NOW() - INTERVAL 5 DAY),
('PRJ2026006', '非遗文化保护行动', '文化保护', '探访非物质文化遗产传承人，记录传统技艺，开展文化保护宣传。', '第一周：寻访非遗传承人，记录技艺\n第二周：开展保护宣传活动，制作纪录片', '完成非遗调研报告，制作宣传纪录片', '云南省大理州', '2026-06-15', '2026-06-30', 9000.00, 8, '13800138006', 13, '赵教授', 3, 'approved', NULL, 0, NOW() - INTERVAL 7 DAY),
('PRJ2026007', '城市文明创建调研', '社会调研', '调研城市文明创建工作，总结经验做法，提出改进建议。', '第一周：实地调研，收集资料\n第二周：分析总结，撰写报告', '完成城市文明调研报告，提出改进建议', '浙江省杭州市', '2026-07-20', '2026-08-05', 4500.00, 9, '13800138007', 14, '孙教授', 1, 'rejected', '实践方案不够具体，需要进一步细化调研内容和方法', 0, NOW() - INTERVAL 4 DAY),
('PRJ2026008', '健康生活科普活动', '科普宣传', '开展健康生活科普宣传活动，提高居民健康意识和生活质量。', '第一周：健康知识调研\n第二周：科普宣传活动', '完成健康科普报告，建立宣传档案', '江苏省南京市', '2026-08-10', '2026-08-25', 3500.00, 10, '13800138008', 15, '周教授', 2, 'rejected', '活动时间安排不合理，与学校课程时间冲突', 0, NOW() - INTERVAL 2 DAY),
('PRJ2026009', '创新创业实践', '创新创业', '开展创新创业实践活动，培养创新精神，提升创业能力。', '第一周：市场调研，项目策划\n第二周：实践验证，总结提升', '完成创新创业报告，形成项目方案', '上海市浦东新区', '2026-09-01', '2026-09-15', 10000.00, 11, '13800138009', 16, '吴教授', 3, 'withdrawn', NULL, 0, NOW() - INTERVAL 1 DAY);

-- ========================================
-- 2. 学生用户项目数据（2021001, ID=1）
-- ========================================

-- 待审核项目
INSERT INTO project (project_no, title, category, description, plan, expected_result, target_area, start_date, end_date, budget, leader_id, leader_phone, teacher_id, teacher_name, college_id, status, reject_reason, is_excellent, created_at) VALUES
('PRJ2026011', '社区志愿服务活动', '志愿服务', '深入社区开展志愿服务活动，关爱老人儿童，提升社区服务质量。', '第一周：社区调研，了解需求\n第二周：开展志愿服务活动\n第三周：总结反馈，建立长效机制', '完成社区志愿服务报告，建立志愿服务档案', '北京市朝阳区', '2026-07-05', '2026-07-20', 3000.00, 1, '13800138001', 8, '陈教授', 1, 'pending', NULL, 0, NOW() - INTERVAL 1 DAY),

-- 学院已审核项目
('PRJ2026012', '传统文化进校园', '文化传承', '将传统文化带入校园，开展传统文化教育活动，提升学生文化素养。', '第一周：策划活动方案\n第二周：开展传统文化讲座\n第三周：组织文化体验活动', '完成传统文化教育活动报告，制作宣传材料', '上海市浦东新区', '2026-06-25', '2026-07-10', 4000.00, 1, '13800138001', 9, '李教授', 2, 'college_approved', NULL, 0, NOW() - INTERVAL 3 DAY),

-- 已立项项目
('PRJ2026013', '环保意识调研', '环保宣传', '调研公众环保意识现状，开展环保宣传活动，提升环保意识。', '第一周：设计调研问卷\n第二周：开展实地调研\n第三周：分析数据，撰写报告', '完成环保意识调研报告，提出环保建议', '广州市天河区', '2026-08-05', '2026-08-20', 3500.00, 1, '13800138001', 10, '张教授', 3, 'approved', NULL, 0, NOW() - INTERVAL 5 DAY),

-- 已驳回项目
('PRJ2026014', '科技创新实践', '科技创新', '开展科技创新实践活动，培养学生的创新思维和实践能力。', '第一周：确定创新项目\n第二周：开展创新实践\n第三周：成果展示与总结', '完成科技创新项目报告，形成创新成果', '深圳市南山区', '2026-07-15', '2026-07-30', 6000.00, 1, '13800138001', 11, '王教授', 1, 'rejected', '项目创新性不足，需要进一步优化方案', 0, NOW() - INTERVAL 7 DAY),

-- 已撤回项目
('PRJ2026015', '健康生活推广', '健康宣传', '推广健康生活方式，开展健康知识宣传活动，提升公众健康意识。', '第一周：健康知识调研\n第二周：开展健康宣传活动\n第三周：效果评估与总结', '完成健康生活推广报告，建立健康档案', '成都市武侯区', '2026-06-10', '2026-06-25', 2500.00, 1, '13800138001', 12, '刘教授', 2, 'withdrawn', NULL, 0, NOW() - INTERVAL 10 DAY),

-- 已结项项目
('PRJ6010', '乡村振兴调研实践', '乡村振兴', '深入农村基层，调研乡村振兴战略实施情况，了解农村发展现状与需求。', '第一周：实地走访调研，收集一手资料\n第二周：数据整理与分析，撰写调研报告', '完成调研报告一份，提出乡村振兴建议方案', '湖南省长沙市望城区', '2026-05-01', '2026-05-15', 5000.00, 1, '13800138001', 8, '陈教授', 1, 'closed', NULL, 1, NOW() - INTERVAL 30 DAY);

-- ========================================
-- 3. 项目成员数据
-- ========================================

INSERT INTO project_member (project_id, user_id, role, responsibility, created_at) VALUES
-- 其他项目成员
(2, 2, 'leader', '项目负责人，统筹协调', NOW()),
(2, 14, 'member', '调研员，负责资料收集', NOW()),
(2, 15, 'member', '宣传员，负责活动组织', NOW()),
(4, 6, 'leader', '项目负责人，统筹协调', NOW()),
(4, 19, 'member', '技术员，负责技术推广', NOW()),
(4, 20, 'member', '培训师，负责技术培训', NOW()),
(5, 7, 'leader', '项目负责人，统筹协调', NOW()),
(5, 23, 'member', '教师，负责教学工作', NOW()),
(5, 24, 'member', '活动组织员，负责文体活动', NOW()),
(6, 8, 'leader', '项目负责人，统筹协调', NOW()),
(6, 26, 'member', '记录员，负责技艺记录', NOW()),
(6, 27, 'member', '摄影师，负责拍摄工作', NOW()),
(7, 9, 'leader', '项目负责人，统筹协调', NOW()),
(7, 28, 'member', '调研员，负责实地调研', NOW()),
(8, 10, 'leader', '项目负责人，统筹协调', NOW()),
(8, 29, 'member', '宣传员，负责科普宣传', NOW()),
(8, 30, 'member', '调研员，负责健康调研', NOW()),
(9, 11, 'leader', '项目负责人，统筹协调', NOW()),
(9, 31, 'member', '市场调研员，负责市场分析', NOW()),

-- 学生项目成员
(11, 1, 'leader', '项目负责人，统筹协调', NOW()),
(11, 12, 'member', '活动组织员，负责活动策划', NOW()),
(11, 13, 'member', '宣传员，负责宣传工作', NOW()),
(12, 1, 'leader', '项目负责人，统筹协调', NOW()),
(12, 14, 'member', '策划员，负责活动策划', NOW()),
(12, 15, 'member', '执行员，负责活动执行', NOW()),
(13, 1, 'leader', '项目负责人，统筹协调', NOW()),
(13, 16, 'member', '调研员，负责数据收集', NOW()),
(13, 17, 'member', '分析师，负责数据分析', NOW()),
(14, 1, 'leader', '项目负责人，统筹协调', NOW()),
(14, 18, 'member', '技术员，负责技术支持', NOW()),
(14, 19, 'member', '研究员，负责研究工作', NOW()),
(15, 1, 'leader', '项目负责人，统筹协调', NOW()),
(15, 20, 'member', '调研员，负责健康调研', NOW()),
(15, 21, 'member', '宣传员，负责健康宣传', NOW()),
(10, 1, 'leader', '项目负责人，统筹协调', NOW()),
(10, 12, 'member', '调研员，负责实地调研', NOW()),
(10, 13, 'member', '数据分析员，负责数据处理', NOW()),
(10, 32, 'member', '报告撰写员，负责报告撰写', NOW());

-- ========================================
-- 4. 审批记录数据
-- ========================================

INSERT INTO approval_record (project_id, approver_id, approval_level, action, opinion, created_at) VALUES
(4, 2, 'college', 'approve', '项目方案切实可行，同意申报', NOW() - INTERVAL 2 DAY),
(5, 5, 'college', 'approve', '项目有意义，方案详细，同意推荐', NOW() - INTERVAL 4 DAY),
(5, 1, 'school', 'approve', '项目立意良好，实施方案可行，同意立项', NOW() - INTERVAL 2 DAY),
(6, 6, 'college', 'approve', '文化保护项目很有价值，支持开展', NOW() - INTERVAL 6 DAY),
(6, 1, 'school', 'approve', '非遗保护具有重要意义，同意立项', NOW() - INTERVAL 4 DAY),
(7, 2, 'college', 'reject', '实践方案不够具体，需要进一步细化调研内容和方法', NOW() - INTERVAL 4 DAY),
(8, 5, 'college', 'reject', '活动时间安排不合理，与学校课程时间冲突', NOW() - INTERVAL 2 DAY),
(12, 2, 'college', 'approve', '传统文化项目很有意义，方案详细，同意申报', NOW() - INTERVAL 2 DAY),
(13, 2, 'college', 'approve', '环保调研项目立意很好，实施方案可行', NOW() - INTERVAL 4 DAY),
(13, 1, 'school', 'approve', '环保意识调研具有重要意义，同意立项', NOW() - INTERVAL 3 DAY),
(14, 2, 'college', 'reject', '项目创新性不足，需要进一步优化方案', NOW() - INTERVAL 6 DAY);

-- ========================================
-- 5. 进度记录数据
-- ========================================

INSERT INTO progress (project_id, title, content, progress_date, location, creator_id, created_at) VALUES
(5, '项目启动会议', '召开项目启动会议，明确分工安排，制定详细实施计划。', '2026-06-15', '学校会议室', 7, NOW() - INTERVAL 10 DAY),
(5, '前期调研准备', '完成文献调研，设计调研问卷，联系当地相关部门。', '2026-06-18', '学校图书馆', 7, NOW() - INTERVAL 8 DAY),
(5, '实地调研开展', '赴贵州黔东南开展实地调研，走访3个乡镇，收集一手资料。', '2026-06-22', '贵州省黔东南州', 7, NOW() - INTERVAL 5 DAY),
(6, '传承人寻访', '赴大理州寻访非遗传承人，记录传统技艺，收集相关资料。', '2026-06-18', '云南省大理州', 8, NOW() - INTERVAL 12 DAY),
(6, '技艺记录整理', '整理收集到的非遗技艺资料，进行分类归档。', '2026-06-22', '学校工作室', 8, NOW() - INTERVAL 8 DAY),
(10, '调研方案制定', '制定详细的乡村振兴调研方案，确定调研对象和方法。', '2026-05-03', '学校会议室', 1, NOW() - INTERVAL 35 DAY),
(10, '实地调研执行', '深入望城区5个行政村开展实地调研，收集问卷和访谈资料。', '2026-05-08', '湖南省长沙市望城区', 1, NOW() - INTERVAL 30 DAY),
(10, '数据整理分析', '整理调研数据，进行统计分析，撰写调研报告初稿。', '2026-05-12', '学校实验室', 1, NOW() - INTERVAL 28 DAY),
(10, '报告完善提交', '完善调研报告，形成最终成果，提交相关部门。', '2026-05-14', '学校办公室', 1, NOW() - INTERVAL 25 DAY),
(13, '项目启动会议', '召开环保意识调研项目启动会议，明确分工安排。', '2026-07-01', '学校会议室', 1, NOW() - INTERVAL 4 DAY),
(13, '调研问卷设计', '设计环保意识调研问卷，确定调研对象和方法。', '2026-07-05', '学校图书馆', 1, NOW() - INTERVAL 3 DAY),
(13, '实地调研开展', '在广州市天河区开展环保意识实地调研。', '2026-07-10', '广州市天河区', 1, NOW() - INTERVAL 2 DAY);

-- ========================================
-- 6. 成果材料数据
-- ========================================

INSERT INTO result (project_id, title, category, description, cover_url, creator_id, status, created_at) VALUES
(5, '教育帮扶调研报告', 'report', '详细记录了贵州黔东南地区教育现状和帮扶实践的调研报告。', '/uploads/covers/education_report.jpg', 7, 'published', NOW() - INTERVAL 3 DAY),
(5, '支教活动照片集', 'other', '记录支教过程中的精彩瞬间和感人故事的照片集合。', '/uploads/covers/education_photos.jpg', 7, 'published', NOW() - INTERVAL 2 DAY),
(6, '非遗技艺记录片', 'video', '记录大理州非物质文化遗产传承人技艺的纪录片。', '/uploads/covers/heritage_video.jpg', 8, 'published', NOW() - INTERVAL 2 DAY),
(6, '非遗保护调研报告', 'report', '关于大理州非遗保护现状和传承发展的调研报告。', '/uploads/covers/heritage_report.jpg', 8, 'published', NOW() - INTERVAL 1 DAY),
(10, '乡村振兴调研报告', 'report', '深入调研望城区乡村振兴战略实施情况的详细报告。', '/uploads/covers/rural_report.jpg', 1, 'published', NOW() - INTERVAL 20 DAY),
(10, '调研数据统计分析', 'data', '乡村振兴调研的原始数据和统计分析结果。', '/uploads/covers/data_analysis.jpg', 1, 'published', NOW() - INTERVAL 18 DAY),
(10, '实践照片集', 'other', '记录乡村振兴调研实践过程中的照片集合。', '/uploads/covers/practice_photos.jpg', 1, 'published', NOW() - INTERVAL 15 DAY),
(13, '环保意识调研报告', 'report', '关于广州市天河区公众环保意识现状的详细调研报告。', '/uploads/covers/env_report.jpg', 1, 'published', NOW() - INTERVAL 1 DAY),
(13, '环保宣传手册', 'other', '环保知识宣传手册，包含环保小知识和实用建议。', '/uploads/covers/env_manual.jpg', 1, 'published', NOW() - INTERVAL 1 DAY);

-- 成果附件数据
INSERT INTO result_attachment (result_id, file_name, file_url, file_size, file_type, created_at) VALUES
(1, '教育帮扶调研报告.pdf', '/uploads/reports/education_report.pdf', 2048576, 'pdf', NOW() - INTERVAL 3 DAY),
(3, '非遗技艺记录片.mp4', '/uploads/videos/heritage_video.mp4', 52428800, 'video', NOW() - INTERVAL 2 DAY),
(5, '乡村振兴调研报告.pdf', '/uploads/reports/rural_revitalization_report.pdf', 3145728, 'pdf', NOW() - INTERVAL 20 DAY),
(8, '环保意识调研报告.pdf', '/uploads/reports/environmental_report.pdf', 1536789, 'pdf', NOW() - INTERVAL 1 DAY);

-- 成果图片数据
INSERT INTO result_image (result_id, image_url, sort, created_at) VALUES
(2, '/uploads/images/education_01.jpg', 1, NOW() - INTERVAL 2 DAY),
(2, '/uploads/images/education_02.jpg', 2, NOW() - INTERVAL 2 DAY),
(2, '/uploads/images/education_03.jpg', 3, NOW() - INTERVAL 2 DAY),
(7, '/uploads/images/rural_01.jpg', 1, NOW() - INTERVAL 15 DAY),
(7, '/uploads/images/rural_02.jpg', 2, NOW() - INTERVAL 15 DAY),
(7, '/uploads/images/rural_03.jpg', 3, NOW() - INTERVAL 15 DAY),
(9, '/uploads/images/env_activity_01.jpg', 1, NOW() - INTERVAL 1 DAY),
(9, '/uploads/images/env_activity_02.jpg', 2, NOW() - INTERVAL 1 DAY),
(9, '/uploads/images/env_activity_03.jpg', 3, NOW() - INTERVAL 1 DAY);

-- ========================================
-- 7. 评优活动数据
-- ========================================

INSERT INTO evaluation (title, year, description, start_time, end_time, status, created_at) VALUES
('2026年暑期三下乡优秀项目评选', 2026, '评选2026年暑期三下乡社会实践活动中的优秀项目，表彰先进，树立典型。', '2026-08-01', '2026-08-31', 'ongoing', NOW() - INTERVAL 10 DAY),
('2026年春季三下乡项目评优', 2026, '对春季学期开展的三下乡项目进行评优，总结经验，推广典型。', '2026-06-01', '2026-06-30', 'finished', NOW() - INTERVAL 60 DAY);

-- 评优评分数据
INSERT INTO evaluation_score (evaluation_id, project_id, expert_id, score_innovation, score_practice, score_effect, score_report, total_score, comment, created_at) VALUES
(1, 5, 13, 85.0, 85.0, 85.0, 85.0, 85.0, '项目立意很好，教育帮扶工作扎实，成果丰硕，建议加强后续跟踪。', NOW() - INTERVAL 5 DAY),
(1, 5, 14, 88.0, 88.0, 88.0, 88.0, 88.0, '支教活动很有意义，团队配合默契，报告质量较高。', NOW() - INTERVAL 4 DAY),
(1, 6, 13, 90.0, 90.0, 90.0, 90.0, 90.0, '非遗保护项目很有价值，记录工作细致，建议加大宣传推广力度。', NOW() - INTERVAL 3 DAY),
(1, 6, 14, 87.0, 87.0, 87.0, 87.0, 87.0, '传统文化保护很有意义，实践成果丰富，值得推广。', NOW() - INTERVAL 2 DAY),
(1, 13, 13, 86.0, 86.0, 86.0, 86.0, 86.0, '环保意识调研项目很有意义，数据详实，建议加强宣传推广。', NOW() - INTERVAL 1 DAY),
(2, 10, 13, 92.0, 92.0, 92.0, 92.0, 92.0, '乡村振兴调研深入扎实，数据详实，建议具有很强的参考价值。', NOW() - INTERVAL 50 DAY),
(2, 10, 14, 89.0, 89.0, 89.0, 89.0, 89.0, '调研方法科学，报告质量高，对当地发展有积极意义。', NOW() - INTERVAL 49 DAY);

-- ========================================
-- 8. 通知公告数据
-- ========================================

INSERT INTO notice (title, type, summary, content, source, publisher_id, is_top, status, publish_time, created_at) VALUES
('关于开展2026年暑期三下乡活动的通知', 'activity', '正式启动2026年暑期三下乡社会实践活动，请各学院积极组织参与。', '为深入学习贯彻习近平新时代中国特色社会主义思想，引导广大青年学生在社会实践中受教育、长才干、作贡献，学校决定开展2026年暑期三下乡社会实践活动。现将有关事项通知如下：\n\n一、活动时间\n2026年7月-8月\n\n二、参与对象\n全校在读本科生、研究生\n\n三、活动内容\n乡村振兴、教育帮扶、文化传承、科技支农等\n\n四、申报要求\n请各学院于6月30日前完成项目申报工作。', '学校团委', 1, 1, 'published', NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 16 DAY),
('三下乡项目申报指南', 'guide', '发布2026年三下乡项目申报指南，明确申报要求和流程。', '为规范三下乡项目申报工作，提高项目质量，特发布本指南。\n\n一、申报条件\n1. 项目负责人须为在校本科生或研究生\n2. 项目团队人数不少于3人，不超过10人\n3. 必须有指导教师\n\n二、申报流程\n1. 网上填报项目申报书\n2. 学院初审推荐\n3. 学校审核立项\n\n三、材料要求\n1. 项目申报书\n2. 实施方案\n3. 安全预案', '学校团委', 1, 0, 'published', NOW() - INTERVAL 12 DAY, NOW() - INTERVAL 13 DAY),
('2026年春季三下乡优秀项目表彰决定', 'result', '表彰2026年春季三下乡社会实践优秀项目和先进个人。', '根据《三下乡社会实践活动管理办法》，经各学院推荐、专家评审、学校审定，决定对以下优秀项目和先进个人予以表彰：\n\n一、优秀项目（10项）\n1. 乡村振兴调研实践（一等奖）\n2. 红色文化传承实践（二等奖）\n...\n\n二、先进个人（20名）\n张三、李四、王五...\n\n希望受表彰的集体和个人珍惜荣誉，再接再厉，在今后的社会实践活动中取得更大成绩。', '学校团委', 1, 0, 'published', NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 21 DAY),
('三下乡安全工作提醒', 'notice', '暑期三下乡实践活动安全注意事项提醒。', '各实践团队：\n\n暑期将至，为确保三下乡社会实践活动安全顺利进行，特提醒以下注意事项：\n\n1. 严格遵守安全规定，确保人身安全\n2. 注意交通安全，遵守交通规则\n3. 注意饮食卫生，防止食物中毒\n4. 保持通讯畅通，及时报告情况\n5. 购买意外保险，做好应急准备\n\n祝各团队实践顺利！', '学校团委', 1, 0, 'published', NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 6 DAY);

-- 通知附件数据
INSERT INTO notice_attachment (notice_id, file_name, file_url, file_size, file_type, created_at) VALUES
(1, '2026年暑期三下乡活动通知.pdf', '/uploads/notices/summer2026_notice.pdf', 1048576, 'pdf', NOW() - INTERVAL 16 DAY),
(2, '项目申报指南.docx', '/uploads/notices/application_guide.docx', 524288, 'docx', NOW() - INTERVAL 13 DAY);

-- ========================================
-- 9. 系统消息数据
-- ========================================

INSERT INTO sys_message (user_id, title, content, type, related_type, related_id, is_read, created_at) VALUES
-- 学生消息
(1, '项目申报学院审核通过', '您的项目"传统文化进校园"已通过学院审核，请等待校级审核。', 'approval', 'project', 12, 0, NOW() - INTERVAL 2 DAY),
(1, '项目申报校级审核通过', '您的项目"环保意识调研"已通过校级审核，项目已立项。', 'approval', 'project', 13, 0, NOW() - INTERVAL 3 DAY),
(1, '项目申报被驳回', '您的项目"科技创新实践"被驳回，原因：项目创新性不足，需要进一步优化方案。', 'approval', 'project', 14, 0, NOW() - INTERVAL 6 DAY),
(1, '项目进度更新', '您参与的项目"环保意识调研"有新的进度更新。', 'progress', 'project', 13, 0, NOW() - INTERVAL 2 DAY),
(1, '项目成果发布', '您参与的项目"环保意识调研"发布了新的成果材料。', 'result', 'project', 13, 0, NOW() - INTERVAL 1 DAY),

-- 其他用户消息
(2, '项目申报审核通过', '您的项目"红色文化传承实践"已通过学院审核，请等待校级审核。', 'approval', 'project', 2, 0, NOW() - INTERVAL 1 DAY),
(7, '项目进度更新', '您参与的项目"教育帮扶暖童心"有新的进度更新。', 'progress', 'project', 5, 0, NOW() - INTERVAL 3 DAY),
(8, '项目成果发布', '您参与的项目"非遗文化保护行动"发布了新的成果材料。', 'result', 'project', 6, 0, NOW() - INTERVAL 2 DAY),
(9, '项目申报被驳回', '您的项目"城市文明创建调研"被驳回，原因：实践方案不够具体。', 'approval', 'project', 7, 0, NOW() - INTERVAL 4 DAY);

-- ========================================
-- 数据统计
-- ========================================

SELECT '完整演示数据初始化完成' as status,
       (SELECT COUNT(*) FROM project) as project_count,
       (SELECT COUNT(*) FROM progress) as progress_count,
       (SELECT COUNT(*) FROM result) as result_count,
       (SELECT COUNT(*) FROM evaluation) as evaluation_count,
       (SELECT COUNT(*) FROM notice) as notice_count,
       (SELECT COUNT(*) FROM sys_message) as message_count,
       (SELECT COUNT(*) FROM project WHERE leader_id = 1 OR EXISTS (SELECT 1 FROM project_member pm WHERE pm.project_id = project.id AND pm.user_id = 1)) as student_project_count;
