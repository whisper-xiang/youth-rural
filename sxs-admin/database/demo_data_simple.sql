-- 简化的演示数据初始化脚本
-- 清理现有数据
DELETE FROM approval_record;
DELETE FROM project_member;
DELETE FROM project;
DELETE FROM progress;
DELETE FROM result;
DELETE FROM result_attachment;
DELETE FROM result_image;
DELETE FROM evaluation;
DELETE FROM evaluation_score;
DELETE FROM notice;
DELETE FROM notice_attachment;
DELETE FROM sys_message;

-- 插入项目数据
INSERT INTO project (id, project_no, title, category, target_area, start_date, end_date, leader_id, teacher_id, college_id, description, plan, expected_result, status, created_at) VALUES
(1, 'PRJ2026001', '乡村振兴调研计划（草稿）', '乡村振兴', '湖南省长沙市望城区', '2026-07-01', '2026-07-15', 3, 8, 1, '深入农村基层调研乡村振兴战略实施情况', '第一周：实地走访调研\n第二周：数据整理与分析', '完成调研报告一份', 'draft', NOW()),
(2, 'PRJ2026002', '红色文化传承实践', '文化传承', '江西省井冈山市', '2026-07-10', '2026-07-25', 4, 9, 2, '探访革命老区，传承红色基因', '第一周：参观革命遗址\n第二周：开展红色教育活动', '完成红色文化调研报告', 'pending', NOW() - INTERVAL 2 DAY),
(3, 'PRJ2026003', '环保宣传进社区', '环保宣传', '广东省深圳市南山区', '2026-08-01', '2026-08-15', 5, 10, 3, '深入社区开展环保知识宣传', '第一周：社区调研\n第二周：开展宣传活动', '完成社区环保调研报告', 'pending', NOW() - INTERVAL 1 DAY),
(4, 'PRJ2026004', '科技支农助振兴', '科技支农', '四川省成都市郫都区', '2026-07-05', '2026-07-20', 6, 11, 1, '运用现代科技手段帮助农业生产', '第一周：调研当地农业现状\n第二周：推广农业技术', '完成科技支农报告', 'college_approved', NOW() - INTERVAL 3 DAY),
(5, 'PRJ2026005', '教育帮扶暖童心', '教育帮扶', '贵州省黔东南州', '2026-06-20', '2026-07-10', 7, 12, 2, '赴偏远地区开展教育帮扶活动', '第一周：开展教学活动\n第二周：组织文体活动', '完成教育帮扶报告', 'approved', NOW() - INTERVAL 5 DAY),
(6, 'PRJ2026006', '非遗文化保护行动', '文化保护', '云南省大理州', '2026-06-15', '2026-06-30', 8, 13, 3, '探访非物质文化遗产传承人', '第一周：寻访非遗传承人\n第二周：开展保护宣传活动', '完成非遗调研报告', 'approved', NOW() - INTERVAL 7 DAY),
(7, 'PRJ2026007', '城市文明创建调研', '社会调研', '浙江省杭州市', '2026-07-20', '2026-08-05', 9, 14, 1, '调研城市文明创建工作', '第一周：实地调研\n第二周：分析总结', '完成城市文明调研报告', 'rejected', NOW() - INTERVAL 4 DAY),
(8, 'PRJ2026008', '健康生活科普活动', '科普宣传', '江苏省南京市', '2026-08-10', '2026-08-25', 10, 15, 2, '开展健康生活科普宣传活动', '第一周：健康知识调研\n第二周：科普宣传活动', '完成健康科普报告', 'rejected', NOW() - INTERVAL 2 DAY),
(9, 'PRJ2026009', '创新创业实践', '创新创业', '上海市浦东新区', '2026-09-01', '2026-09-15', 11, 16, 3, '开展创新创业实践活动', '第一周：市场调研\n第二周：实践验证', '完成创新创业报告', 'withdrawn', NOW() - INTERVAL 1 DAY),
(10, 'PRJ6010', '乡村振兴调研实践', '乡村振兴', '湖南省长沙市望城区', '2026-05-01', '2026-05-15', 3, 8, 1, '深入农村基层调研乡村振兴战略', '第一周：实地走访调研\n第二周：数据整理分析', '完成调研报告', 'closed', NOW() - INTERVAL 30 DAY);

-- 更新已驳回项目的驳回原因
UPDATE project SET reject_reason = '实践方案不够具体，需要进一步细化调研内容和方法' WHERE id = 7;
UPDATE project SET reject_reason = '活动时间安排不合理，与学校课程时间冲突' WHERE id = 8;

-- 插入项目成员
INSERT INTO project_member (project_id, user_id, role, created_at) VALUES
(1, 3, 'leader', NOW()), (1, 12, 'member', NOW()), (1, 13, 'member', NOW()),
(2, 4, 'leader', NOW()), (2, 14, 'member', NOW()), (2, 15, 'member', NOW()), (2, 16, 'member', NOW()),
(3, 5, 'leader', NOW()), (3, 17, 'member', NOW()), (3, 18, 'member', NOW()),
(4, 6, 'leader', NOW()), (4, 19, 'member', NOW()), (4, 20, 'member', NOW()), (4, 21, 'member', NOW()), (4, 22, 'member', NOW()),
(5, 7, 'leader', NOW()), (5, 23, 'member', NOW()), (5, 24, 'member', NOW()), (5, 25, 'member', NOW()),
(6, 8, 'leader', NOW()), (6, 26, 'member', NOW()), (6, 27, 'member', NOW()),
(7, 9, 'leader', NOW()), (7, 28, 'member', NOW()),
(8, 10, 'leader', NOW()), (8, 29, 'member', NOW()), (8, 30, 'member', NOW()),
(9, 11, 'leader', NOW()), (9, 31, 'member', NOW()),
(10, 3, 'leader', NOW()), (10, 12, 'member', NOW()), (10, 13, 'member', NOW()), (10, 32, 'member', NOW());

-- 插入审批记录
INSERT INTO approval_record (project_id, approver_id, approval_level, action, opinion, created_at) VALUES
(4, 2, 'college', 'approve', '项目方案切实可行，同意申报', NOW() - INTERVAL 2 DAY),
(5, 5, 'college', 'approve', '项目有意义，方案详细，同意推荐', NOW() - INTERVAL 4 DAY),
(5, 1, 'school', 'approve', '项目立意良好，实施方案可行，同意立项', NOW() - INTERVAL 2 DAY),
(6, 6, 'college', 'approve', '文化保护项目很有价值，支持开展', NOW() - INTERVAL 6 DAY),
(6, 1, 'school', 'approve', '非遗保护具有重要意义，同意立项', NOW() - INTERVAL 4 DAY),
(7, 2, 'college', 'reject', '实践方案不够具体，需要进一步细化调研内容和方法', NOW() - INTERVAL 4 DAY),
(8, 5, 'college', 'reject', '活动时间安排不合理，与学校课程时间冲突', NOW() - INTERVAL 2 DAY);

-- 插入进度记录
INSERT INTO progress (id, project_id, title, description, status, created_at) VALUES
(1, 5, '项目启动会议', '召开项目启动会议，明确分工安排', 'published', NOW() - INTERVAL 10 DAY),
(2, 5, '前期调研准备', '完成文献调研，设计调研问卷', 'published', NOW() - INTERVAL 8 DAY),
(3, 5, '实地调研开展', '赴贵州黔东南开展实地调研', 'published', NOW() - INTERVAL 5 DAY),
(4, 6, '传承人寻访', '赴大理州寻访非遗传承人', 'published', NOW() - INTERVAL 12 DAY),
(5, 6, '技艺记录整理', '整理收集到的非遗技艺资料', 'published', NOW() - INTERVAL 8 DAY),
(6, 10, '调研方案制定', '制定详细的乡村振兴调研方案', 'published', NOW() - INTERVAL 35 DAY),
(7, 10, '实地调研执行', '深入望城区5个行政村开展实地调研', 'published', NOW() - INTERVAL 30 DAY),
(8, 10, '数据整理分析', '整理调研数据，进行统计分析', 'published', NOW() - INTERVAL 28 DAY),
(9, 10, '报告完善提交', '完善调研报告，形成最终成果', 'published', NOW() - INTERVAL 25 DAY);

-- 插入成果材料
INSERT INTO result (id, project_id, title, category, status, created_at) VALUES
(1, 5, '教育帮扶调研报告', 'report', 'published', NOW() - INTERVAL 3 DAY),
(2, 5, '支教活动照片集', 'other', 'published', NOW() - INTERVAL 2 DAY),
(3, 6, '非遗技艺记录片', 'video', 'published', NOW() - INTERVAL 2 DAY),
(4, 6, '非遗保护调研报告', 'report', 'published', NOW() - INTERVAL 1 DAY),
(5, 10, '乡村振兴调研报告', 'report', 'published', NOW() - INTERVAL 20 DAY),
(6, 10, '调研数据统计分析', 'data', 'published', NOW() - INTERVAL 18 DAY),
(7, 10, '实践照片集', 'other', 'published', NOW() - INTERVAL 15 DAY);

-- 插入成果附件
INSERT INTO result_attachment (result_id, file_name, file_url, file_size, file_type, created_at) VALUES
(1, '教育帮扶调研报告.pdf', '/uploads/reports/education_report.pdf', 2048576, 'application/pdf', NOW() - INTERVAL 3 DAY),
(3, '非遗技艺记录片.mp4', '/uploads/videos/heritage_video.mp4', 52428800, 'video/mp4', NOW() - INTERVAL 2 DAY),
(5, '乡村振兴调研报告.pdf', '/uploads/reports/rural_revitalization_report.pdf', 3145728, 'application/pdf', NOW() - INTERVAL 20 DAY);

-- 插入成果图片
INSERT INTO result_image (result_id, image_url, sort, created_at) VALUES
(2, '/uploads/images/education_01.jpg', 1, NOW() - INTERVAL 2 DAY),
(2, '/uploads/images/education_02.jpg', 2, NOW() - INTERVAL 2 DAY),
(2, '/uploads/images/education_03.jpg', 3, NOW() - INTERVAL 2 DAY),
(7, '/uploads/images/rural_01.jpg', 1, NOW() - INTERVAL 15 DAY),
(7, '/uploads/images/rural_02.jpg', 2, NOW() - INTERVAL 15 DAY),
(7, '/uploads/images/rural_03.jpg', 3, NOW() - INTERVAL 15 DAY);

-- 插入评优活动
INSERT INTO evaluation (id, title, description, start_time, end_time, status, created_at) VALUES
(1, '2026年暑期三下乡优秀项目评选', '评选2026年暑期三下乡社会实践活动中的优秀项目', '2026-08-01', '2026-08-31', 'active', NOW() - INTERVAL 10 DAY),
(2, '2026年春季三下乡项目评优', '对春季学期开展的三下乡项目进行评优', '2026-06-01', '2026-06-30', 'completed', NOW() - INTERVAL 60 DAY);

-- 插入评优评分
INSERT INTO evaluation_score (evaluation_id, project_id, expert_id, score, comment, created_at) VALUES
(1, 5, 13, 85, '项目立意很好，教育帮扶工作扎实', NOW() - INTERVAL 5 DAY),
(1, 5, 14, 88, '支教活动很有意义，团队配合默契', NOW() - INTERVAL 4 DAY),
(1, 6, 13, 90, '非遗保护项目很有价值，记录工作细致', NOW() - INTERVAL 3 DAY),
(1, 6, 14, 87, '传统文化保护很有意义，实践成果丰富', NOW() - INTERVAL 2 DAY),
(2, 10, 13, 92, '乡村振兴调研深入扎实，数据详实', NOW() - INTERVAL 50 DAY),
(2, 10, 14, 89, '调研方法科学，报告质量高', NOW() - INTERVAL 49 DAY);

-- 插入通知公告
INSERT INTO notice (id, title, type, summary, content, source, publisher_id, is_top, status, publish_time, created_at) VALUES
(1, '关于开展2026年暑期三下乡活动的通知', 'activity', '正式启动2026年暑期三下乡社会实践活动', '为深入学习贯彻习近平新时代中国特色社会主义思想，引导广大青年学生在社会实践中受教育、长才干、作贡献，学校决定开展2026年暑期三下乡社会实践活动。', '学校团委', 1, 1, 'published', NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 16 DAY),
(2, '三下乡项目申报指南', 'guide', '发布2026年三下乡项目申报指南', '为规范三下乡项目申报工作，提高项目质量，特发布本指南。', '学校团委', 1, 0, 'published', NOW() - INTERVAL 12 DAY, NOW() - INTERVAL 13 DAY),
(3, '2026年春季三下乡优秀项目表彰决定', 'result', '表彰2026年春季三下乡社会实践优秀项目', '根据《三下乡社会实践活动管理办法》，经各学院推荐、专家评审、学校审定，决定对以下优秀项目和先进个人予以表彰。', '学校团委', 1, 0, 'published', NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 21 DAY),
(4, '三下乡安全工作提醒', 'notice', '暑期三下乡实践活动安全注意事项提醒', '各实践团队：暑期将至，为确保三下乡社会实践活动安全顺利进行，特提醒以下注意事项。', '学校团委', 1, 0, 'published', NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 6 DAY);

-- 插入通知附件
INSERT INTO notice_attachment (notice_id, file_name, file_url, file_size, file_type, created_at) VALUES
(1, '2026年暑期三下乡活动通知.pdf', '/uploads/notices/summer2026_notice.pdf', 1048576, 'application/pdf', NOW() - INTERVAL 16 DAY),
(2, '项目申报指南.docx', '/uploads/notices/application_guide.docx', 524288, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', NOW() - INTERVAL 13 DAY);

-- 插入系统消息
INSERT INTO sys_message (user_id, title, content, type, related_type, related_id, is_read, created_at) VALUES
(3, '项目申报审核通过', '您的项目"乡村振兴调研计划（草稿）"已通过学院审核，请等待校级审核。', 'approval', 'project', 1, 0, NOW() - INTERVAL 1 DAY),
(4, '项目申报被驳回', '您的项目"红色文化传承实践"被驳回，原因：实践方案不够具体', 'approval', 'project', 2, 0, NOW() - INTERVAL 2 DAY),
(5, '项目申报审核通过', '您的项目"环保宣传进社区"已通过学院审核，请等待校级审核。', 'approval', 'project', 3, 0, NOW() - INTERVAL 12 HOUR),
(12, '项目进度更新', '您参与的项目"乡村振兴调研实践"有新的进度更新。', 'progress', 'project', 10, 0, NOW() - INTERVAL 3 DAY),
(13, '项目成果发布', '您参与的项目"乡村振兴调研实践"发布了新的成果材料。', 'result', 'project', 10, 0, NOW() - INTERVAL 2 DAY),
(8, '新项目申报通知', '有新的项目申报需要您指导："乡村振兴调研计划（草稿）".', 'project', 'project', 1, 0, NOW() - INTERVAL 3 DAY),
(9, '项目审批提醒', '有项目等待您的审批："红色文化传承实践".', 'approval', 'project', 2, 0, NOW() - INTERVAL 2 DAY);
