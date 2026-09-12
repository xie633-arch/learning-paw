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

Learning Paw 后续只需要增加“今日 ChatGPT Voice Task、复制提示词、完成练习、记录关键问题”等轻量接口，不开发自建麦克风、STT、实时 Voice API 或虚假的精确发音分数。

发音标准参照仍优先使用真人母语或高质量权威音源；浏览器 TTS 只作为快速辅助。

### 4. 正式测试

日常 `认识 / 模糊 / 不认识` 与正式测试严格分开。

当前手机、商圈零售、行业商业已有 100 分验收；韩语 Week 1 / Month 1 Assessment 仍待按独立 Assessment Schema 完成。

### 5. 数据备份

支持 JSON 学习数据导出 / 导入，用于自动跨设备同步完成前的备份与迁移。

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
- JSON 学习数据导出 / 导入；
- 商圈空间 SVG 训练；
- 行业公开事实证据题；
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

## 当前仍未完成的关键项

这些属于“从成熟原型进入长期正式系统”的剩余工作，而不是缺少页面：

1. Day 0 真正 Baseline Assessment；
2. 韩语 Week 1 / Month 1 正式 Assessment；
3. `history` → StudyEvent v1；
4. Test Result → Assessment Attempt，并逐题产生 StudyEvent；
5. Error Bank 与 `concept_id × skill` Learner Model；
6. 正式 `introduced_content` Learner State，替代当前通过 lessonProgress 推导的兼容层；
7. Today Plan 真正合并“当前 Lesson 新卡 + FSRS Due + 薄弱项”；
8. 手机官方真实产品图片本地化与看图识机；
9. 行业证据来源在界面中直接可见；
10. IndexedDB / 云端跨设备同步；
11. iOS / Android 更完整的 PWA 图标与安装体验 QA。

当前版本定位：**已经可实际学习的 V0.4 成熟原型，但还不是“长期数据层全部完成”的 1.0 产品。**
