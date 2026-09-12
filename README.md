# Personal Learning OS

一个面向手机与电脑的个人学习 PWA。

V0.5 的核心链路：

**完整课程正文 → 主动回忆 → FSRS → ChatGPT Voice → 薄弱专项 → 正式测试 → 再学习**

## 当前领域

- 📱 **手机产品专家**：硬件、系统串联、参数 → 体验、用户场景、竞品、零售 GTM、上市与经营。
- 🇰🇷 **韩语**：Day 0–28 已有完整站内课程正文、Lesson Unlock、Week 1 正式训练卡、每日 ChatGPT Voice Prompt，并按周提供世宗学堂官方可打印 PDF 下载入口；长期目标为 2027 TOPIK II 4级、能力允许冲刺5级。
- 🗺️ **商圈与零售**：用户、JTBD、商圈空间、门店、陈列、Demo、O2O、活动与经营诊断。
- 🌍 **行业与商业**：市场、品牌、产品组合、价格权益、渠道、商业模式、真实市场证据与战略判断。

## V0.5 当前能力

### 1. Schema v1

`schemas/` 包含：

- `content.schema.json`
- `curriculum.schema.json`
- `study-event.schema.json`
- `assessment.schema.json`

公开 JSON Schema 与私有 Obsidian 中 `80_Learning_PWA/10_Data_Schema/` 的正式定义保持对齐。Day 0 作为基线索引允许 `day_index = 0`；长期仍计划把 Day 0 从普通课程壳升级成真正的 `purpose: baseline` Assessment。

### 2. 韩语 Curriculum + 完整 Lesson Reader

`korean-v04.js` 提供 Day 0–28 Curriculum：

- Day 0：入学基线；
- Week 1：韩文系统与基础声音；
- Week 2：받침、音变与第一批真实表达；
- Week 3：句子结构、助词与高频动词；
- Week 4：地点、兴趣、愿望、否定与日常表达；
- Day 28：Month 1 阶段验收接口。

`korean-lesson-content-v05.js` 已为 Day 0–28 全部课程补充可直接阅读的完整学习正文，不再要求用户自行查找教材内容。`korean-learning-ui-v05.js` 在韩语 Today Learning 中提供“开始今日韩语学习”，站内直接展示：

- 当天知识讲解；
- 例子与练习方法；
- 学完检查点；
- 当天任务与建议输出；
- 每周官方打印资料；
- 当日 ChatGPT Voice Task 与完整 Prompt。

### 3. 韩语 Lesson Unlock

`korean-content-v04.js` 负责 Curriculum 与 Practice 联动：

```text
未来 Lesson 的新卡
→ 不进入学习池

当前 Lesson 的新卡
→ 首次学习

已经引入的 Card
→ 交给 FSRS 决定何时复习
```

当前 Week 1 已加入韩文音节块、基础辅音/元音、送气音/紧音意识、复合元音、韩语键盘、真实词、听辨/听写与验收准备卡。旧版生活表达也已按 Curriculum 重新归档，例如问候语在 Day 12 才进入、`-고 싶어요` 在 Day 25 才进入。

### 4. 每周官方可打印材料

韩语不自制重复教材，也不链接来源不明网盘。V0.5 直接使用世宗学堂官方免费学习资源，并在 Lesson Reader 里标明“本周用哪一本、打印哪一部分”。

当前映射：

- **Week 1**：《세종학당 한국어 입문》——基础元音、辅音、送气音/紧音、复合元音；
- **Week 2**：同一本入门教材——받침、겹받침、연음、常用表达；
- **Week 3**：《세종한국어 1 익힘책》——第 1 课 자기소개、第 2 课 일상생활、第 3 课 위치；
- **Week 4**：练习册 1–3 课综合复习，并按需参考《세종학당 한국어 1》初级教材。

网站按钮使用世宗学堂官方 PDF 下载页。官方页提供 PDF / E-book / 听力材料时直接从官方入口下载；不把第三方镜像文件复制进公开仓库。

### 5. ChatGPT Voice 分工

连续韩语语音对话不在 Learning Paw 里重复自建实时语音系统。

```text
Learning Paw
完整课程 / Lesson Unlock / FSRS / 今日 Voice Prompt / 错题与学习记录
        ↓
ChatGPT App Voice
连续韩语对话 / 追问 / 情景陪练 / 适量纠错
        ↓
练习结束
记录 1–3 个高价值错误或表达
        ↓
Error Bank / 后续复习
```

Day 0–28 已经全部提供每日 Voice Task。Prompt 包含场景、当前水平边界、目标内容、建议时长、推进方式、中文救援规则、纠错规则和结束复盘格式。

发音标准参照仍优先使用真人母语或高质量权威音源；浏览器 TTS 只作为快速辅助。

### 6. StudyEvent v1 学习事实层

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

当前仍保留旧 `history / testResults` 供 V0.5 页面兼容使用，但导出的备份已经带 `studyEvents / assessmentAttempts / errorRecords / learnerSignals / introducedContent`。

### 7. 正式测试

日常 `认识 / 模糊 / 不认识` 与正式测试严格分开。当前手机、商圈零售、行业商业已有 100 分验收；韩语 Day 0 / Week 1 / Month 1 Assessment 仍待按独立 Assessment Schema 完成。

### 8. 数据备份

支持 JSON 学习数据导出 / 导入，用于自动跨设备同步完成前的备份与迁移。

## 学习底层原则

1. Curriculum 决定“第一次什么时候学”；
2. FSRS 决定“已经学过的内容什么时候回来”；
3. Learner Model 最终决定“应该用什么方式再练”；
4. 韩语课程必须直接提供可学正文，不把“自己找资料”变成用户任务；
5. 每周纸质材料优先复用官方免费 PDF，只标清本周打印范围，不重复造教材；
6. 日常自评不等于客观考试正确率；
7. StudyEvent 是学习事实源，熟练度和能力分由历史计算；
8. Concept 与 Card 分离；
9. ChatGPT 是老师和陪练，但不会伪装成绝对准确的发音评分仪。

## 已有能力

- 响应式 PWA；
- Manifest + Service Worker；
- 多领域入口；
- 今日学习；
- 完整 Lesson Reader；
- 韩语 Day 0–28 内置课程正文；
- 韩语每周官方 PDF 打印资料入口；
- 韩语每日 ChatGPT Voice Prompt；
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

## 数据与隐私 / 版权

公开仓库只放程序、明确可公开的自有课程内容和公开安全资料链接。世宗学堂教材仍保留在官方站点，Learning Paw 只链接其官方详情/下载页，不重新分发 PDF。

当前私人学习数据仍保存在浏览器 `localStorage`：iPhone 与 Mac 暂不自动同步；清除网站数据前应先导出备份。

## 部署与 QA

GitHub Pages：

https://xie633-arch.github.io/learning-paw/

`main` 分支更新后通过 GitHub Actions 自动重新发布。Service Worker 当前缓存包含韩语完整课程与韩语 Lesson Reader 模块。

## 当前仍未完成的关键项

1. Day 0 真正 Baseline Assessment；
2. 韩语 Week 1 / Month 1 正式 Assessment；
3. 页面原生消费 StudyEvent / Assessment Attempt；
4. Error Bank 的解决 / 回炉 / 验证闭环；
5. `concept_id × skill` 真正弱项推荐；
6. 正式 `introduced_content` Learner State；
7. Today Plan 合并“当前 Lesson 新卡 + FSRS Due + Learner Model 弱项”；
8. 根据 Day 1–7 实际学习结果继续完善 Day 8–28 正式训练 Card；
9. IndexedDB / 云端跨设备同步；
10. iOS / Android 更完整的 PWA 安装体验 QA。

当前版本定位：**V0.5 已经能够直接承载“课程正文 + 训练 + 复习 + ChatGPT Voice + 每周纸质材料”的韩语学习闭环；下一阶段重点转向真实试学后的内容调优与 Assessment / Error Bank。**
