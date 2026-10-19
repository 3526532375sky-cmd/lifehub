# 个人集成包

将「学习 · 生活 · 工作 · 记账 · 锻炼 · 决策」集成到一个可跨设备使用的个人系统中，目标是**精进个人**。

## 模块框架
构建规范见 **`FRAMEWORK.md`**（定位与三条铁律、统一技术底座、精进闭环、各模块数据字典、路线图）。

## 已实现模块
- **记账**（`modules/ledger/`）：收支、分类统计、加密备份，已接入跨设备自动同步。
- **锻炼**（`modules/fitness.html`）：动作记录 + 来源 + 要点提炼 + 评估；「已加入」自动汇总成锻炼 SOP。
- **生活**（`modules/life.html`）：生活日志（当前为养鱼：喂食/换水/观察）。
- **学习**（`modules/study.html`）：笔记 + 资料库 + 学习日志 + 复盘。
- **工作**（`modules/work.html`）：工作 SOP + 相关记录（记录可关联 SOP）。
- **决策·手册**（`modules/decision.html`）：成本×收益×证据分级 决策条目 + 个人手册。

## 同步（账本已接入，其余模块待接入）
- 同步引擎：`sync.js`（GitHub Contents API，端到端加密，冲突自动重试）。
- 设置页：`settings.html`（配置 owner / repo / token / 到期日，首页含到期提醒）。

## 目录结构
```
个人集成包/
├─ index.html            首页（模块导航 + 同步状态，跟随系统深浅色）
├─ settings.html         同步设置页
├─ sync.js               共享同步引擎
├─ FRAMEWORK.md          模块框架
├─ README.md             本说明
└─ modules/
   ├─ ledger/            记账
   ├─ fitness.html       锻炼
   ├─ life.html          生活
   ├─ study.html         学习
   ├─ work.html          工作
   └─ decision.html      决策·手册
```

## 路线图
- [x] 框架定稿 + 六个模块全部落地（本地可用）
- [ ] 新模块接入 `sync.js` 跨设备同步
- [ ] 接入 Codex 智能层：周复盘生成、锻炼计划定制、决策手册 skill、人情世故 skill
