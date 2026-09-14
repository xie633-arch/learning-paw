# Learning Paw · Personal Learning OS

Learning Paw 是一个面向手机与电脑的个人学习 PWA。它不是几套题库拼在一起，而是一套由多个学习领域共同复用的学习引擎。

当前四个正式领域：

- 📱 **手机产品专家**：产品知识、参数 → 体验、用户场景、竞品、零售 GTM、上市与经营判断；
- 🇰🇷 **韩语**：Day 0–28 课程、听说读写、Exit Check、阶段验收与 ChatGPT Voice 任务；
- 🗺️ **商圈与零售**：用户、JTBD、商圈空间、门店、陈列、Demo、O2O、活动与经营诊断；
- 🌍 **行业与商业**：市场、品牌、产品组合、价格权益、渠道、商业模式、证据与战略判断。

完整平台架构见 [`docs/PLATFORM_ARCHITECTURE.md`](docs/PLATFORM_ARCHITECTURE.md)。

## 平台主闭环

所有领域共享同一条核心学习链路：

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
ErrorRecord / Weak Signal
        ↓
Targeted Remediation
        ↓
Revalidation
        ↓
resolved / next learning action
```

领域可以拥有自己的题型、内容和专项工具，但学习事实、弱项识别、重新验证和未来 Today Plan 必须落在同一套平台模型里。

## 共享核心能力

### Curriculum + Lesson Content

四个领域都拥有站内学习路线和可直接学习的正文。Curriculum 决定“第一次什么时候学”，Lesson Content 负责真正的知识讲解、练习任务和学习输出。

当前课程规模：

- 手机产品专家：8 个核心 Lesson；
- 商圈与零售：8 个核心 Lesson；
- 行业与商业：8 个核心 Lesson；
- 韩语：Day 0–28，共 29 个 Lesson。

### Practice + FSRS

Practice 用于主动回忆、听写、参数 → 体验、案例判断等训练。已经引入的可间隔复习内容优先交给 `ts-fsrs`；网络或依赖不可用时使用本地简化排程兜底。

平台原则：**题库存在不等于今天就必须学习。** Curriculum 控制新知识引入，FSRS 管理已经学习过的内容何时回来。

### Assessment

日常自评和正式验收严格分开。

- 手机：100 分综合验收 + Product Lab 场景判断；
- 商圈与零售：100 分综合验收 + 空间 / 零售案例；
- 行业与商业：100 分综合验收 + 市场证据 / 商业判断；
- 韩语：每日 Exit Check + Day 0 / Week 1 / Week 2 / Week 3 / Month 1 阶段验收。

正式 Assessment 的错误会进入统一学习事实层，而不是只显示一次分数后消失。

### StudyEvent v1

`learner-data-v1.js` 将不同学习行为逐步归一为 `StudyEvent v1`：

```text
review / practice
→ StudyEvent

formal assessment
→ Assessment Attempt
→ item StudyEvent

真实错误
→ ErrorRecord

StudyEvent
→ concept_id × skill Learner Signal
```

当前仍保留部分旧 `history / testResults` 供页面兼容，但 StudyEvent 已是平台未来的事实源。

### Adaptive Learning / Error Bank

Adaptive Learning 不只是“错题本”。标准闭环是：

```text
真实错误
→ ErrorRecord active
→ 找回对应 Concept / Content / Skill
→ 最小必要补救
→ 单点重新验证
→ 通过后 resolved
```

手机、韩语、商圈零售、行业商业都必须满足这条共享闭环。领域专项模块可以提供更适合自己的重测方式，但不能建立互不兼容的数据孤岛。

### Persistence / PWA

- Manifest + Service Worker；
- 手机 / 桌面响应式界面；
- JSON 学习数据导出 / 导入；
- 本地 `localStorage` 学习记录；
- `state-write-guard-v113.js` 防止旧 App 内存快照覆盖较新的 StudyEvent / ErrorRecord；
- PWA 离线缓存关键运行模块。

当前尚未开启自动跨设备同步。清除浏览器站点数据前应先导出备份。

## 四个领域的专项扩展

共享平台之上，每个领域保留自己的专业训练形态。

### 📱 手机产品专家

- 手机技术知识库 / Concept Tree；
- 当前真实产品与官方规格；
- Product Lab；
- 产品组合、参数 → 体验、场景匹配；
- 后续继续增强看图识机、竞品和 Retail GTM 场景题。

### 🇰🇷 韩语

- Day 0–28 完整课程正文；
- Lesson Unlock；
- 主动表达、听力 / 听写、TTS；
- 每日 Exit Check；
- Day 0 / 7 / 14 / 21 / 28 阶段验收；
- 每日 ChatGPT Voice Task；
- 世宗学堂官方纸质学习资源入口。

连续语音陪练由 ChatGPT Voice 承担；Learning Paw 负责课程、任务调度、学习记录与弱项闭环。

### 🗺️ 商圈与零售

- 用户 / Need State / JTBD；
- 商圈空间和竞争锚点；
- 门店陈列与 Demo；
- O2O 服务承接；
- 活动、库存、用户经营与经营诊断；
- 后续强化真实门店案例和空间交互训练。

### 🌍 行业与商业

- 市场结构与份额；
- Sell-in / Sell-out；
- 产品组合与价格权益；
- 渠道和商业模式；
- 证据边界、替代解释、情景分析；
- 后续强化实时市场数据和竞争情报训练。

## QA：按平台而不是按单领域守门

GitHub Actions 的 Static QA 分层检查：

1. JavaScript / JSON 语法；
2. Service Worker APP_SHELL；
3. Learner Data migration；
4. Curriculum Content Integrity；
5. `platform-contract.mjs`：四个领域共同满足平台内容契约；
6. Browser Runtime Smoke；
7. Product Lab / Adaptive Loop；
8. `adaptive-general-smoke.mjs`；
9. `platform-adaptive-smoke.mjs`：四领域 Assessment error → ErrorRecord → targeted revalidation → resolved。

这意味着以后即使只修改一个领域，也不能无意破坏另外三个领域的共享学习能力。

## 数据与隐私 / 版权

公开仓库只放程序、可公开的自有课程内容、公开安全资料与官方资源链接。世宗学堂教材保留在官方站点，Learning Paw 只提供官方详情 / 下载入口，不重新分发 PDF。

个人学习记录当前保存在本机浏览器，不写入公开 GitHub 仓库。

## 下一阶段

当前平台的重点不是继续堆独立模块，而是继续收敛共享核心：

1. **统一 Today Plan**：把当前 Curriculum 新内容、FSRS Due、Learner Model 高价值弱项、必要 Assessment / Revalidation 放进一个受总负荷约束的计划器；
2. **页面原生消费 StudyEvent**：逐步减少旧 `history / testResults` 对运行逻辑的主导；
3. **统一 Concept × Skill 推荐**：让四个领域都能根据真实历史决定下一步练什么；
4. **深化领域专项能力**：手机、韩语、零售、行业在共享底座稳定后继续各自专业化；
5. **跨设备同步**：在数据模型稳定后再进入 IndexedDB / 云端同步。

## 部署

GitHub Pages：

https://xie633-arch.github.io/learning-paw/

`main` 分支更新后由 GitHub Actions 自动发布。

当前定位：**Learning Paw 已从单模块学习原型进入“多领域共享学习引擎”阶段。后续新增功能默认先判断它属于平台共性能力还是领域专项能力，再决定放在哪一层。**
