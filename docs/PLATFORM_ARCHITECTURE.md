# Learning Paw｜整体平台架构

Learning Paw 不是“韩语网站 + 手机题库 + 其他几个入口”的拼接，而是一套多领域共享学习引擎。

当前正式领域：

- 📱 手机产品专家
- 🇰🇷 韩语
- 🗺️ 商圈与零售
- 🌍 行业与商业

四个领域允许拥有不同内容形态和专项工具，但必须共享同一套学习事实、学习闭环、推荐原则和质量门槛。

## 1. 平台核心闭环

所有领域都遵循同一个主链路：

```text
Curriculum / Lesson
        ↓
Practice / Active Recall
        ↓
FSRS / Objective Assessment
        ↓
StudyEvent
        ↓
Learner Model
        ↓
ErrorRecord / LearnerSignal
        ↓
Concept × Skill Recommendation
        ↓
Targeted Remediation / Today Plan
        ↓
Revalidation
        ↓
resolved / next learning action
```

领域专项能力只能接在这条主链路上，不能另造一套互不兼容的数据体系。

## 2. 九层结构

### L1｜Domain Registry

定义领域身份、状态、入口和用户可见定位。

当前来源：`cards.js` + `platform-data.js` 的 domain overrides；韩语 Curriculum 当前仍通过 `korean-v04.js` 在启动阶段注册到共享 Registry。

要求：四个正式领域都处于 active 状态，并能从统一首页进入。Registry 的源码来源后续可以继续收敛，但运行时必须表现为一个平台。

### L2｜Curriculum & Lesson Content

Curriculum 决定“第一次什么时候学”。Lesson Content 提供真正可学的正文、任务和输出，而不是只给标题或让用户自己找资料。

要求：每个领域都必须有完整路线、学习任务和输出物。

### L3｜Practice Bank

主动回忆、听写、案例判断、参数 → 体验等都属于 Practice。

要求：Practice 是内容的练习表达，不等于 Curriculum，也不等于正式 Assessment。

### L4｜Scheduling

已经引入的可间隔复习内容由 FSRS 决定什么时候回来；未进入 Curriculum 的内容不应因为“题库存在”就自动挤进今日任务。

要求：新内容引入和复习排程分离。

### L5｜Assessment

日常自评和正式验收严格分开。

- 手机：100 分正式验收 + Product Lab 场景判断
- 韩语：Exit Check + Day 0 / Week 1 / Week 2 / Week 3 / Month 1 阶段验收
- 商圈与零售：100 分正式验收 + 空间 / 案例训练
- 行业与商业：100 分正式验收 + 事实证据 / 商业判断训练

不同领域可以使用不同题型，但结果必须最终映射到统一学习事实层。

### L6｜StudyEvent｜学习事实层

`StudyEvent v1` 是统一事实源。

页面历史、正式测试、专项实验、阶段验收都应逐步归一为 StudyEvent，而不是长期依赖各自的私有结果结构。

核心原则：

- 事实只记录发生过什么；
- 熟练度、弱项、推荐由事实计算；
- 不把 UI 临时状态当长期学习事实；
- 派生结果可以重算，真实学习事实不能被旧页面快照反向覆盖。

V0.12.2 的 `study-event-read-model-v12.js` 已成为页面读取学习事实的统一派生层，目前覆盖：

- 今日 Practice 次数；
- 今日 `good` 次数；
- 当日首次引入内容；
- Lesson 完成 / 取消完成；
- Route / Progress；
- Assessment 完成状态；
- 最近一次正式 Assessment；
- active Weak Signal 摘要。

Lesson 状态按 StudyEvent 时间顺序折叠，因此“曾经完成过”不等于永久完成；较新的 `curriculum_status_changed: completed=false` 可以正确撤销旧的完成事实。

`history / testResults / lessonProgress` 暂时继续存在作为兼容桥，而不是长期事实源。

### L7｜Learner Model + Recommendation

Learner Model 从 StudyEvent 派生：

- `assessmentAttempts`
- `errorRecords`
- `learnerSignals`
- `introducedContent`

目标不是简单统计“做过多少题”，而是回答：

1. 哪个 Concept 不稳定？
2. 哪种 Skill 出问题？
3. 是记忆缺口、理解缺口、应用缺口还是表达缺口？
4. 证据来自主动回忆、正式验收、重复错误，还是失败的重验证？
5. 下一步应该间隔回忆、补课、针对性复习，还是补救后重新验收？

V0.13 新增 `learner-recommendation-v13.js`，四个领域共用同一份 `Concept × Skill` 推荐算法。它综合：

- active ErrorRecord 严重程度；
- 同类错误重复次数；
- 客观 Assessment 错误比例；
- 主动回忆中的 `hard / again`；
- 重验证失败；
- 证据新鲜度。

输出不是一个黑箱“推荐分”，而是包含：

- `priority_score`
- `action`
- `action_label`
- `reason_codes`
- 可读 `reasons`
- evidence snapshot

当前动作类型包括：

- `spaced_recall`
- `targeted_review`
- `targeted_review_then_revalidate`
- `remediate_then_revalidate`
- `continue_curriculum`

关键规则：已经通过成功单点重验证、且不存在新的 active ErrorRecord 的 Concept × Skill，不会因为历史失败比例仍然偏高而被重新“复活”。只有新的真实错误才能重新进入近期推荐。

### L8｜Adaptive Learning

Adaptive Learning 不等于“错题本”。

标准闭环：

```text
真实错误
→ ErrorRecord active
→ 找回对应 Concept / Content / Skill
→ 推荐最小必要补救动作
→ 单点重新验证
→ 通过后 resolved
→ 推荐自动退出
```

补救任务不能无条件挤占每日 FSRS 上限。

四领域共同闭环已由 `platform-adaptive-smoke.mjs` 自动验证。

### L9｜Persistence / Sync / PWA

当前学习数据以 localStorage 为主，支持 JSON 导出 / 导入。

`state-write-guard-v113.js` 用于防止旧的 App 内存快照覆盖较新的 StudyEvent / ErrorRecord 等学习事实。

下一阶段才进入 IndexedDB / 云同步；同步层不能改变 StudyEvent 作为事实源的原则。

## 3. 统一 Today Plan｜V0.12 + V0.13

Today Plan 不再只是“到期卡数量”，而是把四类基础学习动作放进同一计划对象：

```text
当前 Curriculum Lesson
+ FSRS Due / 少量新卡
+ Learner Model 高价值弱项重验证
+ 必要 Assessment
```

“统一”不代表把所有动作强行混成一个数字。

当前负荷规则：

- FSRS / Practice：每日建议最多 10 张；
- 其中新卡：每日最多 5 张；
- ErrorRecord 重验证：每日最多优先列 3 项；
- 重验证不偷偷占用 FSRS 卡片配额；
- Assessment 作为独立行动组，只在课程节点或首次正式验收条件满足时提示。

`today-plan-v12.js` 为四领域输出同一结构：

- `lesson`
- `review`
- `revalidation`
- `assessment`
- `workload`

V0.13 又在 Today Plan 中增加一个**推荐焦点**，由 `recommendation-ui-v13.js` 消费统一 Recommendation Engine：

- 没有足够证据时显示“无需插队”，继续 Curriculum + FSRS；
- 有真实高价值弱项时显示最值得处理的 Concept × Skill；
- 展示推荐动作与原因，而不是只显示一个分数；
- resolved 后自动退出推荐；
- 推荐焦点目前只提供优先级解释，不改变 10 / 5 / 3 等既有负荷配额。

这一步刻意把“推荐”和“强制调度”分开，避免一个尚在校准的推荐分数直接控制每日学习负荷。

## 4. 四领域能力矩阵

| 能力 | 手机产品专家 | 韩语 | 商圈与零售 | 行业与商业 |
| --- | --- | --- | --- | --- |
| Curriculum | ✅ | ✅ | ✅ | ✅ |
| 完整 Lesson Content | ✅ | ✅ | ✅ | ✅ |
| Practice / 主动回忆 | ✅ | ✅ | ✅ | ✅ |
| FSRS | ✅ | ✅ | ✅ | ✅ |
| 正式 Assessment | ✅ 100分 | ✅ 阶段验收 | ✅ 100分 | ✅ 100分 |
| StudyEvent | ✅ | ✅ | ✅ | ✅ |
| StudyEvent-native 页面派生 | ✅ | ✅ | ✅ | ✅ |
| ErrorRecord | ✅ | ✅ | ✅ | ✅ |
| Targeted Revalidation | ✅ | ✅ | ✅ | ✅ |
| Unified Today Plan | ✅ | ✅ | ✅ | ✅ |
| Concept × Skill Recommendation | ✅ | ✅ | ✅ | ✅ |
| 专项扩展 | Product Lab / 产品知识库 | Voice / Exit Check / 阶段验收 | 空间 / 门店 / O2O 案例 | 事实证据 / 市场商业判断 |

这张表是平台边界：以后新增领域时，也应先满足左侧核心能力，再增加专项工具。

## 5. QA 分层

QA 按平台层次组织，而不是按某个领域临时补测试。

### A. Syntax / Shell

- JavaScript syntax
- JSON syntax
- Service Worker APP_SHELL 引用

### B. Content Contract

- `content-integrity.mjs`
- `platform-contract.mjs`

`platform-contract` 强制四领域都具备 active domain、Curriculum、Practice Bank 和正式 Assessment 路径。

### C. Shared Runtime / Learner Facts

- `browser-runtime-smoke.mjs`
- `learner-data-smoke.mjs`
- `study-event-read-model-smoke.mjs`
- `study-event-ui-smoke.mjs`

其中 Read Model / UI Smoke 验证：

- Route 能直接由 StudyEvent 派生；
- 较新的 reset 可以撤销旧完成事实；
- Weak Summary 可由 ErrorRecord + LearnerSignal 派生；
- 最近正式验收可由 Assessment Attempt / StudyEvent 派生；
- 即使没有 legacy `history / testResults`，关键页面仍能正确渲染。

### D. Adaptive Core

- `adaptive-general-smoke.mjs`
- `platform-adaptive-smoke.mjs`

`platform-adaptive-smoke` 验证四个领域都能完成：

```text
assessment error
→ ErrorRecord active
→ 对应领域薄弱页可见
→ targeted revalidation
→ ErrorRecord resolved
```

### E. Today Plan

- `today-plan-smoke.mjs`

它验证：

- 四领域共用同一个计划结构；
- 10 张 Practice / 5 张新卡限制；
- ErrorRecord 重验证与 FSRS 配额分离；
- 韩语阶段验收节点可被统一计划识别；
- 页面每日统计可直接由 StudyEvent 驱动。

### F. Recommendation

- `recommendation-engine-smoke.mjs`
- `recommendation-ui-smoke.mjs`

它们验证：

- 四个领域使用同一份 Concept × Skill 评分策略；
- 相同证据不会因为领域不同产生不同算法政策；
- Assessment error / recall gap / failed revalidation 会映射到不同学习动作；
- resolved 不会被历史失败重新复活；
- 一个领域的证据不会串到另一个领域；
- Today Plan 推荐焦点由 canonical StudyEvent 驱动，而不是测试专用临时状态。

### G. Domain Extensions

专项扩展拥有自己的 Smoke Test，但不得代替平台核心测试：

- 手机 Product Lab：`product-lab-smoke.mjs` / `adaptive-loop-smoke.mjs`
- 韩语阶段验收：平台 adaptive smoke + 韩语专项逻辑共同覆盖
- 零售空间案例：后续独立 interaction smoke
- 行业证据题：后续独立 evidence smoke

## 6. 后续开发优先级

### P0｜保持平台契约全绿｜持续

任何领域升级都不能破坏另外三个领域。

### P1｜统一 Today Plan｜✅ V0.12 第一版完成

已经完成四领域统一计划对象与页面显示；后续迭代优先级算法，不再回到四套独立 Today 逻辑。

### P2｜页面原生消费 StudyEvent｜✅ V0.12.2 第二批完成

当前已迁移的主要消费者：

- Today Plan；
- 首页“今日已复习”；
- 首页“今日认识”；
- Lesson 完成 / 取消完成；
- Assessment 完成判断；
- Route / Progress；
- Weak Summary；
- 最近一次正式 Assessment。

旧 `history / testResults / lessonProgress` 仍作为兼容桥存在。下一阶段的 P2 工作重点不是再造功能，而是等事实链路稳定后逐步清理不再需要的 legacy 页面读取与重复状态，避免一次性大重写。

### P3｜跨领域 Learner Signal 推荐｜🚧 V0.13 第一版完成

已完成：

- 四领域共用 Concept × Skill Recommendation Engine；
- 统一证据评分；
- 可解释 recommendation reasons；
- resolved-state suppression；
- Today Plan 第一批消费者“推荐焦点”；
- 推荐不改变当前 FSRS / revalidation 配额。

下一步：

- 在真实使用数据累积后校准优先级阈值；
- 让弱项列表排序逐步消费 Recommendation Engine，而不是各自再排序；
- 再评估是否让推荐影响 Today Plan 内部顺序，但仍不应直接扩大每日负荷。

### P4｜领域专项深化

在共享闭环稳定后，再分别增强：

- 手机：真实产品、竞品、GTM 场景与看图识机；
- 韩语：听说读写、ChatGPT Voice、TOPIK 路线；
- 零售：门店、商圈、O2O、活动、经营案例；
- 行业：市场数据、价格权益、渠道、竞争情报与战略判断。

### P5｜跨设备同步

在数据模型稳定后再做 IndexedDB / 云端同步，避免先同步一套仍在变化的数据结构。

## 7. 开发判断原则

以后增加功能时先问五个问题：

1. 这是平台共性能力，还是领域专项能力？
2. 它产生的学习行为能否落成 StudyEvent？
3. 错误能否进入统一 Learner Model？
4. 下一步动作能否被 Recommendation / Today Plan 统一解释与调度？
5. 它会不会让一个领域的特殊逻辑污染另外三个领域？

只有回答清楚这五个问题，才继续实现。
