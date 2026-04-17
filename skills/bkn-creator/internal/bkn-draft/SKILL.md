---
name: bkn-draft
description: 将确认后的建模清单生成 .bkn 文件。委托 create-bkn。
---

# BKN 草案落盘

公约：`../_shared/contract.md`

## 委托技能

| 技能 | 用途 | 必须 |
|------|------|------|
| `create-bkn` | 生成符合 BKN v2.0.1 规范的 `.bkn` 文件 | 是 |
| `archive-protocol` | 归档路径生成、ARCHIVE_ID/TIMESTAMP、回读校验 | 是 |

**执行前必须读取 `create-bkn/SKILL.md` 获取规范模板**，不可凭记忆生成 `.bkn` 格式。
**落盘路径必须走 `archive-protocol`**，确保双轨路径（根段 `archives/`）和回读校验。

## 做什么

将用户确认的对象/关系/动作清单转化为 `.bkn` 文件目录，落盘到归档路径。

## 输入

- 已确认的对象/关系/动作清单（含 `存储位置` 标记）
- `network_context`：网络名称、领域
- `mode`：`create`（新建） | `patch`（更新） | `copy`（复制）

## 流程

1. 读取 `archive-protocol/SKILL.md`，获取 `ARCHIVE_ID` + `TIMESTAMP` + 归档路径
2. 读取 `create-bkn/SKILL.md`，按 BKN v2.0.1 规范生成 .bkn 文件
3. 落盘到 `archives/{ARCHIVE_ID}/{TIMESTAMP}/{NETWORK_DIR_NAME}/`（路径由 archive-protocol 生成）
4. `network.bkn` 的 `id` 留空（推送后回填），补齐 `icon: icon-dip-graph`、`color: #0e5fc5`
5. 对象类分配随机颜色
6. **存储位置处理**：
   - **`platform` 对象**：生成完整 BKN 格式（含 Data Source、Logic Properties 等）
   - **`local` 对象**（仅用于模型内部逻辑推理，无外部数据源）：
     - **省略 `### Data Source` 节**
     - **省略 `Mapped Field` 列**（Data Properties 表格中不生成此列）
     - **省略 `### Logic Properties` 节**
     - **省略 `Incremental Key`**
     - 仅保留 `Data Properties`（定义对象的基本属性结构）
   - **注意**：`relation_types` 和 `action_types` 中的关系/动作可以引用 local 对象的属性，draft 阶段照常生成对应关系/动作文件
7. **Data Source 处理**（仅 platform 对象）：
   - 若此时已完成视图绑定（有 `binding_decision_list`）→ 写入真实 `view_id`
   - 若尚未绑定 → **省略整个 `### Data Source` 小节**，不写占位符
   - **禁止写 `待绑定` 或任何占位文本**，平台会将其解析为 view ID 导致推送失败
8. `Mapped Field` 同理：无绑定时写 `-`，不写占位
9. Description 仅写稳定业务语义
10. 委托 `kweaver-core` 执行 `kweaver bkn validate`
11. 用户复核

## 输出

- `.bkn` 文件目录
- validate 结果

## 数据类型选型

生成 Data Properties 时，Type 必须从规范合法类型中选择：

| 语义 | 选型 |
|------|------|
| 数量、金额、单价 | `decimal` |
| 计数、序号、版本号 | `integer` |
| 比率、百分比 | `float` |

**禁止使用 `number`**——平台不认识此类型，推送时报 `InvalidParameter`。

## Action Type 选型

Bound Object 表的 Action Type 列只允许三个值：

| 值 | 语义 |
|------|------|
| `add` | 新增（不可写 `create`，是后端保留字） |
| `modify` | 修改（不可写 `update`，是后端保留字） |
| `delete` | 删除 |

当前平台版本不支持 `query`。如有只读操作需求，暂用 `modify` 并在 Description 标注。

## 约束

- 本 skill 不做建模决策，只做清单 → 文件的转换
- Description 不写映射猜测信息
- 不写任何占位符文本（"待绑定"/"待确认"/"TBD"等），占位值会被平台当作真实 ID 解析
