# Personal Learning OS

一个面向手机与电脑的个人学习 PWA。

V0.4 的核心链路：

**学习新内容 → 主动回忆 → FSRS → 薄弱专项 → 正式测试 → 再学习**

## 当前领域

- 📱 **手机产品专家**：硬件、系统串联、参数 → 体验、用户场景、竞品、零售 GTM、上市与经营。
- 🇰🇷 **韩语**：已接入 Day 0–28 Curriculum，长期目标为 2027 TOPIK II 4级、能力允许冲刺5级；保留主动表达、听力/听写与 TTS，AI Conversation 与 Pronunciation Lab 继续迭代。
- 🗺️ **商圈与零售**：用户、JTBD、商圈空间、门店、陈列、Demo、O2O、活动与经营诊断。
- 🌍 **行业与商业**：市场、品牌、产品组合、价格权益、渠道、商业模式、真实市场证据与战略判断。

## V0.4 当前能力

### 1. Schema v1 进入公开代码仓库

`schemas/` 包含：

- `content.schema.json`
- `curriculum.schema.json`
- `study-event.schema.json`
- `assessment.schema.json`

公开 JSON Schema 与私有 Obsidian 中 `80_Learning_PWA/10_Data_Schema/` 的正式定义对齐。

当前采用兼容迁移：旧 UI 继续读取既有字段，同时运行时给内容、课程和测试补齐 v1 元数据。

### 2. 韩语 Day 0–28 Curriculum 已接入

新增 `korean-v04.js`，不另造韩语页面，直接复用平台现有 Today Learning / Route：

- Day 0：入学基线；
- Week 1：韩文系统与基础声音；
- Week 2：받침、音变与第一批真实表达；
- Week 3：句子结构、助词与高频动词；
- Week 4：地点、兴趣、愿望、否定与日常表达；
- Day 28：Month 1 阶段验收接口。

Curriculum 决定新课推进，FSRS 继续负责旧知识何时回来。AI Conversation 与 Pronunciation Lab 暂只保留课程活动接口，不假装已经具备完整语音评测能力。

### 3. 正式测试升级为综合验收

日常 `认识 / 模糊 / 不认识` 与正式测试严格分开。

当前手机、商圈零售、行业商业保留 100 分基础/综合验收，并逐步迁移到 Assessment v1。

### 4. 商圈空间视觉训练

加入自有 SVG 虚拟商圈案例：

`assets/retail-spatial-case-01.svg`

训练地铁、商场、办公、住宅、文旅客流来源，竞品主入口截流，以及目标门店真实动线和可达性。

### 5. 行业真实证据训练

新增基于公开研究事实的证据卡，训练：

- 市场规模与份额；
- IDC / Counterpoint 口径差异；
- sell-in / sell-out；
- 出货、收入、ASP 的量价关系；
- 市场集中度与证据不确定性。

证据卡保留 `source / as_of / license` 元数据。

### 6. 数据备份

支持 JSON 学习数据导出 / 导入，用于自动跨设备同步完成前的备份与迁移。

## 学习底层原则

1. Curriculum 决定“今天学什么”；
2. FSRS 决定“旧知识什么时候回来”；
3. Learner Model 最终决定“应该用什么方式再练”；
4. 日常自评不等于客观考试正确率；
5. StudyEvent 是学习事实源，熟练度和能力分由历史计算；
6. Concept 与 Card 分离，同一知识点可被听力、阅读、主动表达、口语等不同方式训练；
7. AI 是老师和陪练，但不会伪装成绝对准确的发音评分仪。

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
- 独立正式测试；
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

1. 为韩语 Day 1–7 建第一批正式 Concept + Card，并与 Curriculum 关联；
2. 把旧 `history` 真正迁移成 StudyEvent v1；
3. 测试历史迁移成 Assessment Attempt，并逐题产生 StudyEvent；
4. 建 Error Bank 与 `concept_id × skill` Learner Model；
5. 移除长期 5000 条 history 截断逻辑；
6. 实现 Obsidian Markdown → JSON 自动转换与 Schema Gate；
7. AI Conversation / Pronunciation Lab 接入同一学习事件体系；
8. 再进入 IndexedDB / 自动跨设备同步。
