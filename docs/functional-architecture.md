# 三下乡活动管理系统 - 功能架构图

## 一、功能层次图（三级）

```plantuml
@startmindmap
* 三下乡管理系统
** 学生
*** 项目申报
*** 进度上传
*** 成果提交
** 教师
*** 查看指导项目
*** 评论进度
*** 查看成果
** 学院管理员
*** 学院审批
*** 项目监管
*** 查看统计
** 校级管理员
*** 校级审批
*** 通知发布
*** 系统管理
** 评审专家
*** 项目评审
*** 评分打分
*** 查看结果
@endmindmap
```

## 二、角色用例图

### 2.1 学生用例图

```plantuml
@startuml
left to right direction
actor "学生" as S
rectangle "学生系统" {
  usecase "项目申报" as UC1
  usecase "进度上传" as UC2
  usecase "成果提交" as UC3
}
S --> UC1
S --> UC2
S --> UC3
@enduml
```

### 2.2 教师用例图

```plantuml
@startuml
left to right direction
actor "教师" as T
rectangle "教师系统" {
  usecase "查看指导项目" as UC1
  usecase "评论进度" as UC2
  usecase "查看成果" as UC3
}
T --> UC1
T --> UC2
T --> UC3
@enduml
```

### 2.3 学院管理员用例图

```plantuml
@startuml
left to right direction
actor "学院管理员" as C
rectangle "学院管理系统" {
  usecase "学院审批" as UC1
  usecase "项目监管" as UC2
  usecase "查看统计" as UC3
}
C --> UC1
C --> UC2
C --> UC3
@enduml
```

### 2.4 校级管理员用例图

```plantuml
@startuml
left to right direction
actor "校级管理员" as A
rectangle "校级管理系统" {
  usecase "校级审批" as UC1
  usecase "通知发布" as UC2
  usecase "系统管理" as UC3
}
A --> UC1
A --> UC2
A --> UC3
@enduml
```

### 2.5 评审专家用例图

```plantuml
@startuml
left to right direction
actor "评审专家" as E
rectangle "评审系统" {
  usecase "项目评审" as UC1
  usecase "评分打分" as UC2
  usecase "查看结果" as UC3
}
E --> UC1
E --> UC2
E --> UC3
@enduml
```

## 三、角色权限矩阵

| 用例/角色 | 学生 | 教师 | 学院管理员 | 校级管理员 | 评审专家 |
|-----------|:--:|:--:|:--:|:--:|:--:|
| 项目申报 | ✓ | - | - | - | - |
| 学院审批 | - | - | ✓ | - | - |
| 校级审批 | - | - | - | ✓ | - |
| 进度上传 | ✓ | - | - | - | - |
| 评论进度 | - | ✓ | ✓ | ✓ | - |
| 成果提交 | ✓ | - | - | - | - |
| 项目评审 | - | - | - | - | ✓ |
| 评分打分 | - | - | - | - | ✓ |
| 通知发布 | - | - | - | ✓ | - |
| 系统管理 | - | - | - | ✓ | - |
