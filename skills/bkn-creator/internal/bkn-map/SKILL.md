---
name: bkn-map
description: 属性到字段映射 + 覆盖率计算 + 完备性放行。
---

# 属性映射

公约：`../_shared/contract.md` | 映射规则：`references/mapping-rules.md`

## 做什么

给定已绑定对象和视图字段 schema，为每个属性确定映射状态，计算覆盖率，判定是否放行。

## 输入

- `binding_decision_list`：`bkn-bind` 的输出（仅处理 bound 对象）
- `object_draft_list`：对象清单（含属性）
- 已绑定视图的字段 schema

## 流程

1. **属性回灌**：以原始文本 + 绑定视图字段为输入，重建属性候选
   - 分层标注：`core_business`（原始文本存在）/ `view_derived`（仅视图中有）/ `technical_excluded`（纯技术字段）
   - 输出差异动作：keep / add / rename / merge / drop_candidate
   - **属性名对齐**：若 draft 阶段使用的属性名与视图字段名不一致，执行 rename 操作，将 draft 属性名改为视图实际字段名
   - 无已绑定视图时输出空差异，标注原因
2. **映射判定**：每个属性三态之一
   - `mapped`：有明确字段来源、语义一致、类型兼容
   - `waived`：有依据的豁免（非必填/业务确认暂不绑定）
   - `blocked`：无可接受字段/类型冲突/多候选无法裁决
3. **覆盖率**：`coverage = (mapped + waived) / total`
4. **质量评定**：
   - `blocked_count = 0 AND coverage = 100%` → `mapping_quality: full`
   - `blocked_count = 0 AND coverage >= 80%` → `mapping_quality: partial`（有豁免项）
   - `blocked_count > 0 OR coverage < 80%` → `mapping_quality: needs_work`

   `mapping_quality` 作为评分输入传给 `bkn-review`，不单独阻断 pipeline。Pipeline 放行权由 `bkn-review` 的综合评分决定。

`mapping_quality` 非 `full` 时提供互斥策略：
- **A（BKN 优先）**：补映射后重跑
- **B（视图优先）**：按视图重构属性后重跑
- **C（混合治理）**：高价值差异增补，其余豁免

详细规则见 `references/mapping-rules.md`

## 输出

```yaml
property_regen_summary: {keep, add, rename, merge, drop_candidate}
property_mapping_draft:
  - object_name: ""
    mapped_count: 0
    waived_count: 0
    blocked_count: 0
    coverage: 0.0
    rows: [{property_name, status, view_id, field_path, confidence, reason}]
mapping_gate_summary: {coverage, blocked_count, mapping_quality, recommended_strategy}
```

## 约束

- 属性回灌不可跳过，即使绑定率已达标
- 不将"猜测"标为 mapped
- 不将"暂无字段"标为 waived（waived 是有依据的豁免）
- coverage 必须可追溯到逐属性证据
- 本 skill 执行完成后，pipeline 负责将 `map_completed: true` 写入 `pipeline_state.yaml`，本 skill 不直接写入该文件
