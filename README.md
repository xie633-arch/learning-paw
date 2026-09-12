# Personal Learning OS

一个面向手机与电脑的个人学习 PWA。

V0.4 的核心链路：

**学习新内容 → 主动回忆 → FSRS → 薄弱专项 → 正式测试 → 再学习**

本轮只继续非韩语模块；韩语专项由独立迭代维护。

## 当前领域

- 📱 **手机产品专家**：硬件、系统串联、参数 → 体验、用户场景、竞品、零售 GTM、上市与经营。
- 🇰🇷 **韩语**：保留现有主动表达、听力 / 听写与 TTS，本轮不修改专项逻辑。
- 🗺️ **商圈与零售**：用户、JTBD、商圈空间、门店、陈列、Demo、O2O、活动与经营诊断。
- 🌍 **行业与商业**：市场、品牌、产品组合、价格权益、渠道、商业模式、真实市场证据与战略判断。

## V0.4 新增

### 1. Schema v1 进入公开代码仓库

`schemas/` 现在包含：

- `content.schema.json`
- `curriculum.schema.json`
- `study-event.schema.json`
- `assessment.schema.json`

这些 JSON Schema 与私有 Obsidian 中 `80_Learning_PWA/10_Data_Schema/` 的正式定义对齐。

当前采取兼容迁移：V0.3 UI 继续读取旧字段，同时运行时给内容、课程和测试补齐 v1 元数据。

### 2. 正式测试从“基础参数题”升级为综合验收

仍保持 10 题 × 10 分、100 分制，但内容升级：

- 手机：系统串联、商务场景、竞品条件、Demo、GTM 与经营诊断；
- 商圈零售：Need State、空间动线、客流质量、O2O、活动、库存、用户经营；
- 行业商业：真实市场证据、来源差异、sell-in / sell-out、量价关系、集中度和情景判断。

日常 `认识 / 模糊 / 不认识` 与正式测试继续严格分开。

### 3. 商圈空间视觉训练

加入自有 SVG 虚拟商圈案例：

`assets/retail-spatial-case-01.svg`

训练内容包括地铁、商场、办公、住宅、文旅客流来源，竞品主入口截流，以及目标门店真实动线和可达性。

### 4. 行业真实证据训练

新增基于公开研究事实的证据卡，当前包括 2026 Q2：

- IDC 中国智能手机市场；
- Counterpoint 中国智能手机市场；
- IDC 与 Counterpoint 口径差异的正确处理；
- 全球出货、收入、ASP 的量价关系；
- 市场集中度的正确解释。

每张证据卡保留 `source / as_of / license` 元数据，避免把二手印象当成事实。

### 5. 表述修正

复习结束的“独立掌握率”改为更准确的：

**本轮自评熟练率**

因为 `Good / Hard / Again` 是用户自评，不等于客观考试正确率。

## 已有能力

- 响应式 PWA；
- Manifest + Service Worker；
- 多领域入口；
- 今日学习；
- 学习路线与完成状态；
- 主动输出后查看答案；
- `认识 / 模糊 / 不认识` 三档自评；
- `ts-fsrs` 优先、离线简化排程兜底；
- 到期复习、学习历史与当日统计；
- 薄弱类别识别与专项训练；
- 独立 100 分正式测试；
- JSON 学习数据导出 / 导入；
- GitHub Pages 自动部署。

## 数据与隐私

这个仓库是公开部署仓库，因此只放：

- PWA 程序；
- 明确可公开的通用学习内容；
- 自有训练图；
- 经过来源与公开边界检查的事实型学习数据。

不会把私有 Obsidian Vault、工作日报、内部资料或私人学习记录直接发布到这里。

当前学习数据仍保存在浏览器 `localStorage`：

- iPhone 与 Mac 暂不自动同步；
- 可以手动导出 / 导入备份；
- 清除浏览器网站数据前应先导出备份。

## 部署

GitHub Pages：

https://xie633-arch.github.io/learning-paw/

`main` 分支更新后通过 GitHub Actions 自动重新发布。

## 下一阶段

1. 把旧 `history` 真正迁移成 StudyEvent v1；
2. 测试历史迁移成 Assessment Attempt，并逐题产生事件；
3. 建 Error Bank 与 `concept_id × skill` Learner Model；
4. 移除长期 5000 条 history 截断逻辑；
5. 实现 Obsidian Markdown → JSON 自动转换与 Schema Gate；
6. 本地化可稳定使用的官方产品真实图片，完成真正看图识机；
7. 行业证据增加图表视图和界面可见来源；
8. 再进入 IndexedDB / 自动跨设备同步。
