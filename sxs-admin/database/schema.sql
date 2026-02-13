-- ============================================
-- 三下乡活动管理系统 - 数据库设计
-- 数据库: MySQL 8.0+
-- 字符集: utf8mb4
-- ============================================

CREATE DATABASE IF NOT EXISTS sxs_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sxs_db;

-- ============================================
-- 1. 用户与权限模块
-- ============================================

-- 用户表
CREATE TABLE `sys_user` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名/学号/工号',
  `password` VARCHAR(255) NOT NULL COMMENT '密码(加密)',
  `real_name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
  `phone` VARCHAR(20) COMMENT '手机号',
  `email` VARCHAR(100) COMMENT '邮箱',
  `avatar` VARCHAR(255) COMMENT '头像URL',
  `gender` TINYINT DEFAULT 0 COMMENT '性别: 0未知 1男 2女',
  `role` VARCHAR(20) NOT NULL COMMENT '角色: student/teacher/college_admin/school_admin/expert',
  `college_id` BIGINT COMMENT '所属学院ID',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0禁用 1正常',
  `openid` VARCHAR(100) COMMENT '微信OpenID',
  `last_login_time` DATETIME COMMENT '最后登录时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_role` (`role`),
  INDEX `idx_college` (`college_id`),
  INDEX `idx_openid` (`openid`)
) COMMENT '用户表';

-- 学院表
CREATE TABLE `sys_college` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '学院ID',
  `name` VARCHAR(100) NOT NULL COMMENT '学院名称',
  `code` VARCHAR(20) COMMENT '学院代码',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0禁用 1正常',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '学院表';

-- ============================================
-- 2. 项目申报模块
-- ============================================

-- 项目申报表
CREATE TABLE `project` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '项目ID',
  `project_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '项目编号',
  `title` VARCHAR(200) NOT NULL COMMENT '项目名称',
  `category` VARCHAR(50) NOT NULL COMMENT '项目类别: theory/village/observe/unity',
  `description` TEXT COMMENT '项目简介',
  `target_area` VARCHAR(200) COMMENT '实践地点',
  `start_date` DATE COMMENT '开始日期',
  `end_date` DATE COMMENT '结束日期',
  `budget` DECIMAL(10,2) DEFAULT 0 COMMENT '预算金额',
  `leader_id` BIGINT NOT NULL COMMENT '负责人ID',
  `teacher_id` BIGINT COMMENT '指导教师ID',
  `college_id` BIGINT COMMENT '所属学院ID',
  `status` VARCHAR(20) DEFAULT 'pending' COMMENT '状态: pending(待审核)/college_approved(院审通过)/school_approved(校审通过)/approved(已立项)/closed(已结项)/rejected(已驳回)',
  `reject_reason` VARCHAR(500) COMMENT '驳回原因',
  `is_excellent` TINYINT DEFAULT 0 COMMENT '是否优秀项目: 0否 1是',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_leader` (`leader_id`),
  INDEX `idx_teacher` (`teacher_id`),
  INDEX `idx_college` (`college_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_category` (`category`)
) COMMENT '项目申报表';

-- 项目类别字典
-- category: 乡村振兴, 支教助学, 红色文化, 科技支农, 医疗卫生, 法律援助, 其他

-- 项目团队成员表
CREATE TABLE `project_member` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `project_id` BIGINT NOT NULL COMMENT '项目ID',
  `user_id` BIGINT NOT NULL COMMENT '成员用户ID',
  `role` VARCHAR(20) DEFAULT 'member' COMMENT '角色: leader/member',
  `responsibility` VARCHAR(200) COMMENT '职责分工',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_project` (`project_id`),
  INDEX `idx_user` (`user_id`),
  UNIQUE KEY `uk_project_user` (`project_id`, `user_id`)
) COMMENT '项目团队成员表';

-- 项目附件表
CREATE TABLE `project_attachment` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `project_id` BIGINT NOT NULL COMMENT '项目ID',
  `file_name` VARCHAR(200) NOT NULL COMMENT '文件名',
  `file_url` VARCHAR(500) NOT NULL COMMENT '文件URL',
  `file_size` BIGINT DEFAULT 0 COMMENT '文件大小(字节)',
  `file_type` VARCHAR(50) COMMENT '文件类型: doc/pdf/image/other',
  `upload_user_id` BIGINT COMMENT '上传人ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_project` (`project_id`)
) COMMENT '项目附件表';

-- ============================================
-- 3. 审批管理模块
-- ============================================

-- 审批记录表
CREATE TABLE `approval_record` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `project_id` BIGINT NOT NULL COMMENT '项目ID',
  `approver_id` BIGINT NOT NULL COMMENT '审批人ID',
  `approval_level` VARCHAR(20) NOT NULL COMMENT '审批级别: college/school',
  `action` VARCHAR(20) NOT NULL COMMENT '审批动作: approve/reject',
  `opinion` VARCHAR(500) COMMENT '审批意见',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_project` (`project_id`),
  INDEX `idx_approver` (`approver_id`)
) COMMENT '审批记录表';

-- ============================================
-- 4. 进度跟踪模块
-- ============================================

-- 进度记录表
CREATE TABLE `progress` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `project_id` BIGINT NOT NULL COMMENT '项目ID',
  `title` VARCHAR(200) NOT NULL COMMENT '进度标题',
  `content` TEXT COMMENT '进度内容',
  `progress_date` DATE COMMENT '进度日期',
  `location` VARCHAR(200) COMMENT '活动地点',
  `creator_id` BIGINT NOT NULL COMMENT '创建人ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_project` (`project_id`),
  INDEX `idx_creator` (`creator_id`),
  INDEX `idx_date` (`progress_date`)
) COMMENT '进度记录表';

-- 进度图片表
CREATE TABLE `progress_image` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `progress_id` BIGINT NOT NULL COMMENT '进度ID',
  `image_url` VARCHAR(500) NOT NULL COMMENT '图片URL',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_progress` (`progress_id`)
) COMMENT '进度图片表';

-- 进度评论表
CREATE TABLE `progress_comment` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `progress_id` BIGINT NOT NULL COMMENT '进度ID',
  `user_id` BIGINT NOT NULL COMMENT '评论人ID',
  `content` VARCHAR(500) NOT NULL COMMENT '评论内容',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_progress` (`progress_id`),
  INDEX `idx_user` (`user_id`)
) COMMENT '进度评论表';

-- ============================================
-- 5. 成果管理模块
-- ============================================

-- 成果表
CREATE TABLE `result` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `project_id` BIGINT NOT NULL COMMENT '项目ID',
  `title` VARCHAR(200) NOT NULL COMMENT '成果标题',
  `category` VARCHAR(50) NOT NULL COMMENT '成果类别: report/paper/video/other',
  `description` TEXT COMMENT '成果描述',
  `cover_url` VARCHAR(500) COMMENT '封面图URL',
  `content` TEXT COMMENT '成果内容(富文本)',
  `creator_id` BIGINT NOT NULL COMMENT '创建人ID',
  `view_count` INT DEFAULT 0 COMMENT '浏览次数',
  `status` VARCHAR(20) DEFAULT 'published' COMMENT '状态: published',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_project` (`project_id`),
  INDEX `idx_creator` (`creator_id`),
  INDEX `idx_category` (`category`),
  INDEX `idx_status` (`status`)
) COMMENT '成果表';

-- 成果类别字典
-- category: report(调研报告), paper(学术论文), video(视频作品), other(其他成果)

-- 成果附件表
CREATE TABLE `result_attachment` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `result_id` BIGINT NOT NULL COMMENT '成果ID',
  `file_name` VARCHAR(200) NOT NULL COMMENT '文件名',
  `file_url` VARCHAR(500) NOT NULL COMMENT '文件URL',
  `file_size` BIGINT DEFAULT 0 COMMENT '文件大小(字节)',
  `file_type` VARCHAR(50) COMMENT '文件类型',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_result` (`result_id`)
) COMMENT '成果附件表';

-- 成果图片表
CREATE TABLE `result_image` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `result_id` BIGINT NOT NULL COMMENT '成果ID',
  `image_url` VARCHAR(500) NOT NULL COMMENT '图片URL',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_result` (`result_id`)
) COMMENT '成果图片表';

-- ============================================
-- 6. 评优管理模块
-- ============================================

-- 评优活动表
CREATE TABLE `evaluation` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL COMMENT '评优活动名称',
  `year` INT NOT NULL COMMENT '年度',
  `description` TEXT COMMENT '活动说明',
  `start_time` DATETIME COMMENT '开始时间',
  `end_time` DATETIME COMMENT '结束时间',
  `status` VARCHAR(20) DEFAULT 'pending' COMMENT '状态: pending/ongoing/finished',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_year` (`year`),
  INDEX `idx_status` (`status`)
) COMMENT '评优活动表';

-- 评优项目关联表
CREATE TABLE `evaluation_project` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `evaluation_id` BIGINT NOT NULL COMMENT '评优活动ID',
  `project_id` BIGINT NOT NULL COMMENT '项目ID',
  `is_top` TINYINT DEFAULT 0 COMMENT '是否置顶推荐: 0否 1是',
  `final_score` DECIMAL(5,2) COMMENT '最终得分',
  `rank` INT COMMENT '排名',
  `award_level` VARCHAR(50) COMMENT '获奖等级: 一等奖/二等奖/三等奖/优秀奖',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_evaluation` (`evaluation_id`),
  INDEX `idx_project` (`project_id`),
  UNIQUE KEY `uk_eval_project` (`evaluation_id`, `project_id`)
) COMMENT '评优项目关联表';

-- 专家评分表
CREATE TABLE `evaluation_score` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `evaluation_id` BIGINT NOT NULL COMMENT '评优活动ID',
  `project_id` BIGINT NOT NULL COMMENT '项目ID',
  `expert_id` BIGINT NOT NULL COMMENT '专家ID',
  `score_innovation` DECIMAL(5,2) DEFAULT 0 COMMENT '创新性得分',
  `score_practice` DECIMAL(5,2) DEFAULT 0 COMMENT '实践性得分',
  `score_effect` DECIMAL(5,2) DEFAULT 0 COMMENT '成效性得分',
  `score_report` DECIMAL(5,2) DEFAULT 0 COMMENT '报告质量得分',
  `total_score` DECIMAL(5,2) DEFAULT 0 COMMENT '总分',
  `comment` VARCHAR(500) COMMENT '评语',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_evaluation` (`evaluation_id`),
  INDEX `idx_project` (`project_id`),
  INDEX `idx_expert` (`expert_id`),
  UNIQUE KEY `uk_eval_project_expert` (`evaluation_id`, `project_id`, `expert_id`)
) COMMENT '专家评分表';

-- ============================================
-- 7. 通知公告模块
-- ============================================

-- 通知公告表
CREATE TABLE `notice` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL COMMENT '标题',
  `type` VARCHAR(20) NOT NULL COMMENT '类型: notice/policy/activity',
  `content` TEXT COMMENT '内容(富文本)',
  `summary` VARCHAR(500) COMMENT '摘要',
  `source` VARCHAR(100) COMMENT '来源/发布单位',
  `publisher_id` BIGINT COMMENT '发布人ID',
  `is_top` TINYINT DEFAULT 0 COMMENT '是否置顶: 0否 1是',
  `view_count` INT DEFAULT 0 COMMENT '浏览次数',
  `status` VARCHAR(20) DEFAULT 'published' COMMENT '状态: published',
  `publish_time` DATETIME COMMENT '发布时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_type` (`type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_is_top` (`is_top`),
  INDEX `idx_publish_time` (`publish_time`)
) COMMENT '通知公告表';

-- 通知类型字典
-- type: notice(通知), policy(政策), activity(活动)

-- 通知附件表
CREATE TABLE `notice_attachment` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `notice_id` BIGINT NOT NULL COMMENT '通知ID',
  `file_name` VARCHAR(200) NOT NULL COMMENT '文件名',
  `file_url` VARCHAR(500) NOT NULL COMMENT '文件URL',
  `file_size` BIGINT DEFAULT 0 COMMENT '文件大小(字节)',
  `file_type` VARCHAR(50) COMMENT '文件类型',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_notice` (`notice_id`)
) COMMENT '通知附件表';

-- 通知已读记录表
CREATE TABLE `notice_read` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `notice_id` BIGINT NOT NULL COMMENT '通知ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `read_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '阅读时间',
  INDEX `idx_notice` (`notice_id`),
  INDEX `idx_user` (`user_id`),
  UNIQUE KEY `uk_notice_user` (`notice_id`, `user_id`)
) COMMENT '通知已读记录表';

-- 用户收藏表
CREATE TABLE `user_favorite` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `target_type` VARCHAR(20) NOT NULL COMMENT '收藏类型: notice/result',
  `target_id` BIGINT NOT NULL COMMENT '收藏目标ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_target` (`target_type`, `target_id`),
  UNIQUE KEY `uk_user_target` (`user_id`, `target_type`, `target_id`)
) COMMENT '用户收藏表';

-- ============================================
-- 8. 系统消息模块
-- ============================================

-- 系统消息表
CREATE TABLE `sys_message` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL COMMENT '接收用户ID',
  `title` VARCHAR(200) NOT NULL COMMENT '消息标题',
  `content` VARCHAR(500) COMMENT '消息内容',
  `type` VARCHAR(20) NOT NULL COMMENT '消息类型: system/approval/evaluate',
  `related_type` VARCHAR(20) COMMENT '关联类型: project/result/notice',
  `related_id` BIGINT COMMENT '关联ID',
  `is_read` TINYINT DEFAULT 0 COMMENT '是否已读: 0否 1是',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_is_read` (`is_read`),
  INDEX `idx_type` (`type`)
) COMMENT '系统消息表';

-- ============================================
-- 9. 操作日志模块
-- ============================================

-- 操作日志表
CREATE TABLE `sys_log` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT COMMENT '操作用户ID',
  `username` VARCHAR(50) COMMENT '用户名',
  `module` VARCHAR(50) COMMENT '操作模块',
  `action` VARCHAR(100) COMMENT '操作动作',
  `method` VARCHAR(200) COMMENT '请求方法',
  `params` TEXT COMMENT '请求参数',
  `ip` VARCHAR(50) COMMENT 'IP地址',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0失败 1成功',
  `error_msg` TEXT COMMENT '错误信息',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_module` (`module`),
  INDEX `idx_created_at` (`created_at`)
) COMMENT '操作日志表';

-- ============================================
-- 初始数据
-- ============================================

-- 插入学院数据
INSERT INTO `sys_college` (`name`, `code`, `sort`) VALUES
('经济管理学院', 'JG', 1),
('信息工程学院', 'XX', 2),
('机械工程学院', 'JX', 3),
('文学与传媒学院', 'WC', 4),
('外国语学院', 'WY', 5),
('艺术设计学院', 'YS', 6),
('马克思主义学院', 'MK', 7),
('数学与统计学院', 'SX', 8);

-- 插入管理员账号 (密码: 123456 的 bcrypt 加密)
INSERT INTO `sys_user` (`username`, `password`, `real_name`, `role`, `status`) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '系统管理员', 'school_admin', 1);

-- 插入测试用户
INSERT INTO `sys_user` (`username`, `password`, `real_name`, `phone`, `role`, `college_id`, `status`) VALUES
('2021001', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '张三', '13800138001', 'student', 1, 1),
('T001', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '李教授', '13800138002', 'teacher', 1, 1),
('CA001', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '王主任', '13800138003', 'college_admin', 1, 1),
('E001', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '陈教授', '13800138004', 'expert', NULL, 1);
