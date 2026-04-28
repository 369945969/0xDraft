---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 3045022100f08944d5237381404bc0151fcf6756f19a31f08e753808b8e6f7ff35c5b746e50220048e1c99b28b227df295648f32e1aafd70a6b5744177d61fe7f8ca2987494583
    ReservedCode2: 3046022100cf8e34d1683c28d29e7cd2bf03d34984728b30b216d9d7376f85c356b33081e6022100d89f5f978bdec8ac40f78321cbb0213fdc3764cd4d6500be0a03bb06b754075e
---

# 多Agent Team 看板系统 - 概念设计文档协作平台

## 1. Concept & Vision

一个专为AI Agent团队协作设计的看板系统，用于管理多个软件概念设计项目的创作流程。系统模拟真实的团队协作场景：从全局Agent池中挑选专家组成小组，为项目绑定专属Agent组，并在独立且并行的上下文中完成从需求分析到文档发布的完整周期。

## 2. Design Language

### 2.1 Aesthetic Direction
深色科技风 + 赛博朋克元素，以深蓝/紫色为主色调，配合霓虹蓝和霓虹紫的光效点缀。全页面适配 **宽屏 (1600px)**。

### 2.2 Color Palette
```
--bg-primary: #0a0a1a        /* 主背景 - 深空黑 */
--bg-secondary: #12122a      /* 次级背景 */
--bg-card: #1a1a3e           /* 卡片背景 */
--bg-card-hover: #252552     /* 卡片悬停 */
--border-default: #2a2a5a    /* 默认边框 */
--border-glow: #6366f1       /* 发光边框 */
--text-primary: #f0f0ff      /* 主要文字 */
--text-secondary: #8888aa    /* 次要文字 */
--accent-blue: #6366f1       /* 主色调 - 靛蓝 */
--accent-purple: #8b5cf6     /* 强调色 - 紫色 */
--accent-cyan: #22d3ee       /* 霓虹蓝 */
--accent-pink: #f472b6       /* 霓虹粉 */
--accent-green: #10b981      /* 成功绿 */
--accent-amber: #f59e0b      /* 警告橙 */
--accent-red: #ef4444        /* 错误红 */
--gradient-primary: linear-gradient(135deg, #6366f1, #8b5cf6)
--gradient-glow: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))
```

### 2.3 Typography
- 主字体: "Space Grotesk" - 科技感标题
- 正文字体: "Inter" - 清晰可读
- 代码字体: "JetBrains Mono" - 等宽代码显示
- 字重: 400 (正文), 500 (中等), 600 (标题), 700 (强调)

### 2.4 Spatial System
- 基础单位: 4px
- 间距: 8px, 12px, 16px, 24px, 32px, 48px
- 卡片圆角: 12px
- 按钮圆角: 8px
- 输入框圆角: 8px
- **最大内容宽度: 1600px (宽屏优化)**

## 3. Layout & Structure

### 3.1 整体布局
```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: Logo + [项目切换器] + 页面导航 + 通知(高对比度) + 用户   │
├─────────────────────────────────────────────────────────────────┤
│  BREADCRUMB: 首页 / [当前项目名] / 当前页面                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MAIN CONTENT AREA (1600px Max-Width)                            │
│                                                                 │
│  首页 (Dashboard):                                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  项目统计概览 (总数/完成/Agent组/总进度)                      ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │  [项目管理中心] - 创建/编辑项目、绑定Agent组                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  看板视图: (项目数据隔离)                                        │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐          │
│  │ 待认领   │ 进行中   │ 待审视   │ 已完成   │ 已发布   │          │
│  │ (图标)   │ (图标)   │ (图标)   │ (图标)   │ (图标)   │          │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  FOOTER: 系统状态 + 最后更新时间 + 快捷设置                      │
└─────────────────────────────────────────────────────────────────┘
```

## 4. Features & Interactions

### 4.1 多项目管理 (Project Management)
**功能描述**: 建立独立的工程上下文，实现数据物理隔离。

**核心逻辑**:
- **项目创建**: 输入项目名、描述，并选择绑定的 **Agent组**。
- **项目切换**: 通过Header切换器或首页项目卡片，全局状态即时同步。
- **独立上下文**: 每个项目的任务、分析结果、执行日志完全独立，互不干扰。

### 4.2 全局 Agent 组 (Agent Grouping)
**功能描述**: Agent 作为全局资产，通过“分组”形式为项目提供服务。

**核心概念**:
- **全局池**: 所有定义的 Agent 存在于全局仓库中。
- **分组 (Groups)**: 将 Agent 自由组合（如：前端开发组、架构核心组）。
- **绑定**: 项目与组建立绑定关系，该项目下的任务只能由组内成员认领。
- **并行执行**: 允许同一个 Agent 在不同项目中并行处理任务，每个任务持有独立的 `Project Context`。

### 4.3 看板与 UI 增强
- **图标系统**: 各主要页面（分析、看板、Agent）及其子项（看板列标题）均配有 Lucide 图标。
- **可见性优化**: 通知图标与徽章采用高对比度设计，解决低亮度环境下看不清的问题。
- **页脚标准化**: 统一所有页面的页脚信息，包含实时更新的时间戳和系统状态。

### 4.4 文档预览增强
- **示例引导**: 当项目为空时，预览页面侧边栏显示建议的章节模板作为示例。
- **实时同步**: 预览内容随看板任务的完成状态实时更新。

## 5. Data Model

### 5.1 数据对象结构
```javascript
// 项目
Project {
  id: string,
  name: string,
  description: string,
  groupId: string,      // 绑定的Agent组ID
  createdAt: timestamp,
  updatedAt: timestamp
}

// Agent分组
AgentGroup {
  id: string,
  name: string,
  agentIds: string[]    // 包含的Agent ID列表
}

// 任务 (带项目关联)
ChapterTask {
  id: string,
  projectId: string,    // 属于哪个项目
  ...
}
```

## 6. Technical Approach

### 6.1 状态管理升级
- **Store 实例化**: 采用全局 Object 模式，通过 `Store.init()` 初始化并维持订阅分发逻辑。
- **并行处理**: 利用异步 Promise 模拟 Agent 执行，通过闭包维持每个任务独立的执行环境（Context）。
- **宽屏适配**: 通过 `styles.css` 统一控制 `.page-container` 的 `max-width: 1600px`。

### 6.2 文件规范
- **标准化 Header/Footer**: 确保所有 `.html` 文件拥有相同的顶栏与底栏结构，确保图标初始化调用 `lucide.createIcons()`。
- **集中样式**: 尽量将页面级样式移入 `styles.css`，减少内联 `<style>`。
