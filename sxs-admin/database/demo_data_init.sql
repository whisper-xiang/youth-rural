-- ========================================
-- 三下乡活动管理系统演示数据初始化脚本
-- 用于确保前端每个页面每种状态都有完整数据
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
ALTER TABLE approval_record AUTO_INCREMENT = 1;
ALTER TABLE project AUTO_INCREMENT = 1;
ALTER TABLE progress AUTO_INCREMENT = 1;
ALTER TABLE result AUTO_INCREMENT = 1;
ALTER TABLE evaluation AUTO_INCREMENT = 1;
ALTER TABLE notice AUTO_INCREMENT = 1;

-- ========================================
-- 1. 项目申报数据（覆盖所有状态）
-- ========================================

-- 草稿状态项目
INSERT INTO project (
  id, title, category, target_area, start_date, end_date, 
  leader_id, teacher_id, college_id, description, plan, expected_result,
  status, created_at
) VALUES 
(1, '乡村振兴调研计划（草稿）', '乡村振兴', '湖南省长沙市望城区', 
 '2026-07-01', '2026-07-15', 3, 8, 1,
 '深入农村基层，调研乡村振兴战略实施情况，了解农村发展现状与需求。',
 '第一周：实地走访调研，收集一手资料\n第二周：数据整理与分析，撰写调研报告',
 '完成调研报告一份，提出乡村振兴建议方案',
 'draft', NOW());

-- 待学院审核项目
INSERT INTO project (
  id, title, category, target_area, start_date, end_date, team_name, 
  leader_id, teacher_id, college_id, description, plan, expected_result,
  status, created_at
) VALUES 
(2, '红色文化传承实践', '文化传承', '江西省井冈山市', 
 '2026-07-10', '2026-07-25', '红色先锋队', 4, 9, 2,
 '探访革命老区，传承红色基因，开展红色文化教育活动。',
 '第一周：参观革命遗址，收集历史资料\n第二周：开展红色教育活动，撰写实践报告',
 '完成红色文化调研报告，制作宣传视频',
 'pending', NOW() - INTERVAL 2 DAY),

(3, '环保宣传进社区', '环保宣传', '广东省深圳市南山区', 
 '2026-08-01', '2026-08-15', '绿色使者队', 5, 10, 3,
 '深入社区开展环保知识宣传，提高居民环保意识，推广绿色生活方式。',
 '第一周：社区调研，了解环保现状\n第二周：开展宣传活动，收集反馈意见',
 '完成社区环保调研报告，建立环保宣传档案',
 'pending', NOW() - INTERVAL 1 DAY);

-- 学院已审核项目
INSERT INTO project (
  id, title, category, target_area, start_date, end_date, team_name, 
  leader_id, teacher_id, college_id, description, plan, expected_result,
  status, created_at
) VALUES 
(4, '科技支农助振兴', '科技支农', '四川省成都市郫都区', 
 '2026-07-05', '2026-07-20', '科技助农队', 6, 11, 1,
 '运用现代科技手段帮助农业生产，推广农业新技术，提高农业生产效率。',
 '第一周：调研当地农业现状\n第二周：推广农业技术，开展培训活动',
 '完成科技支农报告，建立技术指导档案',
 'college_approved', NOW() - INTERVAL 3 DAY);

-- 校级已审核项目（已立项）
INSERT INTO project (
  id, title, category, target_area, start_date, end_date, team_name, 
  leader_id, teacher_id, college_id, description, plan, expected_result,
  status, created_at, approved_at
) VALUES 
(5, '教育帮扶暖童心', '教育帮扶', '贵州省黔东南州', 
 '2026-06-20', '2026-07-10', '爱心支教队', 7, 12, 2,
 '赴偏远地区开展教育帮扶活动，为当地儿童提供教育支持和关爱。',
 '第一周：开展教学活动，了解教育现状\n第二周：组织文体活动，进行家访调研',
 '完成教育帮扶报告，建立长期帮扶机制',
 'approved', NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 2 DAY),

(6, '非遗文化保护行动', '文化保护', '云南省大理州', 
 '2026-06-15', '2026-06-30', '非遗守护队', 8, 13, 3,
 '探访非物质文化遗产传承人，记录传统技艺，开展文化保护宣传。',
 '第一周：寻访非遗传承人，记录技艺\n第二周：开展保护宣传活动，制作纪录片',
 '完成非遗调研报告，制作宣传纪录片',
 'approved', NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 4 DAY);

-- 已驳回项目
INSERT INTO project (
  id, title, category, target_area, start_date, end_date, team_name, 
  leader_id, teacher_id, college_id, description, plan, expected_result,
  status, created_at, reject_reason
) VALUES 
(7, '城市文明创建调研', '社会调研', '浙江省杭州市', 
 '2026-07-20', '2026-08-05', '文明观察队', 9, 14, 1,
 '调研城市文明创建工作，总结经验做法，提出改进建议。',
 '第一周：实地调研，收集资料\n第二周：分析总结，撰写报告',
 '完成城市文明调研报告，提出改进建议',
 'rejected', NOW() - INTERVAL 4 DAY, '实践方案不够具体，需要进一步细化调研内容和方法'),

(8, '健康生活科普活动', '科普宣传', '江苏省南京市', 
 '2026-08-10', '2026-08-25', '健康科普队', 10, 15, 2,
 '开展健康生活科普宣传活动，提高居民健康意识和生活质量。',
 '第一周：健康知识调研\n第二周：科普宣传活动',
 '完成健康科普报告，建立宣传档案',
 'rejected', NOW() - INTERVAL 2 DAY, '活动时间安排不合理，与学校课程时间冲突');

-- 已撤回项目
INSERT INTO project (
  id, title, category, target_area, start_date, end_date, team_name, 
  leader_id, teacher_id, college_id, description, plan, expected_result,
  status, created_at
) VALUES 
(9, '创新创业实践', '创新创业', '上海市浦东新区', 
 '2026-09-01', '2026-09-15', '创新实践队', 11, 16, 3,
 '开展创新创业实践活动，培养创新精神，提升创业能力。',
 '第一周：市场调研，项目策划\n第二周：实践验证，总结提升',
 '完成创新创业报告，形成项目方案',
 'withdrawn', NOW() - INTERVAL 1 DAY);

-- 已结项项目
INSERT INTO project (
  id, title, category, target_area, start_date, end_date, team_name, 
  leader_id, teacher_id, college_id, description, plan, expected_result,
  status, created_at, approved_at, summary, achievements, impact
) VALUES 
(10, '乡村振兴调研实践', '乡村振兴', '湖南省长沙市望城区', 
 '2026-05-01', '2026-05-15', '青春筑梦队', 3, 8, 1,
 '深入农村基层，调研乡村振兴战略实施情况，了解农村发展现状与需求。',
 '第一周：实地走访调研，收集一手资料\n第二周：数据整理与分析，撰写调研报告',
 '完成调研报告一份，提出乡村振兴建议方案',
 'closed', NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 25 DAY,
 '项目顺利完成，深入调研了5个行政村，收集有效问卷200余份，访谈村民50余人。',
 '形成高质量调研报告1份，政策建议3条，获得当地政府采纳建议1条。',
 '为当地乡村振兴提供了有价值的数据支撑和建议，受到村民和干部一致好评。');

-- ========================================
-- 2. 项目成员数据
-- ========================================
INSERT INTO project_member (project_id, user_id, role, created_at) VALUES
-- 项目1成员（草稿状态）
(1, 3, 'leader', NOW()),
(1, 12, 'member', NOW()),
(1, 13, 'member', NOW()),

-- 项目2成员（待审核）
(2, 4, 'leader', NOW()),
(2, 14, 'member', NOW()),
(2, 15, 'member', NOW()),
(2, 16, 'member', NOW()),

-- 项目3成员（待审核）
(3, 5, 'leader', NOW()),
(3, 17, 'member', NOW()),
(3, 18, 'member', NOW()),

-- 项目4成员（学院已审）
(4, 6, 'leader', NOW()),
(4, 19, 'member', NOW()),
(4, 20, 'member', NOW()),
(4, 21, 'member', NOW()),
(4, 22, 'member', NOW()),

-- 项目5成员（已立项）
(5, 7, 'leader', NOW()),
(5, 23, 'member', NOW()),
(5, 24, 'member', NOW()),
(5, 25, 'member', NOW()),

-- 项目6成员（已立项）
(6, 8, 'leader', NOW()),
(6, 26, 'member', NOW()),
(6, 27, 'member', NOW()),

-- 项目7成员（已驳回）
(7, 9, 'leader', NOW()),
(7, 28, 'member', NOW()),

-- 项目8成员（已驳回）
(8, 10, 'leader', NOW()),
(8, 29, 'member', NOW()),
(8, 30, 'member', NOW()),

-- 项目9成员（已撤回）
(9, 11, 'leader', NOW()),
(9, 31, 'member', NOW()),

-- 项目10成员（已结项）
(10, 3, 'leader', NOW()),
(10, 12, 'member', NOW()),
(10, 13, 'member', NOW()),
(10, 32, 'member', NOW());

-- ========================================
-- 3. 审批记录数据
-- ========================================
INSERT INTO approval_record (
  project_id, approver_id, approval_level, action, opinion, created_at
) VALUES
-- 项目4的学院审批记录
(4, 2, 'college', 'approve', '项目方案切实可行，同意申报', NOW() - INTERVAL 2 DAY),

-- 项目5的审批记录
(5, 5, 'college', 'approve', '项目有意义，方案详细，同意推荐', NOW() - INTERVAL 4 DAY),
(5, 1, 'school', 'approve', '项目立意良好，实施方案可行，同意立项', NOW() - INTERVAL 2 DAY),

-- 项目6的审批记录
(6, 6, 'college', 'approve', '文化保护项目很有价值，支持开展', NOW() - INTERVAL 6 DAY),
(6, 1, 'school', 'approve', '非遗保护具有重要意义，同意立项', NOW() - INTERVAL 4 DAY),

-- 项目7的驳回记录
(7, 2, 'college', 'reject', '实践方案不够具体，需要进一步细化调研内容和方法', NOW() - INTERVAL 4 DAY),

-- 项目8的驳回记录
(8, 5, 'college', 'reject', '活动时间安排不合理，与学校课程时间冲突', NOW() - INTERVAL 2 DAY);

-- ========================================
-- 4. 进度记录数据
-- ========================================
INSERT INTO progress (
  id, project_id, title, description, status, created_at
) VALUES
-- 项目5的进度记录（已立项）
(1, 5, '项目启动会议', '召开项目启动会议，明确分工安排，制定详细实施计划。', 'published', NOW() - INTERVAL 10 DAY),
(2, 5, '前期调研准备', '完成文献调研，设计调研问卷，联系当地相关部门。', 'published', NOW() - INTERVAL 8 DAY),
(3, 5, '实地调研开展', '赴贵州黔东南开展实地调研，走访3个乡镇，收集一手资料。', 'published', NOW() - INTERVAL 5 DAY),

-- 项目6的进度记录（已立项）
(4, 6, '传承人寻访', '赴大理州寻访非遗传承人，记录传统技艺，收集相关资料。', 'published', NOW() - INTERVAL 12 DAY),
(5, 6, '技艺记录整理', '整理收集到的非遗技艺资料，进行分类归档。', 'published', NOW() - INTERVAL 8 DAY),

-- 项目10的进度记录（已结项）
(6, 10, '调研方案制定', '制定详细的乡村振兴调研方案，确定调研对象和方法。', 'published', NOW() - INTERVAL 35 DAY),
(7, 10, '实地调研执行', '深入望城区5个行政村开展实地调研，收集问卷和访谈资料。', 'published', NOW() - INTERVAL 30 DAY),
(8, 10, '数据整理分析', '整理调研数据，进行统计分析，撰写调研报告初稿。', 'published', NOW() - INTERVAL 28 DAY),
(9, 10, '报告完善提交', '完善调研报告，形成最终成果，提交相关部门。', 'published', NOW() - INTERVAL 25 DAY);

-- ========================================
-- 5. 成果材料数据
-- ========================================
INSERT INTO result (
  id, project_id, title, category, status, created_at
) VALUES
-- 项目5的成果
(1, 5, '教育帮扶调研报告', 'report', 'published', NOW() - INTERVAL 3 DAY),
(2, 5, '支教活动照片集', 'other', 'published', NOW() - INTERVAL 2 DAY),

-- 项目6的成果
(3, 6, '非遗技艺记录片', 'video', 'published', NOW() - INTERVAL 2 DAY),
(4, 6, '非遗保护调研报告', 'report', 'published', NOW() - INTERVAL 1 DAY),

-- 项目10的成果（已结项）
(5, 10, '乡村振兴调研报告', 'report', 'published', NOW() - INTERVAL 20 DAY),
(6, 10, '调研数据统计分析', 'data', 'published', NOW() - INTERVAL 18 DAY),
(7, 10, '实践照片集', 'other', 'published', NOW() - INTERVAL 15 DAY);

-- 成果附件数据
INSERT INTO result_attachment (
  result_id, file_name, file_url, file_size, file_type, created_at
) VALUES
(1, '教育帮扶调研报告.pdf', '/uploads/reports/education_report.pdf', 2048576, 'application/pdf', NOW() - INTERVAL 3 DAY),
(3, '非遗技艺记录片.mp4', '/uploads/videos/heritage_video.mp4', 52428800, 'video/mp4', NOW() - INTERVAL 2 DAY),
(5, '乡村振兴调研报告.pdf', '/uploads/reports/rural_revitalization_report.pdf', 3145728, 'application/pdf', NOW() - INTERVAL 20 DAY);

-- 成果图片数据
INSERT INTO result_image (
  result_id, image_url, sort, created_at
) VALUES
(2, '/uploads/images/education_01.jpg', 1, NOW() - INTERVAL 2 DAY),
(2, '/uploads/images/education_02.jpg', 2, NOW() - INTERVAL 2 DAY),
(2, '/uploads/images/education_03.jpg', 3, NOW() - INTERVAL 2 DAY),
(7, '/uploads/images/rural_01.jpg', 1, NOW() - INTERVAL 15 DAY),
(7, '/uploads/images/rural_02.jpg', 2, NOW() - INTERVAL 15 DAY),
(7, '/uploads/images/rural_03.jpg', 3, NOW() - INTERVAL 15 DAY);

-- ========================================
-- 6. 评优活动数据
-- ========================================
INSERT INTO evaluation (
  id, title, description, start_time, end_time, status, created_at
) VALUES
(1, '2026年暑期三下乡优秀项目评选', '评选2026年暑期三下乡社会实践活动中的优秀项目，表彰先进，树立典型。', 
 '2026-08-01', '2026-08-31', 'active', NOW() - INTERVAL 10 DAY),

(2, '2026年春季三下乡项目评优', '对春季学期开展的三下乡项目进行评优，总结经验，推广典型。', 
 '2026-06-01', '2026-06-30', 'completed', NOW() - INTERVAL 60 DAY);

-- 评优评分数据
INSERT INTO evaluation_score (
  evaluation_id, project_id, expert_id, score, comment, created_at
) VALUES
-- 活动1的评分（进行中）
(1, 5, 13, 85, '项目立意很好，教育帮扶工作扎实，成果丰硕，建议加强后续跟踪。', NOW() - INTERVAL 5 DAY),
(1, 5, 14, 88, '支教活动很有意义，团队配合默契，报告质量较高。', NOW() - INTERVAL 4 DAY),
(1, 6, 13, 90, '非遗保护项目很有价值，记录工作细致，建议加大宣传推广力度。', NOW() - INTERVAL 3 DAY),
(1, 6, 14, 87, '传统文化保护很有意义，实践成果丰富，值得推广。', NOW() - INTERVAL 2 DAY),

-- 活动2的评分（已完成）
(2, 10, 13, 92, '乡村振兴调研深入扎实，数据详实，建议具有很强的参考价值。', NOW() - INTERVAL 50 DAY),
(2, 10, 14, 89, '调研方法科学，报告质量高，对当地发展有积极意义。', NOW() - INTERVAL 49 DAY);

-- 更新评优结果
UPDATE evaluation SET 
  final_score = 90.5,
  award_level = '一等奖',
  completed_at = NOW() - INTERVAL 30 DAY
WHERE id = 2;

-- ========================================
-- 7. 通知公告数据
-- ========================================
INSERT INTO notice (
  id, title, type, summary, content, source, publisher_id, is_top, status, publish_time, created_at
) VALUES
(1, '关于开展2026年暑期三下乡活动的通知', 'activity', 
 '正式启动2026年暑期三下乡社会实践活动，请各学院积极组织参与。', 
 '为深入学习贯彻习近平新时代中国特色社会主义思想，引导广大青年学生在社会实践中受教育、长才干、作贡献，学校决定开展2026年暑期三下乡社会实践活动。现将有关事项通知如下：\n\n一、活动时间\n2026年7月-8月\n\n二、参与对象\n全校在读本科生、研究生\n\n三、活动内容\n乡村振兴、教育帮扶、文化传承、科技支农等\n\n四、申报要求\n请各学院于6月30日前完成项目申报工作。',
 '学校团委', 1, 1, 'published', NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 16 DAY),

(2, '三下乡项目申报指南', 'guide', 
 '发布2026年三下乡项目申报指南，明确申报要求和流程。', 
 '为规范三下乡项目申报工作，提高项目质量，特发布本指南。\n\n一、申报条件\n1. 项目负责人须为在校本科生或研究生\n2. 项目团队人数不少于3人，不超过10人\n3. 必须有指导教师\n\n二、申报流程\n1. 网上填报项目申报书\n2. 学院初审推荐\n3. 学校审核立项\n\n三、材料要求\n1. 项目申报书\n2. 实施方案\n3. 安全预案',
 '学校团委', 1, 0, 'published', NOW() - INTERVAL 12 DAY, NOW() - INTERVAL 13 DAY),

(3, '2026年春季三下乡优秀项目表彰决定', 'result', 
 '表彰2026年春季三下乡社会实践优秀项目和先进个人。', 
 '根据《三下乡社会实践活动管理办法》，经各学院推荐、专家评审、学校审定，决定对以下优秀项目和先进个人予以表彰：\n\n一、优秀项目（10项）\n1. 乡村振兴调研实践（一等奖）\n2. 红色文化传承实践（二等奖）\n...\n\n二、先进个人（20名）\n张三、李四、王五...\n\n希望受表彰的集体和个人珍惜荣誉，再接再厉，在今后的社会实践活动中取得更大成绩。',
 '学校团委', 1, 0, 'published', NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 21 DAY),

(4, '三下乡安全工作提醒', 'notice', 
 '暑期三下乡实践活动安全注意事项提醒。', 
 '各实践团队：\n\n暑期将至，为确保三下乡社会实践活动安全顺利进行，特提醒以下注意事项：\n\n1. 严格遵守安全规定，确保人身安全\n2. 注意交通安全，遵守交通规则\n3. 注意饮食卫生，防止食物中毒\n4. 保持通讯畅通，及时报告情况\n5. 购买意外保险，做好应急准备\n\n祝各团队实践顺利！',
 '学校团委', 1, 0, 'published', NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 6 DAY);

-- 通知附件数据
INSERT INTO notice_attachment (
  notice_id, file_name, file_url, file_size, file_type, created_at
) VALUES
(1, '2026年暑期三下乡活动通知.pdf', '/uploads/notices/summer2026_notice.pdf', 1048576, 'application/pdf', NOW() - INTERVAL 16 DAY),
(2, '项目申报指南.docx', '/uploads/notices/application_guide.docx', 524288, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', NOW() - INTERVAL 13 DAY);

-- ========================================
-- 8. 系统消息数据
-- ========================================
INSERT INTO sys_message (
  user_id, title, content, type, related_type, related_id, is_read, created_at
) VALUES
-- 项目负责人的消息
(3, '项目申报审核通过', '您的项目"乡村振兴调研计划（草稿）"已通过学院审核，请等待校级审核。', 'approval', 'project', 1, 0, NOW() - INTERVAL 1 DAY),
(4, '项目申报被驳回', '您的项目"红色文化传承实践"被驳回，原因：实践方案不够具体，需要进一步细化调研内容和方法。', 'approval', 'project', 2, 0, NOW() - INTERVAL 2 DAY),
(5, '项目申报审核通过', '您的项目"环保宣传进社区"已通过学院审核，请等待校级审核。', 'approval', 'project', 3, 0, NOW() - INTERVAL 12 HOUR),

-- 项目成员的消息
(12, '项目进度更新', '您参与的项目"乡村振兴调研实践"有新的进度更新。', 'progress', 'project', 10, 0, NOW() - INTERVAL 3 DAY),
(13, '项目成果发布', '您参与的项目"乡村振兴调研实践"发布了新的成果材料。', 'result', 'project', 10, 0, NOW() - INTERVAL 2 DAY),

-- 教师的消息
(8, '新项目申报通知', '有新的项目申报需要您指导："乡村振兴调研计划（草稿）"。', 'project', 'project', 1, 0, NOW() - INTERVAL 3 DAY),
(9, '项目审批提醒', '有项目等待您的审批："红色文化传承实践"。', 'approval', 'project', 2, 0, NOW() - INTERVAL 2 DAY);

-- ========================================
-- 9. 更新项目状态为已结项的项目
-- ========================================
UPDATE project SET status = 'closed' WHERE id = 10;

-- ========================================
-- 数据初始化完成
-- ========================================

-- 统计信息
SELECT '项目数据统计' as type, 
       COUNT(*) as total,
       SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
       SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
       SUM(CASE WHEN status = 'college_approved' THEN 1 ELSE 0 END) as college_approved,
       SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
       SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
       SUM(CASE WHEN status = 'withdrawn' THEN 1 ELSE 0 END) as withdrawn,
       SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed
FROM project;

SELECT '进度数据统计' as type,
       COUNT(*) as total_progress
FROM progress;

SELECT '成果数据统计' as type,
       COUNT(*) as total_results
FROM result;

SELECT '评优数据统计' as type,
       COUNT(*) as total_evaluations
FROM evaluation;

SELECT '通知数据统计' as type,
       COUNT(*) as total_notices
FROM notice;

SELECT '消息数据统计' as type,
       COUNT(*) as total_messages,
       SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread_messages
FROM sys_message;
