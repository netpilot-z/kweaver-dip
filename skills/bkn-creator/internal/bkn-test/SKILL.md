---
name: bkn-test
description: 生成测试集与验证用例。三种模式：model_review / rules_verification / qa_verify。
---

# 测试与验证

公约：`../_shared/contract.md`

## 做什么

根据 BKN 草案和业务规则生成可复用的测试集，或对已推送网络做 Q&A 验证。

## 三种模式

### 1. `model_review`（推送前，默认）

输入：对象/关系/动作草案 + 业务规则 + 绑定结果
输出：四类测试用例 + 覆盖率矩阵

| 类别 | 测什么 |
|------|--------|
| smoke | 对象存在、属性非空、关系连通 |
| rules | 每条规则至少 1 正例；关键规则（影响核心业务流程、删除/审批/资金相关）补反例 |
| binding | 绑定率、映射覆盖率、blocked 项 |
| risk | 审批/删除/批量更新等高风险动作 |

### 用例数量规范

| 类别 | 最小数量 | 含义 |
|------|---------|------|
| smoke | 对象数 + 关系数 | 每个对象至少 1 条存在性测试，每个关系至少 1 条连通性测试 |
| rules | 至少 10 条 | 每条规则至少 1 正例；关键规则额外 1 反例；总数不得低于 10 |
| binding | 至少 3 条 | 绑定率、覆盖率、blocked 各 1 条 |
| risk | 高风险动作数 × 2 | 每个高风险动作至少 1 正例 + 1 反例 |

- 若规则数 < 10 条，需扩展测试维度补齐至 10 条（属性组合、边界条件、异常场景）

### 规则风险分级说明

| 等级 | 标签 | 含义 | 示例 |
|------|------|------|------|
| 低 | `低` | 只读或对单条记录的非破坏性操作 | 查询、生成报表 |
| 中 | `中` | 影响多条记录或触发下游流程 | 批量状态变更、MRP 计算 |
| 高/关键 | `高/关键` | 删除、跨系统推送、审批流触发、资金相关 | 删除网络、推送生产计划、关键决策规则 |

**关键规则**：高风险级别的业务规则，涉及删除、审批、资金或跨系统推送。这类规则必须补充反例测试。

### 2. `rules_verification`（推送前）

输入：锚定在网络中的业务规则 Skill
输出：规则正反例测试

- 对每条规则生成正例（满足时预期行为）+ 反例（违反时预期行为）
- 溯源检查：规则来源标注是否真实可追

### 3. `qa_verify`（推送后，实际验证）

输入：业务规则 Skill + 已推送网络
输出：验收引导卡 + Q&A 验证结果

#### L3 规则验证（P1-7）

**L3 级问题必须基于 `skills/` 目录下的业务规则 Skill 文件生成**，不可凭空编造：
1. 读取 `{network_dir}/skills/` 下所有业务规则 Skill 文件
2. 从每条高风险规则中提取验证问题，确保 `rule_id` 可追溯到 Skill 文件中的具体规则
3. 若 Skill 文件不存在或为空，L3 级测试标记为 `skipped`，并在报告中注明"业务规则 Skill 不可用"
4. 若存在 `bkn-rules` 的 `skill_self_check` 且有 fail 项，在引导卡中提示用户注意

#### 问题分级

| 级别 | 验证目标 | 示例 |
|------|---------|------|
| L1 结构 | 对象/属性是否存在 | "预测单有哪些属性？" |
| L2 关系 | 关系连通性 | "MRP 和预测单什么关系？" |
| L3 规则 | 业务规则是否可回答 | "BOM 用量怎么计算？" |
| L4 推理 | 跨实体推导 | "缺料时影响哪些生产计划？" |

每级至少 2 题，L3 级每条关键规则（高风险）至少 1 题。

#### Agent 配置模板

委托验证需要 Agent 时，使用以下配置结构（基于 kweaver-sdk e2e 验证）：

```json
{
  "input": {"fields": [{"name": "user_input", "type": "string", "desc": ""}]},
  "output": {"default_format": "markdown"},
  "system_prompt": "你是{network_name}的Decision Agent。基于知识网络中的对象、关系和业务规则回答用户问题。",
  "llms": [{
    "is_default": true,
    "llm_config": {
      "id": "{model_id}",
      "name": "{model_name}",
      "model_type": "llm",
      "temperature": 0.7,
      "top_p": 0.8,
      "top_k": 1,
      "frequency_penalty": 0,
      "presence_penalty": 0,
      "max_tokens": 4096
    }
  }],
  "data_source": {
    "kg": [{"kg_id": "{kn_id}", "fields": ["{all_object_type_ids}"]}],
    "advanced_config": {
      "kg": {
        "text_match_entity_nums": 60,
        "vector_match_entity_nums": 60,
        "graph_rag_topk": 25,
        "long_text_length": 256,
        "reranker_sim_threshold": -5.5,
        "retrieval_max_length": 20480
      }
    }
  }
}
```

**关键要点**：
- `data_source` 使用 `kg`（非 `knowledge_network`），这是 agent-factory API 的遗留字段名
- `fields` 填入该网络所有 object_type 的 ID 列表
- `llm_config` 必须包含 `temperature`/`top_p`/`top_k`，缺失会导致 `FormatError`
- 不使用 dolphin 模式（无需设置 `is_dolphin_mode`）

#### 交互流程（两阶段）

**第一阶段：生成验收引导卡（必执行）**

生成分级问题后，以引导卡形式呈现给用户，并询问验证方式：

```
知识网络「{network_name}」已推送完成

以下是根据业务规则生成的验收问题：

【L1 结构】
  - {question}
  - {question}

【L2 关系】
  - {question}

【L3 规则】关键规则必问
  - {question}（关联规则：{rule_id}）

【L4 推理】
  - {question}

请选择验证方式：
  A. 我自己去 DIP 验证，完成后把结果反馈给你
  B. 快速验证（L1+L2，使用 context-loader，无需 Agent）
  C. 完整验证（L1-L4，需要 Agent，尝试端到端验证）
```

**第二阶段：按用户选择执行**

| 选择 | 执行路径 |
|------|---------|
| A（用户自验） | 等待用户反馈 → 用户描述 Agent 回答 → 执行判定 → 输出结果 |
| B（快速验证） | L1+L2 自动验证（见下方），L3/L4 输出为"建议用户自行验证" |
| C（完整验证） | L1-L4 自动验证（见下方），Agent 不可用时自动降级为 B |

#### 验证模式

| 模式 | 覆盖级别 | 工具 | 适用场景 |
|------|---------|------|---------|
| 快速验证（B） | L1 + L2 | `kweaver context-loader` + `kweaver bkn search` | 无 Agent、schema_only、快速迭代 |
| 完整验证（C） | L1-L4 | 上述 + `kweaver agent chat` | 有关联 Agent、需验证推理能力 |

**快速验证流程**：
1. 前置：`kweaver context-loader config set --kn-id <network_id>`
2. L1 结构：`kweaver context-loader kn-schema-search "<question>"` → 检查对象/属性命中
3. L2 关系：`kweaver context-loader kn-schema-search "<question>"` → 检查关系连通性 + `kweaver bkn search` → 检查语义可达性

**完整验证流程**：
1. L1 + L2 同快速验证
2. L3 规则：`kweaver bkn search <kn_id> "<question>"` → 检查规则描述命中
3. L4 推理：`kweaver agent chat <agent_id>` → 端到端回答验证（需用户确认判定）

**降级规则**：
- 完整验证时若 `env_capability_matrix.agent_factory == unavailable`，自动降级为快速验证
- `kweaver agent list` 找不到关联 Agent 或调用失败 → 降级为快速验证，不重试
- L4 推理题无论走哪条路，最终判定均需用户确认

#### 反例测试

对高风险关键规则，额外生成反例问题：
- 违反约束条件的查询（如"BOM 用量为负数时如何处理？"）
- 超出业务边界的查询（如"预测单能否直接生成采购订单？"）
- 预期结果：网络应**不匹配**或**明确拒绝**
- 反例通过条件：实际回答不包含 `expected_absent_keywords` 中的任何词

```yaml
qa_results:
  - question: ""
    rule_id: ""
    level: L1 | L2 | L3 | L4
    is_counterexample: false
    expected_keywords: []
    expected_absent_keywords: []
    verify_mode: user_self | quick | full
    tool_used: context-loader | bkn-search | agent-chat
    actual_answer: ""
    match: true | false
    data_status: has_data | schema_only | not_found
    l4_user_confirmed: null | true | false
    final_verdict: pass | fail | skipped
```

## 通用输出

```yaml
testset_summary: {scope, focus, total_cases, passed, failed, blocked}
coverage_matrix: {objects, relations, actions, rules, bindings}
gaps: []
testset_path: ""  # 落盘路径，必须向用户展示
```

每条用例至少含：case_id / title / goal / steps / expected_result

### 测试集持久化

`model_review` 和 `rules_verification` 模式必须将测试集落盘：

- 路径：`{network_dir}/tests/testset.yaml`
- 内容：完整测试用例列表（case_id / title / level / target / steps / expected_result）
- 用途：巡检任务（patrol）定期回放此文件，验证网络是否退化
- `qa_verify` 模式不持久化测试集（验证是实时执行的，不生成可回放用例）

### 完成回执

测试集落盘后，按回显模板输出：

```
### 测试集已生成（完成）
说明：
- 落盘路径：{network_dir}/tests/testset.yaml
- 用例数：{total_cases}
下一步：执行 bkn-test --mode qa_verify 或进入推送流程
```

## 约束

- 不为不存在的对象虚构测试
- 高风险动作必须有风险校验测试
- 不将待确认假设写成确定性预期
