# 查询流程（Read）

定位并展示知识网络或其对象/关系结构，不执行写操作。

## Skill 路径索引

| skill | 路径（相对本文件） |
|-------|-------------------|
| bkn-report | `../bkn-report/SKILL.md` |
| 公约 | `../_shared/contract.md` |

外部 skill `bkn-kweaver` 通过相对路径读取（`../bkn-kweaver/SKILL.md`）。

## 流程

```
bkn-kweaver(查询) → bkn-report
```

## 阶段

| # | 步骤 | 行为 |
|---|------|------|
| 1 | 识别查询目标 | 名称、ID、范围 |
| 2 | 确认查询计划 | 模糊查 / 精确查 |
| 3 | 执行查询 | 委托 bkn-kweaver |
| 4 | 报告 | `../bkn-report/SKILL.md` |

## 标准查询

```bash
kweaver bkn list --name-pattern "关键词"
kweaver bkn get <kn_id>
kweaver bkn object-type list <kn_id>
kweaver bkn relation-type list <kn_id>
```

## 输出规范

- 网络级：kn_id、名称、comment、更新时间
- 对象级：对象名、主键、关键字段、数据源状态
- 关系级：关系名、源→目标、映射字段
- 结果为空：可能原因 + 检索建议
- kn_id 不截断
