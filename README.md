# Personal Learning OS

一个面向手机与电脑的个人学习 PWA。

V0.4 的核心链路：

**学习新内容 → 主动回忆 → FSRS → 薄弱专项 → 正式测试 → 再学习**

## 当前领域

- 📱 **手机产品专家**：硬件、系统串联、参数 → 体验、用户场景、竞品、零售 GTM、上市与经营。
- 🇰🇷 **韩语**：Day 0–28 Curriculum 已接入；Week 1 已有第一批正式训练卡，并由 Lesson Unlock 控制新卡首次出现；长期目标为 2027 TOPIK II 4级、能力允许冲刺5级。
- 🗺️ **商圈与零售**：用户、JTBD、商圈空间、门店、陈列、Demo、O2O、活动与经营诊断。
- 🌍 **行业与商业**：市场、品牌、产品组合、价格权益、渠道、商业模式、真实市场证据与战略判断。

## V0.4 当前能力

### 1. Schema v1

`schemas/` 包含：

- `content.schema.json`
- `curriculum.schema.json`
- `study-event.schema.json`
- `assessment.schema.json`

公开 JSON Schema 与私有 Obsidian 中 `80_Learning_PWA/10_Data_Schema/` 的正式定义保持对齐。Day 0 作为基线索引允许 `day_index = 0`；长期仍计划把 Day 0 从普通课程壳升级成真正的 `purpose: baseline` Assessment。

### 2. 韩语 Curriculum + Lesson Unlock

`korean-v04.js` 提供 Day 0–28 Curriculum：

- Day 0：入学基线；
- Week 1：韩文系统与基础声音；
- Week 2：받침、音变与第一批真实表达；
- Week 3：句子结构、助词与高频动词；
- Week 4：地点、兴趣、愿望、否定与日常表达；
- Day 28：Month 1 阶段验收接口。

`korean-content-v04.js` 负责 Curriculum 与 Practice 的第一轮联动：

```text
未来 Lesson 的新卡
→ 不进入学习池

当前 Lesson 的新卡
→ 首次学习

已经引入的 Card
→ 交给 FSRS 决定何时复习
```

当前 Week 1 已加入第一批韩文音节块、基础辅音/元音、送气音/紧音意识、复合元音、韩语键盘、真实词、听辨/听写与验收准备卡。

旧版韩语生活表达卡也已经按 Curriculum 重新归档，例如问候语在 Day 12 才进入、`-고 싶어요` 在 Day 25 才进入，不再让零基础学习者第一天看到未来内容。

### 3. ChatGPT Voice 分工

连续韩语语音对话不在 Learning Paw 里重复自建实时语音系统。

正式分工：

```text
Learning Paw
课程 / Lesson Unlock / FSRS / 今日语音任务 / 错题与学习记录
        ↓
ChatGPT App Voice
连续韩语对话 / 追问 / 情景陪练 / 适量纠错
        ↓
练习结束
记录 1–3 个高价值错误或表达
        ↓
Error Bank / 后续复习
```

Learning Paw 只需要提供“今日 ChatGPT Voice Task、复制提示词、完成练习、记录关键问题”等轻量接口，不开发自建麦克风、STT、实时 Voice API 或虚假的精确发音分数。

发音标准参照仍优先使用真人母语或高质量权威音源；浏览器 TTS 只作为快速辅助。

### 4. StudyEvent v1 学习事实层

`learner-data-v1.js` 已作为兼容层在 `app.js` 读取本地数据之前运行，把当前原型数据逐步提升为正式学习事实：

```text
legacy history
→ StudyEvent v1

legacy testResults
→ Assessment Attempt
→ item StudyEvent

again / 正式测试答错
→ ErrorRecord

StudyEvent
→ concept_id × skill Learner Signal
→ introduced_content 初始事实
```

当前仍保留旧 `history / testResults` 供 V0.4 页面兼容使用，但导出的备份已经带 `studyEvents / assessmentAttempts / errorRecords / learnerSignals / introducedContent`。因此旧页面无需重做，长期数据结构已经开始迁移。

日常 `认识 / 模糊 / 不认识` 仍然只是自评，不会被写成客观 `correct`；正式测试的客观对错、分数和自评数据保持分离。

### 5. 正式测试

日常 `认识 / 模糊 / 不认识` 与正式测试严格分开。

当前手机、商圈零售、行业商业已有 100 分验收；正式测试结果会兼容生成 Assessment Attempt 与逐题 StudyEvent。韩语 Day 0 / Week 1 / Month 1 Assessment 仍待按独立 Assessment Schema 完成。

### 6. 数据备份

支持 JSON 学习数据导出 / 导入，用于自动跨设备同步完成前的备份与迁移。导出时以经过 StudyEvent v1 兼容层补全后的本地状态为准。

## 学习底层原则

1. Curriculum 决定“第一次什么时候学”；
2. FSRS 决定“已经学过的内容什么时候回来”；
3. Learner Model 最终决定“应该用什么方式再练”；
4. 日常自评不等于客观考试正确率；
5. StudyEvent 是学习事实源，熟练度和能力分由历史计算；
6. Concept 与 Card 分离，同一知识点可被听力、阅读、主动表达、口语等不同方式训练；
7. AI / ChatGPT 是老师和陪练，但不会伪装成绝对准确的发音评分仪。

## 已有能力

- 响应式 PWA；
- Manifest + Service Worker；
- 多领域入口；
- 今日学习；
- 学习路线与完成状态；
- 韩语 Lesson Unlock；
- 主动输出后查看答案；
- `认识 / 模糊 / 不认识` 三档自评；
- `ts-fsrs` 优先、离线简化排程兜底；
- 到期复习、学习历史与当日统计；
- 薄弱类别识别与专项训练；
- 独立正式测试；
- StudyEvent v1 兼容迁移；
- Assessment Attempt / ErrorRecord / Learner Signal 基础层；
- JSON 学习数据导出 / 导入；
- 商圈空间 SVG 训练；
- 行业公开事实证据题；
- GitHub Pages 自动部署；
- Static QA 自动检查 JavaScript、JSON 与 Service Worker Shell 引用。

## 数据与隐私

这个仓库是公开部署仓库，因此只放：

- PWA 程序；
- 明确可公开的通用学习内容；
- 自有训练图；
- 经过来源与公开边界检查的事实型学习数据。

不会把私有 Obsidian Vault、工作日报、内部资料或私人学习记录直接发布到这里。

当前私人学习数据仍保存在浏览器 `localStorage`：

- iPhone 与 Mac 暂不自动同步；
- 可以手动导出 / 导入备份；
- 清除浏览器网站数据前应先导出备份；
- `StudyEvent / Assessment Attempt / ErrorRecord` 只存在用户设备或用户自己导出的备份里，不写入公开仓库。

## 部署与 QA

GitHub Pages：

https://xie633-arch.github.io/learning-paw/

`main` 分支更新后通过 GitHub Actions 自动重新发布。

`.github/workflows/static-qa.yml` 会额外检查：

- 所有 JavaScript 语法；
- JSON / Web Manifest 语法；
- Service Worker `APP_SHELL` 中引用的本地文件是否真实存在。

## 当前仍未完成的关键项

这些属于“从成熟原型进入长期正式系统”的剩余工作，而不是缺少页面：

1. Day 0 真正 Baseline Assessment；
2. 韩语 Week 1 / Month 1 正式 Assessment；
3. 让页面本身直接以 StudyEvent / Assessment Attempt 为数据源，逐步停止依赖兼容用 `history / testResults`；
4. Error Bank 的解决 / 回炉 / 验证闭环；
5. 基于 `concept_id × skill` Learner Signal 形成真正的弱项推荐，而不只按 category；
6. 正式 `introduced_content` Learner State 完全替代当前 lessonProgress 推导的兼容层；
7. Today Plan 真正合并“当前 Lesson 新卡 + FSRS Due + Learner Model 弱项”；
8. 手机官方真实产品图片本地化与看图识机；
9. 行业证据来源在界面中直接可见；
10. IndexedDB / 云端跨设备同步；
11. iOS / Android 更完整的 PWA 图标与安装体验 QA。

当前版本定位：**已经可实际学习的 V0.4 成熟原型；StudyEvent v1 长期数据迁移已经启动，但 1.0 仍需要完成原生数据消费、Error Bank 闭环和长期存储。**
