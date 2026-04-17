---
name: bkn-report
description: 生成阶段报告或最终归档报告。
---

# 报告生成

公约：`../_shared/contract.md`

## 做什么

汇总 pipeline 各阶段产物，生成结构化报告并归档。

## 输入

- `pipeline`：当前流程类型
- `artifacts`：各阶段产物（建模清单、绑定结果、测试结果、推送结果等）
- `network_dir`：归档目录

## 报告类型

| 类型 | 触发时机 | 内容 |
|------|---------|------|
| 阶段报告 | pipeline 中间节点 | 当前阶段摘要 + 下一步 |
| 最终报告 | pipeline 完成 | 全流程回顾 + 产物清单 + 质量评分 |
| 测试报告 | bkn-test 完成后 | 测试结果 + 覆盖率 + 通过率 |

## 最终报告结构

```
1. 网络概览：名称、领域、对象数、关系数
2. 建模摘要：路径（A/B/C）、收敛轮数
3. 绑定摘要：绑定率、覆盖率、风险项
4. 测试摘要：通过率、关键失败项
5. 业务规则：规则数、锚定对象数
6. Q&A 验证：通过率、验证路径
7. 问题与修复：pipeline 执行中遇到的问题及解决方案
8. 产物清单：文件路径列表
```

## 输出

### 1. Markdown 报告（必须）

- 文件：`{network_dir}/REPORT.md`
- 用途：版本控制友好、方便 diff
- 内容：完整报告（上述 1–8 节）

### 2. HTML 报告（可选）

- 生成条件：`references/report-template.html` 模板存在时生成，不存在时跳过
- 模板：`references/report-template.html`
- 文件：`{network_dir}/reports/REPORT.html`
- 用途：可视化展示、直接浏览器打开
- 生成方式：读取模板，替换 `{{placeholder}}` 占位符
- 占位符映射：

| 占位符 | 数据来源 |
|--------|---------|
| `{{network_name}}` | network.bkn → name |
| `{{domain}}` | network_context.domain |
| `{{timestamp}}` | 当前时间 |
| `{{trace_id}}` | ARCHIVE_ID |
| `{{quality_score}}` | bkn-review 评分（未执行写 N/A） |
| `{{verdict_class}}` | score >= 80 → pass, >= 60 → warn, < 60 → fail |
| `{{score_rows}}` | 各维度评分行 `<tr><td>维度</td><td>分数</td><td>权重</td></tr>` |
| `{{object_count}}` | 对象类数量 |
| `{{relation_count}}` | 关系类数量 |
| `{{binding_rate}}` | 绑定率 |
| `{{mapping_coverage}}` | 映射覆盖率 |
| `{{test_rows}}` | 测试结果行 |
| `{{rule_count}}` | 业务规则数 |
| `{{anchor_count}}` | 锚定对象数 |
| `{{qa_pass_rate}}` | Q&A 通过率 |
| `{{artifact_list}}` | 产物路径 `<li>` 列表 |

## 约束

- 报告不编造数据，数值必须来自实际产物
- 归档路径遵循 `_shared/contract.md` 中的归档规则
- Markdown 报告为必须产物；HTML 报告在模板可用时生成，不可用时跳过并在 Markdown 报告末尾注明
- HTML 报告必须基于 `references/report-template.html` 模板生成，不可自行编写 HTML
